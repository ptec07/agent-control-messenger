import React from 'react'
import ReactDOM from 'react-dom/client'

import { ThreadListContainer } from '../../components/ThreadListContainer'

const rootElement = document.getElementById('root')

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ThreadListContainer />
    </React.StrictMode>,
  )
}
