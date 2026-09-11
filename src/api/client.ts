import { mockRequest } from '@/api/mock/handler'
import { isMockMode } from '@/lib/config'

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

function baseUrl() {
  const base = import.meta.env.VITE_API_BASE_URL?.trim().replace(/\/$/, '')
  if (!base) throw new ApiError('VITE_API_BASE_URL is not set', 0)
  return base
}

function readErrorMessage(body: unknown, fallback: string) {
  if (typeof body === 'string' && body.trim()) return body
  if (body && typeof body === 'object' && 'message' in body) {
    const message = (body as { message: unknown }).message
    if (typeof message === 'string' && message.trim()) return message
  }
  return fallback
}

interface RequestOptions {
  method?: string
  body?: unknown
  token?: string | null
}

export async function apiRequest<T>(
  path: string,
  { method = 'GET', body, token }: RequestOptions = {},
): Promise<T> {
  if (isMockMode()) return mockRequest<T>(method, path, body)

  const response = await fetch(`${baseUrl()}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  const text = await response.text()
  const parsed = text ? safeJson(text) : null

  if (!response.ok) {
    throw new ApiError(
      readErrorMessage(parsed, `Request failed (${response.status})`),
      response.status,
    )
  }

  return parsed as T
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}
