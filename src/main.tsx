import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import { QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import App from '@/App'
import { SessionProvider } from '@/auth/session'
import { ConfigError } from '@/components/config-error'
import { isConfigReady, isMockMode } from '@/lib/config'
import { queryClient } from '@/lib/query-client'
import './index.css'

const root = document.getElementById('root')
if (!root) throw new Error('Root element not found')

function AppTree() {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </SessionProvider>
    </QueryClientProvider>
  )
}

createRoot(root).render(
  <StrictMode>
    {isMockMode() ? (
      <AppTree />
    ) : isConfigReady() ? (
      <ClerkProvider
        publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY!}
        afterSignOutUrl="/sign-in"
      >
        <AppTree />
      </ClerkProvider>
    ) : (
      <ConfigError />
    )}
  </StrictMode>,
)
