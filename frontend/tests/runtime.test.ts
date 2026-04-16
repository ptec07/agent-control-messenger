import { describe, expect, it } from 'vitest'

import { buildApiUrl, getWebSocketUrl, resolveAppRoute } from '../lib/runtime'

describe('runtime helpers', () => {
  it('prefixes API calls with /api by default so direct /threads routes stay on the SPA', () => {
    expect(buildApiUrl('/threads')).toBe('/api/threads')
    expect(buildApiUrl('/approval-requests')).toBe('/api/approval-requests')
  })

  it('builds websocket URLs under /api/ws by default', () => {
    expect(getWebSocketUrl()).toBe('ws://localhost:3000/api/ws')
  })

  it('still resolves direct thread routes as application routes', () => {
    expect(resolveAppRoute('/threads')).toEqual({ name: 'thread-list' })
    expect(resolveAppRoute('/threads/thread_123')).toEqual({ name: 'thread-detail', threadId: 'thread_123' })
  })
})
