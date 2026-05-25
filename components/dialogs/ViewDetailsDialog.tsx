'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Patient } from '@/schema/patient'
import { UserDoc } from '@/schema/user'
import { Hospital } from '@/schema/hospital'
import formatFieldValue from './formatFieldValue'
import { db } from '@/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { useEffect, useState } from 'react'

type RowDataType = Patient | UserDoc | Hospital
type FieldToDisplay = { label: string; key: string }

export default function ViewDetailsDialog({
    open,
    onOpenChange,
    rowData,
    fieldsToDisplay,
}: {
    open: boolean
    onOpenChange: (open: boolean) => void
    rowData: RowDataType
    fieldsToDisplay: FieldToDisplay[]
}) {
    const [ashaName, setAshaName] = useState<string | null>(null)

    useEffect(() => {
        const ashaId = (rowData as Patient).assignedAsha
        if (!ashaId || ashaId === 'none' || ashaId === '') {
            setAshaName(null)
            return
        }
        const fetchAshaName = async () => {
            try {
                const ashaDoc = await getDoc(doc(db, 'users', ashaId))
                if (ashaDoc.exists()) {
                    const data = ashaDoc.data()
                    setAshaName(data.name || data.email || ashaId)
                } else {
                    setAshaName(ashaId)
                }
            } catch {
                setAshaName(ashaId)
            }
        }
        fetchAshaName()
    }, [rowData])

    function renderValue(key: string, value: any): string {
        // assignedAsha should show a friendly name fetched from users collection
        if (key === 'assignedAsha') {
            if (!value || value === 'none' || value === '') return 'N/A'
            return ashaName ?? 'Loading...'
        }

        // Preserve number -> date conversion for fields stored as Excel dates (legacy handling)
        if (typeof value === 'number') {
            if (key.toLowerCase().includes('date') || key.toLowerCase().includes('year')) {
                const date = new Date((value - 25569) * 86400 * 1000)
                return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
            }
            return String(value)
        }

        // Delegate remaining formatting to the centralized helper
        return formatFieldValue(key, value)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-card text-card-foreground rounded-xl shadow-md sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-lg font-semibold">
                        {rowData['name']}
                    </DialogTitle>
                </DialogHeader>
                <ScrollArea className="max-h-[70vh] pr-2">
                    <div className="flex flex-col">
                        {fieldsToDisplay.map(({ label, key }) => (
                            <Info
                                key={key}
                                label={label}
                                value={renderValue(key, rowData[key as keyof typeof rowData])}
                            />
                        ))}
                    </div>
                    {'followUps' in rowData && (rowData.followUps?.length ?? 0) > 0 && (
                        <div className="mt-4">
                            <p className="text-muted-foreground mb-2 text-xs font-semibold uppercase tracking-wide">
                                Follow Ups
                            </p>
                            <ul className="space-y-2">
                                {rowData.followUps?.map((f, i) => (
                                    <li key={i} className="border-border border-t py-2">
                                        <Info label="Remarks" value={f?.remarks ?? 'No remarks'} />
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}

function Info({ label, value }: { label: string; value: string }) {
    return (
        <div className="border-b border-border py-3 last:border-0">
            <p className="text-muted-foreground mb-0.5 text-xs font-medium uppercase tracking-wide">
                {label}
            </p>
            <p className="text-sm text-foreground">{value}</p>
        </div>
    )
}
