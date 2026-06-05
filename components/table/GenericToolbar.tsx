'use client'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { importData } from '@/lib/import/importUtils'
import { exportToCSV, exportToExcel } from '@/lib/patient/export'
import { generateDiseasePDF } from '@/lib/patient/generateDiseaseReport'
import { useQueryClient } from '@tanstack/react-query'
import { MoreVertical } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { PatientFilter } from '.'
import GenericHospitalDialog from '../forms/hospital/GenericHospitalDialog'
import GenericPatientDialog from '../forms/patient/GenericPatientDialog'
import GenericUserDialog from '../forms/user/GenericUserDialog'
import { SearchInput } from '../search/SearchInput'
import { useAuth } from '@/contexts/AuthContext'
import { useRef, useState } from 'react'
import { useKeyboardShortcurts } from '@/hooks/keyboardshortcut/keyboardShortcuts'
import { KeyBoardShortcuts } from '../common/KeyBoardShortcuts'
import ImportReviewDialog from '@/components/dialogs/ImportReviewDialog'

export function GenericToolbar({
    activeTab,
    getExportData,
    searchTerm,
    setSearchTerm,
    searchFields,
    isLoading,
}: {
    activeTab: 'ashas' | 'hospitals' | 'doctors' | 'nurses' | 'patients' | 'removedPatients'
    getExportData: () => any[]
    searchTerm: string
    setSearchTerm: (val: string) => void
    searchFields: readonly string[]
    isLoading?: boolean
}) {
    const pathname = usePathname()
    const queryClient = useQueryClient()
    const { role } = useAuth()

    const dashboardTitleContent = pathname.includes('/admin') ? (
        <h1 className="text-2xl font-bold hidden sm:block">Admin Dashboard</h1>
    ) : pathname.includes('/nurse') ? (
        <h1 className="text-2xl font-bold hidden sm:block">Nurse Dashboard</h1>
    ) : (
        <h1 className="text-2xl font-bold hidden sm:block">Doctor Dashboard</h1>
    )

    const handleExportCSV = () => {
        const data = getExportData()
        exportToCSV(data, activeTab)
    }

    const handleExportExcel = () => {
        const data = getExportData()
        exportToExcel(data, activeTab)
    }

    const searchInputRef = useRef<HTMLInputElement>(null)
    const [shortcutDialogOpen, setShortcutDialogOpen] = useState(false)
    const [activeDialog, setActiveDialog] = useState<'patients' | 'hospitals' | 'users' | null>(null)

    // import review dialog state
    const [reviewData, setReviewData] = useState<{
        flagged: any[]
        cleanRows: any[]
        onResolved: (decisions: any[]) => Promise<void>
    } | null>(null)

    useKeyboardShortcurts({
        onSearchFocus: () => { searchInputRef.current?.focus() },
        onOpenShortcuts: () => { setShortcutDialogOpen(true) },
        onCloseDialog: () => { setShortcutDialogOpen(false) },
        onNewPatient: () => {
            if (activeTab === 'patients') setActiveDialog('patients')
            if (activeTab === 'hospitals') setActiveDialog('hospitals')
            if (['ashas', 'doctors', 'nurses'].includes(activeTab)) setActiveDialog('users')
        },
    })

    return (
        <div className="mb-4 flex items-center justify-between">
            {dashboardTitleContent}

            <KeyBoardShortcuts
                open={shortcutDialogOpen}
                onOpenChange={setShortcutDialogOpen}
            />

            <div className="flex items-center gap-2 w-full justify-center sm:w-auto">
                {activeTab && (
                    <SearchInput
                        ref={searchInputRef}
                        value={searchTerm}
                        onChange={setSearchTerm}
                        placeholder={`Search ${activeTab} via ${searchFields.join(', ')}`}
                    />
                )}

                {activeTab === 'patients' && <PatientFilter />}

                {activeTab === 'patients' && (
                    <GenericPatientDialog
                        mode="add"
                        open={activeDialog === 'patients'}
                        onOpenChange={(open) => { setActiveDialog(open ? 'patients' : null) }}
                    />
                )}

                {activeTab === 'hospitals' && (
                    <GenericHospitalDialog
                        mode="add"
                        open={activeDialog === 'hospitals'}
                        onOpenChange={(open) => { setActiveDialog(open ? 'hospitals' : null) }}
                    />
                )}

                {['ashas', 'doctors', 'nurses'].includes(activeTab) && (
                    <GenericUserDialog
                        mode="add"
                        userType={activeTab}
                        open={activeDialog === 'users'}
                        onOpenChange={(open) => { setActiveDialog(open ? 'users' : null) }}
                    />
                )}

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {activeTab === 'patients' && role === 'admin' && (
                            <DropdownMenuItem
                                onSelect={(e) => {
                                    e.preventDefault()
                                    document.getElementById('file-upload')?.click()
                                }}
                            >
                                Import Patients
                            </DropdownMenuItem>
                        )}
                        <input
                            id="file-upload"
                            type="file"
                            accept=".csv, .xlsx, .xls"
                            className="hidden"
                            onChange={(e) => {
                                importData(e, queryClient, (flagged, cleanRows, onResolved) => {
                                    setReviewData({ flagged, cleanRows, onResolved })
                                })
                            }}
                        />
                        <DropdownMenuItem onClick={handleExportCSV}>Export as CSV</DropdownMenuItem>
                        <DropdownMenuItem onClick={handleExportExcel}>Export as Excel</DropdownMenuItem>
                        {activeTab === 'patients' && (
                            <DropdownMenuItem onClick={() => generateDiseasePDF(getExportData())}>
                                Generate Report
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {reviewData && (
                <ImportReviewDialog
                    open={!!reviewData}
                    onOpenChange={(open) => { if (!open) setReviewData(null) }}
                    flaggedRows={reviewData.flagged}
                    cleanRows={reviewData.cleanRows}
                    onResolved={reviewData.onResolved}
                />
            )}
        </div>
    )
}