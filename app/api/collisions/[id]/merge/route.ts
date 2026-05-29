import { NextRequest, NextResponse } from 'next/server'
import { FirestoreCollisionReconciler } from '@/lib/collision-detection/firestore-reconciler'

const reconciler = new FirestoreCollisionReconciler()

/**
 * POST /api/collisions/[id]/merge
 * Execute merge for approved collision
 */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
	try {
		const { primaryPatientId, secondaryPatientId, userId } = await req.json()

		if (!primaryPatientId || !secondaryPatientId) {
			return NextResponse.json(
				{ error: 'Primary and secondary patient IDs required' },
				{ status: 400 }
			)
		}

		const result = await reconciler.mergePatients(
			params.id,
			primaryPatientId,
			secondaryPatientId,
			userId
		)

		return NextResponse.json(result)
	} catch (error: any) {
		console.error('Merge patients error:', error)
		return NextResponse.json(
			{ error: error.message || 'Merge failed' },
			{ status: 500 }
		)
	}
}
