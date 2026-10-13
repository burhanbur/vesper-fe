import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ChangeEvent } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { CurrencyInput } from './currency-input'

describe('CurrencyInput Component', () => {
  it('renders with prefix Rp and initial formatted value', () => {
    render(<CurrencyInput value="1000000" />)

    const input = screen.getByRole<HTMLInputElement>('textbox')
    expect(input.value).toBe('1.000.000')
    expect(screen.getByText('Rp')).toBeInTheDocument()
    expect(screen.getByTestId('compact-badge')).toHaveTextContent('≈ 1 jt')
  })

  it('formats numeric typing in real-time', async () => {
    const user = userEvent.setup()
    const onRawChange = vi.fn()

    render(<CurrencyInput onRawChange={onRawChange} placeholder="Nominal" />)
    const input = screen.getByPlaceholderText<HTMLInputElement>('Nominal')

    await user.type(input, '1500000')

    expect(input.value).toBe('1.500.000')
    expect(onRawChange).toHaveBeenLastCalledWith('1500000')
    expect(screen.getByTestId('compact-badge')).toHaveTextContent('≈ 1,5 jt')
  })

  it('blocks typing alphabetic characters completely', async () => {
    const user = userEvent.setup()
    const onRawChange = vi.fn()

    render(<CurrencyInput onRawChange={onRawChange} placeholder="Nominal" />)
    const input = screen.getByPlaceholderText<HTMLInputElement>('Nominal')

    // Try typing alphabet letters like in the user's report: "sdfdsfdsfs"
    await user.type(input, 'sdfdsfdsfs')

    // Input must remain empty, no letters allowed
    expect(input.value).toBe('')
    expect(onRawChange).not.toHaveBeenCalled()
  })

  it('filters out letters when mixed with numbers', async () => {
    const user = userEvent.setup()
    const onRawChange = vi.fn()

    render(<CurrencyInput onRawChange={onRawChange} placeholder="Nominal" />)
    const input = screen.getByPlaceholderText<HTMLInputElement>('Nominal')

    // Type numbers mixed with letters: '1a2b3c' -> only 123 is accepted
    await user.type(input, '1a2b3c')

    expect(input.value).toBe('123')
    expect(onRawChange).toHaveBeenLastCalledWith('123')
  })

  it('calls standard onChange with sanitized backend value in e.target.value', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn<(e: ChangeEvent<HTMLInputElement>) => void>()

    render(<CurrencyInput onChange={onChange} placeholder="Nominal" />)
    const input = screen.getByPlaceholderText('Nominal')

    await user.type(input, '250000')
    expect(onChange).toHaveBeenCalled()
    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1]
    expect(lastCall?.[0]?.target?.value).toBe('250000')
  })

  it('renders terbilang when showTerbilang is true', () => {
    render(<CurrencyInput value={1500000} showTerbilang />)

    expect(screen.getByTestId('terbilang-text')).toHaveTextContent(
      'Satu Juta Lima Ratus Ribu Rupiah',
    )
  })

  it('clears properly when text is deleted', async () => {
    const user = userEvent.setup()
    const onRawChange = vi.fn()

    render(<CurrencyInput value="1000000" onRawChange={onRawChange} />)
    const input = screen.getByRole<HTMLInputElement>('textbox')

    await user.clear(input)
    expect(input.value).toBe('')
    expect(onRawChange).toHaveBeenLastCalledWith('')
    expect(screen.queryByTestId('compact-badge')).not.toBeInTheDocument()
  })
})
