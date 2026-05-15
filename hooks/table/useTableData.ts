import { db } from '@/firebase'
import { Patient } from '@/schema/patient'
import { Hospital } from '@/schema/hospital'
import { UserDoc } from '@/schema/user'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { collection, getDocs, onSnapshot, query, where } from 'firebase/firestore'
import { useEffect, useMemo } from 'react'

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

export const useTableData = ({ orgId, ashaId, enabled = true, requiredData }: UsePatientsProps) => {
    const queryClient = useQueryClient()

    // 1. Memoize queryKey to avoid infinite effect triggers
    const queryKeyValue = useMemo(() => {
        if (!requiredData) return ['none']
        if (requiredData === 'patients') {
            if (orgId) return ['patients', { orgId }]
            if (ashaId) return ['patients', { ashaId }]
            return ['patients']
        }
        if (['ashas', 'doctors', 'nurses'].includes(requiredData)) {
            return ['users', requiredData]
        }
        return [requiredData]
    }, [requiredData, orgId, ashaId])

    const isPatients = requiredData === 'patients'
    const isHospitals = requiredData === 'hospitals'
    const isUsers = ['ashas', 'doctors', 'nurses'].includes(requiredData as string)
    const isRemoved = requiredData === 'removedPatients'

    const fetchEnabled = enabled && !!requiredData && (isPatients || isHospitals || isUsers || isRemoved)

    // 2. Single unified useQuery (Hooks must be top-level and unconditional)
    const tableQuery = useQuery<any[], Error>({
        queryKey: queryKeyValue,
        queryFn: async () => {
            if (!requiredData) return []

            if (isHospitals) {
                const hospitalQuery = query(collection(db, 'hospitals'))
                const hospitalsSnap = await getDocs(hospitalQuery)
                return hospitalsSnap.docs.map((hos) => ({
                    id: hos.id,
                    ...hos.data(),
                })) as Hospital[]
            }

            if (isUsers) {
                const usersQueryRef = query(
                    collection(db, 'users'),
                    where('role', '==', cutLastCharacter(requiredData))
                )
                const usersSnap = await getDocs(usersQueryRef)
                return usersSnap.docs.map((user) => ({
                    id: user.id,
                    ...(user.data() as Omit<UserDoc, 'id'>),
                })) as UserDoc[]
            }

            if (isPatients) {
                let patientsQueryRef
                if (orgId) {
                    patientsQueryRef = query(collection(db, 'patients'))
                } else if (ashaId) {
                    patientsQueryRef = query(
                        collection(db, 'patients'),
                        where('assignedAsha', '==', ashaId)
                    )
                } else {
                    patientsQueryRef = query(collection(db, 'patients'))
                }
                const patientsSnap = await getDocs(patientsQueryRef)
                return patientsSnap.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                    _hasPendingWrites: doc.metadata.hasPendingWrites,
                })) as Patient[]
            }

            if (isRemoved) {
                const removedPatientsQueryRef = query(collection(db, 'removedPatients'))
                const removedPatientsSnap = await getDocs(removedPatientsQueryRef)
                return removedPatientsSnap.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })) as Patient[]
            }

            return []
        },
        enabled: fetchEnabled,
        staleTime: 60 * 1000,
    })

    // 3. Unified Real-time listener for metadata changes (Sync status)
    useEffect(() => {
        if (!fetchEnabled || !isPatients) return

        let patientsRef
        if (orgId) {
            patientsRef = query(collection(db, 'patients'))
        } else if (ashaId) {
            patientsRef = query(
                collection(db, 'patients'),
                where('assignedAsha', '==', ashaId)
            )
        } else {
            patientsRef = query(collection(db, 'patients'))
        }

        const unsubscribe = onSnapshot(
            patientsRef,
            { includeMetadataChanges: true },
            (snapshot) => {
                const data = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                    _hasPendingWrites: doc.metadata.hasPendingWrites,
                })) as Patient[]

                // Update TanStack Query cache with real-time data + metadata push
                queryClient.setQueryData(queryKeyValue, data)
            }
        )

        return () => unsubscribe()
    }, [fetchEnabled, isPatients, orgId, ashaId, queryClient, queryKeyValue])

    return tableQuery
}
