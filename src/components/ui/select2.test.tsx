import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Select2, type Select2Option } from './select2'

const sampleOptions: Select2Option[] = [
  { value: 'NEW', label: 'Buat Akun Baru Otomatis', badge: 'Baru' },
  { value: 'acc-1', label: 'BCA Main', badge: 'Rekening Bank' },
  { value: 'acc-2', label: 'Jago - Kantong Belanja', badge: 'Rekening Bank' },
  { value: 'acc-3', label: 'Bareksa - BBCA', badge: 'Saham' },
]

describe('Select2 Component', () => {
  it('renders trigger with selected value and badge', () => {
    render(
      <Select2
        value="acc-1"
        onChange={vi.fn()}
        options={sampleOptions}
        placeholder="Pilih rekening..."
      />,
    )

    expect(
      screen.getByRole('button', { name: /BCA Main/i }),
    ).toBeInTheDocument()
    expect(screen.getByText('Rekening Bank')).toBeInTheDocument()
  })

  it('renders placeholder when no matching value is selected', () => {
    render(
      <Select2
        value=""
        onChange={vi.fn()}
        options={sampleOptions}
        placeholder="Pilih rekening..."
      />,
    )

    expect(
      screen.getByRole('button', { name: /Pilih rekening\.\.\./i }),
    ).toBeInTheDocument()
  })

  it('opens popup on click and filters options based on search query', async () => {
    const user = userEvent.setup()
    render(
      <Select2
        value="NEW"
        onChange={vi.fn()}
        options={sampleOptions}
        searchPlaceholder="Cari rekening..."
      />,
    )

    const trigger = screen.getByRole('button')
    await user.click(trigger)

    const searchInput = screen.getByPlaceholderText('Cari rekening...')
    expect(searchInput).toBeInTheDocument()

    // Type query "jago"
    await user.type(searchInput, 'jago')

    expect(screen.getByText('Jago - Kantong Belanja')).toBeInTheDocument()
    expect(screen.queryByText('BCA Main')).not.toBeInTheDocument()
    expect(screen.queryByText('Bareksa - BBCA')).not.toBeInTheDocument()
  })

  it('filters by badge keyword as well', async () => {
    const user = userEvent.setup()
    render(
      <Select2
        value="NEW"
        onChange={vi.fn()}
        options={sampleOptions}
        searchPlaceholder="Cari rekening..."
      />,
    )

    await user.click(screen.getByRole('button'))
    const searchInput = screen.getByPlaceholderText('Cari rekening...')

    await user.type(searchInput, 'saham')

    expect(screen.getByText('Bareksa - BBCA')).toBeInTheDocument()
    expect(screen.queryByText('BCA Main')).not.toBeInTheDocument()
  })

  it('calls onChange with selected value when an option is clicked', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    render(<Select2 value="NEW" onChange={onChange} options={sampleOptions} />)

    await user.click(screen.getByRole('button'))
    await user.click(screen.getByText('BCA Main'))

    expect(onChange).toHaveBeenCalledWith('acc-1')
  })

  it('shows empty message when no options match search query', async () => {
    const user = userEvent.setup()
    render(
      <Select2
        value="NEW"
        onChange={vi.fn()}
        options={sampleOptions}
        emptyMessage="Rekening tidak ditemukan."
      />,
    )

    await user.click(screen.getByRole('button'))
    const searchInput = screen.getByPlaceholderText('Cari...')

    await user.type(searchInput, 'xyz123nonexistent')

    expect(screen.getByText('Rekening tidak ditemukan.')).toBeInTheDocument()
  })
})
