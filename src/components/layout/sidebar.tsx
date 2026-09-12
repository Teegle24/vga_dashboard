import {
  ClipboardList,
  Flag,
  Landmark,
  ScrollText,
  Users,
} from 'lucide-react'
import { IdahoMark } from '@/components/layout/idaho-mark'
import { CURRENT_DIRECTOR } from '@/data/store'
import { cn } from '@/lib/utils'

export type DashboardTab =
  | 'plan'
  | 'tournaments'
  | 'courses'
  | 'members'
  | 'history'

const ITEMS: {
  id: DashboardTab
  label: string
  hint: string
  icon: typeof Flag
}[] = [
  { id: 'plan', label: 'Plan', hint: 'What needs doing', icon: ClipboardList },
  { id: 'tournaments', label: 'Tournaments', hint: 'Dates and tee sheets', icon: Flag },
  { id: 'courses', label: 'Courses', hint: 'Contacts and rates', icon: Landmark },
  { id: 'members', label: 'Members', hint: 'Flights and the field', icon: Users },
  { id: 'history', label: 'History', hint: 'Played rounds', icon: ScrollText },
]

export function Sidebar({
  value,
  onChange,
  noticeCount,
}: {
  value: DashboardTab
  onChange: (tab: DashboardTab) => void
  noticeCount?: number
}) {
  return (
    <aside className="relative bg-forest text-white shadow-[inset_-3px_0_0_0_#2563eb] lg:flex lg:h-dvh lg:w-60 lg:shrink-0 lg:flex-col lg:sticky lg:top-0">
      <div className="border-b border-white/10 px-3 py-4">
        <div className="flex items-center gap-1.5 rounded-md bg-white px-1.5 py-1.5">
          <img
            src="/teegle-golf-logo.png"
            alt="Teegle Golf"
            className="h-7 w-auto shrink-0 object-contain"
          />
          <div className="h-6 w-px shrink-0 bg-border" aria-hidden />
          <img
            src="/vga-seal.png"
            alt="Veteran Golfers Association"
            className="size-8 shrink-0 object-contain"
          />
          <div className="h-6 w-px shrink-0 bg-border" aria-hidden />
          <IdahoMark className="h-9 w-auto shrink-0" />
        </div>
        <p className="mt-4 font-display text-xl font-semibold tracking-tight">
          VGA Idaho
        </p>
        <div className="mt-2 h-0.5 w-12 bg-brand" aria-hidden />
        <p className="mt-2 text-sm text-white/65">Tournament desk</p>
      </div>

      <nav aria-label="Desk" className="grid gap-1.5 p-3 sm:grid-cols-2 lg:grid-cols-1 lg:flex-1">
        {ITEMS.map((item) => {
          const selected = value === item.id
          const Icon = item.icon
          const badge = item.id === 'plan' ? noticeCount : undefined

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={cn(
                'flex min-h-16 items-center gap-3 rounded-md px-3 text-left',
                selected
                  ? 'bg-white text-ink shadow-[inset_4px_0_0_0_#2563eb]'
                  : 'text-white hover:bg-white/10',
              )}
            >
              <Icon className="size-6 shrink-0" aria-hidden />
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2 text-base font-semibold">
                  {item.label}
                  {badge && badge > 0 ? (
                    <span
                      className={cn(
                        'inline-flex min-w-6 items-center justify-center rounded-full px-1.5 py-0.5 text-xs font-bold',
                        selected ? 'bg-brand text-white' : 'bg-brand text-white',
                      )}
                    >
                      {badge}
                    </span>
                  ) : null}
                </span>
                <span
                  className={cn(
                    'block text-sm',
                    selected ? 'text-ink-soft' : 'text-white/60',
                  )}
                >
                  {item.hint}
                </span>
              </span>
            </button>
          )
        })}
      </nav>

      <div className="hidden border-t border-white/10 px-3 py-4 lg:block">
        <p className="text-sm text-white/50">Director</p>
        <p className="text-base text-white/90">{CURRENT_DIRECTOR}</p>
      </div>
      <div className="h-0.5 bg-brand lg:hidden" aria-hidden />
    </aside>
  )
}
