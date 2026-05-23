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
        .preprocess(
            (val) => {
                if (typeof val !== 'string') return val
                const trimmed = val.trim()
                if (trimmed === '+91' || trimmed === '91') return ''
                if (trimmed.startsWith('+91')) return trimmed.slice(3)
                if (trimmed.startsWith('91') && trimmed.length === 12) return trimmed.slice(2)
                return trimmed
            },
            z
                .string()
                .refine(
                    (val) => val === '' || /^[6-9]\d{9}$/.test(val),
                    'Phone number must be a valid 10-digit Indian mobile number (starting with 6–9).'
                )
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
    isLoadingAuth: boolean
    error: Error | null
}