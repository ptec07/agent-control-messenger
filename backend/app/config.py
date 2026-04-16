import os

from pydantic import BaseModel


class Settings(BaseModel):
    service_name: str = os.getenv('ACM_SERVICE_NAME', 'agent-control-messenger-backend')
    frontend_origin: str = os.getenv('ACM_FRONTEND_ORIGIN', 'http://127.0.0.1:5173')
    api_host: str = os.getenv('ACM_API_HOST', '127.0.0.1')
    api_port: int = int(os.getenv('ACM_API_PORT', '8000'))


settings = Settings()
