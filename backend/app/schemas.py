from pydantic import BaseModel


class ThreadCreateRequest(BaseModel):
    title: str
    created_by: str
    agent_id: str
    initial_message: str


class RiskyActionRequest(BaseModel):
    action_type: str
    summary: str
    payload: dict


class ApprovalDecisionRequest(BaseModel):
    operator_id: str
    comment: str | None = None
