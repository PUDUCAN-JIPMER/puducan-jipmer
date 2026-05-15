'use client'

import { Patient } from '@/schema'
import { useState } from 'react'
import { PatientHeader } from '.'
import { PatientWizardDialog } from './Patientwizarddialog'

export default function PatientFormMobile({ patient }: { patient: Patient }) {
    const [dialogOpen, setDialogOpen] = useState(false)

    return (
        <>
            {/* Clickable patient card */}
            <div
                role="button"
                tabIndex={0}
                onClick={() => setDialogOpen(true)}
                onKeyDown={(e) => e.key === 'Enter' && setDialogOpen(true)}
                className="w-full rounded-xl border border-border bg-card text-card-foreground shadow-sm cursor-pointer transition-all hover:shadow-md hover:border-primary/30 active:scale-[0.995]"
            >
                <PatientHeader
                    name={patient.name}
                    address={patient.address}
                    isOpen={false}
                    onToggle={() => setDialogOpen(true)}
                    diseases={patient.diseases}
                    patientStatus={patient.patientStatus}
                    suspectedCase={patient.suspectedCase}
                />
            </div>

            {/* Wizard dialog */}
            <PatientWizardDialog
                patient={patient}
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
            />
        </>
    )
}