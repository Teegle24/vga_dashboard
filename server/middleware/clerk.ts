import { verifyToken } from '@clerk/backend'
import { createMiddleware } from 'hono/factory'

export interface Actor {
  userId: string
  email: string
}

/**
 * Verifies the Clerk session token and enforces the email allowlist. The demo
 * is limited to Mark plus the Teegle team, so an allowlist is enough and we
 * skip a role model entirely.
 */
export const requireDirector = createMiddleware<{
  Variables: { actor: Actor }
}>(async (c, next) => {
  const header = c.req.header('Authorization') ?? ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return c.json({ message: 'Sign in to continue' }, 401)

  const secretKey = process.env.CLERK_SECRET_KEY
  if (!secretKey) return c.json({ message: 'Server is not configured' }, 500)

  try {
    const claims = await verifyToken(token, { secretKey })
    const email =
      typeof claims.email === 'string'
        ? claims.email
        : ((claims as { primary_email_address?: string })
            .primary_email_address ?? '')

    const allowed = (process.env.ALLOWED_EMAILS ?? '')
      .split(',')
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean)

    if (allowed.length > 0 && !allowed.includes(email.toLowerCase())) {
      return c.json({ message: 'This account does not have access yet' }, 403)
    }

    c.set('actor', { userId: claims.sub, email })
    await next()
  } catch {
    return c.json({ message: 'Your session expired — sign in again' }, 401)
  }
})

/** Guards the cron routes. Vercel Cron sends this header automatically. */
export const requireCronSecret = createMiddleware(async (c, next) => {
  const expected = process.env.CRON_SECRET
  const provided =
    c.req.header('Authorization')?.replace('Bearer ', '') ??
    c.req.header('x-cron-secret')

  if (!expected || provided !== expected) {
    return c.json({ message: 'Not authorized' }, 401)
  }
  await next()
})
