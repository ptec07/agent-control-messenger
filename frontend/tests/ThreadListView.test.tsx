import { fireEvent, render, screen } from '@testing-library/react'

import { vi } from 'vitest'

import { ThreadListView } from '../components/ThreadListView'

describe('ThreadListView', () => {
  it('renders empty states for blank and filtered thread results', () => {
    const { rerender } = render(
      <ThreadListView
        threads={[]}
        searchQuery=""
        statusFilter="all"
        onSearchQueryChange={() => {}}
        onStatusFilterChange={() => {}}
      />,
    )

    expect(screen.getByText('아직 표시할 thread가 없습니다.')).toBeInTheDocument()

    rerender(
      <ThreadListView
        threads={[]}
        searchQuery="tmp"
        statusFilter="running"
        onSearchQueryChange={() => {}}
        onStatusFilterChange={() => {}}
      />,
    )

    expect(screen.getByText('현재 필터와 일치하는 thread가 없습니다.')).toBeInTheDocument()
  })

  it('renders colored badges for run status and approval state', () => {
    render(
      <ThreadListView
        threads={[
          {
            id: 'thread_001',
            title: 'Hermes repo 분석',
            latestRunStatus: 'paused_for_approval',
            hasPendingApproval: true,
          },
        ]}
        searchQuery=""
        statusFilter="all"
        onSearchQueryChange={() => {}}
        onStatusFilterChange={() => {}}
      />,
    )

    expect(screen.getByLabelText('run status badge paused_for_approval')).toHaveStyle({
      backgroundColor: '#fef3c7',
      color: '#92400e',
    })
    expect(screen.getByLabelText('approval state badge pending approval')).toHaveStyle({
      backgroundColor: '#fee2e2',
      color: '#991b1b',
    })
  })

  it('renders retry action for an error state', () => {
    const onRetry = vi.fn()

    render(
      <ThreadListView
        threads={[]}
        searchQuery=""
        statusFilter="all"
        errorMessage="thread list를 불러오지 못했습니다."
        onRetry={onRetry}
        onSearchQueryChange={() => {}}
        onStatusFilterChange={() => {}}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: '다시 시도' }))

    expect(onRetry).toHaveBeenCalledTimes(1)
  })


  it('renders thread skeleton cards while loading', () => {
    render(
      <ThreadListView
        threads={[]}
        searchQuery=""
        statusFilter="all"
        isLoading
        onSearchQueryChange={() => {}}
        onStatusFilterChange={() => {}}
      />,
    )

    expect(screen.getByText('thread list를 불러오는 중입니다.')).toBeInTheDocument()
    expect(screen.getByLabelText('thread list skeleton')).toBeInTheDocument()
    expect(screen.getAllByLabelText(/thread skeleton card/i)).toHaveLength(3)
  })

})
