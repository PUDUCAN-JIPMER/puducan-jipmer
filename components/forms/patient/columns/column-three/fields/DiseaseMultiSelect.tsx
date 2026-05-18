import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AVAILABLE_DISEASES_LIST } from '@/constants/diseases'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'
import { useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { FormField, FormItem, FormControl, FormMessage } from '@/components/ui/form'

type DiseaseMultiSelectProps = {
    sex: 'male' | 'female' | 'other' | undefined
}

export default function DiseaseMultiSelect({ sex }: DiseaseMultiSelectProps) {
    const [isCustomDiseaseSelected, setIsCustomDiseaseSelected] = useState(false)
    const { watch, setValue, control } = useFormContext()

    // ------------------- Diseases logic -------------------
    const selectedDiseases: string[] = watch('diseases') || []
    const [customDisease, setCustomDisease] = useState('')
    const suspectedCase = watch('suspectedCase') || false
    const displayedDiseases = selectedDiseases.filter((d) => d.trim() !== '')

    return (
        <div className="flex flex-col gap-3">
            {/* ---- Enter disease checkbox + input ---- */}
            <div className="flex gap-2">
                <label className="flex items-center gap-2 text-sm">
                    <Checkbox
                        checked={isCustomDiseaseSelected}
                        onCheckedChange={(c) => setIsCustomDiseaseSelected(Boolean(c))}
                    />
                    <span className="text-muted-foreground text-sm">Enter disease</span>
                </label>

                {/* ---- Suspected Case checkbox ---- */}
                <label className="flex items-center gap-2 border-l-2 pl-2 text-sm">
                    <Checkbox
                        checked={suspectedCase}
                        onCheckedChange={(c) => {
                            const checked = Boolean(c)

                            setValue('suspectedCase', checked, {
                                shouldDirty: true,
                                shouldValidate: true,
                            })

                            if (checked) {
                                // 🔴 clear diseases when suspected case is selected
                                setValue('diseases', [], {
                                    shouldDirty: true,
                                    shouldValidate: true,
                                })
                                setIsCustomDiseaseSelected(false) // disable custom input
                            }
                        }}
                    />

                    <span className="text-muted-foreground text-sm">Suspected Case</span>
                </label>
            </div>

            {isCustomDiseaseSelected && (
                <div className="ml-6 flex gap-2">
                    <Input
                        className="flex-1"
                        placeholder="Type disease name"
                        value={customDisease}
                        onChange={(e) => setCustomDisease(e.target.value)}
                        onKeyDown={(e) => {
                            if (suspectedCase) return // 🔴 block typing if suspected case is active
                            if (e.key === 'Enter' && customDisease.trim()) {
                                e.preventDefault()
                                if (!selectedDiseases.includes(customDisease.trim())) {
                                    setValue(
                                        'diseases',
                                        [...selectedDiseases, customDisease.trim()],
                                        {
                                            shouldDirty: true,
                                            shouldValidate: true,
                                        }
                                    )
                                }
                                setCustomDisease('')
                            }
                        }}
                        disabled={suspectedCase} // 🔴 disable field
                    />
                    <Button
                        type="button"
                        disabled={suspectedCase} // 🔴 disable add button
                        onClick={() => {
                            if (customDisease.trim()) {
                                if (!selectedDiseases.includes(customDisease.trim())) {
                                    setValue(
                                        'diseases',
                                        [...selectedDiseases, customDisease.trim()],
                                        {
                                            shouldDirty: true,
                                            shouldValidate: true,
                                        }
                                    )
                                }
                                setCustomDisease('')
                            }
                        }}
                    >
                        Add
                    </Button>
                </div>
            )}

            {/* ---- Diseases multi-select box ---- */}
            <FormField
                control={control}
                name="diseases"
                render={({ field }) => (
                    <FormItem>
                        <FormControl>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            '!bg-background min-h-[100px] w-full !border-red-400 p-2 text-left',
                                            {
                                                'text-muted-foreground': displayedDiseases.length === 0,
                                            }
                                        )}
                                    >
                                        <div className="flex max-h-24 flex-wrap items-start gap-1 overflow-y-auto">
                                            {displayedDiseases.length > 0 ? (
                                                displayedDiseases.map((disease, i) => (
                                                    <span
                                                        key={`${disease}-${i}`}
                                                        className="bg-muted text-muted-foreground flex items-center gap-1 rounded px-2 py-0.5 text-xs"
                                                    >
                                                        {disease || '—'}
                                                        <span
                                                            role="button"
                                                            tabIndex={0}
                                                            className="cursor-pointer hover:text-red-500"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                setValue(
                                                                    'diseases',
                                                                    selectedDiseases.filter((d) => d !== disease),
                                                                    { shouldDirty: true, shouldValidate: true }
                                                                )
                                                            }}
                                                        >
                                                            <X size={12} />
                                                        </span>
                                                    </span>
                                                ))
                                            ) : (
                                                <span>Select Diseases</span>
                                            )}
                                        </div>
                                    </Button>
                                </PopoverTrigger>

                                <PopoverContent className="flex w-full justify-center" align="start">
                                    <Tabs defaultValue="solid" className="w-full">
                                        <TabsList className="mb-2 grid w-full grid-cols-2">
                                            <TabsTrigger value="solid">Solid Tumors</TabsTrigger>
                                            <TabsTrigger value="blood">Blood-Related</TabsTrigger>
                                        </TabsList>

                                        {['solid', 'blood'].map((type) => (
                                            <TabsContent key={type} value={type}>
                                                <div
                                                    className={
                                                        type === 'solid'
                                                            ? 'h-[280px] overflow-y-auto'
                                                            : 'h-[250px] overflow-y-auto'
                                                    }
                                                >
                                                    <div
                                                        className={`grid space-y-2 px-4 ${
                                                            AVAILABLE_DISEASES_LIST[type].length > 5
                                                                ? 'grid-cols-2'
                                                                : 'grid-cols-1'
                                                        }`}
                                                    >
                                                        {AVAILABLE_DISEASES_LIST[type]
                                                            .filter((d) => {
                                                                //getting values based on the selected sex
                                                                if (sex === 'male')
                                                                    return (
                                                                        d.gender === undefined ||
                                                                        d.gender === 'male'
                                                                    )
                                                                if (sex === 'female')
                                                                    return (
                                                                        d.gender === undefined ||
                                                                        d.gender === 'female'
                                                                    )
                                                                return true
                                                            })
                                                            .map(({ label }) => (
                                                                <label
                                                                    key={label}
                                                                    className="flex cursor-pointer items-center gap-1"
                                                                >
                                                                    <Checkbox
                                                                        checked={selectedDiseases.includes(label)}
                                                                        onCheckedChange={(checked) => {
                                                                            if (checked) {
                                                                                // 🔴 turn off suspected case if selecting other diseases
                                                                                setValue('suspectedCase', false, {
                                                                                    shouldDirty: true,
                                                                                    shouldValidate: true,
                                                                                })

                                                                                setValue(
                                                                                    'diseases',
                                                                                    [...selectedDiseases, label],
                                                                                    {
                                                                                        shouldDirty: true,
                                                                                        shouldValidate: true,
                                                                                    }
                                                                                )
                                                                            } else {
                                                                                setValue(
                                                                                    'diseases',
                                                                                    selectedDiseases.filter(
                                                                                        (d) => d !== label
                                                                                    ),
                                                                                    {
                                                                                        shouldDirty: true,
                                                                                        shouldValidate: true,
                                                                                    }
                                                                                )
                                                                            }
                                                                        }}
                                                                    />
                                                                    <span className="ml-1 text-sm">{label}</span>
                                                                </label>
                                                            ))}
                                                    </div>
                                                </div>
                                            </TabsContent>
                                        ))}
                                    </Tabs>
                                </PopoverContent>
                            </Popover>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    )
}
