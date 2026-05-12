'use client'

import React from 'react'
import { UseFormReturn } from 'react-hook-form'
import { PatientFormInputs } from '@/schema/patient'
import NameField from './fields/NameField'
import AadhaarField from './fields/AadhaarField'
import PhoneNumbersField from './fields/PhoneNumbersField'
import ReligionDropdown from './fields/ReligionField'
import StatusField from './fields/StatusField'
import clsx from 'clsx'

interface LeftColumnProps {
    form: UseFormReturn<PatientFormInputs>
    isAsha?: boolean
    isEdit?: boolean
}

export function ColumnOne({ form, isAsha = false, isEdit = false }: LeftColumnProps) {
    return (
        <div className={clsx('flex w-full flex-col gap-4 md:w-1/2 lg:w-1/3', isAsha && 'md:w-2/3 lg:w-full px-2 mx-auto')}>
            <NameField form={form} />
            <ReligionDropdown form={form} />
            <StatusField form={form} isEdit={isEdit} />

            <AadhaarField form={form} />
            <PhoneNumbersField form={form} />
        </div>
    )
}
