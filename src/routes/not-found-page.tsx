import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  return (
    <main className="grid min-h-screen place-items-center px-4 text-center">
      <div>
        <p className="text-sm font-semibold text-indigo-600">404</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950">
          Page not found
        </h1>
        <p className="mt-3 text-slate-600">
          The page you requested does not exist.
        </p>
        <Button asChild className="mt-6">
          <Link to="/">Return home</Link>
        </Button>
      </div>
    </main>
  )
}
