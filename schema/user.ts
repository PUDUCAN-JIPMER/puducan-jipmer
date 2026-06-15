import z from 'zod'

import { User as FirebaseAuthUser } from 'firebase/auth'

// User Schema (Doctor, Asha, Nurse, Admin)
export const UserSchema = z.object({
    id: z.string().optional(),
    email: z.string().email({ message: 'Invalid email address.' }).min(1, 'Email is required.'),
    name: z.string().min(1, 'Name is required.'),
    sex: z.enum(['male', 'female']).optional(),
    role: z.enum(['doctor', 'nurse', 'asha', 'admin']),
    phoneNumber: z
        .string()
        .trim()
        .transform((val) => {
            // Strip +91 or 91 country-code prefix left by the PhoneInput component
            if (val === '+91' || val === '91') return ''
            if (val.startsWith('+91')) return val.slice(3)
            if (val.startsWith('91') && val.length === 12) return val.slice(2)
            return val
        })
        .refine(
            (val) => val === '' || /^[6-9]\d{9}$/.test(val),
            'Phone number must be a valid 10-digit Indian mobile number (starting with 6–9).'
        )
        .optional(),
    orgId: z.string(),
    orgName: z.string(),
})

export type UserFormInputs = z.infer<typeof UserSchema>
export type UserDoc = z.infer<typeof UserSchema> & { id: string }

export interface AuthState {
    user: FirebaseAuthUser | null
    userId: string | null
    role: string | null
    orgId: string | null
    orgName: string | null
    isLoadingAuth: boolean
    error: Error | null
}