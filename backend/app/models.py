from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, UTC
from enum import StrEnum
from uuid import uuid4


class ThreadStatus(StrEnum):
    OPEN = "open"
    RUNNING = "running"
    WAITING_APPROVAL = "waiting_approval"
    FAILED = "failed"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class MessageType(StrEnum):
    INSTRUCTION = "instruction"
    STATUS_UPDATE = "status_update"
    APPROVAL_REQUEST = "approval_request"
    APPROVAL_RESPONSE = "approval_response"
    ARTIFACT = "artifact"
    FINAL = "final"
    ERROR = "error"


class RunStatus(StrEnum):
    QUEUED = "queued"
    RUNNING = "running"
    PAUSED_FOR_APPROVAL = "paused_for_approval"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class ApprovalStatus(StrEnum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    EXPIRED = "expired"


class ActionType(StrEnum):
    SHELL_COMMAND = "shell_command"
    FILE_OVERWRITE = "file_overwrite"
    FILE_DELETE = "file_delete"
    EXTERNAL_REQUEST = "external_request"
    SECRET_ACCESS = "secret_access"


@dataclass(slots=True)
class Thread:
    title: str
    created_by: str
    id: str = field(default_factory=lambda: f"thread_{uuid4().hex[:8]}")
    status: ThreadStatus = ThreadStatus.OPEN
    assigned_agent_id: str | None = None
    created_at: datetime = field(default_factory=lambda: datetime.now(UTC))
    updated_at: datetime = field(default_factory=lambda: datetime.now(UTC))


@dataclass(slots=True)
class Message:
    thread_id: str
    sender_type: str
    sender_id: str
    message_type: MessageType
    content_text: str
    id: str = field(default_factory=lambda: f"msg_{uuid4().hex[:8]}")
    metadata: dict = field(default_factory=dict)
    created_at: datetime = field(default_factory=lambda: datetime.now(UTC))


@dataclass(slots=True)
class Run:
    thread_id: str
    agent_id: str
    id: str = field(default_factory=lambda: f"run_{uuid4().hex[:8]}")
    status: RunStatus = RunStatus.QUEUED
    triggered_by_message_id: str | None = None
    current_approval_request_id: str | None = None
    started_at: datetime = field(default_factory=lambda: datetime.now(UTC))
    ended_at: datetime | None = None


@dataclass(slots=True)
class ApprovalRequest:
    thread_id: str
    run_id: str
    agent_id: str
    action_type: ActionType
    risk_level: str
    summary: str
    payload_preview: dict
    original_payload: dict
    id: str = field(default_factory=lambda: f"approval_{uuid4().hex[:8]}")
    status: ApprovalStatus = ApprovalStatus.PENDING
    effective_payload: dict | None = None
    operator_comment: str | None = None
    resolved_by: str | None = None
    created_at: datetime = field(default_factory=lambda: datetime.now(UTC))
    resolved_at: datetime | None = None
