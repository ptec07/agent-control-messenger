import { buildApiUrl } from './runtime'

export type ApiThreadDetail = {
  id: string
  title: string
  latest_run_status: string
}

export type ApiThreadListItem = {
  id: string
  title: string
  latest_run_status: string
  has_pending_approval: boolean
}

export type ApiThreadListResponse = {
  threads: ApiThreadListItem[]
}

export type ApiThreadMessage = {
  id: string
  sender_type: string
  sender_id: string
  message_type: string
  content_text: string
  metadata: Record<string, unknown>
}

export type ApiThreadMessagesResponse = {
  thread_id: string
  messages: ApiThreadMessage[]
}

export type ApiApprovalDetail = {
  id: string
  action_type: string
  risk_level: string
  summary: string
  payload_preview: Record<string, unknown>
}

export type ApiApprovalQueueItem = {
  id: string
  thread_id: string
  thread_title: string | null
  run_id: string
  action_type: string
  risk_level: string
  summary: string
  status: string
}

export type ApiApprovalQueueResponse = {
  approval_requests: ApiApprovalQueueItem[]
}

export type ApiApprovalDecision = {
  id: string
  status: string
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(buildApiUrl(path), init)
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`)
  }
  return response.json() as Promise<T>
}

export async function fetchThreadList(): Promise<ApiThreadListResponse> {
  return requestJson<ApiThreadListResponse>('/threads')
}

export async function fetchThreadDetail(threadId: string): Promise<ApiThreadDetail> {
  return requestJson<ApiThreadDetail>(`/threads/${threadId}`)
}

export async function fetchThreadMessages(threadId: string): Promise<ApiThreadMessagesResponse> {
  return requestJson<ApiThreadMessagesResponse>(`/threads/${threadId}/messages`)
}

export async function fetchApprovalRequest(approvalId: string): Promise<ApiApprovalDetail> {
  return requestJson<ApiApprovalDetail>(`/approval-requests/${approvalId}`)
}

export async function fetchApprovalQueue(): Promise<ApiApprovalQueueResponse> {
  return requestJson<ApiApprovalQueueResponse>('/approval-requests')
}

export async function approveApprovalRequest(approvalId: string): Promise<ApiApprovalDecision> {
  return requestJson<ApiApprovalDecision>(`/approval-requests/${approvalId}/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ operator_id: 'operator_ui', comment: '승인' }),
  })
}

export async function rejectApprovalRequest(approvalId: string): Promise<ApiApprovalDecision> {
  return requestJson<ApiApprovalDecision>(`/approval-requests/${approvalId}/reject`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ operator_id: 'operator_ui', comment: '거절' }),
  })
}
