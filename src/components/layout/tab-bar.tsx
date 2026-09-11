import { cn } from '@/lib/utils'

export type DashboardTab = 'courses' | 'coming-up'

const TABS: { id: DashboardTab; label: string }[] = [
  { id: 'courses', label: 'Courses' },
  { id: 'coming-up', label: 'Coming up' },
]

export function TabBar({
  value,
  onChange,
  comingUpBadge,
}: {
  value: DashboardTab
  onChange: (tab: DashboardTab) => void
  comingUpBadge?: number
}) {
  return (
    <nav
      aria-label="What to look at"
      className="border-b border-border bg-white"
    >
      <div className="mx-auto grid max-w-[960px] grid-cols-2 gap-2 px-5 py-3">
        {TABS.map((tab) => {
          const selected = value === tab.id
          const badge = tab.id === 'coming-up' ? comingUpBadge : undefined

          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => onChange(tab.id)}
              className={cn(
                'inline-flex min-h-14 items-center justify-center gap-2.5 rounded-md px-4 text-lg font-semibold transition-colors',
                selected
                  ? 'bg-brand text-white'
                  : 'bg-muted text-ink hover:bg-brand-soft',
              )}
            >
              {tab.label}
              {badge && badge > 0 ? (
                <span
                  className={cn(
                    'inline-flex min-w-7 items-center justify-center rounded-full px-2 py-0.5 text-sm font-semibold',
                    selected ? 'bg-white text-brand' : 'bg-accent text-ink',
                  )}
                >
                  {badge}
                </span>
              ) : null}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
