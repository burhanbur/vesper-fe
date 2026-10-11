import { Button } from '@/components/ui/button'

interface RouteErrorPageProps {
  readonly error: unknown
  readonly reset: () => void
}

export function RouteErrorPage({ error, reset }: RouteErrorPageProps) {
  const message =
    error instanceof Error ? error.message : 'An unexpected error occurred.'

  return (
    <main className="grid min-h-screen place-items-center px-4 text-center">
      <div className="max-w-md">
        <p className="text-sm font-semibold text-red-600">
          Something went wrong
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950">
          Unable to load this page
        </h1>
        <p className="mt-3 text-slate-600">{message}</p>
        <Button className="mt-6" onClick={reset}>
          Try again
        </Button>
      </div>
    </main>
  )
}
