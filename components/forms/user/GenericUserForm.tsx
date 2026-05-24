'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
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

interface GenericUserFormProps {
    mode: 'add' | 'edit'
    user: string
    defaultValues?: Partial<UserDoc>
    onSuccess?: () => void
    onSubmit: (data: UserFormInputs) => Promise<void> | void
}

export default function GenericUserForm({
    mode,
    user,
    defaultValues,
    onSuccess,
    onSubmit,
}: GenericUserFormProps) {
    const roleValue = user?.endsWith('s') ? user.slice(0, -1) : user
    const [showPassword, setShowPassword] = useState(false)

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
            password: defaultValues?.password ?? '',
        },
    })

    const handleSubmit = async (data: UserFormInputs) => {
        if (mode === 'add') {
            if (!data.password || data.password.length < 6) {
                form.setError('password', {
                    type: 'manual',
                    message: 'Password must be at least 6 characters long.',
                })
                return
            }
        }
        await onSubmit(data)
        onSuccess?.()
        form.reset()
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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

                {/* Password - only displayed in add mode */}
                {mode === 'add' && (
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Password</FormLabel>
                                <div className="relative">
                                    <FormControl className="!border-red-400">
                                        <Input
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="••••••••"
                                            {...field}
                                            className="pr-10"
                                        />
                                    </FormControl>
                                    <button
                                        type="button"
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}

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
