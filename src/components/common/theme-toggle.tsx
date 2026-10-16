import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/hooks/use-theme'
import { cn } from '@/lib/utils'

interface ThemeToggleProps {
  readonly className?: string
  readonly size?: 'sm' | 'default'
}

export function ThemeToggle({ className, size = 'default' }: ThemeToggleProps) {
  const { resolvedTheme, toggleTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        'relative flex cursor-pointer items-center justify-center rounded-xl border transition-all duration-200 select-none',
        size === 'sm' ? 'size-8' : 'size-9',
        'border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-100 hover:text-slate-900',
        'dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-400 dark:shadow-none dark:hover:border-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200',
        className,
      )}
      aria-label={
        isDark
          ? 'Beralih ke mode terang (Light)'
          : 'Beralih ke mode gelap (Dark)'
      }
      title={isDark ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
    >
      {isDark ? (
        <Sun className="size-4 text-amber-400 transition-transform duration-200" />
      ) : (
        <Moon className="size-4 text-indigo-600 transition-transform duration-200" />
      )}
    </button>
  )
}
