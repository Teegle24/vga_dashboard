import { useState } from 'react'
import { Plus, Trash2, UserMinus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TextField } from '@/components/ui/field'
import {
  useAddPlayer,
  useMovePlayerToStandby,
  usePlayers,
  useRemovePlayer,
} from '@/data/hooks'
import { formatPhone, telHref } from '@/lib/format'

export function FieldPanel({
  eventId,
  spotsHeld,
}: {
  eventId: string
  spotsHeld: number | null
}) {
  const { data: players = [], isLoading } = usePlayers(eventId)
  const add = useAddPlayer()
  const remove = useRemovePlayer()
  const toStandby = useMovePlayerToStandby()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')

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

  const over = spotsHeld != null && players.length > spotsHeld

  return (
    <div className="grid gap-4 rounded-lg border border-border bg-canvas p-4">
      <h4 className="text-lg font-semibold text-ink">
        Current field
        <span className="ml-2 font-normal text-ink-soft">
          {players.length}
          {spotsHeld != null ? ` of ${spotsHeld} held` : ''}
        </span>
      </h4>

      {over ? (
        <p className="text-base text-ink">
          You have more names than tee times held. Call the course or move
          someone to standby.
        </p>
      ) : null}

      {isLoading ? (
        <p className="text-base text-ink-soft">Loading…</p>
      ) : players.length === 0 ? (
        <p className="text-base text-ink-soft">
          Nobody on the field yet. Add the first player below.
        </p>
      ) : (
        <ol className="grid gap-2">
          {players.map((player, index) => (
            <li
              key={player.id}
              className="flex flex-wrap items-center gap-3 rounded-md bg-card px-3 py-3"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-soft text-base font-semibold text-brand">
                {index + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-lg font-medium text-ink">
                  {player.memberName}
                </span>
                {player.phone ? (
                  <a
                    href={telHref(player.phone) ?? undefined}
                    className="block text-base text-brand underline-offset-2 hover:underline"
                  >
                    {formatPhone(player.phone)}
                  </a>
                ) : null}
              </span>
              <span className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  aria-label={`Move ${player.memberName} to standby`}
                  onClick={() => toStandby.mutate(player.id)}
                  className="flex size-12 items-center justify-center rounded-md text-ink-soft hover:bg-muted"
                >
                  <UserMinus className="size-5" aria-hidden />
                </button>
                <button
                  type="button"
                  aria-label={`Remove ${player.memberName}`}
                  onClick={() => remove.mutate(player.id)}
                  className="flex size-12 items-center justify-center rounded-md text-ink-soft hover:bg-muted"
                >
                  <Trash2 className="size-5" aria-hidden />
                </button>
              </span>
            </li>
          ))}
        </ol>
      )}

      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <TextField
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Member name"
        />
        <TextField
          label="Phone"
          hint="Optional"
          type="tel"
          inputMode="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="208-555-0100"
        />
        <Button
          variant="secondary"
          onClick={submit}
          disabled={!name.trim() || add.isPending}
        >
          <Plus className="size-5" aria-hidden />
          Add to field
        </Button>
      </div>
    </div>
  )
}
