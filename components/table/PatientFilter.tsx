'use client'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
} from '@/components/ui/sheet'
import {
    HEALTH_STATUS_OPTIONS,
    RATION_COLORS_OPTIONS,
    SEX_OPTIONS,
} from '@/constants/form-fields'
import { AVAILABLE_DISEASES_LIST } from '@/constants/diseases'
import { usePatientFilterStore } from '@/store/patient-filter-store'
import { ListFilter, X, RotateCcw } from 'lucide-react'
import { useMemo } from 'react'
import { cn } from '@/lib/utils'

const AGE_OPTIONS = [
    { label: 'Under 5 years', value: 'lt5' },
    { label: 'Under 20 years', value: 'lt20' },
    { label: 'Over 50 years', value: 'gt50' },
]

const ASSIGNED_OPTIONS = [
    { label: 'Assigned', value: 'assigned' },
    { label: 'Unassigned', value: 'unassigned' },
]

const TRANSFER_OPTIONS = [
    { label: 'Transferred', value: 'transferred' },
    { label: 'Not Transferred', value: 'not_transferred' },
]

export function PatientFilter() {
    const { filters, setFilter, toggleFilterItem, reset } = usePatientFilterStore()

    const activeFilterCount = useMemo(() => {
        let count = 0
        count += filters.sexes.length
        count += filters.diseases.length
        count += filters.statuses.length
        count += filters.rationColors.length
        if (filters.age) count++
        if (filters.assigned) count++
        if (filters.transfer) count++
        return count
    }, [filters])

    return (
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <Sheet>
                <SheetTrigger asChild>
                    <Button className="cursor-pointer" variant="outline">
                        <ListFilter className="mr-1 h-4 w-4" />
                        <span className="hidden md:inline">Filters</span>
                        {activeFilterCount > 0 && (
                            <span className="ml-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                                {activeFilterCount}
                            </span>
                        )}
                    </Button>
                </SheetTrigger>

                <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0 overflow-hidden border-l shadow-2xl">
                    <SheetHeader className="px-6 py-5 border-b bg-muted/30">
                        <div className="flex items-center justify-between">
                            <SheetTitle className="text-xl flex items-center gap-2">
                                <ListFilter className="h-5 w-5" />
                                Patient Filters
                            </SheetTitle>
                            {activeFilterCount > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={reset}
                                    className="h-8 px-3 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                                >
                                    <RotateCcw className="mr-2 h-3.5 w-3.5" />
                                    Clear All
                                </Button>
                            )}
                        </div>
                    </SheetHeader>

                    <ScrollArea className="flex-1 overflow-y-auto">
                        <div className="px-6 py-8 space-y-10">
                            {/* Demographics Group */}
                            <div className="space-y-5">
                                <h4 className="text-[12px] font-bold uppercase tracking-widest text-muted-foreground/60 flex items-center gap-2">
                                    <span className="h-px flex-1 bg-border/40" />
                                    Demographics
                                    <span className="h-px flex-1 bg-border/40" />
                                </h4>
                                <div className="space-y-8">
                                    <FilterSection
                                        label="Sex"
                                        options={SEX_OPTIONS.map((opt) => ({ label: opt, value: opt }))}
                                        selected={filters.sexes}
                                        onToggle={(val) => toggleFilterItem('sexes', val)}
                                        onClear={() => setFilter('sexes', [])}
                                    />
                                    <FilterSection
                                        label="Age Range"
                                        type="radio"
                                        options={AGE_OPTIONS}
                                        selected={filters.age}
                                        onSelect={(val) => setFilter('age', val)}
                                        onClear={() => setFilter('age', null)}
                                    />
                                </div>
                            </div>

                            {/* Medical Group */}
                            <div className="space-y-5">
                                <h4 className="text-[12px] font-bold uppercase tracking-widest text-muted-foreground/60 flex items-center gap-2">
                                    <span className="h-px flex-1 bg-border/40" />
                                    Medical
                                    <span className="h-px flex-1 bg-border/40" />
                                </h4>
                                <FilterSection
                                    label="Disease"
                                    options={Object.values(AVAILABLE_DISEASES_LIST)
                                        .flat()
                                        .map((d) => ({ label: d.label, value: d.label.toLowerCase() }))}
                                    selected={filters.diseases}
                                    onToggle={(val) => toggleFilterItem('diseases', val)}
                                    onClear={() => setFilter('diseases', [])}
                                    scrollable
                                />
                            </div>

                            {/* Status Group */}
                            <div className="space-y-5">
                                <h4 className="text-[12px] font-bold uppercase tracking-widest text-muted-foreground/60 flex items-center gap-2">
                                    <span className="h-px flex-1 bg-border/40" />
                                    Care Status
                                    <span className="h-px flex-1 bg-border/40" />
                                </h4>
                                <div className="space-y-8">
                                    <FilterSection
                                        label="Patient Status"
                                        options={HEALTH_STATUS_OPTIONS.map((opt) => ({ label: opt, value: opt }))}
                                        selected={filters.statuses}
                                        onToggle={(val) => toggleFilterItem('statuses', val)}
                                        onClear={() => setFilter('statuses', [])}
                                    />
                                    <div className="grid grid-cols-2 gap-6">
                                        <FilterSection
                                            label="Assignment"
                                            type="radio"
                                            options={ASSIGNED_OPTIONS}
                                            selected={filters.assigned}
                                            onSelect={(val) => setFilter('assigned', val as 'assigned' | 'unassigned' | '')}
                                            onClear={() => setFilter('assigned', '')}
                                        />
                                        <FilterSection
                                            label="Transfer"
                                            type="radio"
                                            options={TRANSFER_OPTIONS}
                                            selected={filters.transfer}
                                            onSelect={(val) => setFilter('transfer', val as 'transferred' | 'not_transferred' | '')}
                                            onClear={() => setFilter('transfer', '')}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Government Group */}
                            <div className="space-y-5 pb-4">
                                <h4 className="text-[12px] font-bold uppercase tracking-widest text-muted-foreground/60 flex items-center gap-2">
                                    <span className="h-px flex-1 bg-border/40" />
                                    Government
                                    <span className="h-px flex-1 bg-border/40" />
                                </h4>
                                <FilterSection
                                    label="Ration Card"
                                    options={RATION_COLORS_OPTIONS.map((opt) => ({ label: opt, value: opt }))}
                                    selected={filters.rationColors}
                                    onToggle={(val) => toggleFilterItem('rationColors', val)}
                                    onClear={() => setFilter('rationColors', [])}
                                />
                            </div>
                        </div>
                    </ScrollArea>

                    <SheetFooter className="p-6 border-t bg-muted/10 gap-3 sm:flex-col">
                        <SheetTrigger asChild>
                            <Button className="w-full font-semibold">
                                Apply & Close
                            </Button>
                        </SheetTrigger>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </div>
    )
}

