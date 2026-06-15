'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, FieldErrors } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { HospitalFormInputs, HospitalSchema } from '@/schema/hospital'
import { PhoneInput } from '@/components/ui/phone-input'
import { toast } from 'sonner'

interface GenericHospitalFormProps {
    initialData?: HospitalFormInputs
    onSuccess?: () => void
    onSubmit: (data: HospitalFormInputs) => Promise<void> | void
}

export default function GenericHospitalForm({
    initialData,
    onSuccess,
    onSubmit,
}: GenericHospitalFormProps) {
    const form = useForm<HospitalFormInputs>({
        resolver: zodResolver(HospitalSchema),
        defaultValues: {
            name: '',
            address: '',
            contactNumber: '',
            ...initialData, // ✅ pre-fill if editing
        },
    })

    const handleSubmit = async (data: HospitalFormInputs) => {
        await onSubmit(data)
        onSuccess?.()
        form.reset()
    }

    const onInvalidSubmit = (errors: FieldErrors<HospitalFormInputs>) => {
        const currentPayload = form.getValues();
        console.error('[HospitalForm:ValidationErrors] Form submission blocked by validation errors:', errors);
        console.log('[HospitalForm:ValidationErrors] Current form payload state:', currentPayload);
        
        const errorMessages = Object.entries(errors)
            .map(([field, err]) => {
                const message = err?.message || 'Invalid input';
                return `${field}: ${message}`;
            });

        toast.error(`Form validation failed. Please check:`, {
            description: errorMessages.slice(0, 3).join(', '),
            duration: 6000
        });
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit, onInvalidSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Hospital Name</FormLabel>
                            <FormControl className='border-red-400'>
                                <Input placeholder="Enter hospital name" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl className='border-red-400'>
                                <Input placeholder="Enter hospital address" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Phone Number */}
                <FormField
                    control={form.control}
                    name="contactNumber"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                                <PhoneInput
                                    {...field}
                                    placeholder="Enter phone number"
                                    defaultCountry="IN"
                                    international
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end">
                    <Button type="submit" className="w-full">
                        Save
                    </Button>
                </div>
            </form>
        </Form>
    )
}
