import React, { useEffect, useState } from 'react'

import {
  approveApprovalRequest,
  fetchApprovalRequest,
  fetchThreadDetail,
  fetchThreadMessages,
  rejectApprovalRequest,
  type ApiApprovalDecision,
} from '../lib/api'
import { getWebSocketUrl } from '../lib/runtime'
import { subscribeToThreadEvents, type ThreadEvent } from '../lib/ws'
import { copyTokens } from './status-ui'
import { ThreadDetailView, type ThreadMessage } from './ThreadDetailView'

export type ThreadDetailContainerProps = {
  threadId: string
}

export function ThreadDetailContainer({ threadId }: ThreadDetailContainerProps) {
  const [threadTitle, setThreadTitle] = useState('loading')
  const [runStatus, setRunStatus] = useState('loading')
  const [messages, setMessages] = useState<ThreadMessage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  async function mapMessage(message: {
    id: string
    sender_type: string
    sender_id: string
    message_type: string
    content_text: string
    metadata?: Record<string, unknown>
  }): Promise<ThreadMessage> {
    if (message.message_type !== 'approval_request') {
      return {
        id: message.id,
        senderType: message.sender_type,
        senderId: message.sender_id,
        messageType: message.message_type,
        contentText: message.content_text,
      }
    }

    const approvalId = String(message.metadata?.approval_request_id ?? '')
    const approval = await fetchApprovalRequest(approvalId)
    return {
      id: message.id,
      senderType: message.sender_type,
      senderId: message.sender_id,
      messageType: message.message_type,
      contentText: message.content_text,
      approval: {
        id: approval.id,
        actionType: approval.action_type,
        riskLevel: approval.risk_level,
        summary: approval.summary,
        scope: 'approval-required',
        payloadPreview: JSON.stringify(approval.payload_preview),
        status: 'pending',
      },
    }
  }

  function applyApprovalDecision(approvalId: string, decision: ApiApprovalDecision) {
    setMessages((current) =>
      current.map((message) => {
        if (message.approval?.id !== approvalId) {
          return message
        }

        return {
          ...message,
          approval: {
            ...message.approval,
            status: decision.status,
          },
        }
      }),
    )

    if (decision.status === 'approved') {
      setRunStatus('running')
      return
    }

    if (decision.status === 'rejected') {
      setRunStatus('cancelled')
    }
  }

  async function handleApprove(approvalId: string) {
    const decision = await approveApprovalRequest(approvalId)
    applyApprovalDecision(approvalId, decision)
  }

  async function handleReject(approvalId: string) {
    const decision = await rejectApprovalRequest(approvalId)
    applyApprovalDecision(approvalId, decision)
  }

  useEffect(() => {
    let cancelled = false

    async function load() {
      setIsLoading(true)
      setErrorMessage(null)

      try {
        const thread = await fetchThreadDetail(threadId)
        const messageResponse = await fetchThreadMessages(threadId)
        const mappedMessages = await Promise.all(messageResponse.messages.map((message) => mapMessage(message)))

        if (!cancelled) {
          setThreadTitle(thread.title)
          setRunStatus(thread.latest_run_status)
          setMessages(mappedMessages)
        }
      } catch {
        if (!cancelled) {
          setThreadTitle('error')
          setRunStatus('error')
          setMessages([])
          setErrorMessage(copyTokens.threadDetail.error)
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void load()
    const unsubscribe = subscribeToThreadEvents(getWebSocketUrl(), (event: ThreadEvent) => {
      if (event.event === 'run.status_changed' && typeof event.data.status === 'string') {
        setRunStatus(event.data.status)
        return
      }

      if (event.event === 'message.created') {
        void mapMessage({
          id: String(event.data.id),
          sender_id: String(event.data.sender_id),
          sender_type: String(event.data.sender_type),
          message_type: String(event.data.message_type),
          content_text: String(event.data.content_text),
          metadata: (event.data.metadata as Record<string, unknown> | undefined) ?? {},
        }).then((mappedMessage) => {
          setMessages((current) => [...current, mappedMessage])
        })
      }
    })

    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [threadId, retryCount])

  return (
    <ThreadDetailView
      threadTitle={threadTitle}
      runStatus={runStatus}
      messages={messages}
      isLoading={isLoading}
      errorMessage={errorMessage}
      onRetry={() => setRetryCount((current) => current + 1)}
      onApprove={handleApprove}
      onReject={handleReject}
    />
  )
}
