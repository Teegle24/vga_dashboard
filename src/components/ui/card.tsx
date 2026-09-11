import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function Card({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-card p-6 shadow-none',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function SectionHeading({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="text-2xl font-semibold text-ink">{title}</h2>
        {description ? (
          <p className="mt-1 text-base text-ink-soft">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  )
}

/** Status pill. Deliberately text-forward with a small dot, not a wall of color. */
export function Pill({
  tone = 'neutral',
  children,
}: {
  tone?: 'neutral' | 'due' | 'done'
  children: ReactNode
}) {
  const tones = {
    neutral: 'bg-muted text-ink-soft',
    due: 'bg-accent-soft text-ink',
    done: 'bg-brand-soft text-brand',
  } as const

  const dots = {
    neutral: 'bg-ink-soft/40',
    due: 'bg-accent',
    done: 'bg-brand',
  } as const

  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium',
        tones[tone],
      )}
    >
      <span className={cn('size-2 rounded-full', dots[tone])} aria-hidden />
      {children}
    </span>
  )
}
