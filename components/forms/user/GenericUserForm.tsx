'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, FieldErrors } from 'react-hook-form'
import { PhoneInput } from '@/components/ui/phone-input'
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import HospitalSearch from '@/components/search/HospitalSearch'
import { UserFormInputs, UserSchema, UserDoc } from '@/schema/user'
import { toast } from 'sonner'

interface GenericUserFormProps {
    user: string
    defaultValues?: Partial<UserDoc>
    onSuccess?: () => void
    onSubmit: (data: UserFormInputs) => Promise<void> | void
}

export default function GenericUserForm({
    user,
    defaultValues,
    onSuccess,
    onSubmit,
}: GenericUserFormProps) {
    const roleValue = user?.endsWith('s') ? user.slice(0, -1) : user

    const form = useForm<UserFormInputs>({
        resolver: zodResolver(UserSchema),
        defaultValues: {
            email: defaultValues?.email ?? '',
            name: defaultValues?.name ?? '',
            sex: defaultValues?.sex ?? undefined,
            role: defaultValues?.role ?? (roleValue as UserFormInputs['role']),
            phoneNumber: defaultValues?.phoneNumber ?? '',
            orgId: defaultValues?.orgId ?? '',
            orgName: defaultValues?.orgName ?? '',
        },
    })

    const handleSubmit = async (data: UserFormInputs) => {
        await onSubmit(data)
        onSuccess?.()
        form.reset()
    }

    const onInvalidSubmit = (errors: FieldErrors<UserFormInputs>) => {
        const currentPayload = form.getValues();
        
        
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
                {/* Email */}
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl className="!border-red-400">
                                <Input placeholder="user@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Name */}
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl className='border-red-400'>
                                <Input placeholder="Enter full name" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Phone number */}
                <FormField
                    control={form.control}
                    name="phoneNumber"
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

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {/* Sex */}
                    <FormField
                        control={form.control}
                        name="sex"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Sex</FormLabel>
                                <FormControl className="w-full">
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value ?? undefined}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select sex" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="male">Male</SelectItem>
                                            <SelectItem value="female">Female</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Role */}
                    <FormField
                        control={form.control}
                        name="role"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Role</FormLabel>
                                <FormControl className="w-full">
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <SelectTrigger className="w-full !border-red-400">
                                            <SelectValue placeholder="Select role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="doctor">Doctor</SelectItem>
                                            <SelectItem value="nurse">Nurse</SelectItem>
                                            <SelectItem value="asha">Asha</SelectItem>
                                            <SelectItem value="admin">Admin</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Hospital */}
                    <FormField
                        control={form.control}
                        name="orgId"
                        render={() => (
                            <FormItem className="w-full sm:col-span-2">
                                <FormLabel>Organization</FormLabel>
                                <FormControl className="w-full">
                                    <HospitalSearch
                                        value={{
                                            id: form.watch('orgId'),
                                            name: form.watch('orgName'),
                                        }}
                                        onChange={(hospital) => {
                                            form.setValue('orgId', hospital.id)
                                            form.setValue('orgName', hospital.name)
                                        }}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="flex justify-end">
                    <Button type="submit" className="w-full">
                        Save
                    </Button>
                </div>
            </form>
        </Form>
    )
}
