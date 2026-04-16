import React from 'react'

import { MetaText, TitleText, statusTokens } from './status-ui'

type PageHeaderBlockProps = {
  title: string
  subtitle?: string
}

export function PageHeaderBlock({ title, subtitle }: PageHeaderBlockProps) {
  return (
    <header aria-label="page header" style={{ marginBottom: statusTokens.space.md }}>
      <TitleText as="h1">{title}</TitleText>
      {subtitle ? <MetaText style={{ marginTop: '0.35rem' }}>{subtitle}</MetaText> : null}
    </header>
  )
}
