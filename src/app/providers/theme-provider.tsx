import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  ThemeContext,
  type Theme,
  type ResolvedTheme,
  type ThemeContextValue,
} from './theme-context'

export type { Theme, ResolvedTheme, ThemeContextValue }

export const THEME_STORAGE_KEY = 'vesper-theme'

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'system'
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY)
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      return stored
    }
  } catch {
    // localStorage unavailable or restricted
  }
  return 'system'
}

function resolveTheme(theme: Theme): ResolvedTheme {
  if (theme === 'system' && typeof window !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
  }
  return theme === 'light' ? 'light' : 'dark'
}

interface ThemeProviderProps {
  readonly children: ReactNode
  readonly defaultTheme?: Theme
  readonly storageKey?: string
}

export function ThemeProvider({
  children,
  defaultTheme,
  storageKey = THEME_STORAGE_KEY,
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    return defaultTheme ?? getInitialTheme()
  })

  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() =>
    resolveTheme(theme),
  )

  const applyTheme = useCallback((resolved: ResolvedTheme) => {
    if (typeof window === 'undefined') return
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(resolved)
    root.style.colorScheme = resolved
  }, [])

  const setTheme = useCallback(
    (newTheme: Theme) => {
      setThemeState(newTheme)
      try {
        window.localStorage.setItem(storageKey, newTheme)
      } catch {
        // ignore
      }
      const resolved = resolveTheme(newTheme)
      setResolvedTheme(resolved)
      applyTheme(resolved)
    },
    [applyTheme, storageKey],
  )

  const toggleTheme = useCallback(() => {
    const nextTheme: Theme = resolvedTheme === 'dark' ? 'light' : 'dark'
    setTheme(nextTheme)
  }, [resolvedTheme, setTheme])

  // Sync with system changes when theme is 'system'
  useEffect(() => {
    applyTheme(resolveTheme(theme))

    if (theme !== 'system') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      const nextResolved = mediaQuery.matches ? 'dark' : 'light'
      setResolvedTheme(nextResolved)
      applyTheme(nextResolved)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme, applyTheme])

  const contextValue = useMemo<ThemeContextValue>(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
      toggleTheme,
    }),
    [theme, resolvedTheme, setTheme, toggleTheme],
  )

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  )
}
