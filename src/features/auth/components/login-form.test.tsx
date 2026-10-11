import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { LoginForm } from './login-form'

const login = vi.fn()

vi.mock('@/features/auth/hooks/use-auth', () => ({
  useAuth: () => ({ login }),
}))

describe('LoginForm', () => {
  beforeEach(() => {
    login.mockReset()
  })

  it('shows validation errors for empty credentials', async () => {
    const user = userEvent.setup()
    render(<LoginForm onSuccess={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(
      await screen.findByText('Enter your username or email.'),
    ).toBeVisible()
    expect(screen.getByText('Enter your password.')).toBeVisible()
    expect(login).not.toHaveBeenCalled()
  })

  it('submits valid credentials and reports success', async () => {
    const user = userEvent.setup()
    const onSuccess = vi.fn()
    login.mockResolvedValue({})
    render(<LoginForm onSuccess={onSuccess} />)

    await user.type(
      screen.getByLabelText('Username or email'),
      'starter@example.com',
    )
    await user.type(screen.getByLabelText('Password'), 'secret-password')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(login).toHaveBeenCalledWith({
      identifier: 'starter@example.com',
      password: 'secret-password',
    })
    expect(onSuccess).toHaveBeenCalledOnce()
  })

  it('shows a safe API error without navigating', async () => {
    const user = userEvent.setup()
    const onSuccess = vi.fn()
    login.mockRejectedValue(new Error('Invalid credentials.'))
    render(<LoginForm onSuccess={onSuccess} />)

    await user.type(
      screen.getByLabelText('Username or email'),
      'starter@example.com',
    )
    await user.type(screen.getByLabelText('Password'), 'wrong-password')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Invalid credentials.',
    )
    expect(onSuccess).not.toHaveBeenCalled()
  })
})
