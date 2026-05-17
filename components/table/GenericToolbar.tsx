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

// for keyboard shortcuts
import { useRef, useState } from 'react'
import { useKeyboardShortcurts } from '@/hooks/keyboardshortcut/keyboardShortcuts'
import { KeyBoardShortcuts } from '../common/KeyBoardShortcuts'

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
        <h1 className="hidden text-2xl font-bold sm:block">Admin Dashboard</h1>
    ) : pathname.includes('/nurse') ? (
        <h1 className="hidden text-2xl font-bold sm:block">Nurse Dashboard</h1>
    ) : (
        <h1 className="hidden text-2xl font-bold sm:block">Doctor Dashboard</h1>
    )

    const handleExportCSV = () => {
        const data = getExportData()
        exportToCSV(data, activeTab)
    }

    const handleExportExcel = () => {
        const data = getExportData()
        exportToExcel(data, activeTab)
    }

    // for keyboard shortcuts
    const searchInputRef = useRef<HTMLInputElement>(null)

    const [shortcutDialogOpen, setShortcutDialogOpen] = useState(false)

    // for reusable states
    const [activeDialog, setActiveDialog] = useState<
        'patients' | 'hospitals' | 'users' | null
    >(null)

    useKeyboardShortcurts({
        onSearchFocus: () => {
            searchInputRef.current?.focus()
        },

        onOpenShortcuts: () => {
            setShortcutDialogOpen(true)
        },

        onCloseDialog: () => {
            setShortcutDialogOpen(false)
        },

        onNewPatient: () => {
            if (activeTab === "patients") {
                setActiveDialog('patients')
            }

            if (activeTab === "hospitals") {
                setActiveDialog('hospitals')
            }

            if (['ashas', 'doctors', 'nurses'].includes(activeTab)) {
                setActiveDialog('users')
            }
        },

        
    })
    return (
        <div className="mb-4 flex items-center justify-between">
            {dashboardTitleContent}
            <div className="flex w-full items-center justify-center gap-2 sm:w-auto">
                {isLoading ? (
                    <Skeleton className="h-10 w-[250px] rounded-md" />
                ) : (
                    activeTab && (
                        <SearchInput
                            value={searchTerm}
                            onChange={setSearchTerm}
                            placeholder={`Search ${activeTab} via ${searchFields.join(', ')}`}
                        />
                    )
                )}
                {isLoading ? (
                    <Skeleton className="h-10 w-32 rounded-md" />
                ) : (
                    <>
                        {activeTab === 'patients' && <PatientFilter />}
                        {activeTab === 'patients' && <GenericPatientDialog mode="add" />}
                        {activeTab === 'hospitals' && <GenericHospitalDialog mode="add" />}
                        {['ashas', 'doctors', 'nurses'].includes(activeTab) && (
                            <GenericUserDialog mode="add" userType={activeTab} />
                        )}
                    </>
                )}

                {/* Three-dot Dropdown */}
                {isLoading ? (
    <Skeleton className="h-10 w-10 rounded-md" />
) : (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {/* Import */}
                        {activeTab === 'patients' && role === 'admin' && (
                            <DropdownMenuItem
                                onSelect={(e) => {
                                    e.preventDefault() // ✅ stop default closing behavior if needed
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
                                importData(e, queryClient)
                            }}
                        />

                        {/* Export */}
                        <DropdownMenuItem onClick={handleExportCSV}>Export as CSV</DropdownMenuItem>
                        <DropdownMenuItem onClick={handleExportExcel}>
                            Export as Excel
                        </DropdownMenuItem>

                        {/* Report (only for patients) */}
                        {activeTab === 'patients' && (
                            <DropdownMenuItem onClick={() => generateDiseasePDF(getExportData())}>
                                Generate Report
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            )}
            </div>
        </div>
    )
}
