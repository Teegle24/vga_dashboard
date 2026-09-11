import { useState } from 'react'
import { ArrowDown, ArrowUp, Check, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TextField } from '@/components/ui/field'
import {
  useAddWaitlistEntry,
  usePatchWaitlistEntry,
  usePromoteToField,
  useRemoveWaitlistEntry,
  useWaitlist,
} from '@/data/hooks'
import { formatPhone, telHref } from '@/lib/format'
import { cn } from '@/lib/utils'

const ACTION =
  'flex size-11 shrink-0 items-center justify-center rounded-md text-ink-soft hover:bg-white/70 disabled:opacity-30'

/**
 * Ranked standby list for filling last-minute no-shows. Reordering is explicit
 * up/down buttons rather than drag-and-drop, which is unreliable on a phone and
 * unforgiving for anyone with a shaky hand.
 */
export function WaitlistPanel({ eventId }: { eventId: string }) {
  const { data: entries = [], isLoading } = useWaitlist(eventId)
  const add = useAddWaitlistEntry()
  const patch = usePatchWaitlistEntry()
  const promote = usePromoteToField()
  const remove = useRemoveWaitlistEntry()

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')

  const waiting = entries.filter((e) => e.status === 'waiting')

  function submit() {
    if (!name.trim()) return
    add.mutate(
      { eventId, memberName: name.trim(), phone: phone.trim() || null },
      {
        onSuccess: () => {
          setName('')
          setPhone('')
        },
      },
    )
  }

  return (
    <div className="grid min-w-0 gap-4 rounded-lg border border-border bg-white/35 p-4">
      <h4 className="text-lg font-semibold text-ink">
        Standby list
        {waiting.length ? (
          <span className="ml-2 font-normal text-ink-soft">
            {waiting.length} waiting
          </span>
        ) : null}
      </h4>

      <div className="grid gap-3">
        <TextField
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Member name"
        />
        <TextField
          label="Phone"
          type="tel"
          inputMode="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Phone (optional)"
        />
        <Button
          variant="secondary"
          onClick={submit}
          disabled={!name.trim() || add.isPending}
        >
          <Plus className="size-5" aria-hidden />
          Add to standby
        </Button>
      </div>

      {isLoading ? (
        <p className="text-base text-ink-soft">Loading…</p>
      ) : entries.length === 0 ? (
        <p className="text-base text-ink-soft">
          Nobody on standby yet. Add the first person above.
        </p>
      ) : (
        <ol className="grid gap-2">
          {entries.map((entry, index) => (
            <li
              key={entry.id}
              className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-2 rounded-md bg-white/50 px-2.5 py-2"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-soft text-sm font-semibold text-brand">
                {entry.rank}
              </span>

              <span className="flex min-w-0 items-center gap-1">
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-base font-medium text-ink">
                    {entry.memberName}
                    {entry.status === 'filled' ? (
                      <span className="ml-2 text-sm font-normal text-brand">
                        got the spot
                      </span>
                    ) : null}
                    {entry.status === 'declined' ? (
                      <span className="ml-2 text-sm font-normal text-ink-soft">
                        passed
                      </span>
                    ) : null}
                  </span>
                  {entry.phone ? (
                    <a
                      href={telHref(entry.phone) ?? undefined}
                      className="block truncate text-sm text-brand underline-offset-2 hover:underline"
                    >
                      {formatPhone(entry.phone)}
                    </a>
                  ) : null}
                </span>

                <span className="flex shrink-0 items-center">
                  <button
                    type="button"
                    aria-label={`Move ${entry.memberName} up`}
                    disabled={index === 0}
                    onClick={() => patch.mutate({ id: entry.id, direction: 'up' })}
                    className={ACTION}
                  >
                    <ArrowUp className="size-5" aria-hidden />
                  </button>
                  <button
                    type="button"
                    aria-label={`Move ${entry.memberName} down`}
                    disabled={index === entries.length - 1}
                    onClick={() =>
                      patch.mutate({ id: entry.id, direction: 'down' })
                    }
                    className={ACTION}
                  >
                    <ArrowDown className="size-5" aria-hidden />
                  </button>
                  <button
                    type="button"
                    aria-label={`Give ${entry.memberName} a spot on the field`}
                    onClick={() => promote.mutate(entry.id)}
                    className={cn(ACTION, 'text-brand hover:bg-brand-soft')}
                  >
                    <Check className="size-5" aria-hidden />
                  </button>
                  <button
                    type="button"
                    aria-label={`Remove ${entry.memberName}`}
                    onClick={() => remove.mutate(entry.id)}
                    className={ACTION}
                  >
                    <Trash2 className="size-5" aria-hidden />
                  </button>
                </span>
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
