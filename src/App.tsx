import { Navigate, Route, Routes } from 'react-router-dom'
import { SignedIn, SignedOut } from '@clerk/clerk-react'
import { Dashboard } from '@/pages/dashboard'
import { SignInPage } from '@/pages/sign-in'
import { isMockMode } from '@/lib/config'

function Protected() {
  if (isMockMode()) return <Dashboard />
  return (
    <>
      <SignedIn>
        <Dashboard />
      </SignedIn>
      <SignedOut>
        <Navigate to="/sign-in" replace />
      </SignedOut>
    </>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Protected />} />
      {!isMockMode() ? (
        <Route path="/sign-in/*" element={<SignInPage />} />
      ) : null}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
