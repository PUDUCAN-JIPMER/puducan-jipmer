'use client'

import React from 'react'
import { UseFormReturn } from 'react-hook-form'
import { PatientFormInputs } from '@/schema/patient'
import { Checkbox } from '@/components/ui/checkbox'
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { FloatingLabelInput } from '@/components/ui/floating-label-input'

interface AadhaarFieldProps {
    form: UseFormReturn<PatientFormInputs>
}

export default function AadhaarField({ form }: AadhaarFieldProps) {
    const { control, watch, setValue } = form
    const aadhaarId = watch('aadhaarId') || ''
    const hasAadhaar = watch('hasAadhaar') ?? true

    // Format Aadhaar with spaces every 4 digits
    const formatAadhaar = (val: string) =>
        val
            .replace(/\D/g, '') // remove non-digits
            .slice(0, 12) // max 12 digits
            .replace(/(\d{4})(?=\d)/g, '$1 ') // space after each 4 digits

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value
        const formatted = formatAadhaar(raw)
        // store clean digits in form state
        setValue('aadhaarId', formatted.replace(/\s/g, ''), {
            shouldValidate: true,
            shouldDirty: true,
        })
    }

    return (
        <>
            {/* Checkbox for "No Aadhaar" */}
            <FormField
                control={control}
                name="hasAadhaar"
                render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                        <FormControl>
                            <Checkbox
                                checked={!field.value}
                                onCheckedChange={(checked) => field.onChange(!Boolean(checked))}
                            />
                        </FormControl>
                        <FormLabel className="text-muted-foreground text-sm">No Aadhaar</FormLabel>
                    </FormItem>
                )}
            />

            {/* Floating Label Aadhaar Input */}
            <FormField
                control={control}
                name="aadhaarId"
                render={({ field }) => (
                    <FormItem>
                        <FormControl>
                            <FloatingLabelInput
                                {...field}
                                label="Aadhaar Number"
                                value={formatAadhaar(aadhaarId)}
                                onChange={handleChange}
                                maxLength={14} // 12 digits + 2 spaces
                                disabled={!hasAadhaar}
                                autoComplete="off"
                                inputMode="numeric"
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={control}
                name="abhaId"
                render={({ field }) => (
                    <FormItem>
                        <FormControl>
                            <FloatingLabelInput
                                {...field}
                                label="ABHA Number (optional)"
                                autoComplete="off"
                                inputMode="numeric"
                                maxLength={17}
                                disabled={!hasAadhaar}
                                placeholder="XX-XXXX-XXXX-XXXX"
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </>
    )
}
