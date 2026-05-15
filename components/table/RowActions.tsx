// components/RowActions.tsx
'use client'

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { db } from '@/firebase'
import { HospitalFormInputs, UserDoc } from '@/schema'
import type { Patient } from '@/schema/patient'

import { useQueryClient } from '@tanstack/react-query'
import { deleteDoc, doc, setDoc, updateDoc } from 'firebase/firestore'

import {
    Eye,
    MoreVertical,
    Pencil,
    RotateCcw,
    Trash2,
    Repeat2,
    UserCheck,
    UserPlus,
} from 'lucide-react'

import { useState } from 'react'
import { toast } from 'sonner'

import AshaSearchDialog from '../dialogs/AshaSearchDialog'
import TransferDialog from '../dialogs/TransferDialog'
import GenericHospitalDialog from '../forms/hospital/GenericHospitalDialog'
import GenericPatientDialog from '../forms/patient/GenericPatientDialog'
import GenericUserDialog from '../forms/user/GenericUserDialog'
import ConfirmRetrieveDialog from '../dialogs/ConfirmRetrieveDialog'

type RowDataBase = {
    id: string | number
    [key: string]: unknown
}

type RowActionsProps = {
    rowData: RowDataBase
    activeTab: string
    isPatientTab: boolean
    isRemovedPatientsTab?: boolean
    onView: (data: RowDataBase) => void
    onDelete: (data: RowDataBase) => void
}

export function RowActions({
    rowData,
    activeTab,
    isPatientTab,
    isRemovedPatientsTab,
    onView,
    onDelete,
}: RowActionsProps) {
    const [assignedAshaId, setAssignedAshaId] = useState((rowData as Patient).assignedAsha || '')

    const [open, setOpen] = useState(false)

    const queryClient = useQueryClient()
    const { role } = useAuth()

    const handleRetrieve = async () => {
        try {
            if (!rowData.id) throw new Error('Missing patient ID')

            const patientId = rowData.id.toString()

            await setDoc(doc(db, 'patients', patientId), {
                ...rowData,
                restoredAt: new Date().toISOString(),
            })

            await deleteDoc(doc(db, 'removedPatients', patientId))

            queryClient.invalidateQueries({ queryKey: ['patients'] })
            queryClient.invalidateQueries({ queryKey: ['removedPatients'] })

            toast.success(`Patient ${rowData.name} retrieved successfully!`)
        } catch (err) {
            toast.error('Failed to retrieve patient. Check console.')
            console.error(err)
        }
    }

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={(e) => e.stopPropagation()}
                        aria-label="Open actions menu"
                    >
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end">
                    {/* View */}
                    <DropdownMenuItem onClick={() => onView(rowData)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Patient
                    </DropdownMenuItem>

                    {/* Edit Patient */}
                    {isPatientTab && (
                        <GenericPatientDialog
                            mode="edit"
                            patientData={rowData as Patient}
                            trigger={
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Edit Patient
                                </DropdownMenuItem>
                            }
                        />
                    )}

                    {/* Edit User */}
                    {['ashas', 'doctors', 'nurses'].includes(activeTab) && (
                        <GenericUserDialog
                            mode="edit"
                            userType={activeTab}
                            userData={rowData as UserDoc}
                            trigger={
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Edit User
                                </DropdownMenuItem>
                            }
                        />
                    )}

                    {/* Transfer Patient */}
                    {isPatientTab && (
                        <TransferDialog
                            patient={rowData as Patient}
                            trigger={
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    <Repeat2 className="mr-2 h-4 w-4" />
                                    Transfer Patient
                                </DropdownMenuItem>
                            }
                            onTransfer={async (hospitalId, hospitalName) => {
                                try {
                                    if (!rowData.id) throw new Error('Missing patient document ID')

                                    const patientRef = doc(db, 'patients', rowData.id.toString())

                                    await updateDoc(patientRef, {
                                        assignedHospital: {
                                            id: hospitalId,
                                            name: hospitalName,
                                        },
                                        assignedAsha: '',
                                    })

                                    toast.success(`Transferred ${rowData.name} to new PHC.`)
                                } catch (err) {
                                    toast.error('Transfer failed. See console for details.')
                                    console.error(err)
                                }
                            }}
                        />
                    )}

                    {/* Assign ASHA */}
                    {isPatientTab && (
                        <AshaSearchDialog
                            patientId={rowData.id.toString()}
                            assignedAshaId={assignedAshaId}
                            onAssigned={(ashaId: string | null) => setAssignedAshaId(ashaId ?? '')}
                            trigger={
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    {assignedAshaId !== 'none' && assignedAshaId ? (
                                        <UserCheck className="mr-2 h-4 w-4 text-green-600" />
                                    ) : (
                                        <UserPlus className="mr-2 h-4 w-4" />
                                    )}
                                    Assign ASHA
                                </DropdownMenuItem>
                            }
                        />
                    )}

                    <DropdownMenuSeparator />

                    {/* Retrieve */}
                    {isRemovedPatientsTab && (
                        <>
                            <DropdownMenuItem
                                onSelect={(e) => {
                                    e.preventDefault()
                                    setOpen(true)
                                }}
                                className="text-green-600"
                            >
                                <RotateCcw className="mr-2 h-4 w-4" />
                                Retrieve Patient
                            </DropdownMenuItem>

                            <ConfirmRetrieveDialog
                                open={open}
                                onOpenChange={setOpen}
                                patientName={rowData.name as string}
                                onConfirm={handleRetrieve}
                            />
                        </>
                    )}

                    {/* Delete */}
                    {role !== 'nurse' && (
                        <DropdownMenuItem variant="destructive" onClick={() => onDelete(rowData)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    )
}
