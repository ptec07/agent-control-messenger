import React from 'react'

import { approvalStatusBadgeTone, Badge, BodyText, CodeBlock, InfoItem, InfoList, MetaText, riskLevelBadgeTone, Stack } from './status-ui'

type ApprovalMetadataProps = {
  actionType: string
  riskLevel: string
  scope: string
  payloadPreview: string
  status?: string
}

export function ApprovalMetadata({ actionType, riskLevel, scope, payloadPreview, status }: ApprovalMetadataProps) {
  return (
    <InfoList ariaLabel="approval metadata">
      <InfoItem label="action type">
        <BodyText>{actionType}</BodyText>
      </InfoItem>
      <InfoItem label="risk level">
        <Badge ariaLabel={`risk level badge ${riskLevel}`} tone={riskLevelBadgeTone(riskLevel)}>{riskLevel}</Badge>
      </InfoItem>
      <InfoItem label="scope">
        <BodyText>{scope}</BodyText>
      </InfoItem>
      {status ? (
        <InfoItem label="status">
          <Stack gap="0.35rem">
            <Badge ariaLabel={`approval status badge ${status}`} tone={approvalStatusBadgeTone(status)}>{status}</Badge>
            <MetaText>{`상태: ${status}`}</MetaText>
          </Stack>
        </InfoItem>
      ) : null}
      <InfoItem label="payload preview">
        <CodeBlock>{payloadPreview}</CodeBlock>
      </InfoItem>
    </InfoList>
  )
}
