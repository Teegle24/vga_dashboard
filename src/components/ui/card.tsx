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
        'rounded-lg border border-border bg-card p-6 backdrop-blur-[2px] shadow-[0_1px_0_rgba(18,33,12,0.03),0_14px_32px_-28px_rgba(18,33,12,0.2)]',
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
        <h2 className="text-3xl font-semibold text-ink">{title}</h2>
        {description ? (
          <p className="mt-1.5 max-w-xl text-base text-ink-soft">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  )
}

export function Pill({
  tone = 'neutral',
  children,
}: {
  tone?: 'neutral' | 'due' | 'done'
  children: ReactNode
}) {
  const tones = {
    neutral: 'bg-muted text-ink-soft',
    due: 'bg-gold-soft text-ink',
    done: 'bg-brand-soft text-brand',
  } as const

  const dots = {
    neutral: 'bg-ink-soft/40',
    due: 'bg-gold',
    done: 'bg-brand',
  } as const

  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-semibold',
        tones[tone],
      )}
    >
      <span className={cn('size-2 rounded-full', dots[tone])} aria-hidden />
      {children}
    </span>
  )
}
