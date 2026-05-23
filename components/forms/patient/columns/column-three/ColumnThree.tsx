import HospitalSearch from '@/components/search/HospitalSearch'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useFormContext, UseFormReturn } from 'react-hook-form'
import DiagnosisTimingField from './fields/DiagnosisTimingField'
import DiseaseMultiSelect from './fields/DiseaseMultiSelect'
import RationCardSelect from './fields/RationCardSelect'

type RightColumnProps = {
    form: UseFormReturn<any>
    isAsha?: boolean
}

export function ColumnThree({ form, isAsha }: RightColumnProps) {
    const { watch, control } = useFormContext()

    return (
        <div className="w-full space-y-4">
            <DiseaseMultiSelect sex={watch('sex')} />
            <RationCardSelect control={control} />
            <FormField
                control={form.control}
                name="assignedHospital"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-muted-foreground text-sm">
                            Assigned Hospital
                        </FormLabel>
                        <FormControl>
                            <HospitalSearch value={field.value} onChange={field.onChange} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <DiagnosisTimingField form={form} />
        </div>
    )
}