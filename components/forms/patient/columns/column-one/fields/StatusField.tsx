import React from 'react'
import { Controller, UseFormReturn } from 'react-hook-form'
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
    SelectLabel,
} from '@/components/ui/select'
import { PatientFormInputs } from '@/schema/patient'
import { SelectGroup } from '@radix-ui/react-select'

interface StatusFieldProps {
    form: UseFormReturn<PatientFormInputs>
    isEdit?: boolean
}

const StatusField: React.FC<StatusFieldProps> = ({ form: { control }, isEdit = false }) => {
    const options = isEdit ? ['Active', 'Inactive', 'Cured'] : ['Active', 'Inactive']

    return (
        <Controller
            control={control}
            name="patientStatus"
            render={({ field }) => {
                const extraOption = field.value && !options.includes(field.value) ? field.value : undefined

                return (
                    <SelectGroup>
                        <SelectLabel className="text-muted-foreground mb-1 text-sm">
                            Status
                        </SelectLabel>
                        <Select value={field.value} onValueChange={(val) => field.onChange(val)}>
                            <SelectTrigger className="w-full text-muted-foreground mb-1 text-sm">
                                <SelectValue placeholder="Select Status" />
                            </SelectTrigger>
                            <SelectContent className="text-muted-foreground mb-1 text-sm">
                                {options.map((status) => (
                                    <SelectItem key={status} value={status}>
                                        {status}
                                    </SelectItem>
                                ))}
                                {extraOption && (
                                    <SelectItem value={extraOption}>
                                        {extraOption}
                                    </SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                    </SelectGroup>
                )
            }}
        />
    )
}

export default StatusField
