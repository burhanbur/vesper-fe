import { LoaderCircle } from 'lucide-react'
import { useEffect, type ReactNode } from 'react'
import { authSession, useAuth } from '@/features/auth'

interface AuthBootstrapProps {
  readonly children: ReactNode
}

export function AuthBootstrap({ children }: AuthBootstrapProps) {
  const { status } = useAuth()

  useEffect(() => {
    void authSession.restore()
  }, [])

  if (status === 'restoring') {
    return (
      <main
        className="grid min-h-screen place-items-center bg-slate-50"
        aria-busy="true"
      >
        <div className="text-center">
          <LoaderCircle
            className="mx-auto size-7 animate-spin text-indigo-600 motion-reduce:animate-none"
            aria-hidden
          />
          <p className="mt-3 text-sm text-slate-600">Restoring your session…</p>
        </div>
      </main>
    )
  }

  return children
}
