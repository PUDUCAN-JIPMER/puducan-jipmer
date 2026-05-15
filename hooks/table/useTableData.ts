// hooks/table/useTableData.ts
import { db } from '@/firebase'
import { Patient } from '@/schema/patient'
import { Hospital } from '@/schema/hospital'
import { UserDoc } from '@/schema/user'
import { useQuery } from '@tanstack/react-query'
import { collection, getDocs, query, where } from 'firebase/firestore'

/**
 * Removes the last character from a string.
 * @param {string} str The input string.
 * @returns {string} The string with the last character removed.
 */
function cutLastCharacter(str: string | undefined): string | undefined {
    return str?.slice(0, -1)
}

type UsePatientsProps = {
    orgId?: string | null
    ashaId?: string | null | undefined
    enabled?: boolean
    requiredData?:
        | 'ashas'
        | 'doctors'
        | 'nurses'
        | 'hospitals'
        | 'patients'
        | 'removedPatients'
        | undefined
}

export const useTableData = ({
    orgId,
    ashaId,
    enabled = true,
    requiredData,
}: UsePatientsProps) => {
    const isPatientsEnabled =
        requiredData === 'patients'
            ? enabled && (!!orgId || !!ashaId)
            : false

    const isHospitalsEnabled =
        enabled && requiredData === 'hospitals'

    const isUsersEnabled =
        enabled &&
        (requiredData === 'ashas' ||
            requiredData === 'doctors' ||
            requiredData === 'nurses')

    // Hospitals
    if (requiredData === 'hospitals') {
        const hospitalsQuery = useQuery<Hospital[], Error>({
            queryKey: ['hospitals'],
            queryFn: async () => {
                const hospitalQuery = query(collection(db, 'hospitals'))
                const hospitalsSnap = await getDocs(hospitalQuery)

                return hospitalsSnap.docs.map((hos) => ({
                    id: hos.id,
                    ...hos.data(),
                })) as Hospital[]
            },
            enabled: isHospitalsEnabled,
            staleTime: 60 * 1000,
        })

        return hospitalsQuery
    }

    // Users
    if (
        requiredData === 'ashas' ||
        requiredData === 'doctors' ||
        requiredData === 'nurses'
    ) {
        const usersQuery = useQuery<UserDoc[], Error>({
            queryKey: ['users', requiredData],
            queryFn: async () => {
                const usersQuery = query(
                    collection(db, 'users'),
                    where('role', '==', cutLastCharacter(requiredData))
                )

                const usersSnap = await getDocs(usersQuery)

                return usersSnap.docs.map((user) => ({
                    id: user.id,
                    ...(user.data() as Omit<UserDoc, 'id'>),
                })) as UserDoc[]
            },
            enabled: isUsersEnabled,
            staleTime: 60 * 1000,
        })

        return usersQuery
    }

    // Patients
    if (requiredData === 'patients') {
        let queryKeyValue

        if (orgId) {
            queryKeyValue = ['patients', { orgId }]
        } else if (ashaId) {
            queryKeyValue = ['patients', { ashaId }]
        } else {
            queryKeyValue = ['patients']
        }

        const patientsQuery = useQuery<Patient[], Error>({
            queryKey: queryKeyValue,

            queryFn: async () => {
                let patientsQuery

                if (orgId) {
                    patientsQuery = query(collection(db, 'patients'))
                } else if (ashaId) {
                    patientsQuery = query(
                        collection(db, 'patients'),
                        where('assignedAsha', '==', ashaId)
                    )
                } else {
                    throw new Error(
                        'No organization Id or Asha email provided to fetch patients'
                    )
                }

                const patientsSnap = await getDocs(patientsQuery)

                return patientsSnap.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })) as Patient[]
            },

            enabled: isPatientsEnabled,
            staleTime: 60 * 1000,
        })

        return patientsQuery
    }

    // Removed Patients
    if (requiredData === 'removedPatients') {
        const patientsQuery = useQuery<Patient[], Error>({
            queryKey: ['removedPatients'],

            queryFn: async () => {
                const removedPatientsQuery = query(
                    collection(db, 'removedPatients')
                )

                const removedPatientsSnap = await getDocs(
                    removedPatientsQuery
                )

                return removedPatientsSnap.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })) as Patient[]
            },

            staleTime: 60 * 1000,
        })

        return patientsQuery
    }

    // Default empty query
    return useQuery({
        queryKey: ['empty'],
        queryFn: async () => [],
        enabled: false,
    })
}