import z from 'zod'

export const CollisionMatchSchema = z.object({
	patientA: z.object({
		id: z.string(),
		name: z.string(),
		dob: z.string().optional(),
		phoneNumber: z.array(z.string()).optional(),
		aadhaarId: z.string().optional(),
		aabhaId: z.string().optional(),
		bloodGroup: z.string().optional(),
		sex: z.string().optional(),
		assignedHospital: z.object({
			id: z.string(),
			name: z.string(),
		}),
		diagnosedDate: z.string().optional(),
		biopsyNumber: z.string().optional(),
		hbcrID: z.string().optional(),
		createdAt: z.string().optional(),
	}),
	patientB: z.object({
		id: z.string(),
		name: z.string(),
		dob: z.string().optional(),
		phoneNumber: z.array(z.string()).optional(),
		aadhaarId: z.string().optional(),
		aabhaId: z.string().optional(),
		bloodGroup: z.string().optional(),
		sex: z.string().optional(),
		assignedHospital: z.object({
			id: z.string(),
			name: z.string(),
		}),
		diagnosedDate: z.string().optional(),
		biopsyNumber: z.string().optional(),
		hbcrID: z.string().optional(),
		createdAt: z.string().optional(),
	}),
	similarityScore: z.number().min(0).max(1),
	matchingFields: z.array(z.string()),
	riskLevel: z.enum(['high', 'medium', 'low']),
})

export const CollisionRecordSchema = z.object({
	id: z.string(),
	patientAId: z.string(),
	patientBId: z.string(),
	hospitalAId: z.string(),
	hospitalBId: z.string(),
	similarityScore: z.number().min(0).max(1),
	matchingFields: z.array(z.string()),
	riskLevel: z.enum(['high', 'medium', 'low']),
	status: z.enum(['pending', 'approved', 'rejected', 'merged']),
	createdAt: z.date(),
	reviewedAt: z.date().optional(),
	reviewedBy: z.string().optional(),
	notes: z.string().optional(),
	mergeDecision: z.enum(['keep_a', 'keep_b', 'manual_review']).optional(),
	mergedPatientId: z.string().optional(),
})

export const ReconciliationAuditSchema = z.object({
	id: z.string(),
	collisionRecordId: z.string(),
	action: z.enum(['flag', 'review', 'approve', 'reject', 'merge']),
	userId: z.string().optional(),
	timestamp: z.date(),
	metadata: z.record(z.any()).optional(),
})

export const CollisionAlertSchema = z.object({
	totalCollisions: z.number(),
	byHospital: z.record(
		z.object({
			hospitalName: z.string(),
			highRiskCount: z.number(),
			mediumRiskCount: z.number(),
		})
	),
})

export type CollisionMatch = z.infer<typeof CollisionMatchSchema>
export type CollisionRecord = z.infer<typeof CollisionRecordSchema>
export type ReconciliationAudit = z.infer<typeof ReconciliationAuditSchema>
export type CollisionAlert = z.infer<typeof CollisionAlertSchema>
