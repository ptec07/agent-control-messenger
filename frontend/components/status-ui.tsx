import React from 'react'

const space = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '0.75rem',
  lg: '1rem',
  xl: '1.5rem',
} as const

const fontSize = {
  sm: '0.875rem',
  base: '0.95rem',
  lg: '1rem',
  xl: '1.75rem',
} as const

const fontWeight = {
  semibold: 600,
  bold: 700,
} as const

const textColor = {
  default: '#111827',
  muted: '#6b7280',
  subtle: '#374151',
} as const

const color = {
  border: {
    default: '#e5e7eb',
    muted: '#d1d5db',
    primary: '#2563eb',
    danger: '#dc2626',
  } as const,
  surface: {
    canvas: '#ffffff',
    subtle: '#f9fafb',
    skeleton: '#e5e7eb',
    dangerSoft: '#fef2f2',
  } as const,
  action: {
    primary: { bg: '#2563eb', fg: '#ffffff' },
    danger: { bg: '#dc2626', fg: '#ffffff' },
    secondary: { bg: '#ffffff', fg: '#111827' },
    ghost: { bg: '#f9fafb', fg: '#374151' },
  } as const,
  status: {
    neutral: { bg: '#e5e7eb', fg: '#374151' },
    info: { bg: '#dbeafe', fg: '#1d4ed8' },
    success: { bg: '#dcfce7', fg: '#166534' },
    warning: { bg: '#fef3c7', fg: '#92400e' },
    danger: { bg: '#fee2e2', fg: '#991b1b' },
  } as const,
} as const

export const copyTokens = {
  actions: {
    retry: '다시 시도',
  },
  threadList: {
    loading: 'thread list를 불러오는 중입니다.',
    error: 'thread list를 불러오지 못했습니다.',
    emptyDefault: '아직 표시할 thread가 없습니다.',
    emptyFiltered: '현재 필터와 일치하는 thread가 없습니다.',
  },
  approvalQueue: {
    loading: 'approval queue를 불러오는 중입니다.',
    error: 'approval queue를 불러오지 못했습니다.',
    emptyDefault: '현재 대기 중인 approval 요청이 없습니다.',
    emptyFiltered: '현재 검색과 일치하는 approval 요청이 없습니다.',
  },
  threadDetail: {
    loading: 'thread detail을 불러오는 중입니다.',
    error: 'thread detail을 불러오지 못했습니다.',
    emptyTimeline: '아직 표시할 타임라인 이벤트가 없습니다.',
  },
} as const

