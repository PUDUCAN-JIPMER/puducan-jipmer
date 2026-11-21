'use client'

import { Patient } from '@/schema'
import { useState, useRef } from 'react'
import { PatientHeader } from '.'  
import { PatientWizardDialog } from './PatientWizardDialog'
import { importData } from '@/lib/import/importUtils'

export default function PatientFormMobile({ patient }: { patient: Patient }) {
    const [dialogOpen, setDialogOpen] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [importReport, setImportReport] = useState<any>(null)
    const [previewOpen, setPreviewOpen] = useState(false)

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

            {/* Import button */}
            <div className="my-4">
                <button
                    className="px-4 py-2 bg-blue-600 text-white rounded"
                    onClick={() => fileInputRef.current?.click()}
                >
                    Import Patients
                </button>
                <input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={async (e) => {
                        const report = await importData(e, null)
                        setImportReport(report)
                        setPreviewOpen(true)
                    }}
                />
            </div>

            {/* Simple preview modal */}
            {previewOpen && importReport && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded max-w-lg w-full overflow-auto max-h-[80vh]">
                        <h2 className="text-xl font-semibold mb-4">Import Preview</h2>
                        <h3 className="font-medium">Valid Rows (first 10)</h3>
                        <table className="w-full table-auto mb-4">
                            <thead>
                                <tr>
                                    <th className="border px-2 py-1">#</th>
                                    <th className="border px-2 py-1">Name</th>
                                    <th className="border px-2 py-1">DOB</th>
                                    <th className="border px-2 py-1">Hospital</th>
                                </tr>
                            </thead>
                            <tbody>
                                {importReport.validRows.slice(0, 10).map((row: any, idx: number) => (
                                    <tr key={idx}>
                                        <td className="border px-2 py-1 text-center">{idx + 1}</td>
                                        <td className="border px-2 py-1">{row.name}</td>
                                        <td className="border px-2 py-1">{row.dob}</td>
                                        <td className="border px-2 py-1">{row.assignedHospital?.name}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <h3 className="font-medium">Errors</h3>
                        <ul className="list-disc pl-5 mb-4">
                            {importReport.errors.map((e: any, idx: number) => (
                                <li key={idx}>Row {e.row}: {e.issues.join(', ')}</li>
                            ))}
                        </ul>
                        <button
                            className="px-4 py-2 bg-gray-300 rounded mr-2"
                            onClick={() => setPreviewOpen(false)}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </>
    )
}
