'use client'

import { DiseasesCell, PhoneCell, StatusCell } from '.'
import { dobToAgeUtil } from '@/lib/patient/dobToAge'
import { formatDobToDDMMYYYY } from '@/lib/patient/dateFormatter'
import { RiskBadge } from '@/components/common/RiskBadge'
import { TriageCell, TriageLevel } from './TriageCell'

type GenericCellProps = {
    value: unknown
    keyName: string
    isPatientTab?: boolean
    rowData?: any
}

export function GenericCell({ value, keyName, isPatientTab, rowData }: GenericCellProps) {
    switch (keyName) {
        case 'phoneNumber':
        case 'contactNumber':
            return <PhoneCell phoneNumbers={value as string[]} isPatientTab={isPatientTab ?? false} />

        case 'dob':
            return <span>{dobToAgeUtil(formatDobToDDMMYYYY(value as string))}</span>

        case 'diseases':
            return <DiseasesCell diseases={(value as string[]) ?? []} />

        case 'patientStatus':
            return <StatusCell status={value as string} />

        case 'sex':
            return <span className="capitalize">{value as string}</span>

        case 'triageLevel':
            return <TriageCell level={value as TriageLevel} />

        case 'riskLevel':
            return <RiskBadge patient={rowData || {}} />

        default:
            return <span>{String(value ?? '')}</span>
    }
}