'use client'
import WelcomeBanner from '@/components/dashboard/WelcomeBanner'
import { withAuth } from '@/components/hoc/withAuth'
import {GenericTable} from '@/components/table'
import { ROLE_CONFIG } from '@/constants/auth'
import { PATIENT_TABLE_HEADERS } from '@/constants/headers'

function NursePage() {
    return (
        <main className="mx-auto px-8 py-4 lg:max-w-[1240px] xl:max-w-[1400px]">
            <GenericTable headers={PATIENT_TABLE_HEADERS} activeTab="patients" />
        </main>
    )
}

export default withAuth(NursePage, ROLE_CONFIG.nurse)
