import type { EventRecord } from '@/types'
import { TextField } from '@/components/ui/field'
import { usePatchEvent } from '@/data/hooks'
import { DEFAULT_START, retimedGroups, toInputTime } from '@/lib/tee-sheet'

export function FirstTeeField({
  event,
  hint = 'Change this if the course starts later.',
}: {
  event: EventRecord
  hint?: string
}) {
  const patch = usePatchEvent()
  const value = toInputTime(event.firstTeeTime ?? DEFAULT_START)

  return (
    <TextField
      label="First tee time"
      hint={hint}
      type="time"
      value={value}
      disabled={patch.isPending}
      onChange={(e) => {
        const next = e.target.value
        patch.mutate({
          id: event.id,
          patch: {
            firstTeeTime: next || null,
            ...(event.teeGroups?.length
              ? { teeGroups: retimedGroups(event.teeGroups, next || DEFAULT_START) }
              : {}),
          },
        })
      }}
    />
  )
}
