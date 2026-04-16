from __future__ import annotations

from app.models import MessageType
from app.store import InMemoryStore


def bootstrap_demo_data(store: InMemoryStore, *, reset: bool = False) -> dict:
    if reset:
        store.reset()

    created_threads: list[dict[str, str | bool | None]] = []

    first_thread, _, first_run = store.create_thread(
        title='Hermes repo 분석',
        created_by='operator_demo',
        agent_id='agent_hermes_1',
        initial_message='Hermes 저장소 구조를 분석하고 위험 작업이 있으면 승인 요청해줘',
    )
    store.append_message(
        thread_id=first_thread.id,
        sender_type='agent',
        sender_id='agent_hermes_1',
        message_type=MessageType.STATUS_UPDATE,
        content_text='저장소 루트와 테스트 구성을 확인하는 중입니다.',
        metadata={'run_id': first_run.id},
    )
    first_approval = store.create_approval_for_run(
        run_id=first_run.id,
        action_type='shell_command',
        summary='pytest backend/tests -q 실행 요청',
        payload={'command': 'PYTHONPATH=backend python -m pytest backend/tests -q'},
    )
    if first_approval is not None:
        store.append_message(
            thread_id=first_thread.id,
            sender_type='system',
            sender_id='policy-engine',
            message_type=MessageType.APPROVAL_REQUEST,
            content_text='승인 필요: backend 테스트 실행',
            metadata={'approval_request_id': first_approval.id, 'run_id': first_run.id},
        )

    second_thread, _, second_run = store.create_thread(
        title='tmp 정리 작업',
        created_by='operator_demo',
        agent_id='agent_hermes_2',
        initial_message='tmp 디렉터리 정리 계획을 세우고 결과를 보고해줘',
    )
    store.append_message(
        thread_id=second_thread.id,
        sender_type='agent',
        sender_id='agent_hermes_2',
        message_type=MessageType.STATUS_UPDATE,
        content_text='삭제 후보 파일을 스캔하는 중입니다.',
        metadata={'run_id': second_run.id},
    )

    for thread in store.list_threads():
        latest_run = store.get_latest_run_for_thread(thread.id)
        created_threads.append(
            {
                'id': thread.id,
                'title': thread.title,
                'latest_run_status': latest_run.status if latest_run else None,
                'has_pending_approval': bool(latest_run and latest_run.current_approval_request_id),
            }
        )

    return {
        'created_thread_count': len(created_threads),
        'pending_approval_count': len(store.list_pending_approvals()),
        'threads': created_threads,
    }
