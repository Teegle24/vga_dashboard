import { currentStateName } from '@/lib/state'

/** Idaho outline from the public-domain U.S. blank map (Wikimedia). */
export function IdahoMark({ className }: { className?: string }) {
  return (
    <img
      src="/idaho.svg"
      alt={currentStateName()}
      className={className}
    />
  )
}
