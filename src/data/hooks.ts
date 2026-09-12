import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Flight } from '@/lib/flights'
import type {
  ContactInput,
  DashboardData,
  EventRecord,
  FeedbackInput,
  Member,
  NewEventInput,
  NewMemberInput,
  WaitlistEntry,
  WaitlistStatus,
} from '@/types'
import * as store from '@/data/store'

const DASHBOARD_KEY = ['dashboard']
const WAITLIST_KEY = ['waitlist']
const PLAYERS_KEY = ['players']
const MEMBERS_KEY = ['members']

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

export function usePlayers(eventId: string | null) {
  return useQuery({
    queryKey: [...PLAYERS_KEY, eventId],
    enabled: Boolean(eventId),
    queryFn: () => store.listPlayers(eventId!),
  })
}

function useRosterMutation<TInput>(fn: (input: TInput) => unknown) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: async (input: TInput) => fn(input),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: PLAYERS_KEY })
      client.invalidateQueries({ queryKey: WAITLIST_KEY })
      client.invalidateQueries({ queryKey: MEMBERS_KEY })
      client.invalidateQueries({ queryKey: DASHBOARD_KEY })
    },
  })
}

export function useAddPlayer() {
  return useRosterMutation<{
    eventId: string
    memberName: string
    phone: string | null
    flight?: Flight | null
  }>(({ eventId, memberName, phone, flight }) =>
    store.addPlayer(eventId, memberName, phone, flight),
  )
}

export function useRemovePlayer() {
  return useRosterMutation<string>((id) => store.removePlayer(id))
}

export function useMovePlayerToStandby() {
  return useRosterMutation<string>((id) => store.movePlayerToStandby(id))
}

export function usePromoteToField() {
  return useRosterMutation<string>((id) => store.promoteToField(id))
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
      client.invalidateQueries({ queryKey: MEMBERS_KEY })
      client.invalidateQueries({ queryKey: DASHBOARD_KEY })
    },
  })
}

export function useAddWaitlistEntry() {
  return useWaitlistMutation<{
    eventId: string
    memberName: string
    phone: string | null
    flight?: Flight | null
  }>(({ eventId, memberName, phone, flight }) =>
    store.addWaitlistEntry(eventId, memberName, phone, flight),
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

export function useMembers() {
  return useQuery({
    queryKey: MEMBERS_KEY,
    queryFn: async () => store.listMembers(),
  })
}

export function useAllPlayers() {
  return useQuery({
    queryKey: [...PLAYERS_KEY, 'all'],
    queryFn: async () => store.listAllPlayers(),
  })
}

export function useAllWaitlist() {
  return useQuery({
    queryKey: [...WAITLIST_KEY, 'all'],
    queryFn: async () => store.listAllWaitlist(),
  })
}

export function useAddMember() {
  return useDashboardMutation<NewMemberInput>((input) => store.addMember(input))
}

export function usePatchMember() {
  return useDashboardMutation<{
    id: string
    patch: Partial<Pick<Member, 'flight' | 'phone' | 'city'>>
  }>(({ id, patch }) => store.patchMember(id, patch))
}

export function useSendFeedback() {
  return useMutation({
    mutationFn: async (input: FeedbackInput) => store.sendFeedback(input),
  })
}
