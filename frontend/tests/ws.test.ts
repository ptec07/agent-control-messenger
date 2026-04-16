import { describe, expect, it, vi } from 'vitest'

import { subscribeToThreadEvents } from '../lib/ws'


describe('subscribeToThreadEvents', () => {
  it('forwards parsed websocket events to the provided callback', () => {
    const sentEvents: unknown[] = []
    const listeners: Record<string, (event: MessageEvent) => void> = {} as Record<string, (event: MessageEvent) => void>

    class FakeWebSocket {
      url: string
      constructor(url: string) {
        this.url = url
      }
      addEventListener(name: string, handler: (event: MessageEvent) => void) {
        listeners[name] = handler
      }
      close() {}
    }

    vi.stubGlobal('WebSocket', FakeWebSocket as unknown as typeof WebSocket)

    const unsubscribe = subscribeToThreadEvents('ws://localhost:8000/ws', (event) => {
      sentEvents.push(event)
    })

    listeners.message({ data: JSON.stringify({ event: 'message.created', data: { id: 'msg_001' } }) } as MessageEvent)

    expect(sentEvents).toEqual([{ event: 'message.created', data: { id: 'msg_001' } }])
    unsubscribe()
    vi.unstubAllGlobals()
  })
})
