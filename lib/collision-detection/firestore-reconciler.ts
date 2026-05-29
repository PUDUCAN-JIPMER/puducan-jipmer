import { getFirestore, collection, addDoc, query, where, getDocs, updateDoc, doc, writeBatch, serverTimestamp } from 'firebase/firestore'
import { detectCollisions } from '@/lib/collision-detection/similarity'

export interface PatientRecord {
	id: string
	name: string
	dob?: string
	phoneNumber?: string[]
	aadhaarId?: string
	aabhaId?: string
	bloodGroup?: string
	sex?: string
	assignedHospital: {
		id: string
		name: string
	}
	diagnosedDate?: string
	biopsyNumber?: string
	hbcrID?: string
	createdAt?: string
}

/**
 * Firestore-based collision reconciler
 * Replaces InMemoryReconciler for production
 */
export class FirestoreCollisionReconciler {
	private db = getFirestore()

	/**
	 * Run collision detection and flag high-risk cases
	 */
	async analyzeAndFlagCollisions(patients: PatientRecord[]) {
		const collisions = detectCollisions(patients)
		const batch = writeBatch(this.db)
		const flagged = []

		for (const collision of collisions.filter((c) => c.riskLevel === 'high')) {
			const collisionRef = doc(collection(this.db, 'collisions'))
			batch.set(collisionRef, {
				patientAId: collision.patientA.id,
				patientBId: collision.patientB.id,
				hospitalAId: collision.patientA.assignedHospital.id,
				hospitalBId: collision.patientB.assignedHospital.id,
				hospitalAName: collision.patientA.assignedHospital.name,
				hospitalBName: collision.patientB.assignedHospital.name,
				similarityScore: collision.similarityScore,
				matchingFields: collision.matchingFields,
				riskLevel: collision.riskLevel,
				status: 'pending',
				createdAt: serverTimestamp(),
			})
			flagged.push(collisionRef.id)
		}

		if (flagged.length > 0) {
			await batch.commit()
		}

		return {
			totalCollisions: collisions.length,
			flaggedForReview: flagged.length,
			collisions: collisions.map((c) => ({
				patientAId: c.patientA.id,
				patientBId: c.patientB.id,
				score: c.similarityScore,
				riskLevel: c.riskLevel,
			})),
		}
	}

	/**
	 * Get pending collisions for review
	 */
	async getPendingCollisions(hospitalId?: string) {
		const collisionsRef = collection(this.db, 'collisions')
		const q = query(collisionsRef, where('status', '==', 'pending'))

		const snapshot = await getDocs(q)
		let results = snapshot.docs.map((doc) => ({
			id: doc.id,
			...doc.data(),
		}))

		if (hospitalId) {
			results = results.filter(
				(c: any) => c.hospitalAId === hospitalId || c.hospitalBId === hospitalId
			)
		}

		return results.sort((a: any, b: any) => b.similarityScore - a.similarityScore)
	}

	/**
	 * Review and approve/reject collision
	 */
	async reviewCollision(
		collisionId: string,
		decision: 'approved' | 'rejected',
		mergeDecision?: 'keep_a' | 'keep_b' | 'manual_review',
		notes?: string,
		userId?: string
	) {
		const collisionRef = doc(this.db, 'collisions', collisionId)

		const updateData: any = {
			status: decision === 'approved' ? 'approved' : 'rejected',
			reviewedAt: serverTimestamp(),
			reviewedBy: userId,
			notes,
		}

		if (decision === 'approved') {
			updateData.mergeDecision = mergeDecision || 'manual_review'
		}

		await updateDoc(collisionRef, updateData)

		// Log audit
		await addDoc(collection(this.db, 'collisions', collisionId, 'audit'), {
			action: decision === 'approved' ? 'approve' : 'reject',
			userId,
			timestamp: serverTimestamp(),
			metadata: { decision, mergeDecision, notes },
		})

		return { success: true, status: updateData.status }
	}

	/**
	 * Execute merge for approved collision
	 */
	async mergePatients(
		collisionId: string,
		primaryPatientId: string,
		secondaryPatientId: string,
		userId?: string
	) {
		const collisionRef = doc(this.db, 'collisions', collisionId)

		// Get collision details
		const collisionSnap = await getDocs(query(collection(this.db, 'collisions')))
		const collision = collisionSnap.docs
			.map((d) => ({ id: d.id, ...d.data() }))
			.find((c: any) => c.id === collisionId)

		if (!collision || collision.status !== 'approved') {
			throw new Error('Collision must be approved before merge')
		}

		// Mark patients as merged
		const batch = writeBatch(this.db)

		batch.update(doc(this.db, 'patients', primaryPatientId), {
			isMerged: false,
			mergeHistory: [],
		})

		batch.update(doc(this.db, 'patients', secondaryPatientId), {
			isMerged: true,
			mergedIntoPatientId: primaryPatientId,
			mergeTimestamp: serverTimestamp(),
		})

		batch.update(collisionRef, {
			status: 'merged',
			mergedPatientId: primaryPatientId,
			mergedAt: serverTimestamp(),
			mergedBy: userId,
		})

		await batch.commit()

		// Audit trail
		await addDoc(collection(this.db, 'collisions', collisionId, 'audit'), {
			action: 'merge',
			userId,
			timestamp: serverTimestamp(),
			metadata: {
				primaryPatientId,
				secondaryPatientId,
			},
		})

		return {
			success: true,
			mergedPatientId: primaryPatientId,
			collisionId,
		}
	}

	/**
	 * Get audit trail for collision
	 */
	async getAuditTrail(collisionId: string) {
		const auditRef = collection(this.db, 'collisions', collisionId, 'audit')
		const snapshot = await getDocs(auditRef)

		return snapshot.docs
			.map((doc) => ({
				id: doc.id,
				...doc.data(),
			}))
			.sort((a: any, b: any) => (a.timestamp?.seconds || 0) - (b.timestamp?.seconds || 0))
	}

	/**
	 * Get collision summary by hospital
	 */
	async getHospitalCollisionSummary(hospitalId: string) {
		const collisionsRef = collection(this.db, 'collisions')
		const q = query(
			collisionsRef,
			where('status', '==', 'pending'),
			where('riskLevel', 'in', ['high', 'medium'])
		)

		const snapshot = await getDocs(q)
		const collisions = snapshot.docs.map((d) => d.data())

		const filtered = collisions.filter(
			(c: any) => c.hospitalAId === hospitalId || c.hospitalBId === hospitalId
		)

		return {
			hospitalId,
			totalPending: filtered.length,
			highRisk: filtered.filter((c: any) => c.riskLevel === 'high').length,
			mediumRisk: filtered.filter((c: any) => c.riskLevel === 'medium').length,
		}
	}
}
