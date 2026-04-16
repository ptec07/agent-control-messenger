from pathlib import Path

import yaml


ROOT = Path(__file__).resolve().parents[1]


def test_backend_deployment_files_exist_and_reference_healthcheck() -> None:
    dockerfile = ROOT / 'Dockerfile'
    procfile = ROOT / 'Procfile'
    render_config = ROOT / 'render.yaml'

    assert dockerfile.exists()
    assert procfile.exists()
    assert render_config.exists()

    assert 'uvicorn app.main:app' in dockerfile.read_text()
    assert 'web: uvicorn app.main:app' in procfile.read_text()

    config = yaml.safe_load(render_config.read_text())
    service = config['services'][0]
    assert service['env'] == 'docker'
    assert service['healthCheckPath'] == '/health'
    assert service['dockerfilePath'] == './backend/Dockerfile'


def test_backend_env_example_includes_public_origin_settings() -> None:
    env_example = (ROOT / '.env.example').read_text()

    assert 'ACM_FRONTEND_ORIGIN=' in env_example
    assert 'ACM_API_HOST=' in env_example
    assert 'ACM_API_PORT=' in env_example
