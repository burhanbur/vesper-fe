import type { InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type InputProps = Readonly<InputHTMLAttributes<HTMLInputElement>>

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        'flex h-10 w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 shadow-sm transition-colors placeholder:text-slate-500 focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}
