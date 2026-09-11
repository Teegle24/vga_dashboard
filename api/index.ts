import { handle } from 'hono/vercel'
import app from '@server/index'

/** Vercel serverless entry. All API logic lives in `server/`. */
export const config = { runtime: 'nodejs' }

export default handle(app)
