'use client'

import { Patient } from '@/schema'
import { useState } from 'react'
import { PatientHeader } from '.'  
import { PatientWizardDialog } from './PatientWizardDialog'

export default function PatientFormMobile({ patient }: { patient: Patient }) {

/**
 * Simple placeholder geographic dashboard.
 * In a full implementation this would render a map (e.g., using Leaflet or Google Maps)
 * and plot patient locations based on their address/locality.
 */
export function GeographicDashboard({ patients }: { patients: Patient[] }) {
  return (
    <section className="my-4 p-4 border rounded-lg bg-muted">
      <h2 className="text-lg font-semibold mb-2">Geographic Dashboard</h2>
      {/* Placeholder content – replace with map visualisation */}
      <p className="text-sm text-gray-600">
        Showing {patients.length} patient{patients.length !== 1 ? 's' : ''} on the map.
      </p>
      <div className="h-64 bg-gray-200 flex items-center justify-center">
        <span className="text-gray-500">[Map visualization goes here]</span>
      </div>
    </section>
  );
}
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
                    diseases={patient.diseases}
                    patientStatus={patient.patientStatus}
                    suspectedCase={patient.suspectedCase}
                    _hasPendingWrites={patient._hasPendingWrites}
                    patient={patient}
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
