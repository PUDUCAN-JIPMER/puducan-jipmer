'use client'

import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { db } from '@/firebase'
import { cn } from '@/lib/utils'
import { collection, getDocs, limit, orderBy, query, startAt, endAt, where } from 'firebase/firestore'
import { Check, ChevronsUpDown } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useDebounce } from '@/hooks/useDebounce'

type Hospital = {
  id: string
  name: string
  address: string
}

interface HospitalOption {
  id: string
  name: string
}

interface HospitalSearchProps {
  value?: { id: string; name: string }
  onChange?: (value: { id: string; name: string }) => void
}

const SEARCH_DEBOUNCE_MS = 300
const MAX_RESULTS = 5

export default function HospitalSearch({ value, onChange }: HospitalSearchProps) {
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)

  const debouncedTerm = useDebounce(searchTerm, SEARCH_DEBOUNCE_MS)

  // Firestore search – triggered only when debounced term changes and panel is open
  useEffect(() => {
    if (!debouncedTerm) {
      setHospitals([])
      return
    }

    let active = true
    const fetchHospitals = async () => {
      setLoading(true)
      try {
        const searchStr = debouncedTerm.toLowerCase()

        // Firestore prefix search on name field
        const q = query(
          collection(db, 'hospitals'),
          orderBy('name'),
          startAt(searchStr),
          endAt(searchStr + '\uf8ff'),
          limit(MAX_RESULTS)
        )
        const snapshot = await getDocs(q)
        if (!active) return
        const list: Hospital[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Hospital, 'id'>),
        }))
        setHospitals(list)
      } catch (error) {
        console.error('Error searching hospitals:', error)
      } finally {
        if (active) setLoading(false)
      }
    }

    fetchHospitals()
    return () => { active = false }
  }, [debouncedTerm])

  const selectedHospitalName =
    hospitals.find((hospital) => hospital.id === value?.id)?.name || 'Select Hospital...'

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="!bg-background w-full justify-between !border-red-400"
        >
          <span className="text-muted-foreground truncate text-sm">
            {selectedHospitalName}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput
            placeholder="Search hospital..."
            onValueChange={(search) => setSearchTerm(search)}
          />
          <CommandEmpty>
            {loading ? 'Searching…' : 'No hospital found.'}
          </CommandEmpty>
          <CommandGroup>
            {hospitals.map((hospital) => (
              <CommandItem
                key={hospital.id}
                value={hospital.name}
                onSelect={() => {
                  onChange?.({
                    id: hospital.id,
                    name: hospital.name,
                  })
                  setOpen(false)
                }}
              >
                <Check
                  className={cn(
                    'mr-2 h-4 w-4',
                    value?.id === hospital.id ? 'opacity-100' : 'opacity-0'
                  )}
                />
                <div>
                  <p className="font-medium">{hospital.name}</p>
                  <p className="text-muted-foreground text-xs">{hospital.address}</p>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}