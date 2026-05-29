'use client'

import { useState, useEffect } from 'react'

import {
    HOSPITAL_TABLE_HEADERS,
    DOCTOR_TABLE_HEADERS,
    NURSES_TABLE_HEADERS,
    PATIENT_TABLE_HEADERS,
    ASHA_TABLE_HEADERS,
    REMOVED_PATIENT_TABLE_HEADERS,
} from '@/constants'
import { GenericTable } from '@/components/table'
import { withAuth } from '@/components/hoc/withAuth'
import WelcomeBanner from '@/components/dashboard/WelcomeBanner'
import { ROLE_CONFIG } from '@/constants/auth'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

const TAB_KEY = 'adminPageActiveTab'

function AdminPageContent() {
    const [activeTab, setActiveTab] = useState<
        'hospitals' | 'doctors' | 'nurses' | 'ashas' | 'patients' | 'removedPatients'
    >('hospitals')

    useEffect(() => {
        const storedTab = localStorage.getItem(TAB_KEY) as typeof activeTab | null
        if (storedTab) setActiveTab(storedTab)
    }, [])

    const handleTabChange = (tab: typeof activeTab) => {
        setActiveTab(tab)
        localStorage.setItem(TAB_KEY, tab)
    }

    const headersMap = {
        hospitals: HOSPITAL_TABLE_HEADERS,
        doctors: DOCTOR_TABLE_HEADERS,
        nurses: NURSES_TABLE_HEADERS,
        ashas: ASHA_TABLE_HEADERS,
        patients: PATIENT_TABLE_HEADERS,
        removedPatients: REMOVED_PATIENT_TABLE_HEADERS,
    }

    const selectedHeaders = headersMap[activeTab]

    const tabLabels: Record<typeof activeTab, string> = {
        hospitals: 'Hospitals',
        doctors: 'Doctors',
        nurses: 'Nurses',
        ashas: 'ASHAs',
        patients: 'Patients',
        removedPatients: 'Removed Patients',
    }

    return (
        <div className="mx-auto px-4 py-4 lg:max-w-[1240px] xl:max-w-[1400px]">
         

  {/* All screens: dropdown + welcome banner */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Select value={activeTab} onValueChange={(val) => handleTabChange(val as typeof activeTab)}>
                    <SelectTrigger className="w-48 focus:ring-0 focus-visible:ring-0 focus-visible:outline-none">
                        <SelectValue placeholder="Select a section" />
                    </SelectTrigger>
                    <SelectContent>
                        {(
                            [
                                'hospitals',
                                'doctors',
                                'nurses',
                                'ashas',
                                'patients',
                                'removedPatients',
                            ] as const
                        ).map((tab) => (
                            <SelectItem key={tab} value={tab}>
                                {tabLabels[tab]}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <WelcomeBanner />
            </div>
            

            {/* Table */ }
    <div className="mt-4">
        <GenericTable headers={selectedHeaders} activeTab={activeTab} />
    </div>
        </div >
    )
}

export default withAuth(AdminPageContent, ROLE_CONFIG.admin)
