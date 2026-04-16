from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_create_thread_creates_instruction_message_and_run():
    response = client.post(
        "/threads",
        json={
            "title": "Hermes repo 분석",
            "created_by": "user_001",
            "agent_id": "agent_hermes_1",
            "initial_message": "이 저장소를 분석해줘",
        },
    )

    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Hermes repo 분석"
    assert data["status"] == "running"
    assert data["initial_run_id"].startswith("run_")
    assert data["initial_message_id"].startswith("msg_")


def test_get_thread_messages_returns_initial_instruction_message():
    create_response = client.post(
        "/threads",
        json={
            "title": "메시지 조회 테스트",
            "created_by": "user_002",
            "agent_id": "agent_hermes_1",
            "initial_message": "초기 메시지",
        },
    )
    thread_id = create_response.json()["id"]

    response = client.get(f"/threads/{thread_id}/messages")

    assert response.status_code == 200
    payload = response.json()
    assert payload["thread_id"] == thread_id
    assert payload["messages"][0]["message_type"] == "instruction"
    assert payload["messages"][0]["content_text"] == "초기 메시지"


def test_get_run_returns_created_run():
    create_response = client.post(
        "/threads",
        json={
            "title": "run 조회 테스트",
            "created_by": "user_003",
            "agent_id": "agent_hermes_1",
            "initial_message": "run 생성",
        },
    )
    run_id = create_response.json()["initial_run_id"]

    response = client.get(f"/runs/{run_id}")

    assert response.status_code == 200
    payload = response.json()
    assert payload["id"] == run_id
    assert payload["status"] == "running"
    assert payload["agent_id"] == "agent_hermes_1"