export const statusTokens = {
  space,
  fontSize,
  fontWeight,
  textColor,
  color,
  panelBase: {
    borderRadius: space.md,
    padding: '0.875rem',
    marginTop: space.md,
  } satisfies React.CSSProperties,
  panelTone: {
    neutral: {
      border: `1px solid ${color.border.default}`,
      backgroundColor: color.surface.subtle,
      color: textColor.subtle,
    } satisfies React.CSSProperties,
    error: {
      border: '1px solid #fecaca',
      backgroundColor: color.surface.dangerSoft,
      color: color.status.danger.fg,
    } satisfies React.CSSProperties,
  },
  buttonBase: {
    borderRadius: space.sm,
    border: '1px solid transparent',
    padding: '0.45rem 0.8rem',
    fontWeight: fontWeight.bold,
    fontSize: fontSize.base,
    cursor: 'pointer',
  } satisfies React.CSSProperties,
  buttonTone: {
    secondary: { border: `1px solid ${color.border.muted}`, backgroundColor: color.action.secondary.bg, color: color.action.secondary.fg } satisfies React.CSSProperties,
    primary: { border: `1px solid ${color.border.primary}`, backgroundColor: color.action.primary.bg, color: color.action.primary.fg } satisfies React.CSSProperties,
    danger: { border: `1px solid ${color.border.danger}`, backgroundColor: color.action.danger.bg, color: color.action.danger.fg } satisfies React.CSSProperties,
    ghost: { border: `1px solid ${color.border.muted}`, backgroundColor: color.action.ghost.bg, color: color.action.ghost.fg } satisfies React.CSSProperties,
  },
  buttonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  } satisfies React.CSSProperties,
  skeletonBlock: {
    backgroundColor: color.surface.skeleton,
    borderRadius: space.sm,
  } satisfies React.CSSProperties,
  skeletonCard: {
    border: `1px solid ${color.border.default}`,
    borderRadius: space.md,
    padding: space.lg,
  } satisfies React.CSSProperties,
  skeletonGrid: {
    display: 'grid',
    gap: space.md,
    marginTop: space.md,
  } satisfies React.CSSProperties,
  surfaceCard: {
    border: `1px solid ${color.border.default}`,
    borderRadius: space.md,
    padding: space.lg,
    marginBottom: '0.75rem',
  } satisfies React.CSSProperties,
  badgeBase: {
    display: 'inline-flex',
    alignItems: 'center',
    borderRadius: '9999px',
    padding: '0.2rem 0.6rem',
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    lineHeight: 1.2,
  } satisfies React.CSSProperties,
  badgeTone: {
    neutral: { backgroundColor: color.status.neutral.bg, color: color.status.neutral.fg } satisfies React.CSSProperties,
    info: { backgroundColor: color.status.info.bg, color: color.status.info.fg } satisfies React.CSSProperties,
    success: { backgroundColor: color.status.success.bg, color: color.status.success.fg } satisfies React.CSSProperties,
    warning: { backgroundColor: color.status.warning.bg, color: color.status.warning.fg } satisfies React.CSSProperties,
    danger: { backgroundColor: color.status.danger.bg, color: color.status.danger.fg } satisfies React.CSSProperties,
  },
  fieldLabel: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
    fontWeight: fontWeight.semibold,
  } satisfies React.CSSProperties,
  inputBase: {
    border: `1px solid ${color.border.muted}`,
    borderRadius: space.sm,
    padding: '0.55rem 0.75rem',
    fontSize: '0.95rem',
    color: '#111827',
    backgroundColor: color.surface.canvas,
  } satisfies React.CSSProperties,
  fieldRow: {
    display: 'flex',
    gap: space.md,
    flexWrap: 'wrap',
    marginTop: space.md,
    marginBottom: space.md,
  } satisfies React.CSSProperties,
  text: {
    eyebrow: {
      margin: 0,
      color: textColor.muted,
      fontSize: fontSize.sm,
      fontWeight: fontWeight.bold,
      textTransform: 'uppercase',
      letterSpacing: '0.04em',
    } satisfies React.CSSProperties,
    title: {
      margin: 0,
      color: textColor.default,
      fontSize: fontSize.lg,
      fontWeight: fontWeight.bold,
      lineHeight: 1.35,
    } satisfies React.CSSProperties,
    body: {
      margin: 0,
      color: textColor.default,
      fontSize: fontSize.base,
      lineHeight: 1.5,
    } satisfies React.CSSProperties,
    meta: {
      margin: 0,
      color: textColor.muted,
      fontSize: fontSize.sm,
      lineHeight: 1.4,
    } satisfies React.CSSProperties,
    codeBlock: {
      margin: `${space.md} 0 0 0`,
      borderRadius: space.md,
      padding: '0.875rem',
      border: `1px solid ${color.border.default}`,
      backgroundColor: color.surface.subtle,
      color: textColor.subtle,
      whiteSpace: 'pre-wrap',
      fontSize: fontSize.sm,
      lineHeight: 1.5,
    } satisfies React.CSSProperties,
  },
} as const

export type BadgeTone = keyof typeof statusTokens.badgeTone

export function threadStatusBadgeTone(status: string): BadgeTone {
  if (status === 'paused_for_approval') {
    return 'warning'
  }

  if (status === 'running') {
    return 'info'
  }

  return 'neutral'
}

export function approvalStateBadgeTone(hasPendingApproval: boolean): Extract<BadgeTone, 'danger' | 'success'> {
  if (hasPendingApproval) {
    return 'danger'
  }

  return 'success'
}

export function riskLevelBadgeTone(riskLevel: string): Extract<BadgeTone, 'danger' | 'warning' | 'success'> {
  if (riskLevel === 'high') {
    return 'danger'
  }

  if (riskLevel === 'medium') {
    return 'warning'
  }

  return 'success'
}

export function approvalStatusBadgeTone(status?: string): Extract<BadgeTone, 'warning' | 'success' | 'neutral'> {
  if (status === 'pending') {
    return 'warning'
  }

  if (status === 'approved') {
    return 'success'
  }

  return 'neutral'
}

type StatusPanelProps = {
  tone?: 'neutral' | 'error'
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}

