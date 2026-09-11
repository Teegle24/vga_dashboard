import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'secondary' | 'quiet' | 'danger'
type Size = 'md' | 'lg'

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-brand text-white hover:bg-brand-2 active:bg-brand-2',
  secondary:
    'bg-white text-ink border border-input hover:bg-muted active:bg-muted',
  quiet: 'bg-transparent text-brand hover:bg-brand-soft active:bg-brand-soft',
  danger: 'bg-white text-danger border border-input hover:bg-muted',
}

// 56px and 64px tall. The users are older directors, often on a phone.
const SIZES: Record<Size, string> = {
  md: 'min-h-14 px-5 text-base',
  lg: 'min-h-16 px-7 text-lg',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  children: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2.5 rounded-md font-medium transition-colors',
        'disabled:cursor-not-allowed disabled:opacity-50',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
