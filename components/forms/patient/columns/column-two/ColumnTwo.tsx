import { FormField, FormItem, FormControl, FormMessage } from '@/components/ui/form'
import { UseFormReturn } from 'react-hook-form'
import DobOrAgeField from './fields/DobOrAgeField'
import InsuranceInfo from './fields/InsuranceInfo'
import SexSelect from './fields/SexSelect'
import PatientStatusSelect from './fields/PatientStatusSelect'
import { FloatingLabelInput } from '@/components/ui/floating-label-input'
import { RegistrationDateField } from './fields/RegistrationDateField'
import clsx from 'clsx'

type MiddleColumnProps = {
    form: UseFormReturn<any>
    isAsha?: boolean
}

export function ColumnTwo({ form, isAsha }: MiddleColumnProps) {
    const { register, control } = form

    return (
        <div className={clsx('flex flex-col gap-4 md:px-4 sm:border-x-2 md:w-1/2 lg:w-1/3', isAsha && 'md:w-2/3 lg:w-full px-2 mx-auto border-none')}>
            <RegistrationDateField form={form} />
            {/* Address */}
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

            {/* Insurance */}
            <InsuranceInfo form={form} />

            {/* DOB or Age */}
            <DobOrAgeField form={form} />

            {/* Sex */}
            <SexSelect control={control} />
            {/* Status */}
            <PatientStatusSelect control={control} form={form}/>

        </div>
    )
}
