from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_websocket_receives_message_created_event_after_thread_creation():
    with client.websocket_connect('/ws') as websocket:
        response = client.post(
            '/threads',
            json={
                'title': 'ws thread',
                'created_by': 'user_ws',
                'agent_id': 'agent_hermes_1',
                'initial_message': '웹소켓 이벤트 테스트',
            },
        )

        assert response.status_code == 201
        event = websocket.receive_json()
        assert event['event'] == 'message.created'
        assert event['data']['message_type'] == 'instruction'
        assert event['data']['content_text'] == '웹소켓 이벤트 테스트'


def test_websocket_receives_approval_created_event_after_risky_action():
    create_response = client.post(
        '/threads',
        json={
            'title': 'ws approval',
            'created_by': 'user_ws',
            'agent_id': 'agent_hermes_1',
            'initial_message': 'approval 테스트',
        },
    )
    run_id = create_response.json()['initial_run_id']

    with client.websocket_connect('/ws') as websocket:
        response = client.post(
            f'/runs/{run_id}/simulate-risky-action',
            json={
                'action_type': 'shell_command',
                'summary': 'pytest tests/test_api.py -q 실행 요청',
                'payload': {'command': 'pytest tests/test_api.py -q'},
            },
        )

        assert response.status_code == 201
        event = websocket.receive_json()
        assert event['event'] == 'approval.created'
        assert event['data']['action_type'] == 'shell_command'
        assert event['data']['status'] == 'pending'
