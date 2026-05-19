'use client'

import { Button } from '@/components/ui/button'
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from '@/components/ui/command'
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { db } from '@/firebase'
import { Check, UserCheck, UserPlus, X } from 'lucide-react'
import { collection, getDocs, query, where, doc, updateDoc } from 'firebase/firestore'
import {  useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext';
import  {useMutation, useQueryClient} from '@tanstack/react-query';

type Asha = {
    id: string
    email: string
    name?: string
    phoneNumber?: string
}



type BulkAssignDialogProps = {
    open: boolean
    ids: string[] // list of patient IDs to assign/unassign
    onClose: () => void
    onAssigned?: (ashaId: string | null) => void
}


export function BulkAssignDialog({
    open,
    ids,
    onClose,
    onAssigned,
}: BulkAssignDialogProps){
    const { orgId } = useAuth() // get orgId from auth
    const [ashas, setAshas] = useState<Asha[]>([])
    const [selectedAsha, setSelectedAsha] = useState<Asha | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const queryClient = useQueryClient()

    const count = ids.length

    // Fetch ASHAs
    useEffect(() => {
        if(!open) return // only fetch when dialog opens

        const fetchAshas = async () => {
            try {
                let q
                if (orgId) {
                    q = query(
                        collection(db, 'users'),
                        where('role', '==', 'asha'),
                        where('orgId', '==', orgId)
                    )
                } else {
                    
                    q = query(collection(db, 'users'), where('role', '==', 'asha'))
                }

                const snapshot = await getDocs(q)
                const ashaList: Asha[] = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...(doc.data() as Omit<Asha, 'id'>),
                }))
                setAshas(ashaList)
            } catch (error) {
                console.error('Error fetching ASHAs:', error)
            }
        }
        fetchAshas()
    }, [open,orgId]) // refetch if orgId changes

    const filteredAshas = ashas
        .filter(
            (asha) =>
                asha.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                asha.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                asha.phoneNumber?.includes(searchTerm)
        )
        .slice(0, 10)


    const mutation = useMutation({
        mutationFn: async ()=> {
            if(!ids.length) throw new Error('No patients selected')

                await Promise.all(
                    ids.map((id) => {
                        updateDoc(doc(db, 'patients', id), { assignedAsha: selectedAsha?.id || '' }) // empty string = unassigned
                    })
                )

                return ids
        },

        onSuccess: () =>{
            queryClient.invalidateQueries({ queryKey:['patients']})
            toast.success(
                selectedAsha ? `${count} ${count === 1 ? 'patient' : 'patients'} assigned successfully!` : `${count} 
                ${count === 1 ? 'patient' : 'patients'} unassigned successfully!`
            )
            onAssigned?.(selectedAsha?.id || null)
            handleClose()
        }, 
        onError: (err: any) => { toast.error( err.message || 'Assignment failed. See console for details.'); console.error(err) }
    })

    function handleClose() {
        setSelectedAsha(null)
        setSearchTerm('')
        onClose()
    }


    return (
        <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>

            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Assign ASHA to {count} {count === 1 ? 'patient' : 'patients'}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <Command className="rounded-md border shadow-md">
                        <CommandInput
                            placeholder="Search ASHA by email, username, or phone..."
                            onValueChange={(val) => setSearchTerm(val)}
                        />
                        <CommandEmpty>No ASHA found.</CommandEmpty>
                        <CommandGroup>
                            <CommandItem onSelect={() => setSelectedAsha(null)}>
                                <div className="flex w-full items-center justify-between">
                                    <span className="font-medium">Unassign ASHA</span>
                                </div>
                            </CommandItem>

                            {filteredAshas.map((asha) => (
                                <CommandItem key={asha.id} onSelect={() => setSelectedAsha(asha)}>
                                    <div className="flex w-full items-center justify-between">
                                        <div>
                                            {asha.name && (
                                                <div className="flex space-x-2">
                                                    <p className="text-muted-foreground text-sm">
                                                        Name:{' '}
                                                        <span className="text-foreground">
                                                            {asha.name}
                                                        </span>
                                                    </p>
                                                    <p className="text-muted-foreground text-sm">
                                                        Email: {asha.email}
                                                    </p>
                                                </div>
                                            )}
                                            {asha.phoneNumber && (
                                                <p className="text-muted-foreground text-sm">
                                                    PhoneNumber: {asha.phoneNumber}
                                                </p>
                                            )}
                                        </div>
                                        {selectedAsha?.id === asha.id && (
                                            <Check className="h-4 w-4 text-blue-600" />
                                        )}
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </Command>
                </div>

                <DialogFooter>
                    <Button onClick={handleClose} variant="outline" disabled={mutation.isPending}>
                        Cancel
                    </Button>

                    <Button onClick={() => mutation.mutate()} disabled={mutation.isPending} >
                        {
                            mutation.isPending ? 'Saving ...' : selectedAsha ?
                            `Confirm ASHA from ${count} ${count === 1 ? 'patient' : 'patients'} ` : 
                            `Unassigned ASHA from ${count} ${count === 1 ? 'patient' : 'patients'}`
                        }

                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
