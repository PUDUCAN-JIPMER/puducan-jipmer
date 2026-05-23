'use client'

import React from 'react'
import { UseFormReturn } from 'react-hook-form'
import { PatientFormInputs } from '@/schema/patient'
import NameField from './fields/NameField'
import AadhaarField from './fields/AadhaarField'
import PhoneNumbersField from './fields/PhoneNumbersField'
import ReligionDropdown from './fields/ReligionField'

interface LeftColumnProps {
    form: UseFormReturn<PatientFormInputs>
    isAsha?: boolean
}

export function ColumnOne({ form, isAsha = false }: LeftColumnProps) {
    return (
        <div className="w-full space-y-4">
            <NameField form={form} />
            <ReligionDropdown form={form} />
            <AadhaarField form={form} />
            <PhoneNumbersField form={form} />
        </div>
    )
}