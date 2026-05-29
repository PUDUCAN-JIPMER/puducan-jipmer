import { NextRequest, NextResponse } from 'next/server'
import { FirestoreCollisionReconciler } from '@/lib/collision-detection/firestore-reconciler'

const reconciler = new FirestoreCollisionReconciler()

/**
 * GET /api/collisions/hospital/[id]/summary
 * Get collision summary for a specific hospital
 */
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
	try {
		const summary = await reconciler.getHospitalCollisionSummary(params.id)
		return NextResponse.json(summary)
	} catch (error) {
		console.error('Hospital summary error:', error)
		return NextResponse.json({ error: 'Failed to fetch summary' }, { status: 500 })
	}
}
