import HospitalSearch from '@/components/search/HospitalSearch'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useFormContext, UseFormReturn } from 'react-hook-form'
import DiagnosisTimingField from './fields/DiagnosisTimingField'
import DiseaseMultiSelect from './fields/DiseaseMultiSelect'
import RationCardSelect from './fields/RationCardSelect'
import clsx from 'clsx'

type RightColumnProps = {
    form: UseFormReturn<any>
    isAsha?: boolean
}

export function ColumnThree({ form, isAsha }: RightColumnProps) {
    const { watch, control } = useFormContext()

    return (
        <div className={clsx('flex w-full flex-col gap-4 md:w-1/2 lg:w-1/3', isAsha && 'md:w-2/3 lg:w-full px-2 mx-auto')}>
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
                        {form.formState.errors.assignedHospital?.id && (
                            <p className="text-[0.8rem] font-medium text-destructive">
                                {form.formState.errors.assignedHospital.id.message}
                            </p>
                        )}
                        {form.formState.errors.assignedHospital?.name && (
                            <p className="text-[0.8rem] font-medium text-destructive">
                                {form.formState.errors.assignedHospital.name.message}
                            </p>
                        )}
                    </FormItem>
                )}
            />

            <DiagnosisTimingField form={form} />
        </div>
    )
}
