import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  readonly value?: number
  readonly max?: number
  readonly indicatorClassName?: string
}

export function Progress({
  className,
  value = 0,
  max = 100,
  indicatorClassName,
  ...props
}: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      className={cn(
        'relative h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800',
        className,
      )}
      {...props}
    >
      <div
        className={cn(
          'h-full w-full flex-1 rounded-full transition-all duration-300',
          percentage > 90
            ? 'bg-rose-500'
            : percentage > 75
              ? 'bg-amber-500'
              : 'bg-emerald-500',
          indicatorClassName,
        )}
        style={{ transform: `translateX(-${100 - percentage}%)` }}
      />
    </div>
  )
}
