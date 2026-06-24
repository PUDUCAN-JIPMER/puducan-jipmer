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
        <div className={clsx(
            'grid w-full grid-cols-1 gap-6 md:grid-cols-2',
            isAsha && 'px-2 mx-auto'
        )}>
            <div className="space-y-4">
                {/* Wrapped inside FormField for showing required alert messages. */}
                <FormField
                    control={form.control}
                    name="diseases"
                    render={() => (
                        <FormItem>
                            <FormControl>
                                <DiseaseMultiSelect sex={watch('sex')} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <RationCardSelect control={control} />
            </div>

            <div className="space-y-4">
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
        </div>
    )
}
