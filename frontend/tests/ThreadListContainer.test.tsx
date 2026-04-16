import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { vi } from 'vitest'

const hoisted = vi.hoisted(() => ({
  wsHandler: null as null | ((event: { event: string; data: Record<string, unknown> }) => void),
  fetchThreadList: vi.fn(),
}))

hoisted.fetchThreadList.mockResolvedValueOnce({
  threads: [
    {
      id: 'thread_001',
      title: 'Hermes repo 분석',
      latest_run_status: 'paused_for_approval',
      has_pending_approval: true,
    },
    {
      id: 'thread_002',
      title: 'tmp 정리 작업',
      latest_run_status: 'running',
      has_pending_approval: false,
    },
  ],
})

vi.mock('../lib/api', () => ({
  fetchThreadList: hoisted.fetchThreadList,
}))

vi.mock('../lib/ws', () => ({
  subscribeToThreadEvents: vi.fn((_: string, onEvent: (event: { event: string; data: Record<string, unknown> }) => void) => {
    hoisted.wsHandler = onEvent
    return () => {
      hoisted.wsHandler = null
    }
  }),
}))

import { ThreadListContainer } from '../components/ThreadListContainer'

describe('ThreadListContainer', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/threads')
    hoisted.fetchThreadList.mockReset()
    hoisted.fetchThreadList.mockResolvedValue({
      threads: [
        {
          id: 'thread_001',
          title: 'Hermes repo 분석',
          latest_run_status: 'paused_for_approval',
          has_pending_approval: true,
        },
        {
          id: 'thread_002',
          title: 'tmp 정리 작업',
          latest_run_status: 'running',
          has_pending_approval: false,
        },
      ],
    })
    hoisted.wsHandler = null
  })

  it('shows loading and error states while fetching threads', async () => {
    let resolveFetch: ((value: { threads: Array<{ id: string; title: string; latest_run_status: string; has_pending_approval: boolean }> }) => void) | null = null
    hoisted.fetchThreadList.mockImplementationOnce(
      () => new Promise((resolve) => {
        resolveFetch = resolve
      }),
    )

    render(<ThreadListContainer />)

    expect(screen.getByText('thread list를 불러오는 중입니다.')).toBeInTheDocument()

    resolveFetch?.({
      threads: [
        {
          id: 'thread_001',
          title: 'Hermes repo 분석',
          latest_run_status: 'paused_for_approval',
          has_pending_approval: true,
        },
      ],
    })

    await waitFor(() => {
      expect(screen.getByText('Hermes repo 분석')).toBeInTheDocument()
    })

    hoisted.fetchThreadList.mockRejectedValueOnce(new Error('boom'))
    render(<ThreadListContainer />)

    await waitFor(() => {
      expect(screen.getByText('thread list를 불러오지 못했습니다.')).toBeInTheDocument()
    })
  })


  it('retries thread loading after an error', async () => {
    hoisted.fetchThreadList
      .mockRejectedValueOnce(new Error('boom'))
      .mockResolvedValueOnce({
        threads: [
          {
            id: 'thread_003',
            title: 'retry 이후 스레드',
            latest_run_status: 'running',
            has_pending_approval: false,
          },
        ],
      })

    render(<ThreadListContainer />)

    await waitFor(() => {
      expect(screen.getByText('thread list를 불러오지 못했습니다.')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: '다시 시도' }))

    await waitFor(() => {
      expect(screen.getByText('retry 이후 스레드')).toBeInTheDocument()
    })
    expect(hoisted.fetchThreadList).toHaveBeenCalledTimes(2)
  })

  it('renders drill-down links to thread detail rows', async () => {
    hoisted.fetchThreadList.mockResolvedValueOnce({
      threads: [
        {
          id: 'thread_002',
          title: 'tmp 정리 작업',
          latest_run_status: 'running',
          has_pending_approval: false,
        },
        {
          id: 'thread_001',
          title: 'Hermes repo 분석',
          latest_run_status: 'paused_for_approval',
          has_pending_approval: true,
        },
      ],
    })

    render(<ThreadListContainer />)

    await waitFor(() => {
      expect(hoisted.fetchThreadList).toHaveBeenCalledTimes(1)
    })

    expect(screen.getByRole('link', { name: 'Hermes repo 분석 상세 보기' })).toHaveAttribute('href', '/threads/thread_001')
    expect(screen.getByRole('link', { name: 'tmp 정리 작업 상세 보기' })).toHaveAttribute('href', '/threads/thread_002')
  })

  it('loads threads with pending approval items prioritized first', async () => {
    hoisted.fetchThreadList.mockResolvedValueOnce({
      threads: [
        {
          id: 'thread_002',
          title: 'tmp 정리 작업',
          latest_run_status: 'running',
          has_pending_approval: false,
        },
        {
          id: 'thread_001',
          title: 'Hermes repo 분석',
          latest_run_status: 'paused_for_approval',
          has_pending_approval: true,
        },
      ],
    })

    render(<ThreadListContainer />)

    await waitFor(() => {
      expect(hoisted.fetchThreadList).toHaveBeenCalledTimes(1)
    })

    const titles = screen.getAllByRole('heading', { level: 2 }).map((node) => node.textContent)
    expect(titles).toEqual(['Hermes repo 분석', 'tmp 정리 작업'])
  })

  it('filters threads by search text and run status', async () => {
    render(<ThreadListContainer />)

    await waitFor(() => {
      expect(screen.getByText('Hermes repo 분석')).toBeInTheDocument()
    })

    fireEvent.change(screen.getByLabelText('thread search'), { target: { value: 'tmp' } })

    await waitFor(() => {
      expect(screen.queryByText('Hermes repo 분석')).not.toBeInTheDocument()
      expect(screen.getByText('tmp 정리 작업')).toBeInTheDocument()
    })

    fireEvent.change(screen.getByLabelText('thread search'), { target: { value: '' } })
    fireEvent.change(screen.getByLabelText('thread status filter'), { target: { value: 'paused_for_approval' } })

    await waitFor(() => {
      expect(screen.getByText('Hermes repo 분석')).toBeInTheDocument()
      expect(screen.queryByText('tmp 정리 작업')).not.toBeInTheDocument()
    })
  })

  it('hydrates search and status filters from URL query params', async () => {
    window.history.replaceState({}, '', '/threads?q=tmp&status=running')

    render(<ThreadListContainer />)

    await waitFor(() => {
      expect(screen.getByLabelText('thread search')).toHaveValue('tmp')
    })

    expect(screen.getByLabelText('thread status filter')).toHaveValue('running')
    expect(screen.getByText('tmp 정리 작업')).toBeInTheDocument()
    expect(screen.queryByText('Hermes repo 분석')).not.toBeInTheDocument()
  })

  it('persists thread filters into URL query params when controls change', async () => {
    render(<ThreadListContainer />)

    await waitFor(() => {
      expect(screen.getByText('Hermes repo 분석')).toBeInTheDocument()
    })

    fireEvent.change(screen.getByLabelText('thread search'), { target: { value: 'tmp' } })
    fireEvent.change(screen.getByLabelText('thread status filter'), { target: { value: 'running' } })

    await waitFor(() => {
      expect(window.location.search).toBe('?q=tmp&status=running')
    })

    fireEvent.change(screen.getByLabelText('thread search'), { target: { value: '' } })
    fireEvent.change(screen.getByLabelText('thread status filter'), { target: { value: 'all' } })

    await waitFor(() => {
      expect(window.location.search).toBe('')
    })
  })

  it('normalizes invalid thread filter query params on hydrate', async () => {
    window.history.replaceState({}, '', '/threads?q=%20tmp%20&status=bogus')

    render(<ThreadListContainer />)

    await waitFor(() => {
      expect(screen.getByLabelText('thread search')).toHaveValue('tmp')
    })

    expect(screen.getByLabelText('thread status filter')).toHaveValue('all')
    expect(window.location.search).toBe('?q=tmp')
    expect(screen.getByText('tmp 정리 작업')).toBeInTheDocument()
  })

  it('updates thread filters when browser navigation changes the URL', async () => {
    render(<ThreadListContainer />)

    await waitFor(() => {
      expect(screen.getByText('Hermes repo 분석')).toBeInTheDocument()
    })

    await act(async () => {
      window.history.pushState({}, '', '/threads?q=tmp&status=running')
      window.dispatchEvent(new PopStateEvent('popstate'))
    })

    await waitFor(() => {
      expect(screen.getByLabelText('thread search')).toHaveValue('tmp')
    })

    expect(screen.getByLabelText('thread status filter')).toHaveValue('running')
    expect(screen.getByText('tmp 정리 작업')).toBeInTheDocument()
    expect(screen.queryByText('Hermes repo 분석')).not.toBeInTheDocument()

    await act(async () => {
      window.history.pushState({}, '', '/threads')
      window.dispatchEvent(new PopStateEvent('popstate'))
    })

    await waitFor(() => {
      expect(screen.getByLabelText('thread search')).toHaveValue('')
    })

    expect(screen.getByLabelText('thread status filter')).toHaveValue('all')
    expect(screen.getByText('Hermes repo 분석')).toBeInTheDocument()
  })

  it('bumps a newly prioritized thread to the top after websocket status update', async () => {
    render(<ThreadListContainer />)

    await waitFor(() => {
      expect(screen.getByText('Hermes repo 분석')).toBeInTheDocument()
    })

    await act(async () => {
      hoisted.wsHandler?.({
        event: 'run.status_changed',
        data: {
          thread_id: 'thread_002',
          status: 'paused_for_approval',
          current_approval_request_id: 'approval_002',
        },
      })
    })

    await waitFor(() => {
      const titles = screen.getAllByRole('heading', { level: 2 }).map((node) => node.textContent)
      expect(titles[0]).toBe('tmp 정리 작업')
    })
  })

  it('appends a newly created thread after websocket activity for an unknown thread', async () => {
    hoisted.fetchThreadList
      .mockResolvedValueOnce({
        threads: [
          {
            id: 'thread_001',
            title: 'Hermes repo 분석',
            latest_run_status: 'paused_for_approval',
            has_pending_approval: true,
          },
          {
            id: 'thread_002',
            title: 'tmp 정리 작업',
            latest_run_status: 'running',
            has_pending_approval: false,
          },
        ],
      })
      .mockResolvedValueOnce({
        threads: [
          {
            id: 'thread_001',
            title: 'Hermes repo 분석',
            latest_run_status: 'paused_for_approval',
            has_pending_approval: true,
          },
          {
            id: 'thread_002',
            title: 'tmp 정리 작업',
            latest_run_status: 'running',
            has_pending_approval: false,
          },
          {
            id: 'thread_003',
            title: '새로운 스레드',
            latest_run_status: 'running',
            has_pending_approval: false,
          },
        ],
      })

    render(<ThreadListContainer />)

    await waitFor(() => {
      expect(screen.getByText('Hermes repo 분석')).toBeInTheDocument()
    })

    await act(async () => {
      hoisted.wsHandler?.({
        event: 'run.status_changed',
        data: {
          thread_id: 'thread_003',
          status: 'running',
        },
      })
    })

    await waitFor(() => {
      expect(hoisted.fetchThreadList).toHaveBeenCalledTimes(2)
      expect(screen.getByText('새로운 스레드')).toBeInTheDocument()
      expect(screen.getByText('total threads: 3')).toBeInTheDocument()
    })
  })
})
