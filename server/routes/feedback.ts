import { Hono } from 'hono'
import type { FeedbackInput } from '@shared/types'
import { requireDirector, type Actor } from '@server/middleware/clerk'
import { supabase } from '@server/lib/supabase'

export const feedbackRoutes = new Hono<{ Variables: { actor: Actor } }>()

feedbackRoutes.post('/feedback', requireDirector, async (c) => {
  const actor = c.get('actor')
  const input = await c.req.json<FeedbackInput>()

  const { error } = await supabase().from('feedback').insert({
    actor_email: actor.email,
    message: input.message,
    context: input.context ?? {},
  })

  if (error) return c.json({ message: error.message }, 500)
  return c.json({ ok: true })
})
