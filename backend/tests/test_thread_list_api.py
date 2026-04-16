from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_list_threads_returns_latest_run_status_and_pending_approval_flag():
    first = client.post(
        '/threads',
        json={
            'title': 'Hermes repo 분석',
            'created_by': 'user_threads_1',
            'agent_id': 'agent_hermes_1',
            'initial_message': '첫 번째 스레드',
        },
    )
    first_thread_id = first.json()['id']
    first_run_id = first.json()['initial_run_id']
    client.post(
        f'/runs/{first_run_id}/simulate-risky-action',
        json={
            'action_type': 'shell_command',
            'summary': 'pytest tests/test_api.py -q 실행 요청',
            'payload': {'command': 'pytest tests/test_api.py -q'},
        },
    )

    second = client.post(
        '/threads',
        json={
            'title': 'tmp 정리 작업',
            'created_by': 'user_threads_2',
            'agent_id': 'agent_hermes_2',
            'initial_message': '두 번째 스레드',
        },
    )
    second_thread_id = second.json()['id']

    response = client.get('/threads')

    assert response.status_code == 200
    payload = response.json()
    assert len(payload['threads']) >= 2

    first_item = next(item for item in payload['threads'] if item['id'] == first_thread_id)
    second_item = next(item for item in payload['threads'] if item['id'] == second_thread_id)

    assert first_item['title'] == 'Hermes repo 분석'
    assert first_item['latest_run_status'] == 'paused_for_approval'
    assert first_item['has_pending_approval'] is True

    assert second_item['title'] == 'tmp 정리 작업'
    assert second_item['latest_run_status'] == 'running'
    assert second_item['has_pending_approval'] is False
