import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { vi } from 'vitest'

const hoisted = vi.hoisted(() => ({
  wsHandler: null as null | ((event: { event: string; data: Record<string, unknown> }) => void),
  approveApprovalRequest: vi.fn(async () => ({
    id: 'approval_001',
    status: 'approved',
  })),
  rejectApprovalRequest: vi.fn(async () => ({
    id: 'approval_001',
    status: 'rejected',
  })),
  fetchThreadDetail: vi.fn(async () => ({
    id: 'thread_001',
    title: 'Hermes repo 분석',
    latest_run_status: 'paused_for_approval',
  })),
  fetchThreadMessages: vi.fn(async () => ({
    thread_id: 'thread_001',
    messages: [
      {
        id: 'msg_001',
        sender_type: 'human',
        sender_id: 'user_001',
        message_type: 'instruction',
        content_text: '이 저장소를 분석해줘',
        metadata: {},
      },
      {
        id: 'msg_002',
        sender_type: 'system',
        sender_id: 'policy-engine',
        message_type: 'approval_request',
        content_text: '승인 필요: pytest tests/test_api.py -q 실행 요청',
        metadata: { approval_request_id: 'approval_001' },
      },
    ],
  })),
  fetchApprovalRequest: vi.fn(async () => ({
    id: 'approval_001',
    action_type: 'shell_command',
    risk_level: 'high',
    summary: 'pytest tests/test_api.py -q 실행 요청',
    payload_preview: { command: 'pytest tests/test_api.py -q' },
  })),
}))

vi.mock('../lib/api', () => ({
  approveApprovalRequest: hoisted.approveApprovalRequest,
  rejectApprovalRequest: hoisted.rejectApprovalRequest,
  fetchApprovalRequest: hoisted.fetchApprovalRequest,
  fetchThreadDetail: hoisted.fetchThreadDetail,
  fetchThreadMessages: hoisted.fetchThreadMessages,
}))

vi.mock('../lib/ws', () => ({
  subscribeToThreadEvents: vi.fn((_: string, onEvent: (event: { event: string; data: Record<string, unknown> }) => void) => {
    hoisted.wsHandler = onEvent
    return () => {
      hoisted.wsHandler = null
    }
  }),
}))

import { ThreadDetailContainer } from '../components/ThreadDetailContainer'

