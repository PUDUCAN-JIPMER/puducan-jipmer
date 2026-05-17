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
import { use, useCallback, useEffect, useMemo } from 'react'
import ViewDetailsDialog from '../dialogs/ViewDetailsDialog'
import { GenericPagination, GenericRow, GenericToolbar } from './'
import { useTableStore } from '@/store'
import { useResponsiveRows } from '@/hooks/table/useResponsiveRows'
import { TabDataMap, RowDataBase, ModalType } from '@/types/table/types'
import { GenericMobileRow } from './GenericMobileRow'
import TableSkeleton from '@/components/skeletons/TableSkeleton'
import { ArrowUp, ArrowDown, ArrowUpDown ,Trash2, UserPlus, Download, } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useSorting, SORTABLE_KEYS } from '@/hooks/table/useSorting'
import { BulkAction, BulkActionBar } from './BulkActionBar'
import { useBulkSelectionStore } from '@/store/bulk-selection-store'
import { Checkbox } from '../ui/checkbox'
import BulkDeleteDialog from '../dialogs/BulkDeleteDialog'
import { useBulkExport } from '@/hooks/table/useBulkExport'
import {BulkAssignDialog} from '../dialogs/BulkAssignDialog'

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

    //clear selection when filters change or page changes
    useEffect(() => {
        setCurrentPage(1)
    }, [filteredPatients.length, setCurrentPage])

    // Reset to page 1 whenever sorting changes
    useEffect(() => {
        setCurrentPage(1)
    }, [sorting, setCurrentPage])
    
    useEffect(() => {
        clearSelection()
    }, [currentPage, searchFields, filteredPatients.length, clearSelection])



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
    const allCurrentSelected = currentPageIds.length> 0 && currentPageIds.every((id) => selectedIds.has(id))
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
            hidden: !isPatientTab, // only show for patients
            icon: <UserPlus className="h-3 w-3" />,
            onClick: () => {
                // handle assign action
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
                <TableHeader className="bg-muted hidden sm:table-header-group">
                    <TableRow className="border-border border-b">
                        {/* bulk actions */}
                        <TableHead className="border-border w-12 border-r  text-center">
                            <div className='flex items-center justify-center'>
                                <Checkbox
                                checked = {
                                    allCurrentSelected ? true : someCurrentPageSelected ? 'indeterminate' : false
                                }
                                onCheckedChange={() => selectAll(currentPageIds)}
                                aria-label='Select all rows on this page'
                                />
                            </div>
                            
                        </TableHead>
                        <TableHead className="border-border w-12 border-r text-center items-center justify-center">
                            S/NO
                        </TableHead>
                        {headers.map((header, id) => {
                            const isSortable = SORTABLE_KEYS.includes(header.key)
                            const isActive = sorting[0]?.id === header.key
                            const direction = sorting[0]?.desc ? 'desc' : 'asc'

                            return (
                                <TableHead
                                    className="border-border w-12 border-r text-center"
                                    key={id}
                                >
                                    {isSortable ? (
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <button
                                                        onClick={() => toggle(header.key)}
                                                        className="hover:text-foreground flex w-full items-center justify-center gap-1 font-medium"
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
                        <TableHead className="border-border w-12 border-r text-center">
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
                                No matching patients found.
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
                        isSelected={isSelected(data.id)}
                        onToggleSelect={() => toggleRow(data.id)}
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

             {/* Bulk delete confirmation dialog */}

            <BulkDeleteDialog
            open={modal === 'bulkDelete'}
            collectionName={activeTab}
            ids={selectedIdsArray()}
            rowsData={paginatedData as Record<string, any>[]}
            onClose={() =>{
                closeModal(),
                clearSelection()} }
            
            />

            <BulkAssignDialog
            open={modal === 'bulkAssign'}
            ids={selectedIdsArray()}
            onClose={ () =>{
                closeModal()
                clearSelection()}
                
            }
            />
           
        </div>
    )
}
