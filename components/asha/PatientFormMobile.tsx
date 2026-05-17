'use client'

import { useAuth } from '@/contexts/AuthContext'
import { updatePatient } from '@/lib/api/patient.api'
import { Patient } from '@/schema'
import { PatientFormInputs, PatientSchema } from '@/schema/patient'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { ColumnFive, ColumnFour, ColumnOne, ColumnThree, ColumnTwo } from '../forms/patient'
import { PatientHeader, ActionButtons, SwipeableColumns } from '.'  
import { PatientWizardDialog } from './PatientWizardDialog'

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