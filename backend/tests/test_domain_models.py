from app.models import (
    ActionType,
    ApprovalRequest,
    ApprovalStatus,
    Message,
    MessageType,
    Run,
    RunStatus,
    Thread,
    ThreadStatus,
)


def test_thread_defaults_to_open_status():
    thread = Thread(title="Hermes repo 분석", created_by="user_001")

    assert thread.status is ThreadStatus.OPEN
    assert thread.id


def test_message_defaults_metadata_to_empty_dict():
    message = Message(
        thread_id="thread_001",
        sender_type="human",
        sender_id="user_001",
        message_type=MessageType.INSTRUCTION,
        content_text="분석해줘",
    )

    assert message.metadata == {}


def test_run_defaults_to_queued_status():
    run = Run(thread_id="thread_001", agent_id="agent_001")

    assert run.status is RunStatus.QUEUED
    assert run.current_approval_request_id is None


def test_approval_request_defaults_to_pending_status():
    approval = ApprovalRequest(
        thread_id="thread_001",
        run_id="run_001",
        agent_id="agent_001",
        action_type=ActionType.SHELL_COMMAND,
        risk_level="high",
        summary="pytest 실행 요청",
        payload_preview={"command": "pytest tests -q"},
        original_payload={"command": "pytest tests -q"},
    )

    assert approval.status is ApprovalStatus.PENDING
    assert approval.effective_payload is None
