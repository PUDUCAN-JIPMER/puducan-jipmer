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
import TableSkeleton from '@/components/skeletons/TableSkeleton'
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useSorting, SORTABLE_KEYS } from '@/hooks/table/useSorting'

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

    const { selectedRow, modal, setSelectedRow, openModal, closeModal } = useTableStore()

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
    const { data = [], isLoading } = useTableData(queryProps) ?? {}

    const searchFields = SEARCH_FIELDS[activeTab]

    const isPatientTab = activeTab === 'patients'
    const isHospitalTab = activeTab == 'hospitals'
    const patients = (data as Patient[]) ?? []
    const filteredPatients = useFilteredPatients(isPatientTab ? patients : [])

    // ✅ Choose correct baseData (patients → filtered first, others → raw data)
    const baseData = isPatientTab ? filteredPatients : (data ?? [])
    type ActiveDataType = TabDataMap[typeof activeTab] // infer based on activeTab

    const {
        filteredRows: searchedData,
        searchTerm,
        setSearchTerm,
    } = useSearch<ActiveDataType>(baseData, searchFields)

    // ✅ Apply sorting after search
    const { sorting, toggle, sortedData } = useSorting(searchedData)

    // ✅ Use searchedData for pagination
    const dataToPaginate = useMemo(() => sortedData, [sortedData])

    const tableData = usePagination<(typeof dataToPaginate)[number]>(dataToPaginate, rowsPerPage)

    const { paginated: paginatedData, currentPage, totalPages, setCurrentPage } = tableData

    const tableStats = useStats({
        TableData: searchedData ?? [],
        isPatientTab,
        isHospitalTab,
    })

    useEffect(() => {
        setCurrentPage(1)
    }, [filteredPatients.length, setCurrentPage])

    // Reset to page 1 whenever sorting changes
    useEffect(() => {
        setCurrentPage(1)
    }, [sorting, setCurrentPage])

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
                activeTab={activeTab}
                getExportData={() => getExportData(activeTab, data, filteredPatients)}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                searchFields={SEARCH_FIELDS[activeTab]}
                isLoading={isLoading || isLoadingAuth}
            />

            <Table className="border-border flex-1 overflow-auto rounded-md border">
    <caption className="sr-only">
        {activeTab} management table
    </caption>
                <TableHeader className="bg-muted hidden sm:table-header-group">
                    <TableRow className="border-border border-b">
                       <TableHead
    scope="col"
    className="border-border w-12 border-r text-center"
>
    S/NO
</TableHead>
                        {headers.map((header, id) => {
                            const isSortable = SORTABLE_KEYS.includes(header.key)
                            const isActive = sorting[0]?.id === header.key
                            const direction = sorting[0]?.desc ? 'desc' : 'asc'

                            return (
                               <TableHead
    scope="col"
    aria-sort={
        isSortable
            ? isActive
                ? direction === 'asc'
                    ? 'ascending'
                    : 'descending'
                : 'none'
            : undefined
    }
    className="border-border w-12 border-r text-center"
    key={id}
>
                                    {isSortable ? (
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                   <button
    type="button"
    onClick={() => toggle(header.key)}
    aria-label={`Sort by ${header.name}`}
    className="hover:text-foreground focus-visible:ring-ring flex w-full items-center justify-center gap-1 rounded font-medium focus-visible:ring-2 focus-visible:outline-none"
>
                                                        {header.name}
                                                        {isActive && direction === 'asc' && (
                                                            <ArrowUp className="h-3 w-3" />
                                                        )}
                                                        {isActive && direction === 'desc' && (
                                                            <ArrowDown className="h-3 w-3" />
                                                        )}
                                                        {!isActive && (
                                                            <ArrowUpDown className="h-3 w-3 opacity-40" />
                                                        )}
                                                    </button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    {
                                                        !isActive
                                                            ? 'Sort ascending' // not sorted yet → first click = asc
                                                            : direction === 'asc'
                                                              ? 'Sort descending' // currently asc → next click = desc
                                                              : 'Sort ascending' // currently desc → next click = asc
                                                    }
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    ) : (
                                        header.name
                                    )}
                                </TableHead>
                            )
                        })}
                       <TableHead
    scope="col"
    className="border-border w-12 border-r text-center"
>
    Actions
</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {isLoading || isLoadingAuth ? (
                        <TableRow>
                            <TableCell colSpan={headers.length + 2}>
                                <TableSkeleton />
                            </TableCell>
                        </TableRow>
                    ) : paginatedData.length > 0 ? (
                        paginatedData.map((data, index) => (
                            <GenericRow
                                key={data.id}
                                activeTab={activeTab}
                                isPatientTab={isPatientTab}
                                isRemovedPatientsTab={activeTab === 'removedPatients'}
                                rowData={data}
                                index={(currentPage - 1) * rowsPerPage + index}
                                onView={(row) => handleRowAction(row, 'view')}
                                onUpdate={(row) => handleRowAction(row, 'update')}
                                onDelete={(row) => handleRowAction(row, 'delete')}
                                headers={stableHeaders}
                            />
                        ))
                    ) : (
                        <TableRow>
                            <TableCell
                                colSpan={headers.length + 2}
                                className="text-muted-foreground py-10 text-center text-sm"
                            >
                                No matching records found for the current search.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            {/* ✅ Mobile rows outside table */}
            <div className="sm:hidden">
                {paginatedData.map((data, index) => (
                    <GenericMobileRow
                        key={data.id + '-mobile'}
                        activeTab={activeTab}
                        isPatientTab={isPatientTab}
                        isRemovedPatientsTab={activeTab === 'removedPatients'}
                        rowData={data}
                        index={(currentPage - 1) * rowsPerPage + index}
                        onView={(row) => handleRowAction(row, 'view')}
                        onUpdate={(row) => handleRowAction(row, 'update')}
                        onDelete={(row) => handleRowAction(row, 'delete')}
                        headers={stableHeaders}
                    />
                ))}
            </div>

            <div className="">
                <GenericPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    stats={tableStats} // only show stats for patients
                    isPatientTab={isPatientTab}
                    isLoading={isLoading || isLoadingAuth}
                />
            </div>
            {selectedRow && modal === 'view' && (
                <>
                    <ViewDetailsDialog
                        open={modal === 'view'}
                        onOpenChange={(open) => !open && closeModal()}
                        rowData={selectedRow}
                        fieldsToDisplay={fieldsToDisplay}
                    />
                </>
            )}
            <DeleteEntityDialog
                open={modal === 'delete'}
                entityData={selectedRow}
                collectionName={activeTab} // 'patients' | 'hospitals' | 'doctors' | 'nurses' | 'ashas' | 'removedPatients'
                onClose={closeModal}
            />
        </div>
    )
}
