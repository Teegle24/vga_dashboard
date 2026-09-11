import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react'
import { useId } from 'react'
import { cn } from '@/lib/utils'

const CONTROL =
  'w-full min-h-14 rounded-md border border-input bg-white px-4 text-base text-ink ' +
  'placeholder:text-ink-soft/60 focus:border-brand'

export function Label({
  htmlFor,
  children,
  hint,
}: {
  htmlFor?: string
  children: ReactNode
  hint?: string
}) {
  return (
    <label htmlFor={htmlFor} className="block">
      <span className="block text-base font-medium text-ink">{children}</span>
      {hint ? (
        <span className="mt-0.5 block text-sm text-ink-soft">{hint}</span>
      ) : null}
    </label>
  )
}

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  hint?: string
}

export function TextField({ label, hint, className, ...props }: TextFieldProps) {
  const id = useId()
  return (
    <div className="grid gap-2">
      <Label htmlFor={id} hint={hint}>
        {label}
      </Label>
      <input id={id} className={cn(CONTROL, className)} {...props} />
    </div>
  )
}

interface TextAreaFieldProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  hint?: string
}

export function TextAreaField({
  label,
  hint,
  className,
  ...props
}: TextAreaFieldProps) {
  const id = useId()
  return (
    <div className="grid gap-2">
      <Label htmlFor={id} hint={hint}>
        {label}
      </Label>
      <textarea
        id={id}
        rows={3}
        className={cn(CONTROL, 'py-3 leading-relaxed', className)}
        {...props}
      />
    </div>
  )
}
