'use client'

import React from 'react'
import { UseFormReturn } from 'react-hook-form'
import { PatientFormInputs } from '@/schema/patient'
import NameField from './fields/NameField'
import AadhaarField from './fields/AadhaarField'
import PhoneNumbersField from './fields/PhoneNumbersField'
import ReligionDropdown from './fields/ReligionField'
import clsx from 'clsx'

interface LeftColumnProps {
    form: UseFormReturn<PatientFormInputs>
    isAsha?: boolean
}

export function ColumnOne({ form, isAsha = false }: LeftColumnProps) {
    return (
        <div className={clsx(
            'grid w-full grid-cols-1 gap-6 md:grid-cols-2',
            isAsha && 'px-2 mx-auto'
        )}>
            <div className="space-y-4">
                <NameField form={form} />
                <ReligionDropdown form={form} />
            </div>
            <div className="space-y-4">
                <AadhaarField form={form} />
                <PhoneNumbersField form={form} />
            </div>
        </div>
    )
}
