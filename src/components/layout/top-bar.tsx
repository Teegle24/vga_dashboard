import { CURRENT_DIRECTOR } from '@/data/store'
import { currentStateName } from '@/lib/state'

/**
 * The only chrome on the page. White background on purpose: the supplied Teegle
 * logo has a solid white backdrop rather than transparency, so a white bar
 * hides the edge.
 */
export function TopBar() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-white">
      <div className="mx-auto flex max-w-[960px] items-center gap-4 px-5 py-3">
        <img
          src="/teegle-golf-logo.png"
          alt="Teegle Golf"
          className="h-11 w-auto shrink-0 object-contain"
        />

        <div className="h-9 w-px shrink-0 bg-border" aria-hidden />

        <div className="flex min-w-0 items-center gap-2.5">
          <img
            src="/vga-seal.png"
            alt="Veteran Golfers Association"
            className="size-11 shrink-0 object-contain"
          />
          <div className="min-w-0 leading-tight">
            <p className="truncate text-base font-semibold text-ink">
              {currentStateName()}
            </p>
            <p className="truncate text-sm text-ink-soft">Course Directory</p>
          </div>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-3">
          <span className="hidden text-base text-ink-soft sm:inline">
            {CURRENT_DIRECTOR}
          </span>
        </div>
      </div>
    </header>
  )
}
