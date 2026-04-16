import { fireEvent, render, screen } from '@testing-library/react'

import { vi } from 'vitest'

import { ApprovalQueueView } from '../components/ApprovalQueueView'

describe('ApprovalQueueView', () => {
  it('renders empty states for blank and filtered approval results', () => {
    const { rerender } = render(
      <ApprovalQueueView approvals={[]} searchQuery="" onSearchQueryChange={() => {}} />,
    )

    expect(screen.getByText('현재 대기 중인 approval 요청이 없습니다.')).toBeInTheDocument()

    rerender(
      <ApprovalQueueView approvals={[]} searchQuery="pytest" onSearchQueryChange={() => {}} />,
    )

    expect(screen.getByText('현재 검색과 일치하는 approval 요청이 없습니다.')).toBeInTheDocument()
  })

  it('renders colored badges for risk level and approval status', () => {
    render(
      <ApprovalQueueView
        approvals={[
          {
            id: 'approval_001',
            threadId: 'thread_001',
            threadTitle: 'Hermes repo 분석',
            runId: 'run_001',
            actionType: 'shell_command',
            riskLevel: 'high',
            summary: 'pytest tests/test_api.py -q 실행 요청',
            status: 'pending',
          },
        ]}
        searchQuery=""
        onSearchQueryChange={() => {}}
      />,
    )

    expect(screen.getByLabelText('risk level badge high')).toHaveStyle({
      backgroundColor: '#fee2e2',
      color: '#991b1b',
    })
    expect(screen.getByLabelText('approval status badge pending')).toHaveStyle({
      backgroundColor: '#fef3c7',
      color: '#92400e',
    })
  })

  it('renders retry action for an error state', () => {
    const onRetry = vi.fn()

    render(
      <ApprovalQueueView
        approvals={[]}
        searchQuery=""
        errorMessage="approval queue를 불러오지 못했습니다."
        onRetry={onRetry}
        onSearchQueryChange={() => {}}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: '다시 시도' }))

    expect(onRetry).toHaveBeenCalledTimes(1)
  })


  it('renders approval skeleton cards while loading', () => {
    render(
      <ApprovalQueueView
        approvals={[]}
        searchQuery=""
        isLoading
        onSearchQueryChange={() => {}}
      />,
    )

    expect(screen.getByText('approval queue를 불러오는 중입니다.')).toBeInTheDocument()
    expect(screen.getByLabelText('approval queue skeleton')).toBeInTheDocument()
    expect(screen.getAllByLabelText(/approval skeleton card/i)).toHaveLength(3)
  })

})
