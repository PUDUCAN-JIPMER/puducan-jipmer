'use client'

import { DiseasesCell, PhoneCell, StatusCell } from '.'
import { dobToAgeUtil } from '@/lib/patient/dobToAge'
import { formatDobToDDMMYYYY } from '@/lib/patient/dateFormatter'
<<<<<<< Updated upstream
import { TriageCell, TriageLevel } from './TriageCell'
=======
import { RiskBadge } from '@/components/common/RiskBadge'
import { TriageCell, TriageLevel } from './TriageCell' // Import Triage components
>>>>>>> Stashed changes

type GenericCellProps = {
    value: unknown
    keyName: string
    isPatientTab?: boolean
}

export function GenericCell({ value, keyName, isPatientTab }: GenericCellProps) {
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

<<<<<<< Updated upstream
        case 'triageLevel':
            return <TriageCell level={value as TriageLevel} />

        default:
            return <span>{String(value ?? '')}</span>
    }
=======
    case 'triageLevel':
      // Rendering the TriageCell based on the value passed
      return <TriageCell level={value as TriageLevel} />

    case 'sex':
      return <span className="capitalize">{value as string}</span>

    default:
      return <span>{String(value ?? '')}</span>
  }
>>>>>>> Stashed changes
}