describe('ThreadDetailContainer', () => {
  beforeEach(() => {
    hoisted.approveApprovalRequest.mockClear()
    hoisted.rejectApprovalRequest.mockClear()
    hoisted.fetchThreadDetail.mockReset()
    hoisted.fetchThreadMessages.mockReset()
    hoisted.fetchApprovalRequest.mockReset()
    hoisted.fetchThreadDetail.mockResolvedValue({
      id: 'thread_001',
      title: 'Hermes repo 분석',
      latest_run_status: 'paused_for_approval',
    })
    hoisted.fetchThreadMessages.mockResolvedValue({
      thread_id: 'thread_001',
      messages: [
        {
          id: 'msg_001',
          sender_type: 'human',
          sender_id: 'user_001',
          message_type: 'instruction',
          content_text: '이 저장소를 분석해줘',
          metadata: {},
        },
        {
          id: 'msg_002',
          sender_type: 'system',
          sender_id: 'policy-engine',
          message_type: 'approval_request',
          content_text: '승인 필요: pytest tests/test_api.py -q 실행 요청',
          metadata: { approval_request_id: 'approval_001' },
        },
      ],
    })
    hoisted.fetchApprovalRequest.mockResolvedValue({
      id: 'approval_001',
      action_type: 'shell_command',
      risk_level: 'high',
      summary: 'pytest tests/test_api.py -q 실행 요청',
      payload_preview: { command: 'pytest tests/test_api.py -q' },
    })
  })

  it('shows loading, empty, and error states while fetching thread detail', async () => {
    let resolveDetail: ((value: { id: string; title: string; latest_run_status: string }) => void) | null = null
    hoisted.fetchThreadDetail.mockImplementationOnce(
      () => new Promise((resolve) => {
        resolveDetail = resolve
      }),
    )

    render(<ThreadDetailContainer threadId="thread_001" />)

    expect(screen.getByText('thread detail을 불러오는 중입니다.')).toBeInTheDocument()

    resolveDetail?.({
      id: 'thread_001',
      title: 'Hermes repo 분석',
      latest_run_status: 'running',
    })

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Hermes repo 분석' })).toBeInTheDocument()
    })

    hoisted.fetchThreadMessages.mockResolvedValueOnce({ thread_id: 'thread_001', messages: [] })
    render(<ThreadDetailContainer threadId="thread_001" />)

    await waitFor(() => {
      expect(screen.getByText('아직 표시할 타임라인 이벤트가 없습니다.')).toBeInTheDocument()
    })

    hoisted.fetchThreadDetail.mockRejectedValueOnce(new Error('boom'))
    render(<ThreadDetailContainer threadId="thread_001" />)

    await waitFor(() => {
      expect(screen.getByText('thread detail을 불러오지 못했습니다.')).toBeInTheDocument()
    })
  })


  it('retries thread detail loading after an error', async () => {
    hoisted.fetchThreadDetail
      .mockRejectedValueOnce(new Error('boom'))
      .mockResolvedValueOnce({
        id: 'thread_001',
        title: 'retry 이후 detail',
        latest_run_status: 'running',
      })
    hoisted.fetchThreadMessages.mockResolvedValueOnce({
      thread_id: 'thread_001',
      messages: [],
    })

    render(<ThreadDetailContainer threadId="thread_001" />)

    await waitFor(() => {
      expect(screen.getByText('thread detail을 불러오지 못했습니다.')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: '다시 시도' }))

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'retry 이후 detail' })).toBeInTheDocument()
    })
    expect(hoisted.fetchThreadDetail).toHaveBeenCalledTimes(2)
  })

  it('loads thread detail and messages from the backend and renders approval detail', async () => {
    render(<ThreadDetailContainer threadId="thread_001" />)

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Hermes repo 분석' })).toBeInTheDocument()
    })

    expect(screen.getByText('run status: paused_for_approval')).toBeInTheDocument()
    expect(screen.getByText('이 저장소를 분석해줘')).toBeInTheDocument()
    expect(screen.getByText('pytest tests/test_api.py -q 실행 요청')).toBeInTheDocument()
  })

  it('applies websocket updates to run status and timeline', async () => {
    render(<ThreadDetailContainer threadId="thread_001" />)

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Hermes repo 분석' })).toBeInTheDocument()
    })

    await act(async () => {
      hoisted.wsHandler?.({
        event: 'run.status_changed',
        data: { status: 'running' },
      })
      hoisted.wsHandler?.({
        event: 'message.created',
        data: {
          id: 'msg_003',
          sender_id: 'agent_hermes_1',
          sender_type: 'agent',
          message_type: 'status_update',
          content_text: '테스트 실행 중입니다.',
        },
      })
    })

    await waitFor(() => {
      expect(screen.getByText('run status: running')).toBeInTheDocument()
    })
    expect(screen.getByText('테스트 실행 중입니다.')).toBeInTheDocument()
  })

  it('updates the approval card and run status immediately after approve', async () => {
    render(<ThreadDetailContainer threadId="thread_001" />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '승인' })).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: '승인' }))

    await waitFor(() => {
      expect(hoisted.approveApprovalRequest).toHaveBeenCalledWith('approval_001')
    })

    await waitFor(() => {
      expect(screen.getByText('run status: running')).toBeInTheDocument()
      expect(screen.getByText('상태: approved')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '승인' })).toBeDisabled()
      expect(screen.getByRole('button', { name: '거절' })).toBeDisabled()
    })
  })

  it('updates the approval card and run status immediately after reject', async () => {
    render(<ThreadDetailContainer threadId="thread_001" />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '거절' })).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: '거절' }))

    await waitFor(() => {
      expect(hoisted.rejectApprovalRequest).toHaveBeenCalledWith('approval_001')
    })

    await waitFor(() => {
      expect(screen.getByText('run status: cancelled')).toBeInTheDocument()
      expect(screen.getByText('상태: rejected')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '승인' })).toBeDisabled()
      expect(screen.getByRole('button', { name: '거절' })).toBeDisabled()
    })
  })
})
