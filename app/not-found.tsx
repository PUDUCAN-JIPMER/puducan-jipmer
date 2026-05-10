import Link from 'next/link'
import { AlertTriangle, Home } from 'lucide-react'

import { Button } from '@/components/ui/button'

export default function NotFound() {
    return (
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-16 text-foreground">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_var(--primary)_0,_transparent_32%)] opacity-15" />
            <div className="absolute left-1/2 top-1/2 -z-10 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl" />

            <section className="w-full max-w-2xl rounded-3xl border border-border bg-card/95 p-8 text-center text-card-foreground shadow-xl backdrop-blur sm:p-12">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary ring-8 ring-primary/5">
                    <AlertTriangle className="h-10 w-10" aria-hidden="true" />
                </div>

                <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-primary">404 error</p>
                <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">Page not found</h1>
                <p className="mx-auto mt-4 max-w-lg text-base leading-7 text-muted-foreground sm:text-lg">
                    Sorry, we could not find the page you are looking for. It may have been moved, renamed,
                    or is no longer available.
                </p>

                <div className="mt-8 flex justify-center">
                    <Button asChild size="lg" className="rounded-full px-7">
                        <Link href="/home">
                            <Home className="h-4 w-4" aria-hidden="true" />
                            Go to home page
                        </Link>
                    </Button>
                </div>
            </section>
        </main>
    )
}
