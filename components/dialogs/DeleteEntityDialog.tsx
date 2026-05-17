'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { db } from '@/firebase'
import { deleteDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { toast } from 'sonner'

type Collections = 'patients' | 'hospitals' | 'doctors' | 'nurses' | 'ashas' | 'removedPatients'

type WithIdAndName = { id: string | number; name?: string } & Record<string, any>

type DeleteEntityDialogProps<T extends WithIdAndName | null> = {
    open: boolean
    entityData: T
    collectionName: Collections
    onClose: () => void
    onDeleted?: (deletedId: string) => void
}

function labelFromCollection(coll: Collections) {
    switch (coll) {
        case 'patients':
            return 'Patient'
        case 'hospitals':
            return 'Hospital'
        case 'doctors':
            return 'Doctor'
        case 'nurses':
            return 'Nurse'
        case 'ashas':
            return 'ASHA'
        case 'removedPatients':
            return 'Removed Patient'
        default:
            return 'Record'
    }
}

function mapToFirestoreCollection(coll: Collections) {
    if (coll === 'patients') return 'patients'
    if (coll === 'hospitals') return 'hospitals'
    if (coll === 'removedPatients') return 'removedPatients'
    // doctors, nurses, ashas are all in 'users'
    return 'users'
}

export default function DeleteEntityDialog<T extends WithIdAndName | null>({
    open,
    entityData,
    collectionName,
    onClose,
    onDeleted,
}: DeleteEntityDialogProps<T>) {
    const queryClient = useQueryClient()
    const [reason, setReason] = useState('')
    const isPatient = collectionName === 'patients'
    const name = (entityData?.name as string) ?? ''
    const id = entityData?.id ? String(entityData.id) : ''

    const mutation = useMutation({
        mutationFn: async () => {
            if (!entityData || !id) throw new Error('Missing entity id')

            if (isPatient) {
                // require a reason
                if (!reason.trim())
                    throw new Error('Please enter a reason before deleting the patient.')

                // 1) archive to removedPatients (same id so you can cross-reference)
                await setDoc(doc(db, 'removedPatients', id), {
                    ...entityData,
                    deletionReason: reason.trim(),
                    deletedAt: serverTimestamp(),
                    removedFrom: 'patients',
                })

                // 2) delete from patients
                await deleteDoc(doc(db, 'patients', id))
            } else {
                // direct delete for hospitals/users/removedPatients
                const coll = mapToFirestoreCollection(collectionName)
                await deleteDoc(doc(db, coll, id))
            }

            return id
        },
        onSuccess: (deletedId) => {
            // invalidate the right list
            if (collectionName === 'patients') {
                queryClient.invalidateQueries({ queryKey: ['patients'] })
                queryClient.invalidateQueries({ queryKey: ['removedPatients'] })
            } else if (collectionName === 'hospitals') {
                queryClient.invalidateQueries({ queryKey: ['hospitals'] })
            } else if (collectionName === 'removedPatients') {
                queryClient.invalidateQueries({ queryKey: ['removedPatients'] })
            } else {
                // doctors, nurses, ashas
                queryClient.invalidateQueries({ queryKey: ['users'] })
            }

            toast.success(`${name || labelFromCollection(collectionName)} deleted successfully`)
            onDeleted?.(deletedId)
            onClose()
        },
        onError: (err: any) => {
            toast.error(err?.message || 'Deletion failed')
            // keep dialog open so the user can fix reason or retry
        },
    })

    const handleConfirm = () => {
        mutation.mutate()
    }

    return (
        <Dialog
            open={open}
            onOpenChange={(o) => {
                if (!o) onClose()
            }}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete {labelFromCollection(collectionName)}</DialogTitle>
                </DialogHeader>

                <div className="space-y-2">
                    <p>
                        Are you sure you want to delete{' '}
                        <strong className="text-red-600">{name || 'this record'}</strong>?
                    </p>
                    <p className="text-sm text-orange-500">Note: This action cannot be undone.</p>
                </div>

                {isPatient && (
                    <div className="mt-3 space-y-4">
                        <label className="mb-2 block text-sm font-medium">
                            Reason for deletion
                        </label>
                        <Input
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Enter reason..."
                        />
                    </div>
                )}

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={mutation.isPending}>
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleConfirm}
                        disabled={mutation.isPending}
                    >
                        {mutation.isPending ? 'Deleting…' : 'Delete'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
