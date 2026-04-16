import React from 'react'
import ReactDOM from 'react-dom/client'

import { ThreadDetailContainer } from '../../components/ThreadDetailContainer'

const rootElement = document.getElementById('root')
const threadId = rootElement?.getAttribute('data-thread-id') ?? 'thread_001'

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ThreadDetailContainer threadId={threadId} />
    </React.StrictMode>,
  )
}
