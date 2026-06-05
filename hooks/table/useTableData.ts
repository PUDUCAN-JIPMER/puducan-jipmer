import { db } from '@/firebase'
import { Patient } from '@/schema/patient'
import { Hospital } from '@/schema/hospital'
import { UserDoc } from '@/schema/user'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  startAt,
  endAt,
  startAfter,
  limit,
  onSnapshot,
  DocumentSnapshot,
  QueryDocumentSnapshot,
} from 'firebase/firestore'
import { useEffect, useMemo } from 'react'
import { useDebounce } from '@/hooks/useDebounce'

function cutLastCharacter(str: string | undefined): string | undefined {
  return str?.slice(0, -1)
}

const DEFAULT_PAGE_SIZE = 50

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
  searchTerm?: string
  pageSize?: number
  cursor?: QueryDocumentSnapshot | null
}

export const useTableData = ({
  orgId,
  ashaId,
  enabled = true,
  requiredData,
  searchTerm,
  pageSize,
  cursor,
}: UsePatientsProps) => {
  const queryClient = useQueryClient()
  const debouncedSearch = useDebounce(searchTerm ?? '', 300)
  const shouldSearch = debouncedSearch.length > 0

  const isPatients = requiredData === 'patients'
  const isHospitals = requiredData === 'hospitals'
  const isUsers = ['ashas', 'doctors', 'nurses'].includes(requiredData as string)
  const isRemoved = requiredData === 'removedPatients'

  const effectiveLimit = pageSize ?? 10000
  const isPaginated = pageSize !== undefined

  const queryKeyValue = useMemo(() => {
    if (!requiredData) return ['none']
    const base: unknown[] = [requiredData]
    if (isPatients) {
      if (orgId) base.push({ orgId })
      if (ashaId) base.push({ ashaId })
    }
    if (shouldSearch) base.push({ search: debouncedSearch })
    if (isPaginated) {
      base.push({ pageSize })
      if (cursor) base.push({ cursor: cursor.id })
      else base.push({ cursor: null })
    }
    return base
  }, [requiredData, orgId, ashaId, shouldSearch, debouncedSearch, isPaginated, pageSize, cursor, isPatients])

  const fetchEnabled = enabled && !!requiredData

  const tableQuery = useQuery<{ data: any[]; lastDoc: QueryDocumentSnapshot | null } | any[], Error>({
    queryKey: queryKeyValue,
    queryFn: async () => {
      if (!requiredData) return { data: [], lastDoc: null }

      const buildPaginatedQuery = (baseQuery: any) => {
        let q = baseQuery
        if (shouldSearch) {
          q = query(q, orderBy('name'), startAt(debouncedSearch.toLowerCase()), endAt(debouncedSearch.toLowerCase() + '\uf8ff'))
        }
        if (isPaginated) {
          q = query(q, orderBy('name'), limit(effectiveLimit))
          if (cursor) {
            q = query(q, startAfter(cursor))
          }
        }
        return q
      }

      if (isHospitals) {
        const base = query(collection(db, 'hospitals'))
        const q = buildPaginatedQuery(base)
        const snap = await getDocs(q)
        const docs = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Hospital[]
        return { data: docs, lastDoc: snap.docs[snap.docs.length - 1] ?? null }
      }

      if (isUsers) {
        const roleFilter = cutLastCharacter(requiredData)
        const base = query(collection(db, 'users'), where('role', '==', roleFilter))
        const q = buildPaginatedQuery(base)
        const snap = await getDocs(q)
        const docs = snap.docs.map((doc) => ({ id: doc.id, ...(doc.data() as Omit<UserDoc, 'id'>) })) as UserDoc[]
        return { data: docs, lastDoc: snap.docs[snap.docs.length - 1] ?? null }
      }

      if (isPatients) {
        let base
        if (orgId) {
          base = query(collection(db, 'patients'), where('assignedHospital.id', '==', orgId))
        } else if (ashaId) {
          base = query(collection(db, 'patients'), where('assignedAsha', '==', ashaId))
        } else {
          base = query(collection(db, 'patients'))
        }
        const q = buildPaginatedQuery(base)
        const snap = await getDocs(q)
        const docs = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          _hasPendingWrites: doc.metadata.hasPendingWrites,
        })) as Patient[]
        return { data: docs, lastDoc: snap.docs[snap.docs.length - 1] ?? null }
      }

      if (isRemoved) {
        const base = query(collection(db, 'removedPatients'))
        const q = buildPaginatedQuery(base)
        const snap = await getDocs(q)
        const docs = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Patient[]
        return { data: docs, lastDoc: snap.docs[snap.docs.length - 1] ?? null }
      }

      return { data: [], lastDoc: null }
    },
    enabled: fetchEnabled,
    staleTime: 60 * 1000,
  })

  useEffect(() => {
    if (!fetchEnabled || !isPatients || isPaginated) return

    let patientsRef
    if (orgId) {
      patientsRef = query(collection(db, 'patients'), where('assignedHospital.id', '==', orgId))
    } else if (ashaId) {
      patientsRef = query(collection(db, 'patients'), where('assignedAsha', '==', ashaId))
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
        queryClient.setQueryData(queryKeyValue, { data, lastDoc: null })
      }
    )

    return () => unsubscribe()
  }, [fetchEnabled, isPatients, orgId, ashaId, queryClient, queryKeyValue, isPaginated])

  return tableQuery
}