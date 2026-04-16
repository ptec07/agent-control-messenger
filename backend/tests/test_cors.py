from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_cors_allows_local_vite_dev_ports_for_thread_api() -> None:
    response = client.options(
        '/threads',
        headers={
            'Origin': 'http://127.0.0.1:5174',
            'Access-Control-Request-Method': 'GET',
        },
    )

    assert response.status_code == 200
    assert response.headers['access-control-allow-origin'] == 'http://127.0.0.1:5174'
