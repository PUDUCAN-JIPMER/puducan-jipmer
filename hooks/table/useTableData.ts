import { db } from '@/firebase'
import { Patient } from '@/schema/patient'
import { Hospital } from '@/schema/hospital'
import { UserDoc } from '@/schema/user'
import { useQuery } from '@tanstack/react-query'
import { collection, getDocs, query, where, orderBy, startAt, endAt, limit } from 'firebase/firestore'
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

export const useTableData = ({ orgId, ashaId, enabled = true, requiredData, searchTerm }: UsePatientsProps) => {
  const debouncedSearch = useDebounce(searchTerm ?? '', 300)
  const shouldSearch = debouncedSearch.length > 0

  // ── Hospitals (always fetched when tab is hospitals, no search overrides yet) ──
  if (requiredData === 'hospitals') {
    const hospitalsQuery = useQuery<Hospital[], Error>({
      queryKey: ['hospitals', { search: debouncedSearch }],
      queryFn: async () => {
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
      },
      enabled,
      staleTime: 60 * 1000,
    })
    return hospitalsQuery
  }

  // ── Users (doctors/nurses/ashas) ──
  if (requiredData === 'ashas' || requiredData === 'doctors' || requiredData === 'nurses') {
    const roleFilter = cutLastCharacter(requiredData) // 'asha','doctor','nurse'
    const usersQuery = useQuery<UserDoc[], Error>({
      queryKey: ['users', requiredData, { search: debouncedSearch }],
      queryFn: async () => {
        let usersQuery
        if (shouldSearch) {
          usersQuery = query(
            collection(db, 'users'),
            where('role', '==', roleFilter),
            orderBy('name'),
            startAt(debouncedSearch.toLowerCase()),
            endAt(debouncedSearch.toLowerCase() + '\uf8ff'),
            limit(SEARCH_LIMIT)
          )
        } else {
          usersQuery = query(
            collection(db, 'users'),
            where('role', '==', roleFilter)
          )
        }
        const usersSnap = await getDocs(usersQuery)
        return usersSnap.docs.map((user) => ({
          id: user.id,
          ...(user.data() as Omit<UserDoc, 'id'>),
        })) as UserDoc[]
      },
      enabled,
      staleTime: 60 * 1000,
    })
    return usersQuery
  }

  // ── Patients ──
  if (requiredData === 'patients') {
    let queryKeyValue: unknown[] = ['patients']
    if (orgId) queryKeyValue.push({ orgId })
    else if (ashaId) queryKeyValue.push({ ashaId })
    if (shouldSearch) queryKeyValue.push({ search: debouncedSearch })

    const patientsQuery = useQuery<Patient[], Error>({
      queryKey: queryKeyValue,
      queryFn: async () => {
        let patientsQuery
        if (orgId) {
          patientsQuery = query(
            collection(db, 'patients'),
            where('assignedHospital.id', '==', orgId)
          )
        } else if (ashaId) {
          patientsQuery = query(
            collection(db, 'patients'),
            where('assignedAsha', '==', ashaId)
          )
        } else {
          patientsQuery = query(collection(db, 'patients'))
        }

        // If searching, add orderBy + startAt/endAt on name
        if (shouldSearch) {
          patientsQuery = query(
            patientsQuery,
            orderBy('name'),
            startAt(debouncedSearch.toLowerCase()),
            endAt(debouncedSearch.toLowerCase() + '\uf8ff'),
            limit(SEARCH_LIMIT)
          )
        }

        const patientsSnap = await getDocs(patientsQuery)
        return patientsSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Patient[]
      },
      enabled: true,
      staleTime: 60 * 1000,
    })
    return patientsQuery
  }

  // ── removedPatients (no search needed) ──
  if (requiredData === 'removedPatients') {
    const patientsQuery = useQuery<Patient[], Error>({
      queryKey: ['removedPatients'],
      queryFn: async () => {
        const removedPatientsSnap = await getDocs(collection(db, 'removedPatients'))
        return removedPatientsSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Patient[]
      },
      staleTime: 60 * 1000,
    })
    return patientsQuery
  }

  // fallback
  return { data: undefined, isLoading: false } as any
}