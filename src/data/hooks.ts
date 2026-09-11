import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type {
  ContactInput,
  DashboardData,
  EventRecord,
  FeedbackInput,
  NewEventInput,
  WaitlistEntry,
  WaitlistStatus,
} from '@/types'
import * as store from '@/data/store'

const DASHBOARD_KEY = ['dashboard']
const WAITLIST_KEY = ['waitlist']

export function useDashboard() {
  return useQuery({
    queryKey: DASHBOARD_KEY,
    queryFn: () => store.getDashboard(),
  })
}

/** Every write returns fresh dashboard data, so we just seed the cache. */
function useDashboardMutation<TInput>(fn: (input: TInput) => DashboardData) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: async (input: TInput) => fn(input),
    onSuccess: (data) => client.setQueryData(DASHBOARD_KEY, data),
  })
}

export function useSaveContact() {
  return useDashboardMutation<{ courseId: string; input: ContactInput }>(
    ({ courseId, input }) => store.saveContact(courseId, input),
  )
}

export function useLogEvent() {
  return useDashboardMutation<NewEventInput>((input) => store.logEvent(input))
}

export function usePatchEvent() {
  return useDashboardMutation<{ id: string; patch: Partial<EventRecord> }>(
    ({ id, patch }) => store.patchEvent(id, patch),
  )
}

export function useDeleteEvent() {
  return useDashboardMutation<string>((id) => store.deleteEvent(id))
}

export function useRestoreEvent() {
  return useDashboardMutation<EventRecord>((event) => store.restoreEvent(event))
}

export function useWaitlist(eventId: string | null) {
  return useQuery({
    queryKey: [...WAITLIST_KEY, eventId],
    enabled: Boolean(eventId),
    queryFn: () => store.listWaitlist(eventId!),
  })
}

function useWaitlistMutation<TInput>(fn: (input: TInput) => WaitlistEntry[]) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: async (input: TInput) => fn(input),
    onSuccess: () => {
      // Waitlist size shows on the event card, so the dashboard refreshes too.
      client.invalidateQueries({ queryKey: WAITLIST_KEY })
      client.invalidateQueries({ queryKey: DASHBOARD_KEY })
    },
  })
}

export function useAddWaitlistEntry() {
  return useWaitlistMutation<{
    eventId: string
    memberName: string
    phone: string | null
  }>(({ eventId, memberName, phone }) =>
    store.addWaitlistEntry(eventId, memberName, phone),
  )
}

export function usePatchWaitlistEntry() {
  return useWaitlistMutation<{
    id: string
    status?: WaitlistStatus
    direction?: 'up' | 'down'
  }>(({ id, ...patch }) => store.patchWaitlistEntry(id, patch))
}

export function useRemoveWaitlistEntry() {
  return useWaitlistMutation<string>((id) => store.removeWaitlistEntry(id))
}

export function useSendFeedback() {
  return useMutation({
    mutationFn: async (input: FeedbackInput) => store.sendFeedback(input),
  })
}
