import { CURRENT_DIRECTOR } from '@/data/store'

/**
 * Dark forest bar so the white-backed logos sit on a plate instead of
 * floating on a cheap white strip. Gold rule marks the club line.
 */
export function TopBar() {
  return (
    <header className="bg-forest text-white">
      <div className="mx-auto flex max-w-[960px] items-center gap-4 px-5 py-3.5">
        <div className="flex items-center gap-3 rounded-md bg-white px-2.5 py-1.5">
          <img
            src="/teegle-golf-logo.png"
            alt="Teegle Golf"
            className="h-9 w-auto shrink-0 object-contain"
          />
          <div className="h-8 w-px shrink-0 bg-border" aria-hidden />
          <img
            src="/vga-seal.png"
            alt="Veteran Golfers Association"
            className="size-10 shrink-0 object-contain"
          />
        </div>

        <div className="min-w-0 leading-tight">
          <p className="truncate font-display text-lg font-semibold tracking-tight">
            VGA Idaho
          </p>
          <p className="truncate text-sm text-white/70">
            Stroke play · Tournament desk
          </p>
        </div>

        <div className="ml-auto hidden shrink-0 sm:block">
          <p className="text-right text-sm text-white/55">Director</p>
          <p className="text-right text-base text-white/90">{CURRENT_DIRECTOR}</p>
        </div>
      </div>
      <div className="h-0.5 bg-gold" aria-hidden />
    </header>
  )
}
