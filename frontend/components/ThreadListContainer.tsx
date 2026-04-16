import React, { useEffect, useRef, useState } from 'react'

import { fetchThreadList } from '../lib/api'
import { getWebSocketUrl } from '../lib/runtime'
import { subscribeToThreadEvents, type ThreadEvent } from '../lib/ws'
import { copyTokens } from './status-ui'
import { ThreadListView, type ThreadListItem } from './ThreadListView'

const VALID_THREAD_STATUS_FILTERS = new Set(['all', 'paused_for_approval', 'running', 'clear'])

function readThreadFiltersFromLocation() {
  if (typeof window === 'undefined') {
    return {
      searchQuery: '',
      statusFilter: 'all',
    }
  }

  const params = new URLSearchParams(window.location.search)
  const rawQuery = params.get('q') ?? ''
  const rawStatus = params.get('status') ?? 'all'
  return {
    searchQuery: rawQuery.trim(),
    statusFilter: VALID_THREAD_STATUS_FILTERS.has(rawStatus) ? rawStatus : 'all',
  }
}

function sortThreads(items: ThreadListItem[]): ThreadListItem[] {
  return [...items].sort((left, right) => {
    if (left.hasPendingApproval !== right.hasPendingApproval) {
      return left.hasPendingApproval ? -1 : 1
    }
    return (right.sortRank ?? 0) - (left.sortRank ?? 0)
  })
}

export function ThreadListContainer() {
  const [threads, setThreads] = useState<ThreadListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState(() => readThreadFiltersFromLocation().searchQuery)
  const [statusFilter, setStatusFilter] = useState(() => readThreadFiltersFromLocation().statusFilter)
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

    if (statusFilter !== 'all') {
      params.set('status', statusFilter)
    } else {
      params.delete('status')
    }

    const nextSearch = params.toString()
    const nextUrl = `${window.location.pathname}${nextSearch.length > 0 ? `?${nextSearch}` : ''}`
    window.history.replaceState(window.history.state, '', nextUrl)
  }, [searchQuery, statusFilter])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    function syncFiltersFromLocation() {
      const nextFilters = readThreadFiltersFromLocation()
      setSearchQuery(nextFilters.searchQuery)
      setStatusFilter(nextFilters.statusFilter)
    }

    window.addEventListener('popstate', syncFiltersFromLocation)
    return () => {
      window.removeEventListener('popstate', syncFiltersFromLocation)
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function refreshThreads() {
      setIsLoading(true)
      setErrorMessage(null)

      try {
        const response = await fetchThreadList()
        if (cancelled) {
          return
        }

        setThreads((current) => {
          const currentRanks = new Map(current.map((thread) => [thread.id, thread.sortRank ?? 0]))
          return sortThreads(
            response.threads.map((thread) => ({
              id: thread.id,
              title: thread.title,
              latestRunStatus: thread.latest_run_status,
              hasPendingApproval: thread.has_pending_approval,
              sortRank: currentRanks.get(thread.id) ?? allocateSortRank(),
            })),
          )
        })
      } catch {
        if (!cancelled) {
          setThreads([])
          setErrorMessage(copyTokens.threadList.error)
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void refreshThreads()

    const unsubscribe = subscribeToThreadEvents(getWebSocketUrl(), (event: ThreadEvent) => {
      if (event.event === 'run.status_changed') {
        const threadId = typeof event.data.thread_id === 'string' ? event.data.thread_id : null
        const status = typeof event.data.status === 'string' ? event.data.status : null
        if (!threadId || !status) {
          return
        }

        setThreads((current) => {
          const existing = current.find((thread) => thread.id === threadId)
          if (!existing) {
            void refreshThreads()
            return current
          }

          return sortThreads(
            current.map((thread) =>
              thread.id === threadId
                ? {
                    ...thread,
                    latestRunStatus: status,
                    hasPendingApproval: Boolean(event.data.current_approval_request_id),
                    sortRank: allocateSortRank(),
                  }
                : thread,
            ),
          )
        })
        return
      }

      if (event.event === 'approval.created') {
        const threadId = typeof event.data.thread_id === 'string' ? event.data.thread_id : null
        if (!threadId) {
          return
        }

        setThreads((current) => {
          const existing = current.find((thread) => thread.id === threadId)
          if (!existing) {
            void refreshThreads()
            return current
          }

          return sortThreads(
            current.map((thread) =>
              thread.id === threadId
                ? {
                    ...thread,
                    hasPendingApproval: true,
                    sortRank: allocateSortRank(),
                  }
                : thread,
            ),
          )
        })
        return
      }

      if (event.event === 'approval.resolved') {
        const threadId = typeof event.data.thread_id === 'string' ? event.data.thread_id : null
        if (!threadId) {
          return
        }

        setThreads((current) =>
          sortThreads(
            current.map((thread) =>
              thread.id === threadId
                ? {
                    ...thread,
                    hasPendingApproval: false,
                    sortRank: allocateSortRank(),
                  }
                : thread,
            ),
          ),
        )
      }
    })

    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [retryCount])

  const visibleThreads = threads.filter((thread) => {
    const normalizedQuery = searchQuery.trim().toLowerCase()
    const matchesQuery = normalizedQuery.length === 0 || thread.title.toLowerCase().includes(normalizedQuery)
    const matchesStatus =
      statusFilter === 'all'
      || thread.latestRunStatus === statusFilter
      || (statusFilter === 'clear' && !thread.hasPendingApproval)
    return matchesQuery && matchesStatus
  })

  return (
    <ThreadListView
      threads={visibleThreads}
      searchQuery={searchQuery}
      statusFilter={statusFilter}
      isLoading={isLoading}
      errorMessage={errorMessage}
      onRetry={() => setRetryCount((current) => current + 1)}
      onSearchQueryChange={setSearchQuery}
      onStatusFilterChange={setStatusFilter}
    />
  )
}
