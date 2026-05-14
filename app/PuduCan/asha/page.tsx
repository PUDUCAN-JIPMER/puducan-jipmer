'use client'
import WelcomeBanner from '@/components/dashboard/WelcomeBanner'
import { withAuth } from '@/components/hoc/withAuth'
import PatientFormMobile from '@/components/asha/PatientFormMobile'
import Loading from '@/components/ui/loading'
import { ROLE_CONFIG } from '@/constants/auth'
import { useAuth } from '@/contexts/AuthContext'
import { useTableData } from '@/hooks/table/useTableData'
import { Patient } from '@/schema/patient'
import { toast } from 'sonner'


function AshaPageContent() {
    const { user, userId, isLoadingAuth } = useAuth()

    // 🔹 Build queryProps like the doctor page
    const queryProps = {
        orgId: null,
        ashaId: userId,
        enabled: !isLoadingAuth && !!user?.email,
        requiredData: 'patients' as const,
    }

    console.log('user asha:', user)

    const {
        data: patients = [],
        isLoading,
        isError,
    } = (useTableData(queryProps) ?? {}) as {
        data: Patient[]
        isLoading: boolean
        isError: boolean
    }

    console.log('Fetched patients for ASHA:', patients)

    if (isLoading || isLoadingAuth) {
        return (
            <main className="flex h-screen items-center justify-center">
                <Loading />
                <p className="text-gray-500">Loading your patients...</p>
            </main>
        )
    }

    if (isError) {
        toast.error('Failed to load patient data. Try again.')
        return (
            <main className="flex h-screen items-center justify-center text-red-500">
                <p>An error occurred while fetching data.</p>
            </main>
        )
    }

    return (
        <main className="mt-4 p-4">
            <WelcomeBanner />
            <h1 className="mb-4 text-center text-xl font-bold">Your Assigned Patients</h1>

            {patients.length === 0 ? (
                <p className="text-center text-sm">No patients assigned to you.</p>
            ) : (
                <div className="mx-auto flex flex-col items-center gap-4 overflow-auto">
                    {patients.map((patient: Patient) => (
                        <PatientFormMobile key={patient.id} patient={patient} />
                    ))}
                </div>
            )}
        </main>
    )
}

export default withAuth(AshaPageContent, ROLE_CONFIG.asha)
