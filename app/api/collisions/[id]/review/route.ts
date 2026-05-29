import { NextRequest, NextResponse } from 'next/server'
import { FirestoreCollisionReconciler } from '@/lib/collision-detection/firestore-reconciler'

const reconciler = new FirestoreCollisionReconciler()

/**
 * POST /api/collisions/[id]/review
 * Review and approve/reject a collision
 */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
	try {
		const { decision, mergeDecision, notes, userId } = await req.json()

		if (!['approved', 'rejected'].includes(decision)) {
			return NextResponse.json({ error: 'Invalid decision' }, { status: 400 })
		}

		const result = await reconciler.reviewCollision(
			params.id,
			decision,
			mergeDecision,
			notes,
			userId
		)

		return NextResponse.json(result)
	} catch (error) {
		console.error('Review collision error:', error)
		return NextResponse.json({ error: 'Review failed' }, { status: 500 })
	}
}

/**
 * GET /api/collisions/[id]/review
 * Get collision details
 */
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
	try {
		const trail = await reconciler.getAuditTrail(params.id)
		return NextResponse.json({ auditTrail: trail })
	} catch (error) {
		console.error('Get audit trail error:', error)
		return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
	}
}
