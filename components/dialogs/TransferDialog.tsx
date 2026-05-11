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
    Sheet,
    SheetContent,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Label } from '@/components/ui/label'
import { db } from '@/firebase'
import { Patient } from '@/schema/patient'
import { collection, getDocs } from 'firebase/firestore'
import { Repeat2, Check, Hospital as HospitalIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

type Hospital = {
    id: string
    name: string
    address: string
    contactNumber: string
}

export default function TransferDialog({
    onTransfer,
}: {
    patient: Patient
    onTransfer: (hospitalId: string, hospitalName: string) => void
}) {
    const [hospitals, setHospitals] = useState<Hospital[]>([])
    const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [open, setOpen] = useState(false)

    useEffect(() => {
        const fetchHospitals = async () => {
            try {
                const snapshot = await getDocs(collection(db, 'hospitals'))
                const hospitalList: Hospital[] = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...(doc.data() as Omit<Hospital, 'id'>),
                }))
                setHospitals(hospitalList)
            } catch (error) {
                console.error('Error fetching hospitals:', error)
            }
        }

        fetchHospitals()
    }, [])

    const handleTransfer = () => {
        if (selectedHospital) {
            onTransfer(selectedHospital.id, selectedHospital.name)
            setOpen(false)
        }
    }

    const filteredHospitals = searchTerm 
        ? hospitals.filter((h) => (h.name ?? '').toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 3)
        : hospitals

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button
                    size="icon"
                    variant="outline"
                    className="cursor-pointer"
                    title="Transfer Patient"
                >
                    <Repeat2 className="h-4 w-4" />
                </Button>
            </SheetTrigger>

            <SheetContent side="right" className="w-full sm:max-w-md flex flex-col">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <Repeat2 className="h-5 w-5" />
                        Transfer Patient
                    </SheetTitle>
                    <p className="text-sm text-muted-foreground">
                        Select a new Primary Health Centre (PHC) to transfer this patient.
                    </p>
                </SheetHeader>

                <div className="flex-1 mt-6 space-y-4">
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Select Hospital</Label>
                        <Command className="rounded-lg border shadow-sm">
                            <CommandInput
                                placeholder="Search hospital name..."
                                onValueChange={(value) => setSearchTerm(value)}
                            />
                            <CommandEmpty>No hospital found.</CommandEmpty>
                            <ScrollArea className="h-[280px]">
                                <CommandGroup>
                                    {filteredHospitals.map((hospital) => (
                                        <CommandItem
                                            key={hospital.id}
                                            onSelect={() => setSelectedHospital(selectedHospital?.id === hospital.id ? null : hospital)}
                                            className={cn(
                                                "flex items-center justify-between p-3 cursor-pointer transition-colors",
                                                selectedHospital?.id === hospital.id 
                                                    ? "bg-primary/10" 
                                                    : "hover:bg-muted"
                                            )}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="mt-1">
                                                    <HospitalIcon className="h-4 w-4 text-primary" />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="font-semibold text-sm leading-none">
                                                        {hospital.name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground line-clamp-1">
                                                        {hospital.address}
                                                    </p>
                                                </div>
                                            </div>
                                            {selectedHospital?.id === hospital.id && (
                                                <Check className="h-4 w-4 text-primary" />
                                            )}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </ScrollArea>
                        </Command>
                        <p className="text-[10px] text-muted-foreground px-1 italic">
                            {searchTerm 
                                ? `Showing top ${filteredHospitals.length} search matches` 
                                : `Showing all ${filteredHospitals.length} hospitals (scroll to view)`}
                        </p>
                    </div>

                    {selectedHospital && (
                        <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                Selected Destination
                            </h4>
                            <div className="space-y-1">
                                <p className="text-sm font-bold">{selectedHospital.name}</p>
                                <p className="text-xs text-muted-foreground">
                                    {selectedHospital.address}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <SheetFooter className="mt-auto pt-6 border-t">
                    <Button 
                        onClick={handleTransfer} 
                        disabled={!selectedHospital}
                        className="w-full"
                    >
                        Confirm Transfer
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}
