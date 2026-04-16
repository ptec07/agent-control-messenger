export type AppRoute =
  | { name: 'thread-list' }
  | { name: 'approval-queue' }
  | { name: 'thread-detail'; threadId: string }
  | { name: 'not-found' }

function trimTrailingSlash(value: string): string {
  if (value === '/') {
    return ''
  }
  return value.replace(/\/+$/, '')
}

function currentOrigin(): string {
  if (typeof window === 'undefined') {
    return 'http://localhost:5173'
  }
  return window.location.origin
}

export function getApiBaseUrl(): string {
  const configured = trimTrailingSlash(import.meta.env.VITE_API_BASE_URL ?? '')
  return configured || '/api'
}

export function buildApiUrl(path: string): string {
  const base = getApiBaseUrl()
  return `${base}${path}`
}

export function getWebSocketUrl(path = '/ws'): string {
  const configured = trimTrailingSlash(import.meta.env.VITE_WS_URL ?? '')
  if (configured) {
    return `${configured}${path}`
  }

  const apiBase = getApiBaseUrl()
  if (/^https?:\/\//.test(apiBase)) {
    const url = new URL(apiBase)
    url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:'
    url.pathname = `${trimTrailingSlash(url.pathname)}${path}`
    return url.toString()
  }

  const origin = new URL(currentOrigin())
  origin.protocol = origin.protocol === 'https:' ? 'wss:' : 'ws:'
  origin.pathname = `${trimTrailingSlash(apiBase)}${path}`
  return origin.toString()
}

export function resolveAppRoute(pathname: string): AppRoute {
  if (pathname === '/' || pathname === '/threads') {
    return { name: 'thread-list' }
  }

  if (pathname === '/approval-requests') {
    return { name: 'approval-queue' }
  }

  const detailMatch = pathname.match(/^\/threads\/([^/]+)$/)
  if (detailMatch) {
    return { name: 'thread-detail', threadId: decodeURIComponent(detailMatch[1]) }
  }

  return { name: 'not-found' }
}
