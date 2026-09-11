import { Hono } from 'hono'
import { supabase } from '@server/lib/supabase'

export const twilioRoutes = new Hono()

/**
 * Phase 3 placeholder. SMS is not live yet: it waits on Twilio credentials and
 * on confirming that Teegle's existing 10DLC campaign use-case covers
 * event-registration reminders (carrier paperwork, not code).
 *
 * Opt-outs are recorded as new rows rather than updates — consent history has
 * to stay append-only to be defensible.
 */
/** Twilio expects TwiML; an empty Response means "no reply from us". */
const EMPTY_TWIML = '<?xml version="1.0" encoding="UTF-8"?><Response></Response>'

const XML_HEADERS = { 'Content-Type': 'text/xml' } as const

twilioRoutes.post('/webhooks/twilio', async (c) => {
  const body = await c.req.parseBody()
  const from = typeof body.From === 'string' ? body.From : null
  const text = typeof body.Body === 'string' ? body.Body.trim().toUpperCase() : ''

  if (!from) return c.text(EMPTY_TWIML, 200, XML_HEADERS)

  const isOptOut = [
    'STOP',
    'STOPALL',
    'UNSUBSCRIBE',
    'CANCEL',
    'END',
    'QUIT',
  ].includes(text)

  if (isOptOut) {
    await supabase().from('sms_consents').insert({
      participant_phone: from,
      opted_in: false,
      opted_out_at: new Date().toISOString(),
      consent_source: 'sms_reply',
      consent_version: 'v1',
    })
  }

  return c.text(EMPTY_TWIML, 200, XML_HEADERS)
})
