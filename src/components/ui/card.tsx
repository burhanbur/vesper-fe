import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type CardProps = Readonly<HTMLAttributes<HTMLDivElement>>

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-slate-200/80 bg-white/90 text-slate-900 shadow-sm backdrop-blur-md transition-all duration-200 hover:border-slate-300 dark:border-slate-800/80 dark:bg-slate-900/70 dark:text-slate-100 dark:shadow-xl dark:hover:border-slate-700/80',
        className,
      )}
      {...props}
    />
  )
}

export function CardHeader({ className, ...props }: CardProps) {
  return <div className={cn('space-y-1.5 p-6', className)} {...props} />
}

export function CardTitle({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        'text-lg font-semibold tracking-tight text-slate-900 dark:text-white',
        className,
      )}
      {...props}
    >
      {children}
    </h3>
  )
}

export function CardDescription({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn('text-sm text-slate-500 dark:text-slate-400', className)}
      {...props}
    />
  )
}

export function CardContent({ className, ...props }: CardProps) {
  return <div className={cn('p-6 pt-0', className)} {...props} />
}

export function CardFooter({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'mt-4 flex items-center border-t border-slate-200/80 p-6 pt-0 dark:border-slate-800/60',
        className,
      )}
      {...props}
    />
  )
}
