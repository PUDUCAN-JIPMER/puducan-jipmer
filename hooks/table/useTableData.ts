import { db } from '@/firebase'
import { Patient } from '@/schema/patient'
import { Hospital } from '@/schema/hospital'
import { UserDoc } from '@/schema/user'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  collection,
  getDocs,
  onSnapshot,
  query,
  where,
  orderBy,
  startAt,
  endAt,
  limit,
} from 'firebase/firestore'
import { useEffect, useMemo } from 'react'
import { useDebounce } from '@/hooks/useDebounce'

/**
 * Removes the last character from a string.
 */
function cutLastCharacter(str: string | undefined): string | undefined {
  return str?.slice(0, -1)
}

const SEARCH_LIMIT = 50

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
  /** When provided, the hook will build a filtered Firestore query instead of fetching all docs. */
  searchTerm?: string
}

export const useTableData = ({
  orgId,
  ashaId,
  enabled = true,
  requiredData,
  searchTerm,
}: UsePatientsProps) => {
  const queryClient = useQueryClient()
  const debouncedSearch = useDebounce(searchTerm ?? '', 300)
  const shouldSearch = debouncedSearch.length > 0

  const isPatients = requiredData === 'patients'
  const isHospitals = requiredData === 'hospitals'
  const isUsers = ['ashas', 'doctors', 'nurses'].includes(requiredData as string)
  const isRemoved = requiredData === 'removedPatients'

  // 1. Memoize queryKey to avoid infinite effect triggers
  const queryKeyValue = useMemo(() => {
    if (!requiredData) return ['none']
    const base: unknown[] = [requiredData]
    if (isPatients) {
      if (orgId) base.push({ orgId })
      if (ashaId) base.push({ ashaId })
    }
    if (shouldSearch) base.push({ search: debouncedSearch })
    return base
  }, [requiredData, orgId, ashaId, shouldSearch, debouncedSearch, isPatients])

  const fetchEnabled = enabled && !!requiredData

  // 2. Single unified useQuery (Hooks must be top-level and unconditional)
  const tableQuery = useQuery<any[], Error>({
    queryKey: queryKeyValue,
    queryFn: async () => {
      if (!requiredData) return []

      if (isHospitals) {
        let hospitalQuery
        if (shouldSearch) {
          hospitalQuery = query(
            collection(db, 'hospitals'),
            orderBy('name'),
            startAt(debouncedSearch.toLowerCase()),
            endAt(debouncedSearch.toLowerCase() + '\uf8ff'),
            limit(SEARCH_LIMIT)
          )
        } else {
          hospitalQuery = query(collection(db, 'hospitals'))
        }
        const hospitalsSnap = await getDocs(hospitalQuery)
        return hospitalsSnap.docs.map((hos) => ({
          id: hos.id,
          ...hos.data(),
        })) as Hospital[]
      }

      if (isUsers) {
        const roleFilter = cutLastCharacter(requiredData)
        let usersQueryRef
        if (shouldSearch) {
          usersQueryRef = query(
            collection(db, 'users'),
            where('role', '==', roleFilter),
            orderBy('name'),
            startAt(debouncedSearch.toLowerCase()),
            endAt(debouncedSearch.toLowerCase() + '\uf8ff'),
            limit(SEARCH_LIMIT)
          )
        } else {
          usersQueryRef = query(
            collection(db, 'users'),
            where('role', '==', roleFilter)
          )
        }
        const usersSnap = await getDocs(usersQueryRef)
        return usersSnap.docs.map((user) => ({
          id: user.id,
          ...(user.data() as Omit<UserDoc, 'id'>),
        })) as UserDoc[]
      }

      if (isPatients) {
        let patientsQueryRef
        if (orgId) {
          patientsQueryRef = query(
            collection(db, 'patients'),
            where('assignedHospital.id', '==', orgId)
          )
        } else if (ashaId) {
          patientsQueryRef = query(
            collection(db, 'patients'),
            where('assignedAsha', '==', ashaId)
          )
        } else {
          patientsQueryRef = query(collection(db, 'patients'))
        }

        if (shouldSearch) {
          patientsQueryRef = query(
            patientsQueryRef,
            orderBy('name'),
            startAt(debouncedSearch.toLowerCase()),
            endAt(debouncedSearch.toLowerCase() + '\uf8ff'),
            limit(SEARCH_LIMIT)
          )
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

  // 3. Unified real-time listener for metadata changes (Sync status)
  // Only active for patients, and only when not actively searching (search results
  // use one-time getDocs queries; live sync would conflict with the filtered view).
  useEffect(() => {
    if (!fetchEnabled || !isPatients || shouldSearch) return

    let patientsRef
    if (orgId) {
      patientsRef = query(
        collection(db, 'patients'),
        where('assignedHospital.id', '==', orgId)
      )
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

        queryClient.setQueryData(queryKeyValue, data)
      }
    )

    return () => unsubscribe()
  }, [fetchEnabled, isPatients, shouldSearch, orgId, ashaId, queryClient, queryKeyValue])

  return tableQuery
}
