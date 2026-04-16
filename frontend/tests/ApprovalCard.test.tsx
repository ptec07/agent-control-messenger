import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { ApprovalCard } from '../components/ApprovalCard'
import { ApprovalMetadata } from '../components/approval-metadata'
import { CodeBlock, InfoItem, InfoList } from '../components/status-ui'


describe('ApprovalCard', () => {
  it('renders approval summary and action buttons', () => {
    render(
      <ApprovalCard
        approval={{
          id: 'approval_001',
          actionType: 'shell_command',
          riskLevel: 'high',
          summary: 'pytest tests/test_api.py -q 실행 요청',
          scope: '/workspace/tests',
          payloadPreview: 'pytest tests/test_api.py -q',
        }}
      />,
    )

    expect(screen.getByText('승인 필요')).toBeInTheDocument()
    expect(screen.getByText('pytest tests/test_api.py -q 실행 요청')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '승인' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '거절' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '수정 후 승인' })).toBeInTheDocument()
  })

  it('calls onApprove when the approve button is clicked', async () => {
    const onApprove = vi.fn(async () => undefined)

    render(
      <ApprovalCard
        approval={{
          id: 'approval_001',
          actionType: 'shell_command',
          riskLevel: 'high',
          summary: 'pytest tests/test_api.py -q 실행 요청',
          scope: '/workspace/tests',
          payloadPreview: 'pytest tests/test_api.py -q',
        }}
        onApprove={onApprove}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: '승인' }))

    await waitFor(() => {
      expect(onApprove).toHaveBeenCalledWith('approval_001')
    })
  })

  it('renders reusable approval metadata rows and payload preview block with shared text hierarchy', () => {
    render(
      <ApprovalMetadata
        actionType="shell_command"
        riskLevel="high"
        scope="/workspace/tests"
        payloadPreview="pytest tests/test_api.py -q"
        status="approved"
      />,
    )

    expect(screen.getByLabelText('approval metadata')).toBeInTheDocument()
    expect(screen.getByText('action type')).toHaveStyle({ color: '#6b7280', fontSize: '0.875rem' })
    expect(screen.getByText('risk level')).toHaveStyle({ color: '#6b7280', fontSize: '0.875rem' })
    expect(screen.getByText('scope')).toHaveStyle({ color: '#6b7280', fontSize: '0.875rem' })
    expect(screen.getByText('status')).toHaveStyle({ color: '#6b7280', fontSize: '0.875rem' })
    expect(screen.getByText('payload preview')).toHaveStyle({ color: '#6b7280', fontSize: '0.875rem' })
    expect(screen.getByText('/workspace/tests')).toHaveStyle({ color: '#111827', fontSize: '0.95rem' })
    expect(screen.getByText('상태: approved')).toHaveStyle({ color: '#6b7280', fontSize: '0.875rem' })
    expect(screen.getByLabelText('code block')).toHaveStyle({ whiteSpace: 'pre-wrap', backgroundColor: '#f9fafb' })
    expect(screen.getByText('pytest tests/test_api.py -q')).toBeInTheDocument()
  })

  it('renders a reusable code block primitive for payload-style content', () => {
    render(<CodeBlock ariaLabel="shared code block">pytest tests/test_api.py -q</CodeBlock>)

    expect(screen.getByLabelText('shared code block')).toHaveStyle({
      whiteSpace: 'pre-wrap',
      backgroundColor: '#f9fafb',
      color: '#374151',
    })
    expect(screen.getByText('pytest tests/test_api.py -q')).toBeInTheDocument()
  })


  it('renders reusable info list primitives for key-value metadata rows', () => {
    render(
      <InfoList ariaLabel="shared info list">
        <InfoItem label="thread">thread_001</InfoItem>
        <InfoItem label="run">run_001</InfoItem>
      </InfoList>,
    )

    expect(screen.getByLabelText('shared info list')).toBeInTheDocument()
    expect(screen.getByText('thread')).toHaveStyle({ color: '#6b7280', fontSize: '0.875rem' })
    expect(screen.getByText('run')).toHaveStyle({ color: '#6b7280', fontSize: '0.875rem' })
    expect(screen.getByText('thread_001')).toHaveStyle({ color: '#111827', fontSize: '0.95rem' })
    expect(screen.getByText('run_001')).toHaveStyle({ color: '#111827', fontSize: '0.95rem' })
  })

})
