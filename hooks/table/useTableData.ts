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
    // Use the slice method to get a substring from the beginning up to the second-to-last character.
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

export const useTableData = ({ orgId, ashaId, enabled = true, requiredData }: UsePatientsProps) => {
    // console.log('inside custom user hook')
    const isPatientsEnabled = requiredData === 'patients' ? true : enabled && (!!orgId || !!ashaId)
    const isHospitalsEnabled = enabled && requiredData === 'hospitals'
    const isUsersEnabled =
        enabled &&
        (requiredData === 'ashas' || requiredData === 'doctors' || requiredData === 'nurses')

    // Now you return the appropriate query result based on the props.
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
    if (requiredData === 'ashas' || requiredData === 'doctors' || requiredData === 'nurses') {
        const usersQuery = useQuery<UserDoc[], Error>({
            queryKey: ['users', requiredData],
            queryFn: async () => {
                const usersQuery = query(
                    collection(db, 'users'),
                    where('role', '==', cutLastCharacter(requiredData))
                )
                const usersSnap = await getDocs(usersQuery)
                return usersSnap.docs.map((user) => ({
                    id: user.id, // Firestore document ID
                    ...(user.data() as Omit<UserDoc, 'id'>), // spread the rest of the user fields
                })) as UserDoc[]
            },
            enabled: isUsersEnabled,
            staleTime: 60 * 1000,
        })
        return usersQuery
    }

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
                    patientsQuery = query(
                    collection(db, 'patients'),
                    where('assignedHospital.id', '==', orgId)
                    )
        }
                 else if (ashaId) {
                    patientsQuery = query(
                        collection(db, 'patients'),
                        where('assignedAsha', '==', ashaId)
                    )
                } else if (requiredData === 'patients') {
                    patientsQuery = query(collection(db, 'patients'))
                } else {
                    throw new Error('No organization Id or Asha email provided to fetch patients')
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

    if (requiredData === 'removedPatients') {
        let queryKeyValue

        queryKeyValue = ['removedPatients']

        const patientsQuery = useQuery<Patient[], Error>({
            queryKey: queryKeyValue,

            queryFn: async () => {
                let removedPatientsQuery

                removedPatientsQuery = query(collection(db, 'removedPatients'))

                const removedPatientsSnap = await getDocs(removedPatientsQuery)
                return removedPatientsSnap.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })) as Patient[]
            },
            staleTime: 60 * 1000,
        })
        return patientsQuery
    }
}
