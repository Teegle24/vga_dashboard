import { useState } from 'react'
import { Info, X } from 'lucide-react'

export function SampleDataBanner() {
  const [dismissed, setDismissed] = useState(false)
  if (dismissed) return null

  return (
    <div className="flex items-start gap-3 rounded-lg border border-brand/30 bg-brand-soft px-4 py-4">
      <Info className="mt-0.5 size-6 shrink-0 text-ink" aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="text-base font-semibold text-ink">
          Sample planning data so you can click around
        </p>
        <p className="mt-0.5 text-base text-ink-soft">
          Course names are real Idaho courses. Contacts, phones, and tournaments
          are made up. Nothing here should be called or emailed.
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
