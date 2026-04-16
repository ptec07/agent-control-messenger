import React from 'react'

import { ApprovalCard, type ApprovalCardProps } from './ApprovalCard'
import { BodyText, copyTokens, SkeletonCardList, StatusPanel } from './status-ui'
import { PageHeaderBlock } from './page-header-block'
import { TimelineItem, TimelineSkeletonItem } from './timeline-item'


function ThreadDetailSkeleton() {
  return (
    <SkeletonCardList
      ariaLabel="thread detail skeleton"
      itemAriaLabel="timeline skeleton item"
      renderCard={(index) => <TimelineSkeletonItem index={index} />}
    />
  )
}

export type ThreadMessage = {
  id: string
  senderType: string
  senderId: string
  messageType: string
  contentText: string
  approval?: ApprovalCardProps['approval']
}

export type ThreadDetailViewProps = {
  threadTitle: string
  runStatus: string
  messages: ThreadMessage[]
  isLoading?: boolean
  errorMessage?: string | null
  onRetry?: () => void
  onApprove?: (approvalId: string) => void | Promise<void>
  onReject?: (approvalId: string) => void | Promise<void>
}

export function ThreadDetailView({
  threadTitle,
  runStatus,
  messages,
  isLoading = false,
  errorMessage = null,
  onRetry,
  onApprove,
  onReject,
}: ThreadDetailViewProps) {
  return (
    <main>
      <PageHeaderBlock title={threadTitle} subtitle={`run status: ${runStatus}`} />

      {isLoading ? <p>{copyTokens.threadDetail.loading}</p> : null}

      {errorMessage ? (
        <StatusPanel tone="error" title={errorMessage} actionLabel={onRetry ? copyTokens.actions.retry : undefined} onAction={onRetry} />
      ) : null}

      <section aria-label="timeline">
        {isLoading ? <ThreadDetailSkeleton /> : null}
        {!isLoading && !errorMessage && messages.length === 0 ? <StatusPanel title={copyTokens.threadDetail.emptyTimeline} /> : null}
        {messages.map((message) => (
          <TimelineItem key={message.id} metaLabel={`${message.senderType}:${message.messageType}`}>
            {message.approval ? (
              <ApprovalCard approval={message.approval} onApprove={onApprove} onReject={onReject} />
            ) : (
              <BodyText>{message.contentText}</BodyText>
            )}
          </TimelineItem>
        ))}
      </section>
    </main>
  )
}
