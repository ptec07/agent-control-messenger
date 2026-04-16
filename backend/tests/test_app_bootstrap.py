from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_health_check_returns_ok():
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"ok": True, "service": "agent-control-messenger-backend"}


def test_root_returns_basic_service_metadata():
    response = client.get("/")

    assert response.status_code == 200
    assert response.json()["name"] == "agent-control-messenger-backend"
    assert response.json()["status"] == "ok"
