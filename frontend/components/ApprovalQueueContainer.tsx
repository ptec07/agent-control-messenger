import React, { useEffect, useRef, useState } from 'react'

import { fetchApprovalQueue } from '../lib/api'
import { getWebSocketUrl } from '../lib/runtime'
import { subscribeToThreadEvents, type ThreadEvent } from '../lib/ws'
import { approveApprovalRequest, rejectApprovalRequest } from '../lib/api'
import { copyTokens } from './status-ui'
import { ApprovalQueueView, type ApprovalQueueItem } from './ApprovalQueueView'

function readApprovalFiltersFromLocation() {
  if (typeof window === 'undefined') {
    return {
      searchQuery: '',
    }
  }

  const params = new URLSearchParams(window.location.search)
  return {
    searchQuery: (params.get('q') ?? '').trim(),
  }
}

function sortApprovals(items: ApprovalQueueItem[]): ApprovalQueueItem[] {
  return [...items].sort((left, right) => (right.sortRank ?? 0) - (left.sortRank ?? 0))
}

export function ApprovalQueueContainer() {
  const [approvals, setApprovals] = useState<ApprovalQueueItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState(() => readApprovalFiltersFromLocation().searchQuery)
  const [retryCount, setRetryCount] = useState(0)
  const nextSortRank = useRef(1)

  function allocateSortRank() {
    const rank = nextSortRank.current
    nextSortRank.current += 1
    return rank
  }

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const params = new URLSearchParams(window.location.search)
    const normalizedQuery = searchQuery.trim()

    if (normalizedQuery.length > 0) {
      params.set('q', normalizedQuery)
    } else {
      params.delete('q')
    }

    const nextSearch = params.toString()
    const nextUrl = `${window.location.pathname}${nextSearch.length > 0 ? `?${nextSearch}` : ''}`
    window.history.replaceState(window.history.state, '', nextUrl)
  }, [searchQuery])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    function syncFiltersFromLocation() {
      const nextFilters = readApprovalFiltersFromLocation()
      setSearchQuery(nextFilters.searchQuery)
    }

    window.addEventListener('popstate', syncFiltersFromLocation)
    return () => {
      window.removeEventListener('popstate', syncFiltersFromLocation)
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function refreshQueue() {
      setIsLoading(true)
      setErrorMessage(null)

      try {
        const response = await fetchApprovalQueue()
        if (cancelled) {
          return
        }

        setApprovals((current) => {
          const currentRanks = new Map(current.map((approval) => [approval.id, approval.sortRank ?? 0]))
          return sortApprovals(
            response.approval_requests.map((approval) => ({
              id: approval.id,
              threadId: approval.thread_id,
              threadTitle: approval.thread_title ?? 'untitled thread',
              runId: approval.run_id,
              actionType: approval.action_type,
              riskLevel: approval.risk_level,
              summary: approval.summary,
              status: approval.status,
              sortRank: currentRanks.get(approval.id) ?? allocateSortRank(),
            })),
          )
        })
      } catch {
        if (!cancelled) {
          setApprovals([])
          setErrorMessage(copyTokens.approvalQueue.error)
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void refreshQueue()

    const unsubscribe = subscribeToThreadEvents(getWebSocketUrl(), (event: ThreadEvent) => {
      if (event.event === 'approval.created') {
        void refreshQueue()
        return
      }

      if (event.event === 'approval.resolved') {
        const approvalId = typeof event.data.id === 'string' ? event.data.id : null
        if (!approvalId) {
          return
        }
        setApprovals((current) => current.filter((approval) => approval.id !== approvalId))
      }
    })

    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [retryCount])

  async function handleApprove(approvalId: string) {
    await approveApprovalRequest(approvalId)
    setApprovals((current) => current.filter((approval) => approval.id !== approvalId))
  }

  async function handleReject(approvalId: string) {
    await rejectApprovalRequest(approvalId)
    setApprovals((current) => current.filter((approval) => approval.id !== approvalId))
  }

  const visibleApprovals = approvals.filter((approval) => {
    const normalizedQuery = searchQuery.trim().toLowerCase()
    return (
      normalizedQuery.length === 0
      || approval.threadTitle.toLowerCase().includes(normalizedQuery)
      || approval.summary.toLowerCase().includes(normalizedQuery)
    )
  })

  return (
    <ApprovalQueueView
      approvals={visibleApprovals}
      searchQuery={searchQuery}
      isLoading={isLoading}
      errorMessage={errorMessage}
      onRetry={() => setRetryCount((current) => current + 1)}
      onSearchQueryChange={setSearchQuery}
      onApprove={handleApprove}
      onReject={handleReject}
    />
  )
}
