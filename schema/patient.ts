import z from 'zod'

// Insurance Schema definition
export const InsuranceSchema = z
    .object({
        type: z.enum(['none', 'Government', 'Private']),
        id: z.string().optional(),
    })
    .optional()

// FollowUp Schema definition
export const FollowUpSchema = z.object({
    date: z.string().optional(),
    remarks: z.string().optional(),
})

// Main Patient Schema with all validations and refinements
export const PatientSchema = z
    .object({
        name: z
            .string()
            .min(1, 'Name is required.')
            .max(100, "Name length can't exceed 100 characters")
            .regex(/^[A-Za-z\s]+$/, 'Name must only contain letters and spaces'),
        caregiverName: z
            .string()
            .max(100, "Name length can't exceed 100 characters")
            .regex(/^[A-Za-z\s]*$/, 'Name must only contain letters and spaces')
            .optional(),
        createdAt: z.any().optional(),
        phoneNumber: z.array(z.string().optional()).optional(),
        sex: z.enum(['male', 'female', 'other'], {
            message: 'Please select a sex.',
        }),
        dob: z.string().optional(),
        bloodGroup: z.string().optional(),
        address: z.string().min(1, 'Address is required.'),
        religion: z.string().optional(),
        aadhaarId: z.string().optional(),
        rationCardColor: z.enum(['red', 'yellow', 'none']).optional(),
        diseases: z.array(z.string()).optional(),
        assignedHospital: z.object({
            id: z.string().min(1, 'Hospital is required'),
            name: z.string().min(1, 'Hospital name is required'),
        }),
        assignedAsha: z.string().optional(),
        gpsLocation: z
            .object({
                lat: z.number().optional(),
                lng: z.number().optional(),
                accuracy: z.number().nullable().optional(),
                placeName: z.string().nullable().optional(),
            })
            .optional()
            .nullable(),
        followUps: z.array(FollowUpSchema).optional(),
        patientStatus: z.enum(['Alive', 'Not Alive', 'Not Available']).optional(),
        patientDeathDate: z.string().optional(),
        aabhaId: z
            .string()
            .optional()
            .refine(
                (val) => {
                    if (!val || val.trim() === '') return true
                    const digitsOnly = val.replace(/-/g, '')
                    return /^\d{14}$/.test(digitsOnly)
                },
                { message: 'ABHA ID must be exactly 14 digits' }
            ),
        diagnosedDate: z.string().optional(),
        diagnosedYearsAgo: z.string().optional(),
        hospitalRegistrationDate: z.string().optional(),
        treatmentStartDate: z.string().nullable().optional(),
        treatmentEndDate: z.string().nullable().optional(),
        biopsyNumber: z.string().nullable().optional(),
        transferred: z.boolean().optional(),
        transferredFrom: z.string().optional(),
        hasAadhaar: z.boolean(),
        suspectedCase: z.boolean().optional(),
        hbcrID: z.string().optional(),
        hospitalRegistrationId: z.string().optional(),
        stageOfTheCancer: z
            .object({
                stage: z.enum(['Stage 0', 'Stage I', 'Stage II', 'Stage III', 'Stage IV']).optional(),
                subStage: z.enum(['A', 'B', 'C', 'D']).optional(),
            })
            .optional(),
        reasonOfRemoval: z.string().optional(),
        treatmentDetails: z.array(z.string().optional()).optional(),
        otherTreatmentDetails: z.string().optional(),
        insurance: InsuranceSchema,
        // Added triageLevel field
        triageLevel: z
            .enum(['critical', 'high', 'urgent', 'non-urgent'])
            .optional()
            .nullable(),
    })
    // Ensure DOB is provided
    .refine((data) => !!data.dob, {
        message: 'Date of birth is required.',
        path: ['dob'],
    })
    // Require cancer stage if cancer markers are present
    .refine(
        (data) => {
            const indicators = Boolean(
                data.hbcrID || data.biopsyNumber ||
                (data.diseases && data.diseases.some((d) => /cancer/i.test(String(d))))
            )
            if (!indicators) return true
            return Boolean(data.stageOfTheCancer && data.stageOfTheCancer.stage)
        },
        {
            message: 'Please select a cancer stage.',
            path: ['stageOfTheCancer', 'stage'],
        }
    )
    // Treatment date validations
    .refine(
        (data) => {
            if (!data.treatmentStartDate || !data.hospitalRegistrationDate) return true
            return new Date(data.treatmentStartDate) >= new Date(data.hospitalRegistrationDate)
        },
        {
            message: 'Treatment start date must be on or after registration date.',
            path: ['treatmentStartDate'],
        }
    )
    .refine(
        (data) => {
            if (!data.treatmentEndDate || !data.treatmentStartDate) return true
            return new Date(data.treatmentEndDate) >= new Date(data.treatmentStartDate)
        },
        {
            message: 'Treatment end date must be on or after treatment start date.',
            path: ['treatmentEndDate'],
        }
    )
    .refine(
        (data) => !(data.treatmentEndDate && !data.treatmentStartDate),
        {
            message: 'Cannot have treatment end date without start date.',
            path: ['treatmentEndDate'],
        }
    )
    // Death date logic
    .refine(
        (data) => {
            if (!data.patientDeathDate || !data.dob) return true
            const death = new Date(data.patientDeathDate)
            const dob = new Date(data.dob)
            return death >= dob && death <= new Date()
        },
        {
            message: 'Death date must be after birth and not in the future.',
            path: ['patientDeathDate'],
        }
    )

export type PatientFormInputs = z.infer<typeof PatientSchema>

// Fixed Patient Type with Firebase/Firestore metadata safety
export type Patient = PatientFormInputs & {
    id: string
}
