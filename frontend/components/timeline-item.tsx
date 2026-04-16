import React from 'react'

import { MetaText, SkeletonText, SurfaceCard, statusTokens } from './status-ui'

type TimelineItemProps = {
  metaLabel: string
  children: React.ReactNode
}

export function TimelineItem({ metaLabel, children }: TimelineItemProps) {
  return (
    <SurfaceCard ariaLabel="timeline item">
      <MetaText style={{ marginBottom: statusTokens.space.sm, fontWeight: statusTokens.fontWeight.semibold }}>{metaLabel}</MetaText>
      <div>{children}</div>
    </SurfaceCard>
  )
}

export function TimelineSkeletonItem({ index }: { index: number }) {
  return (
    <>
      <SkeletonText width="28%" style={{ marginBottom: '0.75rem' }} />
      <SkeletonText width={index === 1 ? '75%' : '55%'} />
      <SkeletonText width={index === 2 ? '60%' : '42%'} style={{ marginBottom: 0 }} />
    </>
  )
}
