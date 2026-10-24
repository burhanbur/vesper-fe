import { useNavigate } from '@tanstack/react-router'
import { Layers } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { LoginForm } from '@/features/auth'

export function LoginPage() {
  const navigate = useNavigate()

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-slate-50 px-4 py-12 text-slate-900 dark:bg-[#090D16] dark:text-slate-100">
      {/* Ambient Background Glows */}
      <div className="pointer-events-none absolute top-1/4 left-1/2 size-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-600/10 blur-3xl" />
      <div className="pointer-events-none absolute right-1/4 bottom-1/4 size-72 rounded-full bg-emerald-500/10 blur-3xl" />

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 space-y-2 text-center">
          <span className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-emerald-500 text-white shadow-xl shadow-indigo-600/30">
            <Layers className="size-7" aria-hidden />
          </span>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            VESPER
          </h1>
          <p className="text-xs font-semibold tracking-widest text-indigo-700 uppercase dark:text-indigo-400">
            Wealth & Daily Personal Finance
          </p>
          <p className="pt-1 text-sm text-slate-600 dark:text-slate-400">
            Sistem pencatatan keuangan harian, wealth management & grup
            keluarga.
          </p>
        </div>

        <Card className="border-slate-200 bg-white/90 shadow-xl backdrop-blur-xl dark:border-slate-800 dark:bg-[#0E1424]/90 dark:shadow-2xl">
          <CardHeader className="pb-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Akses Akun
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Masuk dengan akun Anda atau buat akun baru.
            </p>
          </CardHeader>
          <CardContent>
            <LoginForm
              onSuccess={() =>
                void navigate({ to: '/dashboard', replace: true })
              }
            />
          </CardContent>
        </Card>

        <p className="mt-8 text-center text-xs text-slate-500 dark:text-slate-400">
          Vesper Finance &copy; 2026. All rights reserved.
        </p>
      </div>
    </main>
  )
}
