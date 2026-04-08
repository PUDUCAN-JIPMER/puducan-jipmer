import z from 'zod'

// Hospital Schema
export const HospitalSchema = z.object({
    id: z.string().optional(),
    name: z
        .string()
        .trim()
        .min(1, 'Hospital name is required.')
        .regex(
            /^[a-zA-Z\s\-&.'(),/]+$/,
            'Hospital name can only contain letters, spaces, hyphens, ampersands, and apostrophes'
        ),
    address: z
        .string()
        .trim()
        .min(1, 'Address is required.')
        .refine(
            (val) => !/^\d+$/.test(val),
            'Address cannot be only numbers'
        ),
    contactNumber: z
        .string()
        .trim()
        .transform((val) => {
            // Convert +91 or 91 alone to empty string
            if (val === '+91' || val === '91') return ''
            return val
        })
        .refine(
            (val) => val === '' || /^(\+)?91[1-9]\d{9}$/.test(val),
            "Phone number must be exactly 10 digits"
        )
        .optional(),
})

export type HospitalFormInputs = z.infer<typeof HospitalSchema>
export type Hospital = z.infer<typeof HospitalSchema> & { id: string }
