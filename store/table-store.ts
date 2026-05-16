import { Hospital } from '@/schema/hospital'
import { Patient } from '@/schema/patient'
import { UserDoc } from '@/schema/user'
import { create } from 'zustand'

type TableRow = Patient | Hospital | UserDoc | null

export const isPatient = (row: any): row is Patient => row && 'patientId' in row
export const isHospital = (row: any): row is Hospital => row && 'hospitalId' in row
export const isUserDoc = (row: any): row is UserDoc => row && 'userId' in row

interface TableState {
    selectedRow: TableRow
    modal: 'view' | 'update' | 'delete' | 'bulkDelete' | null
    setSelectedRow: (row: TableRow | null) => void
    openModal: (type: 'view' | 'update' | 'delete' | 'bulkDelete') => void
    closeModal: () => void
}

export const useTableStore = create<TableState>((set) => ({
    selectedRow: null,
    modal: null,
    setSelectedRow: (row) => set({ selectedRow: row }),
    openModal: (type) => set({ modal: type }),
    closeModal: () => set({ modal: null, selectedRow: null }),
}))