export function StatusPanel({
  tone = 'neutral',
  title,
  description,
  actionLabel,
  onAction,
}: StatusPanelProps) {
  return (
    <div
      aria-label={`status panel ${tone}`}
      style={{
        ...statusTokens.panelBase,
        ...statusTokens.panelTone[tone],
      }}
    >
      <TitleText as="h3">{title}</TitleText>
      {description ? <MetaText style={{ marginTop: '0.35rem' }}>{description}</MetaText> : null}
      {actionLabel && onAction ? (
        <Button tone="secondary" onClick={onAction} style={{ marginTop: space.md }}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  )
}

type SkeletonBlockProps = {
  ariaLabel?: string
  width?: string
  height: string
  style?: React.CSSProperties
}

function SkeletonBlock({ ariaLabel, width = '100%', height, style }: SkeletonBlockProps) {
  return <div aria-label={ariaLabel} style={{ ...statusTokens.skeletonBlock, width, height, ...style }} />
}

export function SkeletonTitle({ ariaLabel, width = '45%', style }: { ariaLabel?: string; width?: string; style?: React.CSSProperties }) {
  return <SkeletonBlock ariaLabel={ariaLabel} width={width} height="1.25rem" style={{ marginBottom: '0.75rem', ...style }} />
}

export function SkeletonText({ ariaLabel, width = '55%', style }: { ariaLabel?: string; width?: string; style?: React.CSSProperties }) {
  return <SkeletonBlock ariaLabel={ariaLabel} width={width} height="0.95rem" style={{ marginBottom: '0.5rem', ...style }} />
}

export function SkeletonBadgeRow({ ariaLabel = 'skeleton badge row', style }: { ariaLabel?: string; style?: React.CSSProperties }) {
  return (
    <div aria-label={ariaLabel} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', ...style }}>
      <SkeletonBlock width="6rem" height="1.8rem" style={{ borderRadius: '9999px' }} />
      <SkeletonBlock width="5rem" height="1.8rem" style={{ borderRadius: '9999px' }} />
    </div>
  )
}

export function SkeletonCodeBlock({ ariaLabel = 'skeleton code block', width = '100%', style }: { ariaLabel?: string; width?: string; style?: React.CSSProperties }) {
  return <SkeletonBlock ariaLabel={ariaLabel} width={width} height="4rem" style={{ borderRadius: statusTokens.space.md, ...style }} />
}

type SkeletonCardListProps = {
  ariaLabel: string
  itemAriaLabel: string
  count?: number
  renderCard: (index: number) => React.ReactNode
}

export function SkeletonCardList({
  ariaLabel,
  itemAriaLabel,
  count = 3,
  renderCard,
}: SkeletonCardListProps) {
  return (
    <div aria-label={ariaLabel} style={statusTokens.skeletonGrid}>
      {Array.from({ length: count }).map((_, index) => (
        <article
          key={`${itemAriaLabel}-${index}`}
          aria-label={`${itemAriaLabel} ${index + 1}`}
          style={statusTokens.skeletonCard}
        >
          {renderCard(index)}
        </article>
      ))}
    </div>
  )
}


type ButtonProps = {
  children: React.ReactNode
  tone?: 'secondary' | 'primary' | 'danger' | 'ghost'
  disabled?: boolean
  onClick?: () => void
  style?: React.CSSProperties
}

export function Button({ children, tone = 'secondary', disabled = false, onClick, style }: ButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      style={{
        ...statusTokens.buttonBase,
        ...statusTokens.buttonTone[tone],
        ...(disabled ? statusTokens.buttonDisabled : {}),
        ...style,
      }}
    >
      {children}
    </button>
  )
}


type LayoutProps = {
  children: React.ReactNode
  ariaLabel?: string
  gap?: string
  align?: React.CSSProperties['alignItems']
  justify?: React.CSSProperties['justifyContent']
}

export function Stack({ children, ariaLabel, gap = statusTokens.space.md }: LayoutProps) {
  return (
    <div aria-label={ariaLabel} style={{ display: 'grid', gap }}>
      {children}
    </div>
  )
}

export function Inline({ children, ariaLabel, gap = statusTokens.space.md, align = 'center' }: LayoutProps) {
  return (
    <div aria-label={ariaLabel} style={{ display: 'flex', gap, alignItems: align }}>
      {children}
    </div>
  )
}

export function Cluster({
  children,
  ariaLabel,
  gap = statusTokens.space.md,
  align = 'center',
  justify = 'flex-start',
}: LayoutProps) {
  return (
    <div aria-label={ariaLabel} style={{ display: 'flex', gap, flexWrap: 'wrap', alignItems: align, justifyContent: justify }}>
      {children}
    </div>
  )
}


type InfoListProps = {
  children: React.ReactNode
  ariaLabel?: string
}

export function InfoList({ children, ariaLabel }: InfoListProps) {
  return (
    <dl aria-label={ariaLabel} style={{ display: 'grid', gap: statusTokens.space.md }}>
      {children}
    </dl>
  )
}

type InfoItemProps = {
  label: string
  children: React.ReactNode
}

export function InfoItem({ label, children }: InfoItemProps) {
  return (
    <div style={{ display: 'grid', gap: statusTokens.space.xs }}>
      <dt style={{ margin: 0, color: statusTokens.textColor.muted, fontSize: statusTokens.fontSize.sm, fontWeight: statusTokens.fontWeight.bold }}>
        {label}
      </dt>
      <dd style={{ margin: 0, color: statusTokens.textColor.default, fontSize: statusTokens.text.body.fontSize, lineHeight: statusTokens.text.body.lineHeight }}>
        {children}
      </dd>
    </div>
  )
}

type TextPrimitiveProps = {
  children: React.ReactNode
  ariaLabel?: string
  as?: 'p' | 'span' | 'h1' | 'h2' | 'h3'
  style?: React.CSSProperties
}

export function Eyebrow({ children, ariaLabel, as = 'p', style }: TextPrimitiveProps) {
  const Component = as
  return <Component aria-label={ariaLabel} style={{ ...statusTokens.text.eyebrow, ...style }}>{children}</Component>
}

export function TitleText({ children, ariaLabel, as = 'p', style }: TextPrimitiveProps) {
  const Component = as
  return <Component aria-label={ariaLabel} style={{ ...statusTokens.text.title, ...style }}>{children}</Component>
}

export function BodyText({ children, ariaLabel, as = 'p', style }: TextPrimitiveProps) {
  const Component = as
  return <Component aria-label={ariaLabel} style={{ ...statusTokens.text.body, ...style }}>{children}</Component>
}

export function MetaText({ children, ariaLabel, as = 'p', style }: TextPrimitiveProps) {
  const Component = as
  return <Component aria-label={ariaLabel} style={{ ...statusTokens.text.meta, ...style }}>{children}</Component>
}

type CodeBlockProps = {
  children: React.ReactNode
  ariaLabel?: string
  style?: React.CSSProperties
}

export function CodeBlock({ children, ariaLabel = 'code block', style }: CodeBlockProps) {
  return <pre aria-label={ariaLabel} style={{ ...statusTokens.text.codeBlock, ...style }}>{children}</pre>
}

type SurfaceCardProps = {
  children: React.ReactNode
  ariaLabel?: string
}

export function SurfaceCard({ children, ariaLabel }: SurfaceCardProps) {
  return (
    <article aria-label={ariaLabel} style={statusTokens.surfaceCard}>
      {children}
    </article>
  )
}

type BadgeProps = {
  children: React.ReactNode
  tone?: 'neutral' | 'info' | 'success' | 'warning' | 'danger'
  ariaLabel?: string
}

export function Badge({ children, tone = 'neutral', ariaLabel }: BadgeProps) {
  return (
    <span aria-label={ariaLabel} style={{ ...statusTokens.badgeBase, ...statusTokens.badgeTone[tone] }}>
      {children}
    </span>
  )
}

type FieldLabelProps = {
  label: string
  children: React.ReactNode
}

export function FieldLabel({ label, children }: FieldLabelProps) {
  return (
    <label style={statusTokens.fieldLabel}>
      {label}
      {children}
    </label>
  )
}

type TextInputProps = {
  value: string
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
}

export function TextInput({ value, onChange }: TextInputProps) {
  return <input type="text" value={value} onChange={onChange} style={statusTokens.inputBase} />
}

type SelectInputProps = {
  value: string
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void
  options: Array<{ value: string; label: string }>
}

export function SelectInput({ value, onChange, options }: SelectInputProps) {
  return (
    <select value={value} onChange={onChange} style={statusTokens.inputBase}>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}
