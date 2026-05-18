import { Control, useFormContext } from 'react-hook-form'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { FormField, FormItem, FormControl, FormMessage } from '@/components/ui/form'
import { AVAILABLE_DISEASES_LIST } from '@/constants/diseases'

type Props = {
    control: Control<any>
}

export default function SexSelect({ control }: Props) {
    const { watch, setValue } = useFormContext()
    const sex = watch('sex')
    const selectedDiseases: string[] = watch('diseases') || []

    // ✅ define here instead of PatientForm
    const allKnownLabels = new Set(
        [...AVAILABLE_DISEASES_LIST.solid, ...AVAILABLE_DISEASES_LIST.blood].map((d) => d.label)
    )

    const clearGenderIncompatible = () => {
        type DiseaseItem = { label: string; gender?: 'male' | 'female' }
        const allowed = (item: DiseaseItem) => {
            if (!item.gender) return true
            if (!sex || sex === 'other') return true
            return item.gender === sex
        }

        const validKnown = (
            [...AVAILABLE_DISEASES_LIST.solid, ...AVAILABLE_DISEASES_LIST.blood] as DiseaseItem[]
        )
            .filter(allowed)
            .map((d) => d.label)

        const next = (selectedDiseases || []).filter(
            (d) => !allKnownLabels.has(d) || validKnown.includes(d)
        )

        setValue('diseases', next, { shouldDirty: true })
    }

    return (
        <FormField
            control={control}
            name="sex"
            render={({ field }) => (
                <FormItem>
                    <FormControl>
                        <Select
                            value={field.value}
                            onValueChange={(val) => {
                                field.onChange(val)
                                clearGenderIncompatible() // ✅ works now
                            }}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select Sex" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="male">Male</SelectItem>
                                <SelectItem value="female">Female</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    )
}
