'use client'

import { withAuth } from '@/components/hoc/withAuth'
import PatientFormMobile from '@/components/asha/PatientFormMobile'
import Loading from '@/components/ui/loading'
import { ROLE_CONFIG } from '@/constants/auth'
import { useAuth } from '@/contexts/AuthContext'
import { useTableData } from '@/hooks/table/useTableData'
import { Patient } from '@/schema/patient'
import { toast } from 'sonner'
import { FileSearch } from 'lucide-react'

function AshaPageContent() {
    const { user, userId, isLoadingAuth } = useAuth()

    // Build query props
    const queryProps = {
        orgId: null,
        ashaId: userId,
        enabled: !isLoadingAuth && !!user?.email,
        requiredData: 'patients' as const,
    }

    const {
        data: patients = [],
        isLoading,
        isError,
    } = (useTableData(queryProps) ?? {}) as {
        data: Patient[]
        isLoading: boolean
        isError: boolean
    }

    // Loading state
    if (isLoading || isLoadingAuth) {
        return (
            <main className="flex h-screen flex-col items-center justify-center gap-2">
                <Loading />
                <p className="text-gray-500">Loading your patients...</p>
            </main>
        )
    }

    // Error state
    if (isError) {
        toast.error('Failed to load patient data. Try again.')

        return (
            <main className="flex h-screen items-center justify-center text-red-500">
                <p>An error occurred while fetching data.</p>
            </main>
        )
    }

    return (
        <main className="mt-4 flex min-h-[60vh] flex-col p-4">
            <h1 className="mb-6 text-center text-2xl font-bold">
                Your Assigned Patients
            </h1>

            {patients.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center shadow-sm">
                    <FileSearch className="mb-4 h-12 w-12 text-gray-400" />

                    <h2 className="text-lg font-semibold text-gray-700">
                        No patients assigned
                    </h2>

                    <p className="mt-2 max-w-md text-sm text-gray-500">
                        There are currently no patients assigned to your
                        account. Please check back later or contact the
                        administrator for assistance.
                    </p>
                </div>
            ) : (
                <div className="mx-auto flex w-full flex-col items-center gap-4 overflow-auto">
                    {patients.map((patient: Patient) => (
                        <PatientFormMobile
                            key={patient.id}
                            patient={patient}
                        />
                    ))}
                </div>
            )}
        </main>
    )
}

export default withAuth(AshaPageContent, ROLE_CONFIG.asha)