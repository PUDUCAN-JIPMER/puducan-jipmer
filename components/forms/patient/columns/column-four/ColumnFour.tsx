import { UseFormReturn } from 'react-hook-form'

import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import TreatmentDropdown from './fields/TreatmentDropdrop'
import { TreatmentPeriodField } from './fields/TreatmentPeriodField'
import { FloatingLabelInput } from '@/components/ui/floating-label-input'
import clsx from 'clsx'
type RightColumnProps = {
    form: UseFormReturn<any>
    isAsha?: boolean
}

export function ColumnFour({ form, isAsha = false }: RightColumnProps) {
    const { watch, control } = form

    const suspectedCase = watch('suspectedCase')

    return (
        !suspectedCase && (
            <div className={clsx('flex w-full flex-col sm:border-l-2 md:pl-4 gap-4 md:w-1/2 lg:w-1/3', isAsha && 'md:w-2/3 lg:w-full border-none px-2 mx-auto')} >
                <TreatmentPeriodField form={form} />
                <FormField
                    control={control}
                    name="hospitalRegistrationNumber"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <FloatingLabelInput
                                    id="hospital-registration-number"
                                    label="Hospital Registration Number"
                                    autoComplete="off"
                                    {...field}
                                />
                                {/* <Input
                                    placeholder="Hospital Registration Number"
                                    autoComplete="off"
                                    {...field}
                                /> */}
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={control}
                    name="hbcrID"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <FloatingLabelInput
                                    label="Enter HBCR ID"
                                    autoComplete="off"
                                    {...field}
                                />
                                {/* <Input placeholder="Enter HBCR ID" autoComplete="off" {...field} /> */}
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={control}
                    name="stageOfTheCancer"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <FloatingLabelInput
                                    label="Enter Stage of the Cancer"
                                    autoComplete="off"
                                    {...field}
                                />
                                {/* <Input
                                    placeholder="Enter Stage of the Cancer"
                                    autoComplete="off"
                                    {...field}
                                /> */}
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={control}
                    name="biopsyNumber"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <FloatingLabelInput
                                    label="Biopsy Number (If Applicable)"
                                    autoComplete="off"
                                    {...field}
                                />
                                {/* <Input
                                    placeholder="Biopsy Number (If Applicable)"
                                    autoComplete="off"
                                    {...field}
                                /> */}
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <TreatmentDropdown form={form} />
            </div>
        )
    )
}
