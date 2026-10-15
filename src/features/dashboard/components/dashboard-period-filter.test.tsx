import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { DashboardPeriodFilter } from './dashboard-period-filter'
import { currentPeriodValue } from '../utils/dashboard-period'

describe('dashboard period filter', () => {
    it('switches both drafts to the current WIB period without publishing until apply', () => {
        const onChange = vi.fn()
        render(
            <DashboardPeriodFilter
                search={{ period: 'monthly', value: '2026-10' }}
                onChange={onChange}
            />,
        )
        fireEvent.click(screen.getByRole('button', { name: 'Harian' }))
        expect(screen.getByRole('button', { name: 'Harian' })).toHaveAttribute(
            'aria-pressed',
            'true',
        )
        expect(screen.getByLabelText('Tanggal dari')).toHaveAttribute(
            'aria-haspopup',
            'dialog',
        )
        expect(screen.getByLabelText('Tanggal sampai')).toHaveTextContent(
            screen.getByLabelText('Tanggal dari').textContent ?? '',
        )
        expect(onChange).not.toHaveBeenCalled()
        fireEvent.click(screen.getByRole('button', { name: 'Terapkan' }))
        expect(onChange).toHaveBeenCalledWith({
            period: 'daily',
            value: currentPeriodValue('daily'),
            end_value: currentPeriodValue('daily'),
        })
    })
    it('blocks reversed ranges with associated inline feedback', async () => {
        const user = userEvent.setup()
        const onChange = vi.fn()
        render(
            <DashboardPeriodFilter
                search={{ period: 'yearly', value: '2026' }}
                onChange={onChange}
            />,
        )
        await user.click(screen.getByLabelText('Tahun sampai'))
        await user.click(screen.getByRole('button', { name: '2025' }))
        expect(screen.getByLabelText('Tahun sampai')).toHaveAttribute(
            'aria-invalid',
            'true',
        )
        expect(screen.getByLabelText('Tahun sampai')).toHaveAccessibleDescription(
            'Periode sampai harus sama atau setelah periode dari.',
        )
        expect(screen.getByRole('alert')).toHaveTextContent('sama atau setelah')
        expect(screen.getByRole('button', { name: 'Terapkan' })).toBeDisabled()
        fireEvent.click(screen.getByRole('button', { name: 'Terapkan' }))
        expect(onChange).not.toHaveBeenCalled()
        await user.click(screen.getByLabelText('Tahun dari'))
        await user.click(screen.getByRole('button', { name: '2024' }))
        expect(screen.queryByRole('alert')).not.toBeInTheDocument()
        expect(onChange).not.toHaveBeenCalled()
        fireEvent.click(screen.getByRole('button', { name: 'Terapkan' }))
        expect(onChange).toHaveBeenCalledWith({
            period: 'yearly',
            value: '2024',
            end_value: '2025',
        })
    })
    it('applies a monthly range and restores both endpoints from URL navigation', async () => {
        const user = userEvent.setup()
        const onChange = vi.fn()
        const { rerender } = render(
            <DashboardPeriodFilter
                search={{ period: 'monthly', value: '2026-10' }}
                onChange={onChange}
            />,
        )
        expect(screen.getByLabelText('Bulan dari')).toHaveTextContent(
            'Oktober 2026',
        )
        await user.click(screen.getByLabelText('Bulan sampai'))
        await user.click(
            screen.getByRole('button', { name: 'Desember' }),
        )
        expect(onChange).not.toHaveBeenCalled()
        fireEvent.click(screen.getByRole('button', { name: 'Terapkan' }))
        expect(onChange).toHaveBeenCalledWith({
            period: 'monthly',
            value: '2026-10',
            end_value: '2026-12',
        })
        rerender(
            <DashboardPeriodFilter
                search={{
                    period: 'daily',
                    value: '2024-02-29',
                    end_value: '2024-03-02',
                }}
                onChange={onChange}
            />,
        )
        expect(screen.getByLabelText('Tanggal dari')).toHaveTextContent(
            '29 Februari 2024',
        )
        expect(screen.getByLabelText('Tanggal sampai')).toHaveTextContent(
            '2 Maret 2024',
        )
        expect(screen.getByLabelText('Tanggal dari')).toHaveAttribute(
            'type',
            'button',
        )
        rerender(
            <DashboardPeriodFilter
                search={{
                    period: 'daily',
                    value: '2024-02-29',
                    end_value: '2024-03-05',
                }}
                onChange={onChange}
            />,
        )
        expect(screen.getByLabelText('Tanggal dari')).toHaveTextContent(
            '29 Februari 2024',
        )
        expect(screen.getByLabelText('Tanggal sampai')).toHaveTextContent(
            '5 Maret 2024',
        )
        expect(onChange).toHaveBeenCalledTimes(1)
    })
})
