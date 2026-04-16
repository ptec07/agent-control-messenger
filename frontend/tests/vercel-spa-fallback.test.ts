import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

describe('vercel spa fallback build', () => {
  it('copies the built app shell to 404.html for static-route fallback', () => {
    const packageJsonPath = resolve(__dirname, '..', 'package.json')
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8')) as {
      scripts?: Record<string, string>
    }

    expect(packageJson.scripts?.build).toContain('cp dist/index.html dist/404.html')
  })
})
