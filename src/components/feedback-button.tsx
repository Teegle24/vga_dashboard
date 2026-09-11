import { useState } from 'react'
import { MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TextAreaField } from '@/components/ui/field'
import { useSendFeedback } from '@/data/hooks'

/**
 * The whole point of this demo is Mark's feedback. Capturing it in place beats
 * trying to reconstruct it from a phone call later.
 */
export function FeedbackButton() {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)
  const send = useSendFeedback()

  if (sent) {
    return (
      <p className="text-base font-medium text-brand">
        Thanks — that came through.
      </p>
    )
  }

  if (!open) {
    return (
      <Button variant="secondary" onClick={() => setOpen(true)}>
        <MessageSquare className="size-5" aria-hidden />
        Suggest a change
      </Button>
    )
  }

  return (
    <div className="grid w-full max-w-xl gap-3">
      <TextAreaField
        label="What would make this easier?"
        hint="Anything at all — wording, layout, something missing."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        autoFocus
      />
      <div className="flex flex-wrap gap-3">
        <Button
          onClick={() =>
            send.mutate(
              { message: message.trim(), context: { path: location.pathname } },
              {
                onSuccess: () => {
                  setSent(true)
                  setMessage('')
                },
              },
            )
          }
          disabled={!message.trim() || send.isPending}
        >
          Send
        </Button>
        <Button variant="secondary" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </div>
  )
}
