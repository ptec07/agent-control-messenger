from dataclasses import asdict
from datetime import datetime

from app.models import ApprovalRequest, Message, Run


def _json_ready(payload: dict) -> dict:
    ready: dict = {}
    for key, value in payload.items():
        if isinstance(value, datetime):
            ready[key] = value.isoformat()
        else:
            ready[key] = value
    return ready


def message_created(message: Message) -> dict:
    return {
        'event': 'message.created',
        'data': {
            **_json_ready(asdict(message)),
            'message_type': message.message_type,
        },
    }


def approval_created(approval: ApprovalRequest) -> dict:
    return {
        'event': 'approval.created',
        'data': {
            **_json_ready(asdict(approval)),
            'action_type': approval.action_type,
            'status': approval.status,
        },
    }


def approval_resolved(approval: ApprovalRequest) -> dict:
    return {
        'event': 'approval.resolved',
        'data': {
            **_json_ready(asdict(approval)),
            'action_type': approval.action_type,
            'status': approval.status,
        },
    }


def run_status_changed(run: Run) -> dict:
    return {
        'event': 'run.status_changed',
        'data': {
            **_json_ready(asdict(run)),
            'status': run.status,
        },
    }
