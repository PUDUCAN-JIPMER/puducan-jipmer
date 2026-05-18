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
import { useState } from 'react'

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

    // Mobile dialog/filter open states
    const [mobileFilterOpen, setMobileFilterOpen] = useState(false)
    const [mobileAddOpen, setMobileAddOpen] = useState(false)

    const dashboardTitleContent = pathname.includes('/admin') ? (
        <h1 className="hidden text-2xl font-bold sm:block">Admin Dashboard</h1>
    ) : pathname.includes('/nurse') ? (
        <h1 className="hidden text-2xl font-bold sm:block">Nurse Dashboard</h1>
    ) : (
        <h1 className="hidden text-2xl font-bold sm:block">Doctor Dashboard</h1>
    )

    const handleExportCSV = () => exportToCSV(getExportData(), activeTab)
    const handleExportExcel = () => exportToExcel(getExportData(), activeTab)

    return (
        <div className="mb-4 flex items-center justify-between">
            {dashboardTitleContent}

            <div className="flex flex-col gap-2 w-full sm:flex-row sm:items-center sm:justify-end">

                {/* ── MOBILE TOOLBAR ── */}
                <div className="flex flex-row items-center gap-2 w-full sm:hidden">

                    {/* Search takes full width */}
                    {activeTab && (
                        <div className="flex-1">
                            <SearchInput
                                value={searchTerm}
                                onChange={setSearchTerm}
                                placeholder={`Search ${activeTab}...`}
                            />
                        </div>
                    )}

                    {/* Hidden dialogs controlled by mobile menu */}
                    {activeTab === 'patients' && (
                        <>
                            <div className="hidden">
                                <PatientFilter />
                            </div>
                            <div className="hidden">
                                <GenericPatientDialog
                                    mode="add"
                                    open={mobileAddOpen}
                                    onOpenChange={setMobileAddOpen}
                                />
                            </div>
                        </>
                    )}

                    {/* Three-dot menu */}
                    {isLoading ? (
                        <Skeleton className="h-10 w-10 rounded-md flex-shrink-0" />
                    ) : (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="icon" className="flex-shrink-0">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent align="end">

                                {activeTab === 'patients' && (
                                    <DropdownMenuItem
                                        onSelect={() => setMobileFilterOpen(true)}
                                    >
                                        Filter Patients
                                    </DropdownMenuItem>
                                )}

                                {activeTab === 'patients' && (
                                    <DropdownMenuItem
                                        onSelect={() => setMobileAddOpen(true)}
                                    >
                                        Add Patient
                                    </DropdownMenuItem>
                                )}

                                {activeTab === 'hospitals' && (
                                    <DropdownMenuItem
                                        onSelect={() => document.querySelector<HTMLButtonElement>('[data-hospital-add]')?.click()}
                                    >
                                        Add Hospital
                                    </DropdownMenuItem>
                                )}

                                {['ashas', 'doctors', 'nurses'].includes(activeTab) && (
                                    <DropdownMenuItem
                                        onSelect={() => document.querySelector<HTMLButtonElement>('[data-user-add]')?.click()}
                                    >
                                        Add {activeTab.slice(0, -1)}
                                    </DropdownMenuItem>
                                )}

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

                                <DropdownMenuItem onClick={handleExportCSV}>
                                    Export as CSV
                                </DropdownMenuItem>

                                <DropdownMenuItem onClick={handleExportExcel}>
                                    Export as Excel
                                </DropdownMenuItem>

                                {activeTab === 'patients' && (
                                    <DropdownMenuItem onClick={() => generateDiseasePDF(getExportData())}>
                                        Generate Report
                                    </DropdownMenuItem>
                                )}

                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>

                {/* ── DESKTOP TOOLBAR ── */}
                <div className="hidden sm:flex sm:flex-row sm:items-center sm:justify-end sm:gap-2 w-full">

                    {activeTab && (
                        <div className="sm:min-w-[320px]">
                            <SearchInput
                                value={searchTerm}
                                onChange={setSearchTerm}
                                placeholder={`Search ${activeTab} via ${searchFields.join(', ')}`}
                            />
                        </div>
                    )}

                    {activeTab === 'patients' && <PatientFilter />}
                    {activeTab === 'patients' && <GenericPatientDialog mode="add" />}
                    {activeTab === 'hospitals' && <GenericHospitalDialog mode="add" />}
                    {['ashas', 'doctors', 'nurses'].includes(activeTab) && (
                        <GenericUserDialog mode="add" userType={activeTab} />
                    )}

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

                                <DropdownMenuItem onClick={handleExportCSV}>
                                    Export as CSV
                                </DropdownMenuItem>

                                <DropdownMenuItem onClick={handleExportExcel}>
                                    Export as Excel
                                </DropdownMenuItem>

                                {activeTab === 'patients' && (
                                    <DropdownMenuItem onClick={() => generateDiseasePDF(getExportData())}>
                                        Generate Report
                                    </DropdownMenuItem>
                                )}

                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>

                {/* Hidden file input */}
                <input
                    id="file-upload"
                    type="file"
                    accept=".csv, .xlsx, .xls"
                    className="hidden"
                    onChange={(e) => importData(e, queryClient)}
                />

            </div>
        </div>
    )
}