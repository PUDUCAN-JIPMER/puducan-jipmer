'use client'

import React from 'react'
import { UseFormReturn } from 'react-hook-form'
import { PatientFormInputs } from '@/schema/patient'
import { PatientImportRowSchema } from '@/schema/patient'
import { Button } from '@/components/ui/button'
import { MinusCircle, PlusCircle } from 'lucide-react'
import { PhoneInput } from '@/components/ui/phone-input'
import { FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'

const MAX_PHONE_NUMBERS = 10

interface PhoneNumbersFieldProps {
    form: UseFormReturn<PatientFormInputs>
}

export default function PhoneNumbersField({ form }: PhoneNumbersFieldProps) {
    const { watch, setValue } = form
    const phoneNumbers = watch('phoneNumber') || []

    const handleAdd = () => {
        const newPhoneNumber = ''
        if (PatientImportRowSchema.safeParse({ phoneNumber: newPhoneNumber }).success) {
            if (phoneNumbers.length < MAX_PHONE_NUMBERS) {
                setValue('phoneNumber', [...phoneNumbers, newPhoneNumber])
            }
        } else {
            console.error('Invalid phone number format')
        }
        const updatedPhoneNumber = value
        if (PatientImportRowSchema.safeParse({ phoneNumber: updatedPhoneNumber }).success) {
            const updated = [...phoneNumbers]
            updated[index] = updatedPhoneNumber
            setValue('phoneNumber', updated)
        } else {
            console.error('Invalid phone number format')
        }
            <FormMessage>
                {form.formState.errors.phoneNumber ? 'Invalid phone number format' : ''}
            </FormMessage>
                {phoneNumbers.length < MAX_PHONE_NUMBERS && (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleAdd}
                    >
                        Add Phone Number
                    </Button>
                )}
        if (phoneNumbers.length < MAX_PHONE_NUMBERS) {
            setValue('phoneNumber', [...phoneNumbers, ''])
        }
    }

    const handleRemove = (index: number) => {
        setValue(
            'phoneNumber',
            phoneNumbers.filter((_, i) => i !== index)
        )
    }

    const handleChange = (index: number, value: string) => {
        const updated = [...phoneNumbers]
        updated[index] = value
        setValue('phoneNumber', updated)
    }

    return (
        <FormItem>
            <FormLabel className="text-muted-foreground text-sm">
                Phone Numbers (Max {MAX_PHONE_NUMBERS})
            </FormLabel>
            <div className="flex flex-col gap-2">
                {phoneNumbers.map((num, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <FormControl>
                            <PhoneInput
                                placeholder="Enter phone number"
                                className="flex-grow"
                                defaultCountry="IN"
                                value={num || ''}
                                onChange={(val: string) => handleChange(index, val)}
                            />
                        </FormControl>
                        {phoneNumbers.length > 1 && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemove(index)}
                                className="text-red-500 hover:text-red-700"
                            >
                                <MinusCircle className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                ))}

                {phoneNumbers.length < MAX_PHONE_NUMBERS && (
                    <Button
                        type="button"
                        variant="ghost"
                        className="text-muted-foreground w-fit px-2 text-sm"
                        onClick={handleAdd}
                    >
                        <PlusCircle className="mr-1 h-4 w-4" />
                        Add phone
                    </Button>
                )}
            </div>
            <FormMessage />
        </FormItem>
    )
}
