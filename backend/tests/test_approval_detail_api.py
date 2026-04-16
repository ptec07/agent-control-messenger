from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_get_approval_request_returns_approval_detail():
    create_response = client.post(
        '/threads',
        json={
            'title': 'approval detail 조회',
            'created_by': 'user_detail',
            'agent_id': 'agent_hermes_1',
            'initial_message': 'approval detail',
        },
    )
    run_id = create_response.json()['initial_run_id']
    approval_response = client.post(
        f'/runs/{run_id}/simulate-risky-action',
        json={
            'action_type': 'shell_command',
            'summary': 'pytest tests/test_api.py -q 실행 요청',
            'payload': {'command': 'pytest tests/test_api.py -q'},
        },
    )
    approval_id = approval_response.json()['id']

    response = client.get(f'/approval-requests/{approval_id}')

    assert response.status_code == 200
    payload = response.json()
    assert payload['id'] == approval_id
    assert payload['action_type'] == 'shell_command'
    assert payload['status'] == 'pending'
