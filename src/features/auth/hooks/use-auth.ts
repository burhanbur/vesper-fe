import { useSyncExternalStore } from 'react'
import { authSession } from '@/features/auth/api/auth-session'

export function useAuth() {
  const snapshot = useSyncExternalStore(
    authSession.subscribe,
    authSession.getSnapshot,
    authSession.getSnapshot,
  )

  return {
    ...snapshot,
    login: authSession.login,
    register: authSession.register,
    logout: authSession.logout,
  }
}
