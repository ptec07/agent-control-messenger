import React from 'react'

import { approvalStateBadgeTone, Badge, BodyText, Cluster, copyTokens, FieldLabel, MetaText, SelectInput, SkeletonBadgeRow, SkeletonCardList, SkeletonText, SkeletonTitle, Stack, StatusPanel, SurfaceCard, TextInput, threadStatusBadgeTone, TitleText, statusTokens } from './status-ui'
import { PageHeaderBlock } from './page-header-block'

function ThreadListSkeleton() {
  return (
    <SkeletonCardList
      ariaLabel="thread list skeleton"
      itemAriaLabel="thread skeleton card"
      renderCard={() => (
        <>
          <SkeletonTitle width="45%" />
          <SkeletonText width="35%" />
          <SkeletonBadgeRow />
          <SkeletonText width="40%" />
          <SkeletonText width="25%" style={{ marginBottom: 0 }} />
        </>
      )}
    />
  )
}

export type ThreadListItem = {
  id: string
  title: string
  latestRunStatus: string
  hasPendingApproval: boolean
  sortRank?: number
}

export type ThreadListViewProps = {
  threads: ThreadListItem[]
  searchQuery: string
  statusFilter: string
  isLoading?: boolean
  errorMessage?: string | null
  onRetry?: () => void
  onSearchQueryChange: (value: string) => void
  onStatusFilterChange: (value: string) => void
}

export function ThreadListView({
  threads,
  searchQuery,
  statusFilter,
  isLoading = false,
  errorMessage = null,
  onRetry,
  onSearchQueryChange,
  onStatusFilterChange,
}: ThreadListViewProps) {
  const emptyMessage = searchQuery.length > 0 || statusFilter !== 'all'
    ? copyTokens.threadList.emptyFiltered
    : copyTokens.threadList.emptyDefault

  return (
    <main>
      <PageHeaderBlock title="Threads" subtitle={`total threads: ${threads.length}`} />

      <Cluster ariaLabel="thread filters" gap={statusTokens.space.md}>
        <FieldLabel label="thread search">
          <TextInput value={searchQuery} onChange={(event) => onSearchQueryChange(event.target.value)} />
        </FieldLabel>
        <FieldLabel label="thread status filter">
          <SelectInput
            value={statusFilter}
            onChange={(event) => onStatusFilterChange(event.target.value)}
            options={[
              { value: 'all', label: 'all' },
              { value: 'paused_for_approval', label: 'paused_for_approval' },
              { value: 'running', label: 'running' },
              { value: 'clear', label: 'clear' },
            ]}
          />
        </FieldLabel>
      </Cluster>

      {isLoading ? (
        <p>{copyTokens.threadList.loading}</p>
      ) : null}

      {errorMessage ? (
        <StatusPanel tone="error" title={errorMessage} actionLabel={onRetry ? copyTokens.actions.retry : undefined} onAction={onRetry} />
      ) : null}

      <section aria-label="thread-list">
        {isLoading ? <ThreadListSkeleton /> : null}
        {!isLoading && !errorMessage && threads.length === 0 ? <StatusPanel title={emptyMessage} /> : null}
        {threads.map((thread) => (
          <SurfaceCard key={thread.id} ariaLabel={`thread card ${thread.id}`}>
            <Stack gap={statusTokens.space.sm}>
              <TitleText as="h2">{thread.title}</TitleText>
              <a href={`/threads/${thread.id}`}>{`${thread.title} 상세 보기`}</a>
              <Cluster gap={statusTokens.space.sm} ariaLabel={`thread badges ${thread.id}`}>
                <Badge ariaLabel={`run status badge ${thread.latestRunStatus}`} tone={threadStatusBadgeTone(thread.latestRunStatus)}>
                  {thread.latestRunStatus}
                </Badge>
                <Badge
                  ariaLabel={`approval state badge ${thread.hasPendingApproval ? 'pending approval' : 'clear'}`}
                  tone={approvalStateBadgeTone(thread.hasPendingApproval)}
                >
                  {thread.hasPendingApproval ? 'pending approval' : 'clear'}
                </Badge>
              </Cluster>
              <Stack gap={statusTokens.space.xs}>
                <MetaText>{`run status: ${thread.latestRunStatus}`}</MetaText>
                <BodyText>{thread.hasPendingApproval ? 'pending approval' : 'clear'}</BodyText>
              </Stack>
            </Stack>
          </SurfaceCard>
        ))}
      </section>
    </main>
  )
}
