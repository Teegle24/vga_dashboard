import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { contactRoutes } from '@server/routes/contacts'
import { cronRoutes } from '@server/routes/cron'
import { dashboardRoutes } from '@server/routes/dashboard'
import { eventRoutes } from '@server/routes/events'
import { feedbackRoutes } from '@server/routes/feedback'
import { twilioRoutes } from '@server/routes/twilio'
import { waitlistRoutes } from '@server/routes/waitlist'

export const app = new Hono().basePath('/api')

app.use('*', cors({ origin: '*', allowHeaders: ['Authorization', 'Content-Type'] }))

app.get('/health', (c) => c.json({ ok: true }))

app.route('/', dashboardRoutes)
app.route('/', contactRoutes)
app.route('/', eventRoutes)
app.route('/', waitlistRoutes)
app.route('/', feedbackRoutes)
app.route('/', cronRoutes)
app.route('/', twilioRoutes)

export default app
