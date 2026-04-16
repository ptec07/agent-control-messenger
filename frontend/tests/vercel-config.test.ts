import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

describe('vercel frontend deployment config', () => {
  it('provides a vercel.json for frontend-only deployment', () => {
    const configPath = resolve(__dirname, '..', 'vercel.json')
    const config = JSON.parse(readFileSync(configPath, 'utf-8')) as {
      version: number
      cleanUrls?: boolean
      outputDirectory?: string
      rewrites?: Array<{ source: string; destination: string }>
    }

    expect(config.version).toBe(2)
    expect(config.cleanUrls).toBeUndefined()
    expect(config.outputDirectory).toBe('dist')
    expect(config.rewrites).toEqual([
      { source: '/threads', destination: '/' },
      { source: '/threads/(.*)', destination: '/' },
      { source: '/approval-requests', destination: '/' },
      { source: '/(.*)', destination: '/index' },
    ])
  })
})
