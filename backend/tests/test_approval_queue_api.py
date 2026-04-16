from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_list_pending_approval_requests_returns_queue_items():
    first_thread = client.post(
        '/threads',
        json={
            'title': '첫 번째 승인 대기',
            'created_by': 'user_queue_1',
            'agent_id': 'agent_hermes_1',
            'initial_message': '첫 번째 위험 작업',
        },
    )
    first_run_id = first_thread.json()['initial_run_id']
    first_approval = client.post(
        f'/runs/{first_run_id}/simulate-risky-action',
        json={
            'action_type': 'shell_command',
            'summary': 'pytest tests/test_api.py -q 실행 요청',
            'payload': {'command': 'pytest tests/test_api.py -q'},
        },
    )

    second_thread = client.post(
        '/threads',
        json={
            'title': '두 번째 승인 대기',
            'created_by': 'user_queue_2',
            'agent_id': 'agent_hermes_2',
            'initial_message': '두 번째 위험 작업',
        },
    )
    second_run_id = second_thread.json()['initial_run_id']
    second_approval = client.post(
        f'/runs/{second_run_id}/simulate-risky-action',
        json={
            'action_type': 'file_delete',
            'summary': 'tmp 디렉터리 삭제 요청',
            'payload': {'path': '/tmp/demo'},
        },
    )

    client.post(
        f"/approval-requests/{second_approval.json()['id']}/approve",
        json={'operator_id': 'operator_queue', 'comment': '먼저 처리'},
    )

    response = client.get('/approval-requests')

    assert response.status_code == 200
    payload = response.json()
    assert len(payload['approval_requests']) >= 1
    assert payload['approval_requests'][0]['id'] == first_approval.json()['id']
    assert payload['approval_requests'][0]['thread_id'] == first_thread.json()['id']
    assert payload['approval_requests'][0]['thread_title'] == '첫 번째 승인 대기'
    assert payload['approval_requests'][0]['run_id'] == first_run_id
    assert payload['approval_requests'][0]['status'] == 'pending'
    assert payload['approval_requests'][0]['summary'] == 'pytest tests/test_api.py -q 실행 요청'
