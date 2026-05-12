'use client'

import PatientFormMobile from '@/components/asha/PatientFormMobile'
import { withAuth } from '@/components/hoc/withAuth'
import { useAuth } from '@/contexts/AuthContext'
import { useTableData } from '@/hooks/table/useTableData'
import { Patient } from '@/schema/patient'
import { ROLE_CONFIG } from '../../constants/auth'
import { UseQueryResult } from '@tanstack/react-query'

function AshaPageContent() {
    const { userId, isLoadingAuth } = useAuth()

    if (isLoadingAuth || !userId) {
        return (
            <main className="flex min-h-[60vh] items-center justify-center">
                <p className="text-sm text-muted-foreground">Loading…</p>
            </main>
        )
    }

    return <AshaPatientList ashaId={userId} />
}

function AshaPatientList({ ashaId }: { ashaId: string }) {
    const {
        data: patients = [],
        isLoading,
        isError,
    } = useTableData({
        ashaId,
        requiredData: 'patients',
    }) as UseQueryResult<Patient[], Error>

    return (
        <main className="mx-auto w-full max-w-4xl px-4 py-8">
            {/* Page header */}
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-foreground">Your Assigned Patients</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    {isLoading
                        ? 'Loading patients…'
                        : `${patients.length} patient${patients.length !== 1 ? 's' : ''} assigned to you`}
                </p>
            </div>

            {/* Loading skeletons */}
            {isLoading && (
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-20 w-full animate-pulse rounded-xl bg-muted" />
                    ))}
                </div>
            )}

            {/* Error */}
            {isError && (
                <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                    Failed to load patients. Please refresh the page.
                </div>
            )}

            {/* Empty state */}
            {!isLoading && !isError && patients.length === 0 && (
                <div className="rounded-xl border border-dashed border-border p-12 text-center">
                    <p className="text-sm font-medium text-foreground">No patients assigned to you</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Patients will appear here once assigned to your account.
                    </p>
                </div>
            )}

            {/* Patient list — click any card to open the wizard */}
            {!isLoading && !isError && patients.length > 0 && (
                <div className="space-y-3">
                    {patients.map((patient: Patient) => (
                        <PatientFormMobile key={patient.id} patient={patient} />
                    ))}
                </div>
            )}
        </main>
    )
}

export default withAuth(AshaPageContent, ROLE_CONFIG.asha)