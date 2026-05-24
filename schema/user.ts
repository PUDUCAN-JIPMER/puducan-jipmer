import z from 'zod'

import { User as FirebaseAuthUser } from 'firebase/auth'

// User Schema (Doctor, Asha, Nurse, Admin)
export const UserSchema = z.object({
    id: z.string().optional(),
    email: z.string().email({ message: 'Invalid email address.' }).min(1, 'Email is required.'),
    name: z.string().min(1, 'Name is required.'),
    sex: z.enum(['male', 'female']).optional(),
    role: z.enum(['doctor', 'nurse', 'asha', 'admin']),
    phoneNumber: z.string().optional(),
    orgId: z.string(),
    orgName: z.string(),
    password: z.string().min(6, 'Password must be at least 6 characters long.').optional().or(z.literal('')),
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
