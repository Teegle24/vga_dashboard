import { createContext, useContext, type ReactNode } from 'react'
import { useAuth, useUser } from '@clerk/clerk-react'
import { isMockMode } from '@/lib/config'

interface SessionValue {
  isLoaded: boolean
  isSignedIn: boolean
  displayName: string
  getToken: () => Promise<string | null>
}

const SessionContext = createContext<SessionValue | null>(null)

/** Mock mode skips Clerk entirely so the app runs with no keys configured. */
function MockSession({ children }: { children: ReactNode }) {
  return (
    <SessionContext.Provider
      value={{
        isLoaded: true,
        isSignedIn: true,
        displayName: 'Mark Brinkman',
        getToken: async () => null,
      }}
    >
      {children}
    </SessionContext.Provider>
  )
}

function ClerkSession({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn, getToken } = useAuth()
  const { user } = useUser()

  return (
    <SessionContext.Provider
      value={{
        isLoaded,
        isSignedIn: Boolean(isSignedIn),
        displayName:
          user?.fullName ??
          user?.primaryEmailAddress?.emailAddress ??
          'Director',
        getToken: () => getToken(),
      }}
    >
      {children}
    </SessionContext.Provider>
  )
}

export function SessionProvider({ children }: { children: ReactNode }) {
  return isMockMode() ? (
    <MockSession>{children}</MockSession>
  ) : (
    <ClerkSession>{children}</ClerkSession>
  )
}

export function useSession() {
  const value = useContext(SessionContext)
  if (!value) throw new Error('useSession must be used inside SessionProvider')
  return value
}
