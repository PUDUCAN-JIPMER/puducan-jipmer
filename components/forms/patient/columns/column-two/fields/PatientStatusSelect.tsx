import { Controller, Control, UseFormReturn } from 'react-hook-form'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'

type Props = {
    control: Control<any>
    form: UseFormReturn<any>
}

export default function PatientStatusSelect({ control, form }: Props) {
    const { watch } = form
    const patientStatus = watch('patientStatus')
    const patientBirthDate = watch('dob')

    return (
        <div className="flex flex-col gap-4">
            {/* Patient Status Select */}
            <Controller
                control={control}
                name="patientStatus"
                render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="w-full" required={true}>
                            <SelectValue className="tracking-wider">
                                {field.value ? (
                                    <span className="font-medium">{field.value}</span>
                                ) : (
                                    'Select Status'
                                )}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="tracking-wider">
                            <SelectItem value="Alive">Alive</SelectItem>
                            <SelectItem value="Not Alive">Not Alive</SelectItem>
                            <SelectItem value="Not Available">Not Available</SelectItem>
                        </SelectContent>
                    </Select>
                )}
            />

            {patientStatus === 'Not Alive' && (
                <FormField
                    control={control}
                    name="patientDeathDate"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-muted-foreground text-sm">
                                Date of Death
                            </FormLabel>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                '!bg-background text-muted-foreground w-full !border-red-400 pl-3 text-left font-normal',
                                                !field.value && 'text-muted-foreground'
                                            )}
                                        >
                                            {field.value ? (
                                                format(new Date(field.value), 'PPP')
                                            ) : (
                                                <span>Select date of death</span>
                                            )}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        captionLayout="dropdown"
                                        selected={field.value ? new Date(field.value) : undefined}
                                        onSelect={(date) => {
                                            if (!date) {
                                                field.onChange('')
                                                return
                                            }
                                            const year = date.getFullYear()
                                            const month = String(date.getMonth() + 1).padStart(
                                                2,
                                                '0'
                                            )
                                            const day = String(date.getDate()).padStart(2, '0')
                                            const formatted = `${year}-${month}-${day}`
                                            field.onChange(formatted)
                                        }}
                                    />
                                </PopoverContent>
                            </Popover>
                            <FormMessage /> {/* ✅ will now show validation errors */}
                        </FormItem>
                    )}
                />
            )}
        </div>
    )
}
