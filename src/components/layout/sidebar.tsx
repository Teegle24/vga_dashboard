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
  { id: 'history', label: 'History', hint: 'Played rounds and rates', icon: ScrollText },
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
    <aside className="bg-forest/72 text-white backdrop-blur-xl lg:flex lg:h-dvh lg:w-72 lg:shrink-0 lg:flex-col lg:sticky lg:top-0">
      <div className="border-b border-white/10 px-5 py-4">
        <div className="flex items-center gap-2.5 rounded-md bg-white/80 px-2.5 py-1.5 backdrop-blur-sm">
          <img
            src="/teegle-golf-logo.png"
            alt="Teegle Golf"
            className="h-8 w-auto shrink-0 object-contain"
          />
          <div className="h-7 w-px shrink-0 bg-border" aria-hidden />
          <img
            src="/vga-seal.png"
            alt="Veteran Golfers Association"
            className="size-9 shrink-0 object-contain"
          />
          <div className="h-7 w-px shrink-0 bg-border" aria-hidden />
          <IdahoMark className="h-11 w-auto shrink-0" />
        </div>
        <p className="mt-4 font-display text-xl font-semibold tracking-tight">
          VGA Idaho
        </p>
        <p className="text-sm text-white/65">Tournament desk</p>
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
                  ? 'bg-gold/72 text-forest backdrop-blur-sm'
                  : 'text-white/90 hover:bg-white/10',
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
                        selected ? 'bg-forest text-gold' : 'bg-gold text-forest',
                      )}
                    >
                      {badge}
                    </span>
                  ) : null}
                </span>
                <span
                  className={cn(
                    'block text-sm',
                    selected ? 'text-forest/70' : 'text-white/55',
                  )}
                >
                  {item.hint}
                </span>
              </span>
            </button>
          )
        })}
      </nav>

      <div className="hidden border-t border-white/10 px-5 py-4 lg:block">
        <p className="text-sm text-white/50">Director</p>
        <p className="text-base text-white/90">{CURRENT_DIRECTOR}</p>
      </div>
      <div className="h-0.5 bg-gold lg:hidden" aria-hidden />
    </aside>
  )
}
