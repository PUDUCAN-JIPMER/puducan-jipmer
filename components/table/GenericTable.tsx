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
import { use, useCallback, useEffect, useMemo, useState, useRef } from 'react'
import ViewDetailsDialog from '../dialogs/ViewDetailsDialog'
import { GenericPagination, GenericRow, GenericToolbar } from './'
import { useTableStore } from '@/store'
import { useResponsiveRows } from '@/hooks/table/useResponsiveRows'
import { TabDataMap, RowDataBase, ModalType } from '@/types/table/types'
import { GenericMobileRow } from './GenericMobileRow'
import TableSkeleton from '@/components/skeletons/TableSkeleton'
import { ArrowUp, ArrowDown, ArrowUpDown, Trash2, UserPlus, Download } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useSorting, SORTABLE_KEYS } from '@/hooks/table/useSorting'
import { BulkAction, BulkActionBar } from './BulkActionBar'
import { useBulkSelectionStore } from '@/store/bulk-selection-store'
import { Checkbox } from '../ui/checkbox'
import BulkDeleteDialog from '../dialogs/BulkDeleteDialog'
import { useBulkExport } from '@/hooks/table/useBulkExport'
import { BulkAssignDialog } from '../dialogs/BulkAssignDialog'
import { QueryDocumentSnapshot } from 'firebase/firestore'

