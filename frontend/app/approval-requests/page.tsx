import React from 'react'
import ReactDOM from 'react-dom/client'

import { ApprovalQueueContainer } from '../../components/ApprovalQueueContainer'

const rootElement = document.getElementById('root')

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ApprovalQueueContainer />
    </React.StrictMode>,
  )
}
