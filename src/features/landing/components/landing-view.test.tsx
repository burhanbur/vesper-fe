import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import { ThemeProvider } from '@/app/providers/theme-provider'
import { LandingView } from './landing-view'

vi.mock('@tanstack/react-router', () => ({
    Link: ({
        children,
        to,
        search,
        ...props
    }: {
        children?: ReactNode
        to?: string
        search?: Record<string, unknown>
    } & ComponentPropsWithoutRef<'a'>) => {
        const searchString = search ? `?demo=${String(search.demo)}` : ''
        return (
            <a href={`${to ?? '#'}${searchString}`} {...props}>
                {children}
            </a>
        )
    },
    useNavigate: () => vi.fn(),
}))

function renderLanding() {
    return render(
        <ThemeProvider>
            <LandingView />
        </ThemeProvider>,
    )
}

describe('LandingView', () => {
    beforeEach(() => {
        window.matchMedia = vi.fn().mockImplementation((query: string) => ({
            matches: false,
            media: query,
            onchange: null,
            addListener: vi.fn(),
            removeListener: vi.fn(),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn(),
        }))
    })

    it('renders brand heading and core value proposition', () => {
        renderLanding()

        expect(
            screen.getByRole('heading', {
                name: /satu platform untuk finansial harian/i,
            }),
        ).toBeInTheDocument()

        expect(
            screen.getAllByRole('heading', {
                name: /100% offline-first/i,
            }).length,
        ).toBeGreaterThanOrEqual(1)

        expect(
            screen.getByRole('heading', {
                name: /kerap ditanyakan/i,
            }),
        ).toBeInTheDocument()
    })

    it('renders interactive navigation anchors and CTA links', () => {
        renderLanding()

        expect(
            screen.getAllByRole('link', { name: /masuk/i }).length,
        ).toBeGreaterThan(0)
        expect(
            screen.getAllByRole('link', { name: /demo/i }).length,
        ).toBeGreaterThan(0)
    })
})
