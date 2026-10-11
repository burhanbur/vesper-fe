import { useEffect } from 'react'
import { router } from '@/app/router/router'
import { useAuth } from '@/features/auth'

export function AuthRouterSync() {
  const { status } = useAuth()

  useEffect(() => {
    if (status !== 'restoring') {
      void router.invalidate()
    }
  }, [status])

  return null
}
