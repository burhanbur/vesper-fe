import { zodResolver } from '@hookform/resolvers/zod'
import { LoaderCircle, LogIn, Sparkles, UserPlus } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/features/auth/hooks/use-auth'
import {
  loginFormSchema,
  registerFormSchema,
  type LoginFormInput,
  type RegisterFormInput,
} from '@/features/auth/schemas/auth.schema'

interface LoginFormProps {
  readonly onSuccess: () => void
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const { login, register: registerUser } = useAuth()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Login Form
  const loginForm = useForm<LoginFormInput>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { identifier: '', password: '' },
  })

  // Register Form
  const registerForm = useForm<RegisterFormInput>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: { name: '', username: '', email: '', password: '' },
  })

  const onLoginSubmit = loginForm.handleSubmit(async (input) => {
    setSubmitError(null)
    try {
      await login(input)
      onSuccess()
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : 'Unable to sign in. Please try again.',
      )
    }
  })

  const onRegisterSubmit = registerForm.handleSubmit(async (input) => {
    setSubmitError(null)
    try {
      await registerUser(input)
      onSuccess()
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : 'Gagal mendaftar. Silakan coba lagi.',
      )
    }
  })

  function handleFillDemo() {
    loginForm.setValue('identifier', 'burhanburdev@gmail.com')
    loginForm.setValue('password', 'burhan123')
  }

  return (
    <div className="space-y-6">
      {/* Mode Tabs */}
      <div className="grid grid-cols-2 rounded-xl border border-slate-800 bg-slate-900/90 p-1">
        <button
          type="button"
          onClick={() => {
            setMode('login')
            setSubmitError(null)
          }}
          className={`rounded-lg py-2 text-xs font-semibold transition-all ${
            mode === 'login'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Masuk (Sign in)
        </button>
        <button
          type="button"
          onClick={() => {
            setMode('register')
            setSubmitError(null)
          }}
          className={`rounded-lg py-2 text-xs font-semibold transition-all ${
            mode === 'register'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Daftar (Register)
        </button>
      </div>

      {submitError ? (
        <div
          className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-xs text-rose-400"
          role="alert"
        >
          {submitError}
        </div>
      ) : null}

      {mode === 'login' ? (
        <form
          className="space-y-4"
          onSubmit={(event) => void onLoginSubmit(event)}
          noValidate
        >
          <div className="space-y-1.5">
            <label
              className="text-xs font-medium text-slate-300"
              htmlFor="identifier"
            >
              Username or email
            </label>
            <Input
              id="identifier"
              autoComplete="username"
              aria-invalid={Boolean(loginForm.formState.errors.identifier)}
              placeholder="burhanburdev@gmail.com atau bmafazi"
              {...loginForm.register('identifier')}
            />
            {loginForm.formState.errors.identifier ? (
              <p className="text-xs text-rose-400" id="identifier-error">
                {loginForm.formState.errors.identifier.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <label
              className="text-xs font-medium text-slate-300"
              htmlFor="password"
            >
              Password
            </label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              aria-invalid={Boolean(loginForm.formState.errors.password)}
              placeholder="••••••••"
              {...loginForm.register('password')}
            />
            {loginForm.formState.errors.password ? (
              <p className="text-xs text-rose-400" id="password-error">
                {loginForm.formState.errors.password.message}
              </p>
            ) : null}
          </div>

          <Button
            className="h-11 w-full text-sm font-semibold"
            type="submit"
            disabled={loginForm.formState.isSubmitting}
          >
            {loginForm.formState.isSubmitting ? (
              <LoaderCircle
                className="size-4 animate-spin motion-reduce:animate-none"
                aria-hidden
              />
            ) : (
              <LogIn className="size-4" aria-hidden />
            )}
            {loginForm.formState.isSubmitting ? 'Signing in…' : 'Sign in'}
          </Button>

          {/* Quick Demo Credentials Autofill */}
          <button
            type="button"
            onClick={handleFillDemo}
            className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-dashed border-indigo-500/40 bg-indigo-500/5 px-3 py-2.5 text-xs font-medium text-indigo-300 transition-colors hover:bg-indigo-500/10"
          >
            <Sparkles className="size-3.5 text-indigo-400" />
            Gunakan Akun Demo: Burhan Mafazi
          </button>
        </form>
      ) : (
        <form
          className="space-y-4"
          onSubmit={(event) => void onRegisterSubmit(event)}
          noValidate
        >
          <div className="space-y-1.5">
            <label
              className="text-xs font-medium text-slate-300"
              htmlFor="reg-name"
            >
              Nama Lengkap
            </label>
            <Input
              id="reg-name"
              placeholder="Contoh: Burhan Mafazi"
              {...registerForm.register('name')}
            />
            {registerForm.formState.errors.name ? (
              <p className="text-xs text-rose-400">
                {registerForm.formState.errors.name.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <label
              className="text-xs font-medium text-slate-300"
              htmlFor="reg-username"
            >
              Username (Opsional)
            </label>
            <Input
              id="reg-username"
              placeholder="bmafazi"
              {...registerForm.register('username')}
            />
          </div>

          <div className="space-y-1.5">
            <label
              className="text-xs font-medium text-slate-300"
              htmlFor="reg-email"
            >
              Alamat Email
            </label>
            <Input
              id="reg-email"
              type="email"
              placeholder="nama@example.com"
              {...registerForm.register('email')}
            />
            {registerForm.formState.errors.email ? (
              <p className="text-xs text-rose-400">
                {registerForm.formState.errors.email.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <label
              className="text-xs font-medium text-slate-300"
              htmlFor="reg-password"
            >
              Password (Minimal 8 Karakter)
            </label>
            <Input
              id="reg-password"
              type="password"
              placeholder="••••••••"
              {...registerForm.register('password')}
            />
            {registerForm.formState.errors.password ? (
              <p className="text-xs text-rose-400">
                {registerForm.formState.errors.password.message}
              </p>
            ) : null}
          </div>

          <Button
            className="h-11 w-full text-sm font-semibold"
            type="submit"
            variant="emerald"
            disabled={registerForm.formState.isSubmitting}
          >
            {registerForm.formState.isSubmitting ? (
              <LoaderCircle
                className="size-4 animate-spin motion-reduce:animate-none"
                aria-hidden
              />
            ) : (
              <UserPlus className="size-4" aria-hidden />
            )}
            {registerForm.formState.isSubmitting
              ? 'Mendaftarkan…'
              : 'Daftar Akun Baru'}
          </Button>
        </form>
      )}
    </div>
  )
}