const PAGE_SIZE = 50

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
    const { selectedIds, toggleRow, selectAll, clearSelection, isSelected, selectedIdsArray, selectionCount } = useBulkSelectionStore()
    const { exportSelected } = useBulkExport()

    // ── Pagination state ──
    const [cursor, setCursor] = useState<QueryDocumentSnapshot | null>(null)
    const [pageHistory, setPageHistory] = useState<QueryDocumentSnapshot[]>([]) // for going back
    const [currentPage, setCurrentPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)

    const queryProps = {
        orgId: role === 'admin' ? null : orgId,
        ashaId: role === 'asha' ? user?.id : null,
        enabled: !isLoadingAuth,
        requiredData: activeTab,
        pageSize: PAGE_SIZE,
        cursor: cursor,
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
    const { data: rawData, isLoading } = useTableData(queryProps) ?? {}

    // Extract actual data array from the new response shape (could be { data, lastDoc } or just array for old code)
    const data = useMemo(() => {
        if (Array.isArray(rawData)) return rawData
        if (rawData && typeof rawData === 'object' && 'data' in rawData) return (rawData as any).data as any[]
        return []
    }, [rawData])

    const lastDoc = useMemo(() => {
        if (rawData && typeof rawData === 'object' && 'lastDoc' in rawData) return (rawData as any).lastDoc as QueryDocumentSnapshot | null
        return null
    }, [rawData])

    // Update hasMore based on whether we got a full page
    useEffect(() => {
        if (data.length < PAGE_SIZE) setHasMore(false)
        else setHasMore(true)
    }, [data])

    const searchFields = SEARCH_FIELDS[activeTab]

    const isPatientTab = activeTab === 'patients'
    const isHospitalTab = activeTab == 'hospitals'
    const patients = (data as Patient[]) ?? []
    const filteredPatients = useFilteredPatients(isPatientTab ? patients : [])
    const baseData = isPatientTab ? filteredPatients : (data ?? [])
    type ActiveDataType = TabDataMap[typeof activeTab]

    // We still use client-side search for instant feedback on the current page
    const { filteredRows: searchedData, searchTerm, setSearchTerm } = useSearch<ActiveDataType>(baseData, searchFields)

    const { sorting, toggle, sortedData } = useSorting(searchedData)
    const dataToPaginate = useMemo(() => sortedData, [sortedData])

    // Use client-side pagination on the already fetched page (for display)
    const tableData = usePagination<(typeof dataToPaginate)[number]>(dataToPaginate, rowsPerPage)
    const { paginated: paginatedData, totalPages, setCurrentPage: setClientPage } = tableData

    const tableStats = useStats({
        TableData: searchedData ?? [],
        isPatientTab,
        isHospitalTab,
    })

    const tabLabels: Record<string, string> = {
        patients: 'patients',
        hospitals: 'hospitals',
        doctors: 'doctors',
        nurses: 'nurses',
        ashas: 'ASHAs',
        removedPatients: 'removed patients',
    }

    // Handle page change – if we have a lastDoc and we're going forward, set cursor
    const handlePageChange = (newPage: number) => {
        if (newPage > currentPage && lastDoc && hasMore) {
            // Move to next server-side page
            setPageHistory(prev => [...prev, cursor!])
            setCursor(lastDoc)
            setCurrentPage(newPage)
            setClientPage(1) // reset client page to 1 for the new data
        } else if (newPage < currentPage && pageHistory.length > 0) {
            // Go back to previous server page
            const prevCursor = pageHistory[pageHistory.length - 1]
            setPageHistory(prev => prev.slice(0, -1))
            setCursor(prevCursor)
            setCurrentPage(newPage)
            setClientPage(1)
        } else {
            // Within the same page, just update client page
            setClientPage(newPage)
            setCurrentPage(newPage)
        }
    }

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

    const currentPageIds = useMemo(() => paginatedData.map((row) => row.id), [paginatedData])
    const allCurrentSelected = currentPageIds.length > 0 && currentPageIds.every((id) => selectedIds.has(id))
    const someCurrentPageSelected = !allCurrentSelected && currentPageIds.some((id) => selectedIds.has(id))

    const bulkActions: BulkAction[] = useMemo(() => [
        {
            key: 'delete',
            label: 'Delete',
            icon: <Trash2 className="h-3 w-3" />,
            variant: 'destructive',
            onClick: () => {
                openModal('bulkDelete')
            }
        },
        {
            key: 'Assign',
            label: 'Assign',
            hidden: !isPatientTab,
            icon: <UserPlus className="h-3 w-3" />,
            onClick: () => {
                openModal('bulkAssign')
            }
        },
        {
            key: 'export',
            label: 'Export',
            icon: <Download className="h-3 w-3" />,
            onClick: (ids) => {
                exportSelected(
                    ids,
                    stableHeaders,
                    activeTab,
                    data as Record<string, unknown>[],
                )
            }
        }
    ], [openModal, isPatientTab, exportSelected, data, stableHeaders, activeTab])

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

            <BulkActionBar
                selectedCount={selectionCount()}
                selectedIds={selectedIdsArray()}
                actions={bulkActions}
                onClearSelection={clearSelection}
            />

            <Table className="border-border flex-1 overflow-auto rounded-md border">
                <caption className="sr-only">
                    {activeTab} management table
                </caption>
                <TableHeader className="bg-muted hidden sm:table-header-group">
                    <TableRow className="border-border border-b">
                        <TableHead className="border-border w-12 border-r text-center">
                            <div className='flex items-center justify-center'>
                                <Checkbox
                                    checked={
                                        allCurrentSelected ? true : someCurrentPageSelected ? 'indeterminate' : false
                                    }
                                    onCheckedChange={() => selectAll(currentPageIds)}
                                    aria-label='Select all rows on this page'
                                />
                            </div>
                        </TableHead>
                        <TableHead className="border-border w-12 border-r text-center">
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
                                                            ? 'Sort ascending'
                                                            : direction === 'asc'
                                                                ? 'Sort descending'
                                                                : 'Sort ascending'
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
                        <TableHead scope="col" className="border-border w-12 border-r text-center">
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
                                isSelected={isSelected(data.id)}
                                onToggleSelect={() => toggleRow(data.id)}
                            />
                        ))
                    ) : (
                        <TableRow>
                            <TableCell
                                colSpan={headers.length + 2}
                                className="text-muted-foreground py-10 text-center text-sm"
                            >
                                {`No matching ${tabLabels[activeTab] ?? 'records'} found for the current search.`}
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>

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
                        isSelected={isSelected(data.id)}
                        onToggleSelect={() => toggleRow(data.id)}
                    />
                ))}
            </div>

            <div className="">
                <GenericPagination
                    currentPage={currentPage}
                    totalPages={hasMore ? currentPage + 1 : currentPage} // simple indication of more pages
                    onPageChange={handlePageChange}
                    stats={tableStats}
                    isPatientTab={isPatientTab}
                    isLoading={isLoading || isLoadingAuth}
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
            <BulkDeleteDialog
                open={modal === 'bulkDelete'}
                collectionName={activeTab}
                ids={selectedIdsArray()}
                rowsData={paginatedData as Record<string, any>[]}
                onClose={() => {
                    closeModal()
                    clearSelection()
                }}
            />
            <BulkAssignDialog
                open={modal === 'bulkAssign'}
                ids={selectedIdsArray()}
                onClose={() => {
                    closeModal()
                    clearSelection()
                }}
            />
        </div>
    )
}