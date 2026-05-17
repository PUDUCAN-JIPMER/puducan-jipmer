import { UseFormReturn, Controller } from 'react-hook-form'

import { FormControl, FormField, FormItem, FormMessage, FormLabel } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import TreatmentDropdown from './fields/TreatmentDropdrop'
import { TreatmentPeriodField } from './fields/TreatmentPeriodField'
import { FloatingLabelInput } from '@/components/ui/floating-label-input'
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from '@/components/ui/select'
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
                    name="hbcrId"
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
                <div className="flex flex-col gap-2">
                    <FormLabel className="text-muted-foreground text-sm">Stage of the Cancer</FormLabel>

                    <FormField
                        control={control}
                        name="stageOfTheCancer.stage"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Select value={field.value ?? ''} onValueChange={(v) => field.onChange(v === '' ? undefined : v)}>
                                        <SelectTrigger className="w-full" required>
                                            <SelectValue>
                                                {field.value ? (
                                                    <span className="font-medium">{field.value}</span>
                                                ) : (
                                                    'Select Stage'
                                                )}
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Stage 0">Stage 0</SelectItem>
                                            <SelectItem value="Stage I">Stage I</SelectItem>
                                            <SelectItem value="Stage II">Stage II</SelectItem>
                                            <SelectItem value="Stage III">Stage III</SelectItem>
                                            <SelectItem value="Stage IV">Stage IV</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={control}
                        name="stageOfTheCancer.subStage"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Select value={field.value ?? ''} onValueChange={(v) => field.onChange(v === '' || v === 'none' ? undefined : v)}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue>
                                                {field.value ? (
                                                    <span className="font-medium">{field.value}</span>
                                                ) : (
                                                    'Sub-stage (optional)'
                                                )}
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">None</SelectItem>
                                            <SelectItem value="A">A</SelectItem>
                                            <SelectItem value="B">B</SelectItem>
                                            <SelectItem value="C">C</SelectItem>
                                            <SelectItem value="D">D</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
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
