import { fireEvent, render, screen } from '@testing-library/react'

import { vi } from 'vitest'

import { ThreadDetailView } from '../components/ThreadDetailView'


describe('ThreadDetailView', () => {
  it('renders loading, empty, and error states', () => {
    const { rerender } = render(
      <ThreadDetailView threadTitle="loading" runStatus="loading" messages={[]} isLoading />,
    )

    expect(screen.getByText('thread detail을 불러오는 중입니다.')).toBeInTheDocument()

    rerender(
      <ThreadDetailView threadTitle="Hermes repo 분석" runStatus="running" messages={[]} />,
    )

    expect(screen.getByText('아직 표시할 타임라인 이벤트가 없습니다.')).toBeInTheDocument()

    rerender(
      <ThreadDetailView
        threadTitle="Hermes repo 분석"
        runStatus="error"
        messages={[]}
        errorMessage="thread detail을 불러오지 못했습니다."
      />,
    )

    expect(screen.getByText('thread detail을 불러오지 못했습니다.')).toBeInTheDocument()
  })

  it('renders instruction, status update, and approval card in a timeline layout', () => {
    render(
      <ThreadDetailView
        threadTitle="Hermes repo 분석"
        runStatus="paused_for_approval"
        messages={[
          {
            id: 'msg_001',
            senderType: 'human',
            senderId: 'user_001',
            messageType: 'instruction',
            contentText: '이 저장소를 분석해줘',
          },
          {
            id: 'msg_002',
            senderType: 'agent',
            senderId: 'agent_hermes_1',
            messageType: 'status_update',
            contentText: 'repo 구조를 확인하는 중입니다.',
          },
          {
            id: 'msg_003',
            senderType: 'system',
            senderId: 'policy-engine',
            messageType: 'approval_request',
            contentText: '승인 필요: pytest tests/test_api.py -q 실행 요청',
            approval: {
              id: 'approval_001',
              actionType: 'shell_command',
              riskLevel: 'high',
              summary: 'pytest tests/test_api.py -q 실행 요청',
              scope: '/workspace/tests',
              payloadPreview: 'pytest tests/test_api.py -q',
            },
          },
        ]}
      />,
    )

    expect(screen.getByRole('heading', { name: 'Hermes repo 분석' })).toBeInTheDocument()
    expect(screen.getByText('run status: paused_for_approval')).toBeInTheDocument()
    expect(screen.getByText('이 저장소를 분석해줘')).toBeInTheDocument()
    expect(screen.getByText('repo 구조를 확인하는 중입니다.')).toBeInTheDocument()
    expect(screen.getByText('승인 필요')).toBeInTheDocument()
    expect(screen.getByText('pytest tests/test_api.py -q 실행 요청')).toBeInTheDocument()
  })

  it('renders retry action for an error state', () => {
    const onRetry = vi.fn()

    render(
      <ThreadDetailView
        threadTitle="Hermes repo 분석"
        runStatus="error"
        messages={[]}
        errorMessage="thread detail을 불러오지 못했습니다."
        onRetry={onRetry}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: '다시 시도' }))

    expect(onRetry).toHaveBeenCalledTimes(1)
  })


  it('renders timeline skeleton items while loading', () => {
    render(
      <ThreadDetailView
        threadTitle="loading"
        runStatus="loading"
        messages={[]}
        isLoading
      />,
    )

    expect(screen.getByText('thread detail을 불러오는 중입니다.')).toBeInTheDocument()
    expect(screen.getByLabelText('thread detail skeleton')).toBeInTheDocument()
    expect(screen.getAllByLabelText(/timeline skeleton item/i)).toHaveLength(3)
  })


  it('renders plain timeline messages with shared text hierarchy', () => {
    render(
      <ThreadDetailView
        threadTitle="Hermes repo 분석"
        runStatus="running"
        messages={[
          {
            id: 'msg_001',
            senderType: 'human',
            senderId: 'user_001',
            messageType: 'instruction',
            contentText: '이 저장소를 분석해줘',
          },
        ]}
      />,
    )

    expect(screen.getByLabelText('timeline item')).toBeInTheDocument()
    expect(screen.getByText('human:instruction')).toHaveStyle({ color: '#6b7280' })
    expect(screen.getByText('이 저장소를 분석해줘')).toHaveStyle({ color: '#111827', fontSize: '0.95rem' })
  })

})
