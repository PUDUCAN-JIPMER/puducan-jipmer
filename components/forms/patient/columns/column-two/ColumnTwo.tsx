import { FormField, FormItem, FormControl, FormMessage } from '@/components/ui/form'
import { UseFormReturn } from 'react-hook-form'
import DobOrAgeField from './fields/DobOrAgeField'
import InsuranceInfo from './fields/InsuranceInfo'
import SexSelect from './fields/SexSelect'
import PatientStatusSelect from './fields/PatientStatusSelect'
import { FloatingLabelInput } from '@/components/ui/floating-label-input'
import { RegistrationDateField } from './fields/RegistrationDateField'

type MiddleColumnProps = {
    form: UseFormReturn<any>
    isAsha?: boolean
}

export function ColumnTwo({ form, isAsha }: MiddleColumnProps) {
    const { control } = form

    return (
        <div className="w-full space-y-4">
            <RegistrationDateField form={form} />
            
            <FormField
                control={control}
                name="address"
                render={({ field }) => (
                    <FormItem>
                        <FormControl>
                            <FloatingLabelInput
                                {...field}
                                label="Address"
                                autoComplete="off"
                                className="!border-red-400"
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <InsuranceInfo form={form} />
            <DobOrAgeField form={form} />
            <SexSelect control={control} />
            <PatientStatusSelect control={control} form={form}/>
        </div>
    )
}