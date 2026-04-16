import importlib

from fastapi.testclient import TestClient

import app.config as config_module
import app.main as main_module


def build_client(monkeypatch: object, **env: str) -> TestClient:
    for key, value in env.items():
        monkeypatch.setenv(key, value)

    importlib.reload(config_module)
    reloaded_main = importlib.reload(main_module)
    return TestClient(reloaded_main.app)


def test_demo_bootstrap_creates_demo_threads_and_pending_approval(monkeypatch):
    client = build_client(monkeypatch, ACM_ENV='development')
    response = client.post('/demo/bootstrap')

    assert response.status_code == 201
    payload = response.json()
    assert payload['created_thread_count'] >= 2
    assert payload['pending_approval_count'] >= 1
    assert len(payload['threads']) == payload['created_thread_count']
    assert payload['threads'][0]['id'].startswith('thread_')
    assert payload['threads'][0]['latest_run_status'] in {'running', 'paused_for_approval'}


def test_demo_bootstrap_is_blocked_in_production_by_default(monkeypatch):
    client = build_client(monkeypatch, ACM_ENV='production')

    response = client.post('/demo/bootstrap')

    assert response.status_code == 403
    assert response.json() == {'detail': 'Demo bootstrap is disabled in production'}


def test_demo_bootstrap_can_be_explicitly_enabled_in_production(monkeypatch):
    client = build_client(
        monkeypatch,
        ACM_ENV='production',
        ACM_ALLOW_DEMO_BOOTSTRAP='true',
    )

    response = client.post('/demo/bootstrap')

    assert response.status_code == 201
