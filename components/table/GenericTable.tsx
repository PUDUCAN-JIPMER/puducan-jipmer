'use client'

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { useAuth } from '@/contexts/AuthContext'
import { useFilteredPatients } from '@/hooks/table/useFilteredPatients'
import { usePagination } from '@/hooks/table/usePagination'

import DeleteEntityDialog from '@/components/dialogs/DeleteEntityDialog'
import { hospitalFields, patientFields, SEARCH_FIELDS, userFields } from '@/constants'
import { useSearch, useStats, useTableData } from '@/hooks'
import { Hospital, Patient, UserDoc } from '@/schema'
import { useCallback, useEffect, useMemo } from 'react'
import ViewDetailsDialog from '../dialogs/ViewDetailsDialog'
import { GenericPagination, GenericRow, GenericToolbar } from './'
import { useTableStore } from '@/store'
import { useResponsiveRows } from '@/hooks/table/useResponsiveRows'
import { TabDataMap, RowDataBase, ModalType } from '@/types/table/types'
import { GenericMobileRow } from './GenericMobileRow'
import { Skeleton } from '@/components/ui/skeleton'
import { FileSearch } from 'lucide-react'

export function GenericTable({
    headers,
    activeTab,
}: {
    headers: {
        name: string
        key: string
    }[]
    activeTab: 'ashas' | 'doctors' | 'nurses' | 'hospitals' | 'patients' | 'removedPatients'
}) {
    const stableHeaders = useMemo(() => headers, [headers])

    const rowsPerPage = useResponsiveRows()

    const { user, role, orgId, isLoadingAuth } = useAuth() as {
        user: UserDoc | null
        role: string
        orgId: string
        isLoadingAuth: boolean
    }

    const { selectedRow, modal, setSelectedRow, openModal, closeModal } =
        useTableStore()

    const queryProps = {
        orgId,
        ashaId: role === 'asha' ? user?.id : null,
        enabled: !isLoadingAuth,
        requiredData: activeTab,
    }

    const fieldsMap = {
        patients: patientFields,
        hospitals: hospitalFields,
        doctors: userFields,
        nurses: userFields,
        ashas: userFields,
        removedPatients: patientFields,
    } as const

    const fieldsToDisplay = fieldsMap[activeTab]

    const {
        data = [],
        isLoading,
    } = useTableData(queryProps) ?? {}

    const searchFields = SEARCH_FIELDS[activeTab]

    const isPatientTab = activeTab === 'patients'
    const isHospitalTab = activeTab === 'hospitals'

    const patients = (data as Patient[]) ?? []

    const filteredPatients = useFilteredPatients(
        isPatientTab ? patients : []
    )

    // ✅ Choose correct baseData
    const baseData = isPatientTab ? filteredPatients : (data ?? [])

    type ActiveDataType = TabDataMap[typeof activeTab]

    const {
        filteredRows: searchedData,
        searchTerm,
        setSearchTerm,
    } = useSearch<ActiveDataType>(baseData, searchFields)

    // ✅ Use searchedData for pagination
    const dataToPaginate = useMemo(() => searchedData, [searchedData])

    const tableData = usePagination<(typeof dataToPaginate)[number]>(
        dataToPaginate,
        rowsPerPage
    )

    const {
        paginated: paginatedData,
        currentPage,
        totalPages,
        setCurrentPage,
    } = tableData

    const tableStats = useStats({
        TableData: searchedData ?? [],
        isPatientTab,
        isHospitalTab,
    })

    useEffect(() => {
        setCurrentPage(1)
    }, [filteredPatients.length, setCurrentPage])

    const handleRowAction = useCallback(
        (row: RowDataBase, action: ModalType) => {
            setSelectedRow(row as TabDataMap[typeof activeTab])
            openModal(action)
        },
        [activeTab, setSelectedRow, openModal]
    )

    function getExportData(
        activeTab: keyof TabDataMap,
        data: unknown[],
        filteredPatients: Patient[]
    ) {
        if (activeTab === 'patients') return filteredPatients
        if (activeTab === 'hospitals') return (data ?? []) as Hospital[]
        return data ?? []
    }

    return (
        <div className="flex min-h-screen flex-col">
            <GenericToolbar
                loading={isLoading}
                activeTab={activeTab}
                getExportData={() =>
                    getExportData(activeTab, data, filteredPatients)
                }
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                searchFields={SEARCH_FIELDS[activeTab]}
            />

            <Table className="border-border flex-1 overflow-auto rounded-md border">
                <TableHeader className="bg-muted hidden sm:table-header-group">
                    <TableRow className="border-border border-b">
                        <TableHead className="border-border w-12 border-r text-center">
                            S/NO
                        </TableHead>

                        {headers.map((header, id) => (
                            <TableHead
                                className="border-border w-12 border-r text-center"
                                key={id}
                            >
                                {header.name}
                            </TableHead>
                        ))}

                        <TableHead className="border-border w-12 border-r text-center">
                            Actions
                        </TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {isLoading ? (
                        Array.from({ length: 6 }).map((_, index) => (
                            <TableRow key={index}>
                                {Array.from({
                                    length: headers.length + 2,
                                }).map((_, cellIndex) => (
                                    <TableCell key={cellIndex}>
                                        <Skeleton className="h-8 w-full" />
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : paginatedData.length > 0 ? (
                        paginatedData.map((data, index) => (
                            <GenericRow
                                key={data.id}
                                activeTab={activeTab}
                                isPatientTab={isPatientTab}
                                isRemovedPatientsTab={
                                    activeTab === 'removedPatients'
                                }
                                rowData={data}
                                index={
                                    (currentPage - 1) * rowsPerPage + index
                                }
                                onView={(row) =>
                                    handleRowAction(row, 'view')
                                }
                                onUpdate={(row) =>
                                    handleRowAction(row, 'update')
                                }
                                onDelete={(row) =>
                                    handleRowAction(row, 'delete')
                                }
                                headers={stableHeaders}
                            />
                        ))
                    ) : (
                        <TableRow>
                            <TableCell
                                colSpan={headers.length + 2}
                                className="h-40 text-center"
                            >
                                <div className="flex flex-col items-center justify-center">
                                    <FileSearch className="mb-3 h-12 w-12 text-gray-400" />

                                    <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                                        No results found
                                    </h2>

                                    <p className="mt-2 text-sm text-gray-500">
                                        Try adjusting your search keywords.
                                    </p>
                                </div>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            {/* ✅ Mobile rows outside table */}
            <div className="sm:hidden">
                {isLoading ? (
                    Array.from({ length: 4 }).map((_, index) => (
                        <div
                            key={index}
                            className="mb-4 rounded-lg border p-4"
                        >
                            <Skeleton className="mb-2 h-5 w-3/4" />
                            <Skeleton className="mb-2 h-4 w-1/2" />
                            <Skeleton className="h-4 w-2/3" />
                        </div>
                    ))
                ) : paginatedData.length > 0 ? (
                    paginatedData.map((data, index) => (
                        <GenericMobileRow
                            key={data.id + '-mobile'}
                            activeTab={activeTab}
                            isPatientTab={isPatientTab}
                            isRemovedPatientsTab={
                                activeTab === 'removedPatients'
                            }
                            rowData={data}
                            index={
                                (currentPage - 1) * rowsPerPage + index
                            }
                            onView={(row) =>
                                handleRowAction(row, 'view')
                            }
                            onUpdate={(row) =>
                                handleRowAction(row, 'update')
                            }
                            onDelete={(row) =>
                                handleRowAction(row, 'delete')
                            }
                            headers={stableHeaders}
                        />
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
                        <FileSearch className="mb-3 h-12 w-12 text-gray-400" />

                        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                            No results found
                        </h2>

                        <p className="mt-2 text-sm text-gray-500">
                            Try adjusting your search keywords.
                        </p>
                    </div>
                )}
            </div>

            <div>
                <GenericPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    stats={tableStats}
                    isPatientTab={isPatientTab}
                />
            </div>

            {selectedRow && modal === 'view' && (
                <ViewDetailsDialog
                    open={modal === 'view'}
                    onOpenChange={(open) => !open && closeModal()}
                    rowData={selectedRow}
                    fieldsToDisplay={fieldsToDisplay}
                />
            )}

            <DeleteEntityDialog
                open={modal === 'delete'}
                entityData={selectedRow}
                collectionName={activeTab}
                onClose={closeModal}
            />
        </div>
    )
}