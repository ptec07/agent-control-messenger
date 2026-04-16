from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_get_thread_returns_thread_metadata_and_latest_run_status():
    create_response = client.post(
        '/threads',
        json={
            'title': 'thread detail 조회',
            'created_by': 'user_detail',
            'agent_id': 'agent_hermes_1',
            'initial_message': '상세 정보 조회',
        },
    )
    thread_id = create_response.json()['id']
    run_id = create_response.json()['initial_run_id']

    response = client.get(f'/threads/{thread_id}')

    assert response.status_code == 200
    payload = response.json()
    assert payload['id'] == thread_id
    assert payload['title'] == 'thread detail 조회'
    assert payload['latest_run_id'] == run_id
    assert payload['latest_run_status'] == 'running'
