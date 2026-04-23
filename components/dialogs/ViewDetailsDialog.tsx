'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import RiskScoreBadge from '@/components/ui/RiskScoreBadge'
import { useRiskScore } from '@/hooks/useRiskScore'
import { Patient } from '@/schema/patient'
import { UserDoc } from '@/schema/user'
import { Hospital } from '@/schema/hospital'

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
    // Use the generic type here
    rowData: RowDataType
    fieldsToDisplay: FieldToDisplay[]
}) {
    // Determine if this is a patient record (has 'dob' field) for risk scoring
    const isPatientRecord = 'dob' in rowData
    const risk = useRiskScore(isPatientRecord ? (rowData as Patient) : null)

    // Helper function to render specific data types
    function renderValue(key: string, value: any): string {
        if (value == null) return 'N/A'

        if (Array.isArray(value)) {
            // diseases: ["cancer", "diabetes"]
            if (typeof value[0] === 'string') return value.join(', ')
            // followUps: [{ date, remarks }]
            if (typeof value[0] === 'object') {
                return value.map((v) => `${v.date || ''} - ${v.remarks || ''}`).join('; ')
            }
        }

        if (typeof value === 'object') {
            if (key === 'gpsLocation') return `Lat: ${value.lat}, Lng: ${value.lng}`
            if (key === 'assignedHospital') return `${value.name} (ID: ${value.id})`
            if (key === 'insurance') return `${value.type}${value.id ? ` (${value.id})` : ''}`
            return JSON.stringify(value) // fallback
        }

        if (typeof value === 'boolean') return value ? 'Yes' : 'No'

        return String(value)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-card text-card-foreground rounded-xl shadow-md md:w-1/2 lg:w-1/3">
                <DialogHeader>
                    {/* Make the title dynamic based on the data */}
                    <DialogTitle className="text-lg font-semibold">
                        Details of {rowData['name']}
                    </DialogTitle>
                    {/* Show ML risk score badge for patient records */}
                    {risk && (
                        <div className="mt-2">
                            <RiskScoreBadge risk={risk} />
                        </div>
                    )}
                </DialogHeader>
                <ScrollArea className="max-h-[70vh] pr-2">
                    <div className="grid gap-6 text-sm md:grid-cols-2">
                        {/* Dynamically render the fields */}
                        {fieldsToDisplay.map(({ label, key }) => (
                            <Info
                                key={key as string}
                                label={label}
                                value={renderValue(key, rowData[key as keyof typeof rowData])}
                            />
                        ))}
                    </div>
                    {/* Follow-ups section can be a conditional render */}
                    {'followUps' in rowData && (rowData.followUps?.length ?? 0) > 0 && (
                        <div className="md:col-span-2">
                            <p className="mt-4 font-semibold">Follow Ups:</p>
                            <ul className="mt-2 space-y-3">
                                {rowData.followUps?.map((f, i) => (
                                    <li
                                        key={i}
                                        className="border-border bg-muted/20 rounded-lg border p-3"
                                    >
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
        <p>
            <span className="text-muted-foreground font-medium">{label}:</span> <span>{value}</span>
        </p>
    )
}
