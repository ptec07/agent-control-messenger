import os

from pydantic import BaseModel


TRUE_VALUES = {'1', 'true', 'yes', 'on'}


def env_flag(name: str, default: bool = False) -> bool:
    raw = os.getenv(name)
    if raw is None:
        return default
    return raw.strip().lower() in TRUE_VALUES


class Settings(BaseModel):
    service_name: str = os.getenv('ACM_SERVICE_NAME', 'agent-control-messenger-backend')
    frontend_origin: str = os.getenv('ACM_FRONTEND_ORIGIN', 'http://127.0.0.1:5173')
    api_host: str = os.getenv('ACM_API_HOST', '127.0.0.1')
    api_port: int = int(os.getenv('ACM_API_PORT', '8000'))
    environment: str = os.getenv('ACM_ENV', 'development').strip().lower()
    allow_demo_bootstrap: bool = env_flag('ACM_ALLOW_DEMO_BOOTSTRAP', default=False)

    @property
    def is_production(self) -> bool:
        return self.environment == 'production'

    @property
    def demo_bootstrap_enabled(self) -> bool:
        return not self.is_production or self.allow_demo_bootstrap


settings = Settings()
