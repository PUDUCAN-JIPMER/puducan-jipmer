import { UseFormReturn } from 'react-hook-form'
import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import TreatmentDropdown from './fields/TreatmentDropdrop'
import { TreatmentPeriodField } from './fields/TreatmentPeriodField'
import { FloatingLabelInput } from '@/components/ui/floating-label-input'

type RightColumnProps = {
    form: UseFormReturn<any>
    isAsha?: boolean
}

export function ColumnFour({ form, isAsha = false }: RightColumnProps) {
    const { watch, control } = form
    const suspectedCase = watch('suspectedCase')

    return (
        !suspectedCase && (
            <div className="w-full space-y-4">
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
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={control}
                    name="hbcrId"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <FloatingLabelInput
                                    label="Enter HBCR ID"
                                    autoComplete="off"
                                    {...field}
                                />
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