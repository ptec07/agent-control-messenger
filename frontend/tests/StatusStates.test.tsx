import { fireEvent, render, screen } from '@testing-library/react'
import { vi } from 'vitest'

import {
  approvalStateBadgeTone,
  approvalStatusBadgeTone,
  Badge,
  BodyText,
  Button,
  Cluster,
  copyTokens,
  Eyebrow,
  FieldLabel,
  Inline,
  MetaText,
  riskLevelBadgeTone,
  SelectInput,
  SkeletonBadgeRow,
  SkeletonCardList,
  SkeletonCodeBlock,
  SkeletonText,
  SkeletonTitle,
  Stack,
  StatusPanel,
  SurfaceCard,
  TextInput,
  threadStatusBadgeTone,
  TitleText,
} from '../components/status-ui'

import { PageHeaderBlock } from '../components/page-header-block'

describe('status-ui', () => {
  it('renders a reusable error panel with retry action', () => {
    const onAction = vi.fn()

    render(
      <StatusPanel
        tone="error"
        title="불러오기에 실패했습니다."
        description="잠시 후 다시 시도해주세요."
        actionLabel="다시 시도"
        onAction={onAction}
      />,
    )

    expect(screen.getByLabelText('status panel error')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: '불러오기에 실패했습니다.' })).toBeInTheDocument()
    expect(screen.getByText('잠시 후 다시 시도해주세요.')).toHaveStyle({ color: '#6b7280' })

    fireEvent.click(screen.getByRole('button', { name: '다시 시도' }))
    expect(onAction).toHaveBeenCalledTimes(1)
  })

  it('renders a reusable skeleton card list with requested count', () => {
    render(
      <>
        <SkeletonCardList
          ariaLabel="shared skeleton"
          itemAriaLabel="shared skeleton item"
          count={4}
          renderCard={(index) => <div>card-{index}</div>}
        />
        <SkeletonTitle ariaLabel="shared skeleton title" width="45%" />
        <SkeletonText ariaLabel="shared skeleton text" width="60%" />
        <SkeletonBadgeRow ariaLabel="shared skeleton badges" />
        <SkeletonCodeBlock ariaLabel="shared skeleton code block" />
      </>,
    )

    expect(screen.getByLabelText('shared skeleton')).toBeInTheDocument()
    expect(screen.getAllByLabelText(/shared skeleton item/i)).toHaveLength(4)
    expect(screen.getByText('card-0')).toBeInTheDocument()
    expect(screen.getByText('card-3')).toBeInTheDocument()
    expect(screen.getByLabelText('shared skeleton title')).toHaveStyle({ height: '1.25rem' })
    expect(screen.getByLabelText('shared skeleton text')).toHaveStyle({ height: '0.95rem' })
    expect(screen.getByLabelText('shared skeleton badges')).toBeInTheDocument()
    expect(screen.getByLabelText('shared skeleton code block')).toHaveStyle({ height: '4rem' })
  })

  it('renders reusable surface card, badge, and form fields with shared labels', () => {
    render(
      <>
        <SurfaceCard ariaLabel="shared card">
          <div>card body</div>
        </SurfaceCard>
        <Badge ariaLabel="shared badge" tone="warning">running</Badge>
        <FieldLabel label="thread search">
          <TextInput value="tmp" onChange={() => {}} />
        </FieldLabel>
        <FieldLabel label="thread status filter">
          <SelectInput value="all" onChange={() => {}} options={[{ value: 'all', label: 'all' }]} />
        </FieldLabel>
      </>,
    )

    expect(screen.getByLabelText('shared card')).toBeInTheDocument()
    expect(screen.getByLabelText('shared badge')).toHaveStyle({
      backgroundColor: '#fef3c7',
      color: '#92400e',
    })
    expect(screen.getByLabelText('thread search')).toHaveValue('tmp')
    expect(screen.getByLabelText('thread status filter')).toHaveValue('all')
  })


  it('renders reusable buttons with semantic tones and disabled state', () => {
    const onClick = vi.fn()

    render(
      <>
        <Button tone="primary" onClick={onClick}>승인</Button>
        <Button tone="danger" disabled>거절</Button>
      </>,
    )

    fireEvent.click(screen.getByRole('button', { name: '승인' }))

    expect(onClick).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('button', { name: '승인' })).toHaveStyle({
      backgroundColor: '#2563eb',
      color: '#ffffff',
    })
    expect(screen.getByRole('button', { name: '거절' })).toBeDisabled()
  })


  it('renders a reusable page header block with title and supporting text', () => {
    render(<PageHeaderBlock title="Threads" subtitle="total threads: 2" />)

    expect(screen.getByLabelText('page header')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: 'Threads' })).toHaveStyle({ fontWeight: '700' })
    expect(screen.getByText('total threads: 2')).toHaveStyle({ color: '#6b7280' })
  })


  it('exposes reusable typography and spacing scales through status tokens', async () => {
    const mod = await import('../components/status-ui')

    expect(mod.statusTokens.space.md).toBe('0.75rem')
    expect(mod.statusTokens.space.lg).toBe('1rem')
    expect(mod.statusTokens.fontSize.xl).toBe('1.75rem')
    expect(mod.statusTokens.fontSize.sm).toBe('0.875rem')
    expect(mod.statusTokens.fontWeight.bold).toBe(700)
    expect(mod.statusTokens.textColor.muted).toBe('#6b7280')
  })


  it('exposes semantic color tokens for surfaces, actions, and statuses', async () => {
    const mod = await import('../components/status-ui')

    expect(mod.statusTokens.color.border.default).toBe('#e5e7eb')
    expect(mod.statusTokens.color.surface.canvas).toBe('#ffffff')
    expect(mod.statusTokens.color.surface.subtle).toBe('#f9fafb')
    expect(mod.statusTokens.color.action.primary.bg).toBe('#2563eb')
    expect(mod.statusTokens.color.action.danger.bg).toBe('#dc2626')
    expect(mod.statusTokens.color.status.warning.bg).toBe('#fef3c7')
    expect(mod.statusTokens.color.status.danger.fg).toBe('#991b1b')
  })


  it('renders reusable layout primitives for stack, inline, and cluster', () => {
    render(
      <>
        <Stack ariaLabel="stack layout">
          <div>one</div>
          <div>two</div>
        </Stack>
        <Inline ariaLabel="inline layout">
          <div>a</div>
          <div>b</div>
        </Inline>
        <Cluster ariaLabel="cluster layout">
          <div>x</div>
          <div>y</div>
        </Cluster>
      </>,
    )

    expect(screen.getByLabelText('stack layout')).toHaveStyle({ display: 'grid' })
    expect(screen.getByLabelText('inline layout')).toHaveStyle({ display: 'flex' })
    expect(screen.getByLabelText('cluster layout')).toHaveStyle({ display: 'flex', flexWrap: 'wrap' })
  })

  it('exposes shared badge tone mapping helpers for thread and approval states', () => {
    expect(threadStatusBadgeTone('paused_for_approval')).toBe('warning')
    expect(threadStatusBadgeTone('running')).toBe('info')
    expect(threadStatusBadgeTone('completed')).toBe('neutral')

    expect(approvalStateBadgeTone(true)).toBe('danger')
    expect(approvalStateBadgeTone(false)).toBe('success')

    expect(riskLevelBadgeTone('high')).toBe('danger')
    expect(riskLevelBadgeTone('medium')).toBe('warning')
    expect(riskLevelBadgeTone('low')).toBe('success')

    expect(approvalStatusBadgeTone('pending')).toBe('warning')
    expect(approvalStatusBadgeTone('approved')).toBe('success')
    expect(approvalStatusBadgeTone('rejected')).toBe('neutral')
  })

  it('renders shared text hierarchy primitives for eyebrow, title, body, and meta text', () => {
    render(
      <>
        <Eyebrow ariaLabel="shared eyebrow">운영 상태</Eyebrow>
        <TitleText ariaLabel="shared title">Hermes repo 분석</TitleText>
        <BodyText ariaLabel="shared body">pytest tests/test_api.py -q 실행 요청</BodyText>
        <MetaText ariaLabel="shared meta">run status: paused_for_approval</MetaText>
      </>,
    )

    expect(screen.getByLabelText('shared eyebrow')).toHaveStyle({ textTransform: 'uppercase' })
    expect(screen.getByLabelText('shared title')).toHaveStyle({ fontWeight: '700' })
    expect(screen.getByLabelText('shared body')).toHaveStyle({ color: '#111827' })
    expect(screen.getByLabelText('shared meta')).toHaveStyle({ color: '#6b7280' })
  })

  it('exposes shared copy tokens for loading, error, and empty states', () => {
    expect(copyTokens.threadList.loading).toBe('thread list를 불러오는 중입니다.')
    expect(copyTokens.threadList.error).toBe('thread list를 불러오지 못했습니다.')
    expect(copyTokens.threadList.emptyFiltered).toBe('현재 필터와 일치하는 thread가 없습니다.')
    expect(copyTokens.approvalQueue.emptyDefault).toBe('현재 대기 중인 approval 요청이 없습니다.')
    expect(copyTokens.threadDetail.emptyTimeline).toBe('아직 표시할 타임라인 이벤트가 없습니다.')
    expect(copyTokens.actions.retry).toBe('다시 시도')
  })

})
