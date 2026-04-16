import React, { useEffect, useState } from 'react'

import { ApprovalQueueContainer } from './components/ApprovalQueueContainer'
import { ThreadDetailContainer } from './components/ThreadDetailContainer'
import { ThreadListContainer } from './components/ThreadListContainer'
import { BodyText, TitleText } from './components/status-ui'
import { resolveAppRoute } from './lib/runtime'

export function App() {
  const [pathname, setPathname] = useState(() => window.location.pathname)

  useEffect(() => {
    function handlePopstate() {
      setPathname(window.location.pathname)
    }

    function handleDocumentClick(event: MouseEvent) {
      const target = event.target
      if (!(target instanceof Element)) {
        return
      }

      const anchor = target.closest('a[href]')
      if (!(anchor instanceof HTMLAnchorElement)) {
        return
      }

      const href = anchor.getAttribute('href')
      if (!href || !href.startsWith('/')) {
        return
      }

      event.preventDefault()
      window.history.pushState({}, '', href)
      setPathname(window.location.pathname)
    }

    window.addEventListener('popstate', handlePopstate)
    document.addEventListener('click', handleDocumentClick)
    return () => {
      window.removeEventListener('popstate', handlePopstate)
      document.removeEventListener('click', handleDocumentClick)
    }
  }, [])

  const route = resolveAppRoute(pathname)

  if (route.name === 'thread-list') {
    return <ThreadListContainer />
  }

  if (route.name === 'approval-queue') {
    return <ApprovalQueueContainer />
  }

  if (route.name === 'thread-detail') {
    return <ThreadDetailContainer threadId={route.threadId} />
  }

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'grid', gap: '0.75rem' }}>
        <TitleText as="h1">페이지를 찾을 수 없습니다.</TitleText>
        <BodyText>요청한 경로에 대응하는 Hermes 운영 화면이 없습니다.</BodyText>
        <a href="/threads">thread 목록으로 이동</a>
      </div>
    </main>
  )
}
