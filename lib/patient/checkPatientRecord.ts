import { db } from '@/firebase'
import { Patient } from '@/schema/patient'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { toast } from 'sonner'

/*
    *this function check the patients record in the db
     and returns true if a match exists , that signifies a record already exists.

    TODO:
        we can either stop with notification or go one step further of transfer here, or request transfer to the respective hospital
*/

export const checkAadhaarDuplicateUtil = async (
    aadhaarId: string
): Promise<{ exists: boolean; patientId?: string }> => {
    if (!aadhaarId || aadhaarId.length !== 12) {
        return { exists: false }
    }
    const patientsRef = collection(db, 'patients')
    const q = query(patientsRef, where('aadhaarId', '==', aadhaarId))
    const querySnapshot = await getDocs(q)

    if (!querySnapshot.empty) {
        const patientId = querySnapshot.docs[0].id
        // Todo: need to send the patient name also in the return type
        // const patientName = querySnapshot.docs[0].name;

        toast.warning('Patient with this Aadhaar already exists.', {
            // action: {
            // 	label: (
            // 		<span className='flex items-center text-blue-500'>
            // 			<ArrowRightCircle className='h-4 w-4 mr-1' />{' '}
            // 			Transfer
            // 		</span>
            // 	),
            // 	onClick: () =>
            // 		updatePatientAssignedPhc(
            // 			patientId,
            // 			selectedPhc
            // 		),
            // },
            duration: 5000,
        })

        return { exists: true, patientId }
    }
    return { exists: false }
}

/*
    *this function check the patients record in the db
     and returns true if a match exists , that signifies a record already exists.
     with the help of name and phone number via fuzzy logic to check whether any record exists with
     the possibility of more than 90% match, for the patients who don't have aadhaar number to check the reduntancy

    TODO:
        we can either stop with notification or go one step further of transfer here, or request transfer to the respective hospital
*/

export const checkNamePhoneDuplicate = async (
    name: string,
    phoneNumbers: string[]
): Promise<{ exists: boolean; patientId?: string }> => {
    if (!name.trim() || phoneNumbers.length === 0) {
        return { exists: false }
    }

    const patientsRef = collection(db, 'patients')
    const querySnapshot = await getDocs(patientsRef)

    const cleanedName = name.toLowerCase().trim()
    const cleanedPhoneNumbers = phoneNumbers
        .map((num) => num.replace(/\D/g, ''))
        .filter((num) => num.length === 10)

    let possibleMatchFound = false
    let matchedPatientId: string | undefined

    for (const doc of querySnapshot.docs) {
        const patient = doc.data() as Patient
        const patientName = patient.name.toLowerCase().trim()
        const patientPhoneNumbers = patient.phoneNumber || []

        const nameMatch =
            patientName.includes(cleanedName) ||
            cleanedName.includes(patientName) ||
            (cleanedName.length > 3 &&
                patientName.startsWith(
                    cleanedName.substring(0, Math.floor(cleanedName.length * 0.9))
                ))

        const phoneMatch = cleanedPhoneNumbers.some((num) => patientPhoneNumbers.includes(num))

        if (nameMatch && phoneMatch){
            possibleMatchFound = true
            matchedPatientId = doc.id
            break
        }
    }

    if (possibleMatchFound && matchedPatientId) {
        toast.info(
            'Possible match found based on name and phone number. Ask if they already provided details.',
            {
                // action: {
                // 	label: (
                // 		<span className='flex items-center text-blue-500'>
                // 			<ArrowRightCircle className='h-4 w-4 mr-1' />{' '}
                // 			Transfer
                // 		</span>
                // 	),
                // 	onClick: () =>
                // 		updatePatientAssignedPhc(
                // 			matchedPatientId!,
                // 			selectedPhc
                // 		),
                // },
                duration: 5000,
            }
        )
        return { exists: true, patientId: matchedPatientId }
    }
    return { exists: false }
}
