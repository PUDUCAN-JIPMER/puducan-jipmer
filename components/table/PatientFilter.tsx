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
import { useMemo, useState } from 'react'
import { cn } from '@/lib/utils'
import { useKeyboardShortcurts } from '@/hooks/keyboardshortcut/keyboardShortcuts'

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

const sectionHeadingClass =
    'text-xs sm:text-sm font-semibold uppercase tracking-wider text-neutral-600 dark:text-muted-foreground flex items-center gap-2 md:gap-3'

const sectionDividerClass = 'h-px flex-1 bg-border dark:bg-border/40'

function getOptionLabelClass(isSelected: boolean) {
    return cn(
        'text-sm md:text-base font-medium capitalize cursor-pointer flex-1 leading-snug transition-colors',
        isSelected
            ? 'text-primary font-semibold'
            : 'text-neutral-700 dark:text-muted-foreground group-hover:text-foreground'
    )
}

export function PatientFilter() {
    const { filters, setFilter, toggleFilterItem, reset } = usePatientFilterStore()

    // shortcut for filter
    const [filterOpen, setFilterOpen] = useState(false);

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

    // for filter shortcut
    useKeyboardShortcurts({
        onOpenFilter: () => {
            setFilterOpen(true)
        }
    })

    return (
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
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

                <SheetContent
                    side="right"
                    className="w-full sm:max-w-md md:max-w-lg flex flex-col p-0 overflow-hidden border-l shadow-2xl"
                >
                    <SheetHeader className="shrink-0 px-4 py-4 sm:px-6 sm:py-5 border-b bg-muted/40 dark:bg-muted/30">
                        <div className="flex items-center justify-between gap-3">
                            <SheetTitle className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground flex items-center gap-2">
                                <ListFilter className="h-5 w-5 sm:h-6 sm:w-6 shrink-0" />
                                Patient Filters
                            </SheetTitle>
                            {activeFilterCount > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={reset}
                                    className="h-8 shrink-0 px-2.5 sm:px-3 text-xs sm:text-sm font-medium text-neutral-600 dark:text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                                >
                                    <RotateCcw className="mr-1.5 sm:mr-2 h-3.5 w-3.5" />
                                    Clear All
                                </Button>
                            )}
                        </div>
                    </SheetHeader>

                    <ScrollArea className="flex-1 overflow-y-auto">
                        <div className="px-4 py-6 sm:px-6 sm:py-8 md:py-10 space-y-8 sm:space-y-10 md:space-y-12">
                            {/* Demographics Group */}
                            <div className="space-y-4 md:space-y-5">
                                <h4 className={sectionHeadingClass}>
                                    <span className={sectionDividerClass} />
                                    Demographics
                                    <span className={sectionDividerClass} />
                                </h4>
                                <div className="space-y-6 md:space-y-8">
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
                            <div className="space-y-4 md:space-y-5">
                                <h4 className={sectionHeadingClass}>
                                    <span className={sectionDividerClass} />
                                    Medical
                                    <span className={sectionDividerClass} />
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
                            <div className="space-y-4 md:space-y-5">
                                <h4 className={sectionHeadingClass}>
                                    <span className={sectionDividerClass} />
                                    Care Status
                                    <span className={sectionDividerClass} />
                                </h4>
                                <div className="space-y-6 md:space-y-8">
                                    <FilterSection
                                        label="Patient Status"
                                        options={HEALTH_STATUS_OPTIONS.map((opt) => ({ label: opt, value: opt }))}
                                        selected={filters.statuses}
                                        onToggle={(val) => toggleFilterItem('statuses', val)}
                                        onClear={() => setFilter('statuses', [])}
                                    />
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
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
                            <div className="space-y-4 md:space-y-5 pb-2 md:pb-4">
                                <h4 className={sectionHeadingClass}>
                                    <span className={sectionDividerClass} />
                                    Government
                                    <span className={sectionDividerClass} />
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

                    <SheetFooter className="shrink-0 px-4 py-4 sm:p-6 border-t bg-muted/30 dark:bg-muted/10 gap-3 sm:flex-col">
                        <SheetTrigger asChild>
                            <Button className="w-full h-11 sm:h-12 text-sm sm:text-base font-semibold shadow-sm">
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
        <div className="mt-2 space-y-2.5 sm:space-y-3">
            {type === 'checkbox' ? (
                options.map((option) => {
                    const isSelected =
                        Array.isArray(selected) && selected.includes(option.value)
                    return (
                        <div key={option.value} className="flex items-center gap-3 py-0.5 group">
                            <Checkbox
                                id={`${label}-${option.value}`}
                                checked={isSelected}
                                onCheckedChange={() => onToggle?.(option.value)}
                                className="shrink-0 transition-transform group-hover:scale-105"
                            />
                            <Label
                                htmlFor={`${label}-${option.value}`}
                                className={getOptionLabelClass(isSelected)}
                            >
                                {option.label}
                            </Label>
                        </div>
                    )
                })
            ) : (
                <RadioGroup
                    value={(selected as string) || ''}
                    onValueChange={onSelect}
                    className="gap-2.5 sm:gap-3"
                >
                    {options.map((option) => {
                        const isSelected = selected === option.value
                        return (
                            <div
                                key={option.value}
                                className="flex items-center gap-3 py-0.5 group"
                            >
                                <RadioGroupItem
                                    value={option.value}
                                    id={`${label}-${option.value}`}
                                    className="shrink-0"
                                />
                                <Label
                                    htmlFor={`${label}-${option.value}`}
                                    className={getOptionLabelClass(isSelected)}
                                >
                                    {option.label}
                                </Label>
                            </div>
                        )
                    })}
                </RadioGroup>
            )}
        </div>
    )

    return (
        <div className="flex flex-col min-w-0 sm:min-w-[140px]">
            <div className="flex items-center justify-between gap-2 mb-1.5 sm:mb-2">
                <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm md:text-base lg:text-lg font-semibold text-foreground truncate">
                        {label}
                    </span>
                    {activeCount > 0 && (
                        <span className="inline-flex shrink-0 items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-primary/15 text-primary text-xs font-semibold">
                            {activeCount}
                        </span>
                    )}
                </div>
                {activeCount > 0 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClear}
                        aria-label={`Clear ${label} filter`}
                        className="h-6 w-6 shrink-0 p-0 text-neutral-500 dark:text-muted-foreground hover:text-destructive hover:bg-transparent"
                    >
                        <X className="h-3.5 w-3.5" />
                    </Button>
                )}
            </div>
            {scrollable ? (
                <ScrollArea className="h-[120px] sm:h-[140px] md:h-[160px] mt-1 pr-3 -mr-1">
                    {content}
                </ScrollArea>
            ) : (
                content
            )}
        </div>
    )
}
