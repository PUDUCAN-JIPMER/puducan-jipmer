import { NextRequest, NextResponse } from 'next/server'
import { FirestoreCollisionReconciler } from '@/lib/collision-detection/firestore-reconciler'

const reconciler = new FirestoreCollisionReconciler()

/**
 * GET /api/collisions/pending?hospitalId=h1
 * Get pending collisions for review
 */
export async function GET(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url)
		const hospitalId = searchParams.get('hospitalId') || undefined

		const pending = await reconciler.getPendingCollisions(hospitalId)

		return NextResponse.json({ collisions: pending })
	} catch (error) {
		console.error('Get pending collisions error:', error)
		return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
	}
}
