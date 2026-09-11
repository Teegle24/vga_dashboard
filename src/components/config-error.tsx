import { missingConfig } from '@/lib/config'

export function ConfigError() {
  return (
    <div className="grid min-h-dvh place-items-center bg-canvas px-5 py-12">
      <div className="grid max-w-lg gap-4 rounded-lg border border-border bg-card p-8">
        <h1 className="text-2xl font-semibold text-ink">
          Teegle Golf · VGA Idaho
        </h1>
        <p className="text-base text-ink-soft">
          This build is missing configuration, so it can’t connect to the
          directory yet.
        </p>
        <ul className="grid gap-1">
          {missingConfig().map((key) => (
            <li key={key} className="font-mono text-base text-danger">
              {key}
            </li>
          ))}
        </ul>
        <p className="text-base text-ink-soft">
          To click through with sample data instead, set{' '}
          <span className="font-mono">VITE_USE_MOCK=true</span>.
        </p>
      </div>
    </div>
  )
}
