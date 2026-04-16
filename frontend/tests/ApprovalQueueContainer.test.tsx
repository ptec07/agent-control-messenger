import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { vi } from 'vitest'

const hoisted = vi.hoisted(() => ({
  wsHandler: null as null | ((event: { event: string; data: Record<string, unknown> }) => void),
  fetchApprovalQueue: vi.fn(),
  approveApprovalRequest: vi.fn(async (approvalId: string) => ({
    id: approvalId,
    status: 'approved',
  })),
  rejectApprovalRequest: vi.fn(async (approvalId: string) => ({
    id: approvalId,
    status: 'rejected',
  })),
}))

vi.mock('../lib/api', () => ({
  fetchApprovalQueue: hoisted.fetchApprovalQueue,
  approveApprovalRequest: hoisted.approveApprovalRequest,
  rejectApprovalRequest: hoisted.rejectApprovalRequest,
}))

vi.mock('../lib/ws', () => ({
  subscribeToThreadEvents: vi.fn((_: string, onEvent: (event: { event: string; data: Record<string, unknown> }) => void) => {
    hoisted.wsHandler = onEvent
    return () => {
      hoisted.wsHandler = null
    }
  }),
}))

import { ApprovalQueueContainer } from '../components/ApprovalQueueContainer'

describe('ApprovalQueueContainer', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/approval-requests')
    hoisted.fetchApprovalQueue.mockReset()
    hoisted.fetchApprovalQueue.mockResolvedValue({
      approval_requests: [
        {
          id: 'approval_001',
          thread_id: 'thread_001',
          thread_title: 'Hermes repo 분석',
          run_id: 'run_001',
          action_type: 'shell_command',
          risk_level: 'high',
          summary: 'pytest tests/test_api.py -q 실행 요청',
          status: 'pending',
        },
        {
          id: 'approval_002',
          thread_id: 'thread_002',
          thread_title: 'tmp 정리 작업',
          run_id: 'run_002',
          action_type: 'file_delete',
          risk_level: 'high',
          summary: '/tmp/demo 삭제 요청',
          status: 'pending',
        },
      ],
    })
    hoisted.approveApprovalRequest.mockClear()
    hoisted.rejectApprovalRequest.mockClear()
    hoisted.wsHandler = null
  })

  it('shows loading and error states while fetching approvals', async () => {
    let resolveFetch: ((value: { approval_requests: Array<{ id: string; thread_id: string; thread_title: string; run_id: string; action_type: string; risk_level: string; summary: string; status: string }> }) => void) | null = null
    hoisted.fetchApprovalQueue.mockImplementationOnce(
      () => new Promise((resolve) => {
        resolveFetch = resolve
      }),
    )

    render(<ApprovalQueueContainer />)

    expect(screen.getByText('approval queue를 불러오는 중입니다.')).toBeInTheDocument()

    resolveFetch?.({
      approval_requests: [
        {
          id: 'approval_001',
          thread_id: 'thread_001',
          thread_title: 'Hermes repo 분석',
          run_id: 'run_001',
          action_type: 'shell_command',
          risk_level: 'high',
          summary: 'pytest tests/test_api.py -q 실행 요청',
          status: 'pending',
        },
      ],
    })

    await waitFor(() => {
      expect(screen.getByText('Hermes repo 분석')).toBeInTheDocument()
    })

    hoisted.fetchApprovalQueue.mockRejectedValueOnce(new Error('boom'))
    render(<ApprovalQueueContainer />)

    await waitFor(() => {
      expect(screen.getByText('approval queue를 불러오지 못했습니다.')).toBeInTheDocument()
    })
  })


  it('retries approval loading after an error', async () => {
    hoisted.fetchApprovalQueue
      .mockRejectedValueOnce(new Error('boom'))
      .mockResolvedValueOnce({
        approval_requests: [
          {
            id: 'approval_003',
            thread_id: 'thread_003',
            thread_title: 'retry 이후 승인',
            run_id: 'run_003',
            action_type: 'shell_command',
            risk_level: 'medium',
            summary: 'npm test 재실행 요청',
            status: 'pending',
          },
        ],
      })

    render(<ApprovalQueueContainer />)

    await waitFor(() => {
      expect(screen.getByText('approval queue를 불러오지 못했습니다.')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: '다시 시도' }))

    await waitFor(() => {
      expect(screen.getByText('retry 이후 승인')).toBeInTheDocument()
    })
    expect(hoisted.fetchApprovalQueue).toHaveBeenCalledTimes(2)
  })

  it('renders thread detail links for approval rows', async () => {
    hoisted.fetchApprovalQueue.mockResolvedValueOnce({
      approval_requests: [
        {
          id: 'approval_001',
          thread_id: 'thread_001',
          thread_title: 'Hermes repo 분석',
          run_id: 'run_001',
          action_type: 'shell_command',
          risk_level: 'high',
          summary: 'pytest tests/test_api.py -q 실행 요청',
          status: 'pending',
        },
        {
          id: 'approval_002',
          thread_id: 'thread_002',
          thread_title: 'tmp 정리 작업',
          run_id: 'run_002',
          action_type: 'file_delete',
          risk_level: 'high',
          summary: '/tmp/demo 삭제 요청',
          status: 'pending',
        },
      ],
    })

    render(<ApprovalQueueContainer />)

    await waitFor(() => {
      expect(hoisted.fetchApprovalQueue).toHaveBeenCalledTimes(1)
    })

    expect(screen.getByRole('link', { name: 'Hermes repo 분석 상세 보기' })).toHaveAttribute('href', '/threads/thread_001')
    expect(screen.getByRole('link', { name: 'tmp 정리 작업 상세 보기' })).toHaveAttribute('href', '/threads/thread_002')
  })

  it('loads pending approval requests with newest items first', async () => {
    hoisted.fetchApprovalQueue.mockResolvedValueOnce({
      approval_requests: [
        {
          id: 'approval_001',
          thread_id: 'thread_001',
          thread_title: 'Hermes repo 분석',
          run_id: 'run_001',
          action_type: 'shell_command',
          risk_level: 'high',
          summary: 'pytest tests/test_api.py -q 실행 요청',
          status: 'pending',
        },
        {
          id: 'approval_002',
          thread_id: 'thread_002',
          thread_title: 'tmp 정리 작업',
          run_id: 'run_002',
          action_type: 'file_delete',
          risk_level: 'high',
          summary: '/tmp/demo 삭제 요청',
          status: 'pending',
        },
      ],
    })

    render(<ApprovalQueueContainer />)

    await waitFor(() => {
      expect(hoisted.fetchApprovalQueue).toHaveBeenCalledTimes(1)
    })

    const titles = screen.getAllByRole('heading', { level: 2 }).map((node) => node.textContent)
    expect(titles).toEqual(['tmp 정리 작업', 'Hermes repo 분석'])
  })

  it('filters approval rows by search text', async () => {
    render(<ApprovalQueueContainer />)

    await waitFor(() => {
      expect(screen.getByText('Hermes repo 분석')).toBeInTheDocument()
    })

    fireEvent.change(screen.getByLabelText('approval search'), { target: { value: '외부 API' } })

    await waitFor(() => {
      expect(screen.queryByText('Hermes repo 분석')).not.toBeInTheDocument()
      expect(screen.queryByText('tmp 정리 작업')).not.toBeInTheDocument()
    })

    fireEvent.change(screen.getByLabelText('approval search'), { target: { value: 'tmp' } })

    await waitFor(() => {
      expect(screen.getByText('tmp 정리 작업')).toBeInTheDocument()
      expect(screen.queryByText('Hermes repo 분석')).not.toBeInTheDocument()
    })
  })

  it('hydrates approval search from URL query params', async () => {
    window.history.replaceState({}, '', '/approval-requests?q=tmp')

    render(<ApprovalQueueContainer />)

    await waitFor(() => {
      expect(screen.getByLabelText('approval search')).toHaveValue('tmp')
    })

    expect(screen.getByText('tmp 정리 작업')).toBeInTheDocument()
    expect(screen.queryByText('Hermes repo 분석')).not.toBeInTheDocument()
  })

  it('persists approval search into URL query params when the filter changes', async () => {
    render(<ApprovalQueueContainer />)

    await waitFor(() => {
      expect(screen.getByText('Hermes repo 분석')).toBeInTheDocument()
    })

    fireEvent.change(screen.getByLabelText('approval search'), { target: { value: 'tmp' } })

    await waitFor(() => {
      expect(window.location.search).toBe('?q=tmp')
    })

    fireEvent.change(screen.getByLabelText('approval search'), { target: { value: '' } })

    await waitFor(() => {
      expect(window.location.search).toBe('')
    })
  })

  it('normalizes approval search query params on hydrate', async () => {
    window.history.replaceState({}, '', '/approval-requests?q=%20tmp%20')

    render(<ApprovalQueueContainer />)

    await waitFor(() => {
      expect(screen.getByLabelText('approval search')).toHaveValue('tmp')
    })

    expect(window.location.search).toBe('?q=tmp')
    expect(screen.getByText('tmp 정리 작업')).toBeInTheDocument()
  })

  it('updates approval search when browser navigation changes the URL', async () => {
    render(<ApprovalQueueContainer />)

    await waitFor(() => {
      expect(screen.getByText('Hermes repo 분석')).toBeInTheDocument()
    })

    await act(async () => {
      window.history.pushState({}, '', '/approval-requests?q=tmp')
      window.dispatchEvent(new PopStateEvent('popstate'))
    })

    await waitFor(() => {
      expect(screen.getByLabelText('approval search')).toHaveValue('tmp')
    })

    expect(screen.getByText('tmp 정리 작업')).toBeInTheDocument()
    expect(screen.queryByText('Hermes repo 분석')).not.toBeInTheDocument()

    await act(async () => {
      window.history.pushState({}, '', '/approval-requests')
      window.dispatchEvent(new PopStateEvent('popstate'))
    })

    await waitFor(() => {
      expect(screen.getByLabelText('approval search')).toHaveValue('')
    })

    expect(screen.getByText('Hermes repo 분석')).toBeInTheDocument()
  })

  it('bumps a newly arrived approval to the top of the queue', async () => {
    hoisted.fetchApprovalQueue
      .mockResolvedValueOnce({
        approval_requests: [
          {
            id: 'approval_001',
            thread_id: 'thread_001',
            thread_title: 'Hermes repo 분석',
            run_id: 'run_001',
            action_type: 'shell_command',
            risk_level: 'high',
            summary: 'pytest tests/test_api.py -q 실행 요청',
            status: 'pending',
          },
          {
            id: 'approval_002',
            thread_id: 'thread_002',
            thread_title: 'tmp 정리 작업',
            run_id: 'run_002',
            action_type: 'file_delete',
            risk_level: 'high',
            summary: '/tmp/demo 삭제 요청',
            status: 'pending',
          },
        ],
      })
      .mockResolvedValueOnce({
        approval_requests: [
          {
            id: 'approval_001',
            thread_id: 'thread_001',
            thread_title: 'Hermes repo 분석',
            run_id: 'run_001',
            action_type: 'shell_command',
            risk_level: 'high',
            summary: 'pytest tests/test_api.py -q 실행 요청',
            status: 'pending',
          },
          {
            id: 'approval_002',
            thread_id: 'thread_002',
            thread_title: 'tmp 정리 작업',
            run_id: 'run_002',
            action_type: 'file_delete',
            risk_level: 'high',
            summary: '/tmp/demo 삭제 요청',
            status: 'pending',
          },
          {
            id: 'approval_003',
            thread_id: 'thread_003',
            thread_title: '새 approval 스레드',
            run_id: 'run_003',
            action_type: 'external_request',
            risk_level: 'high',
            summary: '외부 API 호출 승인 요청',
            status: 'pending',
          },
        ],
      })

    render(<ApprovalQueueContainer />)

    await waitFor(() => {
      expect(screen.getByText('Hermes repo 분석')).toBeInTheDocument()
    })

    await act(async () => {
      hoisted.wsHandler?.({
        event: 'approval.created',
        data: {
          id: 'approval_003',
          thread_id: 'thread_003',
          run_id: 'run_003',
          action_type: 'external_request',
          status: 'pending',
        },
      })
    })

    await waitFor(() => {
      const titles = screen.getAllByRole('heading', { level: 2 }).map((node) => node.textContent)
      expect(titles[0]).toBe('새 approval 스레드')
    })
  })

  it('approves a queue item and removes it from the pending queue', async () => {
    render(<ApprovalQueueContainer />)

    await waitFor(() => {
      expect(screen.getByText('Hermes repo 분석')).toBeInTheDocument()
    })

    const targetArticle = screen.getByText('Hermes repo 분석').closest('article')
    expect(targetArticle).not.toBeNull()
    fireEvent.click(within(targetArticle as HTMLElement).getByRole('button', { name: '승인' }))

    await waitFor(() => {
      expect(hoisted.approveApprovalRequest).toHaveBeenCalledWith('approval_001')
    })

    await waitFor(() => {
      expect(screen.queryByText('Hermes repo 분석')).not.toBeInTheDocument()
    })
    expect(screen.getByText('pending approvals: 1')).toBeInTheDocument()
  })

  it('rejects a queue item and removes it from the pending queue', async () => {
    render(<ApprovalQueueContainer />)

    await waitFor(() => {
      expect(screen.getByText('tmp 정리 작업')).toBeInTheDocument()
    })

    const targetArticle = screen.getByText('tmp 정리 작업').closest('article')
    expect(targetArticle).not.toBeNull()
    fireEvent.click(within(targetArticle as HTMLElement).getByRole('button', { name: '거절' }))

    await waitFor(() => {
      expect(hoisted.rejectApprovalRequest).toHaveBeenCalledWith('approval_002')
    })

    await waitFor(() => {
      expect(screen.queryByText('tmp 정리 작업')).not.toBeInTheDocument()
    })
    expect(screen.getByText('pending approvals: 1')).toBeInTheDocument()
  })

  it('appends a new approval after websocket event refreshes the queue', async () => {
    hoisted.fetchApprovalQueue
      .mockResolvedValueOnce({
        approval_requests: [
          {
            id: 'approval_001',
            thread_id: 'thread_001',
            thread_title: 'Hermes repo 분석',
            run_id: 'run_001',
            action_type: 'shell_command',
            risk_level: 'high',
            summary: 'pytest tests/test_api.py -q 실행 요청',
            status: 'pending',
          },
          {
            id: 'approval_002',
            thread_id: 'thread_002',
            thread_title: 'tmp 정리 작업',
            run_id: 'run_002',
            action_type: 'file_delete',
            risk_level: 'high',
            summary: '/tmp/demo 삭제 요청',
            status: 'pending',
          },
        ],
      })
      .mockResolvedValueOnce({
        approval_requests: [
          {
            id: 'approval_001',
            thread_id: 'thread_001',
            thread_title: 'Hermes repo 분석',
            run_id: 'run_001',
            action_type: 'shell_command',
            risk_level: 'high',
            summary: 'pytest tests/test_api.py -q 실행 요청',
            status: 'pending',
          },
          {
            id: 'approval_002',
            thread_id: 'thread_002',
            thread_title: 'tmp 정리 작업',
            run_id: 'run_002',
            action_type: 'file_delete',
            risk_level: 'high',
            summary: '/tmp/demo 삭제 요청',
            status: 'pending',
          },
          {
            id: 'approval_003',
            thread_id: 'thread_003',
            thread_title: '새 approval 스레드',
            run_id: 'run_003',
            action_type: 'external_request',
            risk_level: 'high',
            summary: '외부 API 호출 승인 요청',
            status: 'pending',
          },
        ],
      })

    render(<ApprovalQueueContainer />)

    await waitFor(() => {
      expect(screen.getByText('Hermes repo 분석')).toBeInTheDocument()
    })

    await act(async () => {
      hoisted.wsHandler?.({
        event: 'approval.created',
        data: {
          id: 'approval_003',
          thread_id: 'thread_003',
          run_id: 'run_003',
          action_type: 'external_request',
          status: 'pending',
        },
      })
    })

    await waitFor(() => {
      expect(hoisted.fetchApprovalQueue).toHaveBeenCalledTimes(2)
      expect(screen.getByText('새 approval 스레드')).toBeInTheDocument()
      expect(screen.getByText('외부 API 호출 승인 요청')).toBeInTheDocument()
      expect(screen.getByText('pending approvals: 3')).toBeInTheDocument()
    })
  })
})
