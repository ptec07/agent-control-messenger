from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def _create_thread() -> dict:
    response = client.post(
        "/threads",
        json={
            "title": "승인 플로우 테스트",
            "created_by": "user_approval",
            "agent_id": "agent_hermes_1",
            "initial_message": "위험 작업을 시도해줘",
        },
    )
    assert response.status_code == 201
    return response.json()


def test_risky_action_creates_approval_request_and_pauses_run():
    created = _create_thread()
    run_id = created["initial_run_id"]

    response = client.post(
        f"/runs/{run_id}/simulate-risky-action",
        json={
            "action_type": "shell_command",
            "summary": "pytest tests/test_api.py -q 실행 요청",
            "payload": {"command": "pytest tests/test_api.py -q"},
        },
    )

    assert response.status_code == 201
    payload = response.json()
    assert payload["status"] == "pending"
    assert payload["action_type"] == "shell_command"

    run_response = client.get(f"/runs/{run_id}")
    assert run_response.status_code == 200
    assert run_response.json()["status"] == "paused_for_approval"
    assert run_response.json()["current_approval_request_id"] == payload["id"]


def test_approving_request_resumes_run():
    created = _create_thread()
    run_id = created["initial_run_id"]
    approval_response = client.post(
        f"/runs/{run_id}/simulate-risky-action",
        json={
            "action_type": "shell_command",
            "summary": "pytest tests/test_api.py -q 실행 요청",
            "payload": {"command": "pytest tests/test_api.py -q"},
        },
    )
    approval_id = approval_response.json()["id"]

    response = client.post(
        f"/approval-requests/{approval_id}/approve",
        json={"operator_id": "operator_001", "comment": "승인"},
    )

    assert response.status_code == 200
    assert response.json()["status"] == "approved"

    run_response = client.get(f"/runs/{run_id}")
    assert run_response.json()["status"] == "running"


def test_rejecting_request_cancels_run():
    created = _create_thread()
    run_id = created["initial_run_id"]
    approval_response = client.post(
        f"/runs/{run_id}/simulate-risky-action",
        json={
            "action_type": "file_delete",
            "summary": "tmp 디렉터리 삭제 요청",
            "payload": {"path": "/tmp/demo"},
        },
    )
    approval_id = approval_response.json()["id"]

    response = client.post(
        f"/approval-requests/{approval_id}/reject",
        json={"operator_id": "operator_001", "comment": "거절"},
    )

    assert response.status_code == 200
    assert response.json()["status"] == "rejected"

    run_response = client.get(f"/runs/{run_id}")
    assert run_response.json()["status"] == "cancelled"
