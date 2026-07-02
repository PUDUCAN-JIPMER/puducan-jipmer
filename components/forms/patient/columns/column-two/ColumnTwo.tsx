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
        <div className={clsx(
            'grid w-full grid-cols-1 gap-6 md:grid-cols-2',
            isAsha && 'px-2 mx-auto border-none'
        )}>
            <div className="space-y-4">
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
            </div>

            <div className="space-y-4">
                {/* DOB or Age */}
                <DobOrAgeField form={form} />

                {/* Sex */}
                {/* wrapped inside formfield for showing required alert messages.*/}
                <FormField
                    control={control}
                    name="sex"
                    render={() => (
                        <FormItem>
                            <FormControl>
                                <SexSelect control={control} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Status */}
                <PatientStatusSelect control={control} form={form} />
            </div>
        </div>
    )
}
