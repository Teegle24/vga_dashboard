import { useEffect, useState } from 'react'
import { FileDown, Save } from 'lucide-react'
import type { EventRecord, TeeGroup } from '@/types'
import { Button } from '@/components/ui/button'
import { FirstTeeField } from '@/components/first-tee-field'
import { usePatchEvent } from '@/data/hooks'
import { downloadTeeSheet, groupsForEvent } from '@/lib/tee-sheet'

export function TeeSheetBuilder({ event }: { event: EventRecord }) {
  const patch = usePatchEvent()
  const [groups, setGroups] = useState<TeeGroup[]>(() => groupsForEvent(event))
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setGroups(groupsForEvent(event))
  }, [event.id, event.headcount, event.firstTeeTime, event.teeGroups])

  function setPlayer(groupIndex: number, slot: number, value: string) {
    setGroups((current) =>
      current.map((group, i) =>
        i === groupIndex
          ? {
              ...group,
              players: group.players.map((p, s) => (s === slot ? value : p)),
            }
          : group,
      ),
    )
  }

  function save() {
    patch.mutate(
      {
        id: event.id,
        patch: {
          teeGroups: groups,
          teeSheetSentAt: event.teeSheetSentAt ?? new Date().toISOString(),
          status: event.status === 'held' ? 'confirmed' : event.status,
        },
      },
      {
        onSuccess: () => {
          setSaved(true)
          window.setTimeout(() => setSaved(false), 3000)
        },
      },
    )
  }

  return (
    <div className="grid gap-4">
      <div className="max-w-xs">
        <FirstTeeField
          event={event}
          hint="The rest of the sheet follows this time."
        />
      </div>
      <p className="text-base text-ink-soft">
        Foursomes off the first tee. Names can stay blank until
        the roster is set in Golf Genius — then download and email the course.
      </p>

      <div className="grid gap-3">
        {groups.map((group, groupIndex) => (
          <div
            key={`${group.teeTime}-${groupIndex}`}
            className="grid gap-3 rounded-md border border-border bg-muted/60 p-4"
          >
            <p className="text-sm font-semibold uppercase tracking-wider text-ink-soft">
              {group.teeTime} · Group {groupIndex + 1}
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {group.players.map((player, slot) => (
                <label key={slot} className="grid gap-1">
                  <span className="text-sm text-ink-soft">Player {slot + 1}</span>
                  <input
                    value={player}
                    onChange={(e) =>
                      setPlayer(groupIndex, slot, e.target.value)
                    }
                    placeholder="Name"
                    className="min-h-12 rounded-md border border-input bg-white px-3 text-base text-ink"
                  />
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={save} disabled={patch.isPending}>
          <Save className="size-5" aria-hidden />
          {patch.isPending ? 'Saving…' : 'Save tee sheet'}
        </Button>
        <Button
          variant="secondary"
          onClick={() => downloadTeeSheet({ ...event, teeGroups: groups })}
        >
          <FileDown className="size-5" aria-hidden />
          Download for the course
        </Button>
        {saved ? (
          <span className="text-base font-medium text-brand">Saved.</span>
        ) : null}
      </div>
    </div>
  )
}
