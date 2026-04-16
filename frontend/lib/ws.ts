export type ThreadEvent = {
  event: string
  data: Record<string, unknown>
}

export function subscribeToThreadEvents(
  url: string,
  onEvent: (event: ThreadEvent) => void,
): () => void {
  const socket = new WebSocket(url)

  socket.addEventListener('message', (event: MessageEvent) => {
    onEvent(JSON.parse(event.data) as ThreadEvent)
  })

  return () => socket.close()
}
