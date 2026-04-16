from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_demo_run_adds_status_message_and_pending_approval():
    create_response = client.post(
        "/threads",
        json={
            "title": "demo run 테스트",
            "created_by": "user_demo",
            "agent_id": "agent_hermes_1",
            "initial_message": "데모 실행",
        },
    )
    thread_id = create_response.json()["id"]
    run_id = create_response.json()["initial_run_id"]

    response = client.post(f"/threads/{thread_id}/demo-run")

    assert response.status_code == 200
    payload = response.json()
    assert payload["run_id"] == run_id
    assert payload["approval_request_id"].startswith("approval_")

    messages_response = client.get(f"/threads/{thread_id}/messages")
    messages = messages_response.json()["messages"]
    assert messages[1]["message_type"] == "status_update"
    assert "repo 구조를 확인하는 중입니다" in messages[1]["content_text"]
    assert messages[2]["message_type"] == "approval_request"
