import {
  createContext,
  useContext,
  type HTMLAttributes,
  type ReactNode,
} from 'react'
import { cn } from '@/lib/utils'

interface TabsContextValue {
  readonly value: string
  readonly onValueChange: (value: string) => void
}

const TabsContext = createContext<TabsContextValue | null>(null)

interface TabsProps extends HTMLAttributes<HTMLDivElement> {
  readonly value: string
  readonly onValueChange: (value: string) => void
  readonly children: ReactNode
}

export function Tabs({
  value,
  onValueChange,
  className,
  children,
  ...props
}: TabsProps) {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div className={cn('w-full', className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  )
}

export function TabsList({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 p-1 text-slate-600 dark:border-slate-700/60 dark:bg-slate-800/80 dark:text-slate-400',
        className,
      )}
      {...props}
    />
  )
}

interface TabsTriggerProps extends HTMLAttributes<HTMLButtonElement> {
  readonly value: string
  readonly disabled?: boolean
}

export function TabsTrigger({
  value,
  className,
  disabled,
  children,
  ...props
}: TabsTriggerProps) {
  const context = useContext(TabsContext)
  if (!context) throw new Error('TabsTrigger must be used within Tabs')

  const isActive = context.value === value

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      disabled={disabled}
      onClick={() => context.onValueChange(value)}
      className={cn(
        'inline-flex cursor-pointer items-center justify-center rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 sm:text-sm',
        isActive
          ? 'bg-indigo-600 font-semibold text-white shadow-xs'
          : 'text-slate-600 hover:bg-white hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-700/40 dark:hover:text-slate-100',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}

interface TabsContentProps extends HTMLAttributes<HTMLDivElement> {
  readonly value: string
}

export function TabsContent({
  value,
  className,
  children,
  ...props
}: TabsContentProps) {
  const context = useContext(TabsContext)
  if (!context) throw new Error('TabsContent must be used within Tabs')

  if (context.value !== value) return null

  return (
    <div
      role="tabpanel"
      className={cn('mt-4 focus-visible:outline-none', className)}
      {...props}
    >
      {children}
    </div>
  )
}
