import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { App } from '../App'

vi.mock('../components/ThreadListContainer', () => ({
  ThreadListContainer: () => (
    <div>
      thread list screen
      <a href="/threads/thread_from_list">go detail</a>
    </div>
  ),
}))

vi.mock('../components/ApprovalQueueContainer', () => ({
  ApprovalQueueContainer: () => <div>approval queue screen</div>,
}))

vi.mock('../components/ThreadDetailContainer', () => ({
  ThreadDetailContainer: ({ threadId }: { threadId: string }) => <div>thread detail {threadId}</div>,
}))

describe('App', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/threads')
  })

  it('renders the thread list route by default', () => {
    render(<App />)

    expect(screen.getByText('thread list screen')).toBeInTheDocument()
  })

  it('renders the approval queue route', () => {
    window.history.replaceState({}, '', '/approval-requests')

    render(<App />)

    expect(screen.getByText('approval queue screen')).toBeInTheDocument()
  })

  it('renders the thread detail route with the thread id', () => {
    window.history.replaceState({}, '', '/threads/thread_123')

    render(<App />)

    expect(screen.getByText('thread detail thread_123')).toBeInTheDocument()
  })

  it('navigates client-side when a local thread detail link is clicked', () => {
    render(<App />)

    fireEvent.click(screen.getByRole('link', { name: 'go detail' }))

    expect(screen.getByText('thread detail thread_from_list')).toBeInTheDocument()
    expect(window.location.pathname).toBe('/threads/thread_from_list')
  })

  it('renders a not-found state for unknown routes', () => {
    window.history.replaceState({}, '', '/unknown')

    render(<App />)

    expect(screen.getByRole('heading', { name: '페이지를 찾을 수 없습니다.' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'thread 목록으로 이동' })).toHaveAttribute('href', '/threads')
  })
})
