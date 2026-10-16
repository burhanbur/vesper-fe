import { X } from 'lucide-react'
import { useEffect, useRef, type HTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface DialogProps {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly children: ReactNode
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && open) {
        onOpenChange(false)
      }
    }
    if (open) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, onOpenChange])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="animate-in fade-in fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
        onClick={() => onOpenChange(false)}
        aria-hidden="true"
      />
      {/* Content Container */}
      <div
        ref={dialogRef}
        className="animate-in zoom-in-95 relative z-50 w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 text-slate-900 shadow-2xl transition-all duration-150 dark:border-slate-700/60 dark:bg-slate-900 dark:text-slate-100"
      >
        {children}
      </div>
    </div>
  )
}

interface DialogHeaderProps extends HTMLAttributes<HTMLDivElement> {
  readonly onClose?: () => void
}

export function DialogHeader({
  className,
  children,
  onClose,
  ...props
}: DialogHeaderProps) {
  return (
    <div
      className={cn(
        'flex items-start justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800',
        className,
      )}
      {...props}
    >
      <div className="space-y-1">{children}</div>
      {onClose ? (
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-100"
          aria-label="Close dialog"
        >
          <X className="size-4" />
        </button>
      ) : null}
    </div>
  )
}

export function DialogTitle({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn(
        'text-lg font-semibold tracking-tight text-slate-900 dark:text-white',
        className,
      )}
      {...props}
    >
      {children}
    </h2>
  )
}

export function DialogDescription({
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

export function DialogFooter({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex flex-col-reverse gap-2 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end dark:border-slate-800',
        className,
      )}
      {...props}
    />
  )
}
