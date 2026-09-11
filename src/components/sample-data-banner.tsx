import { useState } from 'react'
import { Info, X } from 'lucide-react'

/**
 * Shown whenever any `sample` rows are present. A course directory only works
 * if people trust it, so demo data has to announce itself.
 */
export function SampleDataBanner() {
  const [dismissed, setDismissed] = useState(false)
  if (dismissed) return null

  return (
    <div className="flex items-start gap-3 rounded-lg border border-accent bg-accent-soft px-4 py-4">
      <Info className="mt-0.5 size-6 shrink-0 text-ink" aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="text-base font-medium text-ink">
          Showing sample events so you can see how this works
        </p>
        <p className="mt-0.5 text-base text-ink-soft">
          Course names are real Idaho courses, but the contacts, phone numbers,
          and past events are made up. Nothing here should be called or emailed.
        </p>
      </div>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Hide this notice"
        className="flex size-12 shrink-0 items-center justify-center rounded-md text-ink-soft hover:bg-white/60"
      >
        <X className="size-5" aria-hidden />
      </button>
    </div>
  )
}
