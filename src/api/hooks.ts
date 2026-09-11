import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type {
  ContactInput,
  DashboardData,
  EventRecord,
  FeedbackInput,
  NewEventInput,
  WaitlistEntry,
  WaitlistStatus,
} from '@shared/types'
import { apiRequest } from '@/api/client'
import { useSession } from '@/auth/session'

const DASHBOARD_KEY = ['dashboard']

function useAuthedRequest() {
  const { getToken } = useSession()
  return async function request<T>(
    path: string,
    options: { method?: string; body?: unknown } = {},
  ) {
    const token = await getToken()
    return apiRequest<T>(path, { ...options, token })
  }
}

export function useDashboard() {
  const request = useAuthedRequest()
  return useQuery({
    queryKey: DASHBOARD_KEY,
    queryFn: () => request<DashboardData>('/dashboard'),
  })
}

/** Every mutation returns fresh dashboard data, so we just seed the cache. */
function useDashboardMutation<TInput>(
  fn: (
    request: ReturnType<typeof useAuthedRequest>,
    input: TInput,
  ) => Promise<DashboardData>,
) {
  const request = useAuthedRequest()
  const client = useQueryClient()
  return useMutation({
    mutationFn: (input: TInput) => fn(request, input),
    onSuccess: (data) => client.setQueryData(DASHBOARD_KEY, data),
  })
}

export function useSaveContact() {
  return useDashboardMutation<{ courseId: string; input: ContactInput }>(
    (request, { courseId, input }) =>
      request<DashboardData>(`/courses/${courseId}/contact`, {
        method: 'PUT',
        body: input,
      }),
  )
}

export function useLogEvent() {
  return useDashboardMutation<NewEventInput>((request, input) =>
    request<DashboardData>('/events', { method: 'POST', body: input }),
  )
}

export function usePatchEvent() {
  return useDashboardMutation<{ id: string; patch: Partial<EventRecord> }>(
    (request, { id, patch }) =>
      request<DashboardData>(`/events/${id}`, { method: 'PATCH', body: patch }),
  )
}

export function useDeleteEvent() {
  return useDashboardMutation<string>((request, id) =>
    request<DashboardData>(`/events/${id}`, { method: 'DELETE' }),
  )
}

export function useRestoreEvent() {
  return useDashboardMutation<EventRecord>((request, event) =>
    request<DashboardData>(`/events/${event.id}/restore`, {
      method: 'POST',
      body: event,
    }),
  )
}

export function useWaitlist(eventId: string | null) {
  const request = useAuthedRequest()
  return useQuery({
    queryKey: ['waitlist', eventId],
    enabled: Boolean(eventId),
    queryFn: () => request<WaitlistEntry[]>(`/events/${eventId}/waitlist`),
  })
}

function useWaitlistMutation<TInput>(
  fn: (
    request: ReturnType<typeof useAuthedRequest>,
    input: TInput,
  ) => Promise<WaitlistEntry[]>,
) {
  const request = useAuthedRequest()
  const client = useQueryClient()
  return useMutation({
    mutationFn: (input: TInput) => fn(request, input),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['waitlist'] })
      client.invalidateQueries({ queryKey: DASHBOARD_KEY })
    },
  })
}

export function useAddWaitlistEntry() {
  return useWaitlistMutation<{
    eventId: string
    memberName: string
    phone: string | null
  }>((request, { eventId, ...body }) =>
    request<WaitlistEntry[]>(`/events/${eventId}/waitlist`, {
      method: 'POST',
      body,
    }),
  )
}

export function usePatchWaitlistEntry() {
  return useWaitlistMutation<{
    id: string
    status?: WaitlistStatus
    direction?: 'up' | 'down'
  }>((request, { id, ...body }) =>
    request<WaitlistEntry[]>(`/waitlist/${id}`, { method: 'PATCH', body }),
  )
}

export function useRemoveWaitlistEntry() {
  return useWaitlistMutation<string>((request, id) =>
    request<WaitlistEntry[]>(`/waitlist/${id}`, { method: 'DELETE' }),
  )
}

export function useSendFeedback() {
  const request = useAuthedRequest()
  return useMutation({
    mutationFn: (input: FeedbackInput) =>
      request<{ ok: boolean }>('/feedback', { method: 'POST', body: input }),
  })
}
