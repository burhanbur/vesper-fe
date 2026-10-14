import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { DashboardPeriodPicker } from './dashboard-period-picker'

function setup(period: 'daily' | 'monthly' | 'yearly', value: string) {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(
        <DashboardPeriodPicker
            id="picker"
            label="Periode dari"
            period={period}
            value={value}
            onChange={onChange}
        />,
    )
    return { user, onChange }
}

describe('dashboard period picker', () => {
    it('selects a real leap day and restores focus after closing', async () => {
        const { user, onChange } = setup('daily', '2024-02-01')
        const trigger = screen.getByRole('button', { name: /Periode dari/ })
        await user.click(trigger)
        expect(screen.getByRole('dialog')).toHaveAccessibleName(
            'Pilih periode dari',
        )
        expect(
            screen.queryByRole('button', { name: '30 Februari 2024' }),
        ).not.toBeInTheDocument()
        await user.click(screen.getByRole('button', { name: '29 Februari 2024' }))
        expect(onChange).toHaveBeenCalledWith('2024-02-29')
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
        expect(trigger).toHaveFocus()
    })

    it('jumps from daily year to month grid and excludes non-leap February 29', async () => {
        const { user, onChange } = setup('daily', '2024-02-29')
        await user.click(screen.getByRole('button', { name: /Periode dari/ }))
        await user.click(screen.getByRole('button', { name: '2024' }))
        await user.click(screen.getByRole('button', { name: '2025' }))
        await user.click(
            screen.getByRole('button', { name: 'Februari' }),
        )
        expect(
            screen.queryByRole('button', { name: '29 Februari 2025' }),
        ).not.toBeInTheDocument()
        await user.click(screen.getByRole('button', { name: 'Periode berikutnya' }))
        await user.click(screen.getByRole('button', { name: '1 Maret 2025' }))
        expect(onChange).toHaveBeenCalledWith('2025-03-01')
    })

    it('selects months after year navigation', async () => {
        const { user, onChange } = setup('monthly', '2026-10')
        await user.click(screen.getByRole('button', { name: /Periode dari/ }))
        expect(
            screen.getByRole('button', { name: 'Oktober' }),
        ).toHaveAttribute('aria-pressed', 'true')
        await user.click(screen.getByRole('button', { name: 'Periode sebelumnya' }))
        await user.click(
            screen.getByRole('button', { name: 'Desember' }),
        )
        expect(onChange).toHaveBeenCalledWith('2025-12')
    })

    it('pages twelve years and selects a year', async () => {
        const { user, onChange } = setup('yearly', '2026')
        await user.click(screen.getByRole('button', { name: /Periode dari/ }))
        expect(
            screen.getByRole('button', { name: '2026' }),
        ).toHaveAttribute('aria-pressed', 'true')
        await user.click(screen.getByRole('button', { name: 'Periode berikutnya' }))
        await user.click(screen.getByRole('button', { name: '2030' }))
        expect(onChange).toHaveBeenCalledWith('2030')
    })

    it.each([
        ['daily', '1000-01-01', 'Periode sebelumnya'],
        ['daily', '9998-12-31', 'Periode berikutnya'],
        ['monthly', '1000-01', 'Periode sebelumnya'],
        ['monthly', '9998-12', 'Periode berikutnya'],
        ['yearly', '1000', 'Periode sebelumnya'],
        ['yearly', '9998', 'Periode berikutnya'],
    ] as const)(
        'clamps %s navigation at %s',
        async (period, value, direction) => {
            const { user } = setup(period, value)
            await user.click(screen.getByRole('button', { name: /Periode dari/ }))
            expect(screen.getByRole('button', { name: direction })).toBeDisabled()
        },
    )

    it('traps tab focus and dismisses with Escape without changing the draft', async () => {
        const { user, onChange } = setup('daily', '2026-10-13')
        const trigger = screen.getByRole('button', { name: /Periode dari/ })
        await user.click(trigger)
        await user.tab({ shift: true })
        expect(
            screen.getByRole('button', { name: '31 Oktober 2026' }),
        ).toHaveFocus()
        await user.tab()
        expect(
            within(screen.getByRole('dialog')).getByRole('button', {
                name: 'Close dialog',
            }),
        ).toHaveFocus()
        await user.keyboard('{Escape}')
        expect(trigger).toHaveFocus()
        expect(onChange).not.toHaveBeenCalled()
    })
})
