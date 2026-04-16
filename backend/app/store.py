from __future__ import annotations

from dataclasses import asdict

from datetime import UTC, datetime

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


class InMemoryStore:
    def __init__(self) -> None:
        self.threads: dict[str, Thread] = {}
        self.messages: dict[str, list[Message]] = {}
        self.runs: dict[str, Run] = {}
        self.approvals: dict[str, ApprovalRequest] = {}

    def reset(self) -> None:
        self.threads.clear()
        self.messages.clear()
        self.runs.clear()
        self.approvals.clear()

    def create_thread(
        self,
        *,
        title: str,
        created_by: str,
        agent_id: str,
        initial_message: str,
    ) -> tuple[Thread, Message, Run]:
        thread = Thread(
            title=title,
            created_by=created_by,
            assigned_agent_id=agent_id,
            status=ThreadStatus.RUNNING,
        )
        message = Message(
            thread_id=thread.id,
            sender_type="human",
            sender_id=created_by,
            message_type=MessageType.INSTRUCTION,
            content_text=initial_message,
        )
        run = Run(
            thread_id=thread.id,
            agent_id=agent_id,
            triggered_by_message_id=message.id,
            status=RunStatus.RUNNING,
        )
        self.threads[thread.id] = thread
        self.messages[thread.id] = [message]
        self.runs[run.id] = run
        return thread, message, run

    def get_thread(self, thread_id: str) -> Thread | None:
        return self.threads.get(thread_id)

    def list_threads(self) -> list[Thread]:
        return list(self.threads.values())

    def get_thread_messages(self, thread_id: str) -> list[Message]:
        return self.messages.get(thread_id, [])

    def append_message(
        self,
        *,
        thread_id: str,
        sender_type: str,
        sender_id: str,
        message_type: MessageType,
        content_text: str,
        metadata: dict | None = None,
    ) -> Message | None:
        if thread_id not in self.threads:
            return None
        message = Message(
            thread_id=thread_id,
            sender_type=sender_type,
            sender_id=sender_id,
            message_type=message_type,
            content_text=content_text,
            metadata=metadata or {},
        )
        self.messages.setdefault(thread_id, []).append(message)
        return message

    def get_latest_run_for_thread(self, thread_id: str) -> Run | None:
        for run in reversed(list(self.runs.values())):
            if run.thread_id == thread_id:
                return run
        return None

    def get_run(self, run_id: str) -> Run | None:
        return self.runs.get(run_id)

    def create_approval_for_run(
        self,
        *,
        run_id: str,
        action_type: str,
        summary: str,
        payload: dict,
    ) -> ApprovalRequest | None:
        run = self.runs.get(run_id)
        if run is None:
            return None
        approval = ApprovalRequest(
            thread_id=run.thread_id,
            run_id=run.id,
            agent_id=run.agent_id,
            action_type=ActionType(action_type),
            risk_level="high",
            summary=summary,
            payload_preview=payload,
            original_payload=payload,
        )
        self.approvals[approval.id] = approval
        run.status = RunStatus.PAUSED_FOR_APPROVAL
        run.current_approval_request_id = approval.id
        return approval

    def resolve_approval(
        self,
        approval_id: str,
        *,
        approved: bool,
        operator_id: str,
        comment: str | None,
    ) -> ApprovalRequest | None:
        approval = self.approvals.get(approval_id)
        if approval is None:
            return None
        run = self.runs.get(approval.run_id)
        approval.status = ApprovalStatus.APPROVED if approved else ApprovalStatus.REJECTED
        approval.operator_comment = comment
        approval.resolved_by = operator_id
        approval.resolved_at = datetime.now(UTC)
        if run is not None:
            run.current_approval_request_id = None
            run.status = RunStatus.RUNNING if approved else RunStatus.CANCELLED
        return approval

    def get_approval(self, approval_id: str) -> ApprovalRequest | None:
        return self.approvals.get(approval_id)

    def list_pending_approvals(self) -> list[ApprovalRequest]:
        return [approval for approval in self.approvals.values() if approval.status == ApprovalStatus.PENDING]


store = InMemoryStore()
