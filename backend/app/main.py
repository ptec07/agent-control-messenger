from dataclasses import asdict

from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.demo import bootstrap_demo_data
from app.event_payloads import approval_created, approval_resolved, message_created, run_status_changed
from app.events import broker
from app.models import MessageType
from app.schemas import ApprovalDecisionRequest, RiskyActionRequest, ThreadCreateRequest
from app.store import store

app = FastAPI(title=settings.service_name)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    allow_origin_regex=r'https?://(localhost|127\.0\.0\.1):(5\d{3}|4\d{3})',
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)


@app.websocket('/ws')
async def websocket_events(websocket: WebSocket) -> None:
    await websocket.accept()
    try:
        async with broker.subscribe() as queue:
            while True:
                event = await queue.get()
                await websocket.send_json(event)
    except WebSocketDisconnect:
        return


@app.get('/')
def root() -> dict[str, str]:
    return {'name': settings.service_name, 'status': 'ok'}


@app.get('/health')
def health() -> dict[str, str | bool]:
    return {'ok': True, 'service': settings.service_name}


@app.post('/demo/bootstrap', status_code=201)
def bootstrap_demo(reset: bool = False) -> dict:
    return bootstrap_demo_data(store, reset=reset)


@app.post('/threads', status_code=201)
def create_thread(payload: ThreadCreateRequest) -> dict:
    thread, message, run = store.create_thread(
        title=payload.title,
        created_by=payload.created_by,
        agent_id=payload.agent_id,
        initial_message=payload.initial_message,
    )
    broker.publish(message_created(message))
    broker.publish(run_status_changed(run))
    return {
        'id': thread.id,
        'title': thread.title,
        'status': thread.status,
        'initial_message_id': message.id,
        'initial_run_id': run.id,
    }


@app.get('/threads')
def list_threads() -> dict:
    threads = store.list_threads()
    return {
        'threads': [
            {
                'id': thread.id,
                'title': thread.title,
                'status': thread.status,
                'assigned_agent_id': thread.assigned_agent_id,
                'latest_run_id': latest_run.id if latest_run else None,
                'latest_run_status': latest_run.status if latest_run else None,
                'has_pending_approval': bool(latest_run and latest_run.current_approval_request_id),
            }
            for thread in threads
            for latest_run in [store.get_latest_run_for_thread(thread.id)]
        ]
    }


@app.get('/threads/{thread_id}')
def get_thread(thread_id: str) -> dict:
    thread = store.get_thread(thread_id)
    if thread is None:
        raise HTTPException(status_code=404, detail='Thread not found')
    latest_run = store.get_latest_run_for_thread(thread_id)
    return {
        'id': thread.id,
        'title': thread.title,
        'status': thread.status,
        'assigned_agent_id': thread.assigned_agent_id,
        'latest_run_id': latest_run.id if latest_run else None,
        'latest_run_status': latest_run.status if latest_run else None,
    }


@app.get('/threads/{thread_id}/messages')
def get_thread_messages(thread_id: str) -> dict:
    messages = store.get_thread_messages(thread_id)
    if not messages:
        raise HTTPException(status_code=404, detail='Thread not found')
    return {
        'thread_id': thread_id,
        'messages': [
            {
                **asdict(message),
                'message_type': message.message_type,
            }
            for message in messages
        ],
    }


@app.get('/runs/{run_id}')
def get_run(run_id: str) -> dict:
    run = store.get_run(run_id)
    if run is None:
        raise HTTPException(status_code=404, detail='Run not found')
    return {**asdict(run), 'status': run.status}


@app.post('/threads/{thread_id}/demo-run')
def run_fake_agent_demo(thread_id: str) -> dict:
    run = store.get_latest_run_for_thread(thread_id)
    if run is None:
        raise HTTPException(status_code=404, detail='Run not found for thread')
    status_message = store.append_message(
        thread_id=thread_id,
        sender_type='agent',
        sender_id=run.agent_id,
        message_type=MessageType.STATUS_UPDATE,
        content_text='repo 구조를 확인하는 중입니다.',
        metadata={'run_id': run.id},
    )
    approval = store.create_approval_for_run(
        run_id=run.id,
        action_type='shell_command',
        summary='pytest tests/test_api.py -q 실행 요청',
        payload={'command': 'pytest tests/test_api.py -q'},
    )
    if status_message is not None:
        broker.publish(message_created(status_message))
    if approval is not None:
        broker.publish(approval_created(approval))
        broker.publish(run_status_changed(store.get_run(run.id) or run))
    approval_message = store.append_message(
        thread_id=thread_id,
        sender_type='system',
        sender_id='policy-engine',
        message_type=MessageType.APPROVAL_REQUEST,
        content_text='승인 필요: pytest tests/test_api.py -q 실행 요청',
        metadata={'approval_request_id': approval.id if approval else None, 'run_id': run.id},
    )
    if approval_message is not None:
        broker.publish(message_created(approval_message))
    return {
        'run_id': run.id,
        'status_message_id': status_message.id if status_message else None,
        'approval_request_id': approval.id if approval else None,
        'approval_message_id': approval_message.id if approval_message else None,
    }


@app.post('/runs/{run_id}/simulate-risky-action', status_code=201)
def simulate_risky_action(run_id: str, payload: RiskyActionRequest) -> dict:
    approval = store.create_approval_for_run(
        run_id=run_id,
        action_type=payload.action_type,
        summary=payload.summary,
        payload=payload.payload,
    )
    if approval is None:
        raise HTTPException(status_code=404, detail='Run not found')
    broker.publish(approval_created(approval))
    run = store.get_run(run_id)
    if run is not None:
        broker.publish(run_status_changed(run))
    return {
        **asdict(approval),
        'action_type': approval.action_type,
        'status': approval.status,
    }


@app.post('/approval-requests/{approval_id}/approve')
def approve_request(approval_id: str, payload: ApprovalDecisionRequest) -> dict:
    approval = store.resolve_approval(
        approval_id,
        approved=True,
        operator_id=payload.operator_id,
        comment=payload.comment,
    )
    if approval is None:
        raise HTTPException(status_code=404, detail='Approval request not found')
    broker.publish(approval_resolved(approval))
    run = store.get_run(approval.run_id)
    if run is not None:
        broker.publish(run_status_changed(run))
    return {**asdict(approval), 'status': approval.status}


@app.get('/approval-requests')
def list_approval_requests() -> dict:
    approvals = store.list_pending_approvals()
    return {
        'approval_requests': [
            {
                **asdict(approval),
                'action_type': approval.action_type,
                'status': approval.status,
                'thread_title': store.get_thread(approval.thread_id).title if store.get_thread(approval.thread_id) else None,
            }
            for approval in approvals
        ]
    }


@app.get('/approval-requests/{approval_id}')
def get_approval_request(approval_id: str) -> dict:
    approval = store.get_approval(approval_id)
    if approval is None:
        raise HTTPException(status_code=404, detail='Approval request not found')
    return {
        **asdict(approval),
        'action_type': approval.action_type,
        'status': approval.status,
    }


@app.post('/approval-requests/{approval_id}/reject')
def reject_request(approval_id: str, payload: ApprovalDecisionRequest) -> dict:
    approval = store.resolve_approval(
        approval_id,
        approved=False,
        operator_id=payload.operator_id,
        comment=payload.comment,
    )
    if approval is None:
        raise HTTPException(status_code=404, detail='Approval request not found')
    broker.publish(approval_resolved(approval))
    run = store.get_run(approval.run_id)
    if run is not None:
        broker.publish(run_status_changed(run))
    return {**asdict(approval), 'status': approval.status}
