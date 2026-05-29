import { NextRequest, NextResponse } from 'next/server'
import { FirestoreCollisionReconciler } from '@/lib/collision-detection/firestore-reconciler'
import { getFirestore, collection, getDocs } from 'firebase/firestore'

const reconciler = new FirestoreCollisionReconciler()

/**
 * POST /api/collisions/analyze
 * Fetch all patients and run collision detection
 */
export async function POST(req: NextRequest) {
	try {
		const db = getFirestore()
		const patientsRef = collection(db, 'patients')
		const snapshot = await getDocs(patientsRef)

		const patients = snapshot.docs.map((doc) => ({
			id: doc.id,
			...doc.data(),
		}))

		const result = await reconciler.analyzeAndFlagCollisions(patients as any)

		return NextResponse.json(result)
	} catch (error) {
		console.error('Collision analysis error:', error)
		return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
	}
}
