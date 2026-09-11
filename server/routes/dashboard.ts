import { Hono } from 'hono'
import { requireDirector } from '@server/middleware/clerk'
import { loadDashboard } from '@server/lib/dashboard'

export const dashboardRoutes = new Hono()

dashboardRoutes.get('/dashboard', requireDirector, async (c) => {
  try {
    return c.json(await loadDashboard())
  } catch (error) {
    return c.json({ message: (error as Error).message }, 500)
  }
})
