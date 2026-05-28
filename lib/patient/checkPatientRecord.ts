import { db } from '@/firebase'
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

