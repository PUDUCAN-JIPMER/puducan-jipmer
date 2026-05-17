'use client'

import { useAuth } from '@/contexts/AuthContext'
import { withAuth } from '@/components/hoc/withAuth'
import { ROLE_REDIRECTS } from '@/constants/auth'
import { useStatsData } from '@/hooks/stats/useStatsData'
import { PatientStatsSection } from '@/components/stats/PatientStatsSection'
import { AdminStatsSection } from '@/components/stats/AdminStatsSection'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle, BarChart3, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

// ── Allowed for admin, doctor, and nurse ────────────────────────────
const STATS_ROLE_CONFIG = {
    allowedRoles: ['admin', 'doctor', 'nurse'] as const,
    redirectMap: ROLE_REDIRECTS,
}

function StatsPageContent() {
    const { role, orgId } = useAuth()
    const router = useRouter()

    const { patientStats, adminStats, isLoading, isError } = useStatsData({
        role,
        orgId,
    })

    if (isLoading) {
        return (
            <main className="mx-auto max-w-6xl space-y-6 px-4 py-6">
                <div className="flex items-center gap-2">
                    <BarChart3 className="text-primary h-6 w-6" />
                    <h1 className="text-2xl font-bold">Analytics</h1>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <Skeleton key={i} className="h-24 rounded-xl" />
                    ))}
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Skeleton className="h-64 rounded-xl" />
                    <Skeleton className="h-64 rounded-xl" />
                </div>
                <Skeleton className="h-56 rounded-xl" />
            </main>
        )
    }

    if (isError) {
        return (
            <main className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-12 text-center">
                <AlertCircle className="text-destructive h-10 w-10" />
                <p className="text-lg font-medium">Failed to load analytics data.</p>
                <p className="text-muted-foreground text-sm">
                    Check your connection and try refreshing the page.
                </p>
            </main>
        )
    }

    return (
        <main className="mx-auto max-w-6xl space-y-8 px-4 py-6 lg:max-w-[1240px] xl:max-w-[1400px]">
            {/* Page header */}
            <div className="flex items-center gap-2 border-b pb-3">
                <button
                    onClick={() => router.back()}
                    className="text-muted-foreground hover:text-foreground bg-muted mr-6 flex items-center gap-1 rounded-md px-3 py-1.5 text-sm transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                </button>
                <BarChart3 className="text-primary h-6 w-6" />
                <h1 className="text-2xl font-bold">Analytics</h1>
                <span className="text-muted-foreground bg-muted ml-auto rounded-md px-2 py-1 text-sm capitalize">
                    {role}
                </span>
            </div>

            {/* Patient stats — visible to all allowed roles */}
            <section>
                <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                    Patient Insights
                    <span className="text-muted-foreground text-xs font-normal">
                        ({role === 'admin' ? 'All hospitals' : 'Your hospital'})
                    </span>
                </h2>
                <PatientStatsSection stats={patientStats} role={role ?? ''} />
            </section>

            {/* Admin-only section */}
            {role === 'admin' && adminStats && (
                <section>
                    <AdminStatsSection stats={adminStats} />
                </section>
            )}
        </main>
    )
}

export default withAuth(StatsPageContent, STATS_ROLE_CONFIG as any)
