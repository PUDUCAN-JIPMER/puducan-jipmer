'use client'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
    DISEASE_OPTIONS,
    PATIENT_STATUS_OPTIONS,
    RATION_COLORS_OPTIONS,
    SEX_OPTIONS,
} from '@/constants/form-fields'
import { usePatientFilterStore } from '@/store/patient-filter-store'
import { ListFilter } from 'lucide-react'
import { useEffect, useRef } from 'react'

export function PatientFilter() {
    const searchRef = useRef<HTMLInputElement>(null)
    const { filters, setFilter, toggleFilterItem, reset } = usePatientFilterStore()

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.key.toLowerCase() === 'k') {
                e.preventDefault()
                searchRef.current?.focus()
            }
        }
        window.addEventListener('keydown', handleKey)
        return () => window.removeEventListener('keydown', handleKey)
    }, [])

    return (
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
            {/* Filters */}
            <Popover>
                <PopoverTrigger asChild>
                    <Button className="cursor-pointer" variant="outline">
                        <ListFilter className="mr-1 h-4 w-4" />
                        <span className='hidden md:inline'>Filters</span>
                    </Button>
                </PopoverTrigger>

                <PopoverContent className="w-auto px-10 py-6">
                    <div className="flex flex-col sm:grid sm:grid-cols-2 gap-6">
                        {/* Sex */}
                        <FilterGroup
                            label="Sex"
                            options={SEX_OPTIONS}
                            selected={filters.sexes}
                            onToggle={(val) => toggleFilterItem('sexes', val)}
                        />

                        {/* Disease */}
                        <FilterGroup
                            label="Disease"
                            options={DISEASE_OPTIONS}
                            selected={filters.diseases}
                            onToggle={(val) => toggleFilterItem('diseases', val)}
                        />

                        {/* Status */}
                        <FilterGroup
                            label="Status"
                            options={PATIENT_STATUS_OPTIONS}
                            selected={filters.statuses}
                            onToggle={(val) => toggleFilterItem('statuses', val)}
                        />

                        {/* Ration Card */}
                        <FilterGroup
                            label="Ration Card"
                            options={RATION_COLORS_OPTIONS}
                            selected={filters.rationColors}
                            onToggle={(val) => toggleFilterItem('rationColors', val)}
                        />
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    )
}

function FilterGroup({
    label,
    options,
    selected,
    onToggle,
}: {
    label: string
    options: string[]
    selected: string[]
    onToggle: (val: string) => void
}) {
    return (
        <div className="min-w-[150px]">
            <Label className="text-sm font-medium">{label}</Label>
            <div className="mt-2 space-y-1">
                {options.map((option) => (
                    <div key={option} className="flex items-center space-x-2">
                        <Checkbox
                            id={`${label}-${option}`}
                            checked={selected.includes(option)}
                            onCheckedChange={() => onToggle(option)}
                        />
                        <Label htmlFor={`${label}-${option}`} className="capitalize">
                            {option}
                        </Label>
                    </div>
                ))}
            </div>
        </div>
    )
}
