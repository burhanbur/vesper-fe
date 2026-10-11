import { cva, type VariantProps } from 'class-variance-authority'
import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium tracking-wide transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30',
        success:
          'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
        destructive: 'bg-rose-500/15 text-rose-400 border border-rose-500/30',
        warning: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
        info: 'bg-sky-500/15 text-sky-400 border border-sky-500/30',
        secondary: 'bg-slate-800 text-slate-300 border border-slate-700',
        outline: 'border border-slate-700 text-slate-400',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}
