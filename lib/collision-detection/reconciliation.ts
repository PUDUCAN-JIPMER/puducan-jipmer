/**
 * Non-destructive collision reconciliation workflow
 * Preserves audit trail for manual review and approval
 */

type CollisionRecord = {
	id: string
	patientAId: string
	patientBId: string
	hospitalAId: string
	hospitalBId: string
	similarityScore: number
	matchingFields: string[]
	riskLevel: 'high' | 'medium' | 'low'
	status: 'pending' | 'approved' | 'rejected' | 'merged'
	createdAt: Date
	reviewedAt?: Date
	reviewedBy?: string
	notes?: string
	// Merge decision (if approved)
	mergeDecision?: 'keep_a' | 'keep_b' | 'manual_review'
	mergedPatientId?: string // ID of primary record after merge
}

type ReconciliationAudit = {
	id: string
	collisionRecordId: string
	action: 'flag' | 'review' | 'approve' | 'reject' | 'merge'
	userId?: string
	timestamp: Date
	metadata?: Record<string, any>
}

export interface CollisionReconciler {
	/**
	 * Flag a collision for manual review
	 */
	flagCollision(
		patientAId: string,
		patientBId: string,
		hospitalAId: string,
		hospitalBId: string,
		similarity: {
			score: number
			fields: string[]
			riskLevel: 'high' | 'medium' | 'low'
		}
	): Promise<CollisionRecord>

	/**
	 * Review and approve/reject collision
	 */
	reviewCollision(
		collisionId: string,
		decision: 'approved' | 'rejected',
		mergeDecision?: 'keep_a' | 'keep_b' | 'manual_review',
		notes?: string,
		userId?: string
	): Promise<CollisionRecord>

	/**
	 * Execute merge for approved collision
	 */
	mergePatients(
		collisionId: string,
		primaryPatientId: string,
		userId?: string
	): Promise<{
		success: boolean
		mergedPatientId: string
		auditId: string
	}>

	/**
	 * Get pending collisions for review
	 */
	getPendingCollisions(hospitalId?: string): Promise<CollisionRecord[]>

	/**
	 * Get audit trail for a collision
	 */
	getAuditTrail(collisionId: string): Promise<ReconciliationAudit[]>
}

/**
 * In-memory reconciliation implementation
 * In production, this would use a database (Firestore, PostgreSQL, etc.)
 */
export class InMemoryReconciler implements CollisionReconciler {
	private collisions: Map<string, CollisionRecord> = new Map()
	private audits: Map<string, ReconciliationAudit[]> = new Map()
	private nextId = 1

	async flagCollision(
		patientAId: string,
		patientBId: string,
		hospitalAId: string,
		hospitalBId: string,
		similarity: {
			score: number
			fields: string[]
			riskLevel: 'high' | 'medium' | 'low'
		}
	): Promise<CollisionRecord> {
		const id = `collision_${this.nextId++}`
		const record: CollisionRecord = {
			id,
			patientAId,
			patientBId,
			hospitalAId,
			hospitalBId,
			similarityScore: similarity.score,
			matchingFields: similarity.fields,
			riskLevel: similarity.riskLevel,
			status: 'pending',
			createdAt: new Date(),
		}

		this.collisions.set(id, record)
		this.audits.set(id, [
			{
				id: `audit_${this.nextId++}`,
				collisionRecordId: id,
				action: 'flag',
				timestamp: new Date(),
			},
		])

		return record
	}

	async reviewCollision(
		collisionId: string,
		decision: 'approved' | 'rejected',
		mergeDecision?: 'keep_a' | 'keep_b' | 'manual_review',
		notes?: string,
		userId?: string
	): Promise<CollisionRecord> {
		const collision = this.collisions.get(collisionId)
		if (!collision) {
			throw new Error(`Collision ${collisionId} not found`)
		}

		collision.status = decision === 'approved' ? 'approved' : 'rejected'
		collision.reviewedAt = new Date()
		collision.reviewedBy = userId
		collision.notes = notes
		collision.mergeDecision = mergeDecision

		const audits = this.audits.get(collisionId) || []
		audits.push({
			id: `audit_${this.nextId++}`,
			collisionRecordId: collisionId,
			action: decision === 'approved' ? 'approve' : 'reject',
			userId,
			timestamp: new Date(),
			metadata: { mergeDecision, notes },
		})
		this.audits.set(collisionId, audits)

		return collision
	}

	async mergePatients(
		collisionId: string,
		primaryPatientId: string,
		userId?: string
	): Promise<{
		success: boolean
		mergedPatientId: string
		auditId: string
	}> {
		const collision = this.collisions.get(collisionId)
		if (!collision) {
			throw new Error(`Collision ${collisionId} not found`)
		}

		if (collision.status !== 'approved') {
			throw new Error(`Collision must be approved before merge`)
		}

		collision.status = 'merged'
		collision.mergedPatientId = primaryPatientId

		const auditId = `audit_${this.nextId++}`
		const audits = this.audits.get(collisionId) || []
		audits.push({
			id: auditId,
			collisionRecordId: collisionId,
			action: 'merge',
			userId,
			timestamp: new Date(),
			metadata: { primaryPatientId },
		})
		this.audits.set(collisionId, audits)

		return {
			success: true,
			mergedPatientId: primaryPatientId,
			auditId,
		}
	}

	async getPendingCollisions(hospitalId?: string): Promise<CollisionRecord[]> {
		const pending = Array.from(this.collisions.values()).filter(
			(c) => c.status === 'pending' && (!hospitalId || c.hospitalAId === hospitalId)
		)

		return pending.sort((a, b) => b.similarityScore - a.similarityScore)
	}

	async getAuditTrail(collisionId: string): Promise<ReconciliationAudit[]> {
		return this.audits.get(collisionId) || []
	}
}
