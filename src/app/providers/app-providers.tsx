import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router'
import { Toaster } from 'sonner'
import { AuthBootstrap } from '@/app/providers/auth-bootstrap'
import { AuthRouterSync } from '@/app/providers/auth-router-sync'
import { ThemeProvider } from '@/app/providers/theme-provider'
import { TimezoneProvider } from '@/app/providers/timezone-provider'
import { router } from '@/app/router/router'
import { queryClient } from '@/lib/query-client'

export function AppProviders() {
  return (
    <ThemeProvider>
      <TimezoneProvider>
        <QueryClientProvider client={queryClient}>
          <AuthBootstrap>
            <AuthRouterSync />
            <RouterProvider router={router} />
          </AuthBootstrap>
          <Toaster richColors position="top-right" />
        </QueryClientProvider>
      </TimezoneProvider>
    </ThemeProvider>
  )
}
