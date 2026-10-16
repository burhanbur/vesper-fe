import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { ThemeProvider } from './theme-provider'
import { useTheme } from './theme-context'
import { ThemeToggle } from '@/components/common/theme-toggle'

function TestComponent() {
    const { theme, resolvedTheme, setTheme } = useTheme()
    return (
        <div>
            <span data-testid="theme">{theme}</span>
            <span data-testid="resolved">{resolvedTheme}</span>
            <button onClick={() => setTheme('light')}>Set Light</button>
            <button onClick={() => setTheme('dark')}>Set Dark</button>
            <button onClick={() => setTheme('system')}>Set System</button>
        </div>
    )
}

describe('ThemeProvider & ThemeToggle', () => {
    let listeners: Array<(e: MediaQueryListEvent) => void> = []

    beforeEach(() => {
        listeners = []
        window.matchMedia = vi.fn().mockImplementation((query: string) => ({
            matches: false, // light by default in mock
            media: query,
            onchange: null,
            addListener: vi.fn(),
            removeListener: vi.fn(),
            addEventListener: vi.fn((_type: string, listener: unknown) => {
                listeners.push(listener as (e: MediaQueryListEvent) => void)
            }),
            removeEventListener: vi.fn((_type: string, listener: unknown) => {
                listeners = listeners.filter((l) => l !== listener)
            }),
            dispatchEvent: vi.fn(),
        }))
    })

    afterEach(() => {
        document.documentElement.classList.remove('dark', 'light')
        document.documentElement.style.colorScheme = ''
    })

    it('defaults to system theme and resolves to light when OS prefers light', () => {
        render(
            <ThemeProvider>
                <TestComponent />
            </ThemeProvider>,
        )

        expect(screen.getByTestId('theme').textContent).toBe('system')
        expect(screen.getByTestId('resolved').textContent).toBe('light')
        expect(document.documentElement.classList.contains('light')).toBe(true)
        expect(document.documentElement.classList.contains('dark')).toBe(false)
    })

    it('updates DOM classes and localStorage when switching themes', async () => {
        const user = userEvent.setup()
        render(
            <ThemeProvider>
                <TestComponent />
            </ThemeProvider>,
        )

        await user.click(screen.getByRole('button', { name: 'Set Dark' }))

        expect(screen.getByTestId('theme').textContent).toBe('dark')
        expect(screen.getByTestId('resolved').textContent).toBe('dark')
        expect(document.documentElement.classList.contains('dark')).toBe(true)
        expect(localStorage.getItem('vesper-theme')).toBe('dark')

        await user.click(screen.getByRole('button', { name: 'Set Light' }))

        expect(screen.getByTestId('theme').textContent).toBe('light')
        expect(screen.getByTestId('resolved').textContent).toBe('light')
        expect(document.documentElement.classList.contains('light')).toBe(true)
        expect(localStorage.getItem('vesper-theme')).toBe('light')
    })

    it('ThemeToggle toggles between light and dark', async () => {
        const user = userEvent.setup()
        render(
            <ThemeProvider defaultTheme="light">
                <ThemeToggle />
            </ThemeProvider>,
        )

        const toggleBtn = screen.getByRole('button', {
            name: /beralih ke mode gelap/i,
        })
        expect(toggleBtn).toBeInTheDocument()

        await user.click(toggleBtn)

        expect(document.documentElement.classList.contains('dark')).toBe(true)
        expect(localStorage.getItem('vesper-theme')).toBe('dark')

        const lightBtn = screen.getByRole('button', {
            name: /beralih ke mode terang/i,
        })
        expect(lightBtn).toBeInTheDocument()
    })
})
