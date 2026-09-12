import { cn } from '@/lib/utils'

/** A short ruled line with end ticks — decorative only, does not change layout. */
export function Flourish({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 10"
      className={cn('h-2.5 w-28 text-brand', className)}
      aria-hidden
    >
      <path
        d="M2 5h38 M80 5h38"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="square"
      />
      <path
        d="M40 1.5v7 M80 1.5v7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <circle cx="60" cy="5" r="2.2" className="fill-flare" />
    </svg>
  )
}
