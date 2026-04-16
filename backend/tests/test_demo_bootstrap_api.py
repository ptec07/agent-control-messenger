from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_demo_bootstrap_creates_demo_threads_and_pending_approval():
    response = client.post('/demo/bootstrap')

    assert response.status_code == 201
    payload = response.json()
    assert payload['created_thread_count'] >= 2
    assert payload['pending_approval_count'] >= 1
    assert len(payload['threads']) == payload['created_thread_count']
    assert payload['threads'][0]['id'].startswith('thread_')
    assert payload['threads'][0]['latest_run_status'] in {'running', 'paused_for_approval'}
