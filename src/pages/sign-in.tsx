import { SignIn } from '@clerk/clerk-react'

export function SignInPage() {
  return (
    <div className="grid min-h-dvh place-items-center bg-canvas px-5 py-12">
      <div className="grid w-full max-w-md justify-items-center gap-6">
        <img
          src="/teegle-golf-logo.png"
          alt="Teegle Golf"
          className="h-20 w-auto object-contain"
        />

        <div className="grid justify-items-center gap-3 text-center">
          <img
            src="/vga-seal.png"
            alt="Veteran Golfers Association"
            className="size-16 object-contain"
          />
          <p className="text-lg text-ink-soft">
            Veteran Golfers Association — Idaho
          </p>
        </div>

        <SignIn
          routing="path"
          path="/sign-in"
          appearance={{
            variables: {
              colorPrimary: '#2b5910',
              fontSize: '16px',
              borderRadius: '0.5rem',
            },
          }}
        />
      </div>
    </div>
  )
}
