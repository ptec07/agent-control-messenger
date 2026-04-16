import React from 'react'

import { BodyText, Button, Cluster, Eyebrow, Stack, SurfaceCard, TitleText, statusTokens } from './status-ui'
import { ApprovalMetadata } from './approval-metadata'

export type ApprovalCardProps = {
  approval: {
    id: string
    actionType: string
    riskLevel: string
    summary: string
    scope: string
    payloadPreview: string
    status?: string
  }
  onApprove?: (approvalId: string) => void | Promise<void>
  onReject?: (approvalId: string) => void | Promise<void>
}

export function ApprovalCard({ approval, onApprove, onReject }: ApprovalCardProps) {
  const isResolved = approval.status === 'approved' || approval.status === 'rejected'

  return (
    <SurfaceCard ariaLabel={`approval-${approval.id}`}>
      <Stack gap={statusTokens.space.sm}>
        <Eyebrow>승인 필요</Eyebrow>
        <TitleText>{approval.actionType}</TitleText>
        <BodyText>{approval.summary}</BodyText>
      </Stack>
      <ApprovalMetadata
        actionType={approval.actionType}
        riskLevel={approval.riskLevel}
        scope={approval.scope}
        payloadPreview={approval.payloadPreview}
        status={approval.status}
      />
      <Cluster gap={statusTokens.space.sm} ariaLabel={`approval actions ${approval.id}`}>
        <Button tone="primary" disabled={isResolved} onClick={() => void onApprove?.(approval.id)}>
          승인
        </Button>
        <Button tone="danger" disabled={isResolved} onClick={() => void onReject?.(approval.id)}>
          거절
        </Button>
        <Button tone="ghost" disabled={isResolved}>
          수정 후 승인
        </Button>
      </Cluster>
    </SurfaceCard>
  )
}
