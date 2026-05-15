import z from 'zod'

export const InsuranceSchema = z
    .object({
        type: z.enum(['none', 'Government', 'Private']),
        id: z.string().optional(),
    })
    .optional()

export const FollowUpSchema = z.object({
    date: z.string().optional(),
    remarks: z.string().optional(),
})

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
            })
            .optional()
            .nullable(),
        followUps: z.array(FollowUpSchema).optional(),
        patientStatus: z.enum(['Alive', 'Not Alive', 'Not Available']).optional(),
        patientDeathDate: z.string().optional(),
        // treatmentStatus: z.enum(['Ongoing', 'FollowUp', 'Stopped', 'Not Available']).optional(),
        aabhaId: z.string().optional(),
        diagnosedDate: z.string().optional(),
        diagnosedYearsAgo: z.string().optional(),
        // new fields after second meet
        hospitalRegistrationDate: z.string().optional(),
        treatmentStartDate: z.string().nullable().optional(),
        treatmentEndDate: z.string().nullable().optional(),
        biopsyNumber: z.string().nullable().optional(),
        transferred: z.boolean().optional(),
        transferredFrom: z.string().optional(),
        // Fields for internal use
        hasAadhaar: z.boolean(),
        suspectedCase: z.boolean().optional(),
        // additional fields after second meet
        hbcrID: z.string().optional(),
        hospitalRegistrationId: z.string().optional(),
        stageOfTheCancer: z.string().optional(),
        reasonOfRemoval: z.string().optional(),
        treatmentDetails: z.array(z.string().optional()).optional(),
        otherTreatmentDetails: z.string().optional(),
        insurance: InsuranceSchema,
    })
    .refine((data) => data.dob, {
        message: 'Please enter either age or date of birth.',
        path: ['age', 'dob'],
    })
    // ✅ treatmentStartDate >= hospitalRegistrationDate
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
    // ✅ treatmentEndDate >= treatmentStartDate
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
    // ✅ treatmentEndDate cannot exist if treatmentStartDate is missing
    .refine(
        (data) => {
            if (data.treatmentEndDate && !data.treatmentStartDate) return false
            return true
        },
        {
            message: 'Cannot have treatment end date without start date.',
            path: ['treatmentEndDate'],
        }
    )
    .refine(
        (data) => {
            if (!data.patientDeathDate) return true // optional field
            const death = new Date(data.patientDeathDate)
            const today = new Date()

            // must not be in future
            if (death > today) return false

            // must not be before dob
            if (data.dob) {
                const dob = new Date(data.dob)
                if (death < dob) return false
            }

            return true
        },
        {
            message: 'Death date must be after date of birth and not in the future.',
            path: ['patientDeathDate'],
        }
    )
export type PatientFormInputs = z.infer<typeof PatientSchema>

// This type is for fetched data from the database, which always has an ID
export type Patient = PatientFormInputs & {
    id: string
    _hasPendingWrites?: boolean
}
