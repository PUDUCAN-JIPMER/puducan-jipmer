import z from 'zod'

// Hospital Schema
export const HospitalSchema = z.object({
    id: z.string().optional(),
    name: z
        .string()
        .min(1, 'Hospital name is required.')
        .regex(
            /^[a-zA-Z\s\-&.']+$/,
            'Hospital name can only contain letters, spaces, hyphens, ampersands, and apostrophes'
        ),
    address: z
        .string()
        .min(1, 'Address is required.')
        .refine(
            (val) => !/^\d+$/.test(val),
            'Address cannot be only numbers'
        ),
    contactNumber: z.string().max(10, "Phone number has more than 10 digits").optional(),
})

export type HospitalFormInputs = z.infer<typeof HospitalSchema>
export type Hospital = z.infer<typeof HospitalSchema> & { id: string }
