import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { CategoryDto, CategoryType } from '../types/category'
import { CategoryGroups } from './category-groups'

function category(id: string, name: string, type: CategoryType): CategoryDto {
    return {
        id,
        name,
        type,
        user_id: 'user',
        version: '2',
        created_at: '',
        updated_at: '',
        deleted_at: null,
    }
}

describe('CategoryGroups', () => {
    it('groups by type, sorts alphabetically without mutating input and preserves delete selection', async () => {
        const categories = [
            category('1', 'Transportasi', 'EXPENSE'),
            category('2', 'Bonus', 'INCOME'),
            category('3', 'Admin', 'EXPENSE'),
            category('4', 'Gaji', 'INCOME'),
        ]
        const onDelete = vi.fn()
        render(<CategoryGroups categories={categories} onDelete={onDelete} />)
        const income = screen.getByRole('region', { name: 'Pemasukan' })
        const expense = screen.getByRole('region', { name: 'Pengeluaran' })
        expect(
            within(income)
                .getAllByRole('button')
                .map((button) => button.getAttribute('aria-label')),
        ).toEqual([
            'Hapus kategori pemasukan Bonus',
            'Hapus kategori pemasukan Gaji',
        ])
        expect(
            within(expense)
                .getAllByRole('button')
                .map((button) => button.getAttribute('aria-label')),
        ).toEqual([
            'Hapus kategori pengeluaran Admin',
            'Hapus kategori pengeluaran Transportasi',
        ])
        expect(within(income).getByText('2 kategori')).toBeInTheDocument()
        expect(categories.map((item) => item.id)).toEqual(['1', '2', '3', '4'])
        await userEvent.click(
            within(expense).getByRole('button', {
                name: 'Hapus kategori pengeluaran Admin',
            }),
        )
        expect(onDelete).toHaveBeenCalledWith('3', '2')
    })

    it('shows an empty state in each group', () => {
        render(<CategoryGroups categories={[]} onDelete={vi.fn()} />)
        expect(
            screen.getByText('Belum ada kategori pemasukan.'),
        ).toBeInTheDocument()
        expect(
            screen.getByText('Belum ada kategori pengeluaran.'),
        ).toBeInTheDocument()
    })
})