interface FilterOption {
    label: string
    value: string
}

function FilterSection({
    label,
    options,
    selected,
    onToggle,
    onSelect,
    onClear,
    type = 'checkbox',
    scrollable = false,
}: {
    label: string
    options: FilterOption[]
    selected: string | string[] | null
    onToggle?: (val: string) => void
    onSelect?: (val: string) => void
    onClear: () => void
    type?: 'checkbox' | 'radio'
    scrollable?: boolean
}) {
    const activeCount = Array.isArray(selected) ? selected.length : selected ? 1 : 0

    const content = (
        <div className="mt-2.5 space-y-2">
            {type === 'checkbox' ? (
                options.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2.5 group">
                        <Checkbox
                            id={`${label}-${option.value}`}
                            checked={Array.isArray(selected) && selected.includes(option.value)}
                            onCheckedChange={() => onToggle?.(option.value)}
                            className="transition-transform group-hover:scale-105"
                        />
                        <Label
                            htmlFor={`${label}-${option.value}`}
                            className={cn(
                                "text-xs font-medium capitalize cursor-pointer flex-1 transition-colors",
                                Array.isArray(selected) && selected.includes(option.value) ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                            )}
                        >
                            {option.label}
                        </Label>
                    </div>
                ))
            ) : (
                <RadioGroup value={(selected as string) || ''} onValueChange={onSelect} className="gap-2">
                    {options.map((option) => (
                        <div key={option.value} className="flex items-center space-x-2.5 group">
                            <RadioGroupItem value={option.value} id={`${label}-${option.value}`} />
                            <Label
                                htmlFor={`${label}-${option.value}`}
                                className={cn(
                                    "text-xs font-medium capitalize cursor-pointer flex-1 transition-colors",
                                    selected === option.value ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                                )}
                            >
                                {option.label}
                            </Label>
                        </div>
                    ))}
                </RadioGroup>
            )}
        </div>
    )

    return (
        <div className="flex flex-col min-w-[140px]">
            <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                    <span className="text-[13px] font-semibold text-foreground/90">{label}</span>
                    {activeCount > 0 && (
                        <span className="inline-flex items-center justify-center h-4 px-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                            {activeCount}
                        </span>
                    )}
                </div>
                {activeCount > 0 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClear}
                        className="h-5 w-5 p-0 text-muted-foreground/50 hover:text-destructive hover:bg-transparent"
                    >
                        <X className="h-3.5 w-3.5" />
                    </Button>
                )}
            </div>
            {scrollable ? (
                <ScrollArea className="h-[140px] mt-2 pr-3 -mr-1">
                    {content}
                </ScrollArea>
            ) : (
                content
            )}
        </div>
    )
}
