import { cn } from '@/lib/utils'

export type DashboardTab = 'plan' | 'courses' | 'tournaments'

const TABS: { id: DashboardTab; label: string }[] = [
  { id: 'plan', label: 'Plan' },
  { id: 'courses', label: 'Courses' },
  { id: 'tournaments', label: 'Tournaments' },
]

export function TabBar({
  value,
  onChange,
  noticeCount,
}: {
  value: DashboardTab
  onChange: (tab: DashboardTab) => void
  noticeCount?: number
}) {
  return (
    <nav aria-label="What to look at" className="bg-forest-2">
      <div className="mx-auto grid max-w-[960px] grid-cols-3 gap-1.5 px-4 py-2.5">
        {TABS.map((tab) => {
          const selected = value === tab.id
          const badge = tab.id === 'plan' ? noticeCount : undefined

          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => onChange(tab.id)}
              className={cn(
                'inline-flex min-h-14 items-center justify-center gap-2 rounded-md px-3 text-base font-semibold',
                selected
                  ? 'bg-gold text-forest'
                  : 'bg-white/10 text-white/90 hover:bg-white/16',
              )}
            >
              {tab.label}
              {badge && badge > 0 ? (
                <span
                  className={cn(
                    'inline-flex min-w-6 items-center justify-center rounded-full px-1.5 py-0.5 text-xs font-bold',
                    selected ? 'bg-forest text-gold' : 'bg-gold text-forest',
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
