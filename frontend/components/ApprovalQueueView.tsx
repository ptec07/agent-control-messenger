import React from 'react'

import { approvalStatusBadgeTone, Badge, BodyText, Button, Cluster, copyTokens, FieldLabel, InfoItem, InfoList, MetaText, riskLevelBadgeTone, SkeletonBadgeRow, SkeletonCardList, SkeletonText, SkeletonTitle, Stack, StatusPanel, SurfaceCard, TextInput, TitleText, statusTokens } from './status-ui'
import { PageHeaderBlock } from './page-header-block'

function ApprovalQueueSkeleton() {
  return (
    <SkeletonCardList
      ariaLabel="approval queue skeleton"
      itemAriaLabel="approval skeleton card"
      renderCard={() => (
        <>
          <SkeletonTitle width="40%" />
          <SkeletonText width="55%" />
          <SkeletonText width="30%" />
          <SkeletonBadgeRow />
          <SkeletonText width="35%" />
          <SkeletonText width="25%" style={{ marginBottom: 0 }} />
        </>
      )}
    />
  )
}

export type ApprovalQueueItem = {
  id: string
  threadId: string
  threadTitle: string
  runId: string
  actionType: string
  riskLevel: string
  summary: string
  status: string
  sortRank?: number
}

export type ApprovalQueueViewProps = {
  approvals: ApprovalQueueItem[]
  searchQuery: string
  isLoading?: boolean
  errorMessage?: string | null
  onRetry?: () => void
  onSearchQueryChange: (value: string) => void
  onApprove?: (approvalId: string) => void | Promise<void>
  onReject?: (approvalId: string) => void | Promise<void>
}

export function ApprovalQueueView({
  approvals,
  searchQuery,
  isLoading = false,
  errorMessage = null,
  onRetry,
  onSearchQueryChange,
  onApprove,
  onReject,
}: ApprovalQueueViewProps) {
  const emptyMessage = searchQuery.length > 0
    ? copyTokens.approvalQueue.emptyFiltered
    : copyTokens.approvalQueue.emptyDefault

  return (
    <main>
      <PageHeaderBlock title="Approval Queue" subtitle={`pending approvals: ${approvals.length}`} />

      <Cluster ariaLabel="approval filters" gap={statusTokens.space.md}>
        <FieldLabel label="approval search">
          <TextInput value={searchQuery} onChange={(event) => onSearchQueryChange(event.target.value)} />
        </FieldLabel>
      </Cluster>

      {isLoading ? <p>{copyTokens.approvalQueue.loading}</p> : null}

      {errorMessage ? (
        <StatusPanel tone="error" title={errorMessage} actionLabel={onRetry ? copyTokens.actions.retry : undefined} onAction={onRetry} />
      ) : null}

      <section aria-label="approval-queue">
        {isLoading ? <ApprovalQueueSkeleton /> : null}
        {!isLoading && !errorMessage && approvals.length === 0 ? <StatusPanel title={emptyMessage} /> : null}
        {approvals.map((approval) => (
          <SurfaceCard key={approval.id} ariaLabel={`approval card ${approval.id}`}>
            <Stack gap={statusTokens.space.sm}>
              <TitleText as="h2">{approval.threadTitle}</TitleText>
              <a href={`/threads/${approval.threadId}`}>{`${approval.threadTitle} 상세 보기`}</a>
              <BodyText>{approval.summary}</BodyText>
              <MetaText>{approval.actionType}</MetaText>
              <Cluster gap={statusTokens.space.sm} ariaLabel={`approval badges ${approval.id}`}>
                <Badge ariaLabel={`risk level badge ${approval.riskLevel}`} tone={riskLevelBadgeTone(approval.riskLevel)}>
                  {approval.riskLevel}
                </Badge>
                <Badge ariaLabel={`approval status badge ${approval.status}`} tone={approvalStatusBadgeTone(approval.status)}>
                  {approval.status}
                </Badge>
              </Cluster>
              <InfoList ariaLabel={`approval details ${approval.id}`}>
                <InfoItem label="risk">{approval.riskLevel}</InfoItem>
                <InfoItem label="status">{approval.status}</InfoItem>
                <InfoItem label="thread">{approval.threadId}</InfoItem>
                <InfoItem label="run">{approval.runId}</InfoItem>
              </InfoList>
              <Cluster gap={statusTokens.space.sm} ariaLabel={`approval actions ${approval.id}`}>
                <Button tone="primary" onClick={() => void onApprove?.(approval.id)}>
                  승인
                </Button>
                <Button tone="danger" onClick={() => void onReject?.(approval.id)}>
                  거절
                </Button>
              </Cluster>
            </Stack>
          </SurfaceCard>
        ))}
      </section>
    </main>
  )
}
