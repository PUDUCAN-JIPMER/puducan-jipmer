import { describe, it, expect, beforeEach } from 'vitest'
import { detectCollisions, getCollisionAlert } from '@/lib/collision-detection/similarity'
import { InMemoryReconciler } from '@/lib/collision-detection/reconciliation'

describe('Patient Identity Collision Detection', () => {
	describe('Similarity Detection', () => {
		it('should detect high-similarity collisions across hospitals', () => {
			const patients = [
				{
					id: 'p1',
					name: 'Shiva Kumar',
					dob: '1970-01-15',
					sex: 'male',
					phoneNumber: ['9876543210'],
					bloodGroup: 'O+',
					diagnosedDate: '2024-01-10',
					assignedHospital: { id: 'h1', name: 'Hospital A' },
				},
				{
					id: 'p2',
					name: 'S. Kumar',
					dob: '1970-01-15',
					sex: 'male',
					phoneNumber: ['9876543210'],
					bloodGroup: 'O+',
					diagnosedDate: '2024-01-12',
					assignedHospital: { id: 'h2', name: 'Hospital B' },
				},
			]

			const collisions = detectCollisions(patients)

			expect(collisions).toHaveLength(1)
			expect(collisions[0].similarityScore).toBeGreaterThan(0.75)
			expect(collisions[0].riskLevel).toBe('high')
			expect(collisions[0].matchingFields).toContain('name')
		})

		it('should handle transliteration variations', () => {
			const patients = [
				{
					id: 'p1',
					name: 'Raj Patel',
					dob: '1985-05-20',
					sex: 'male',
					assignedHospital: { id: 'h1', name: 'Hospital A' },
				},
				{
					id: 'p2',
					name: 'Raj Patel',
					dob: '1985-05-20',
					sex: 'male',
					assignedHospital: { id: 'h2', name: 'Hospital B' },
				},
			]

			const collisions = detectCollisions(patients)

			expect(collisions).toHaveLength(1)
			expect(collisions[0].similarityScore).toBe(1)
		})

		it('should ignore same-hospital records', () => {
			const patients = [
				{
					id: 'p1',
					name: 'Shiva Kumar',
					dob: '1970-01-15',
					assignedHospital: { id: 'h1', name: 'Hospital A' },
				},
				{
					id: 'p2',
					name: 'S. Kumar',
					dob: '1970-01-15',
					assignedHospital: { id: 'h1', name: 'Hospital A' },
				},
			]

			const collisions = detectCollisions(patients)

			expect(collisions).toHaveLength(0)
		})

		it('should filter low-similarity matches', () => {
			const patients = [
				{
					id: 'p1',
					name: 'Shiva Kumar',
					dob: '1970-01-15',
					assignedHospital: { id: 'h1', name: 'Hospital A' },
				},
				{
					id: 'p2',
					name: 'Vivek Singh',
					dob: '1980-05-20',
					assignedHospital: { id: 'h2', name: 'Hospital B' },
				},
			]

			const collisions = detectCollisions(patients)

			expect(collisions).toHaveLength(0)
		})

		it('should rank collisions by similarity score', () => {
			const patients = [
				{
					id: 'p1',
					name: 'Shiva Kumar',
					dob: '1970-01-15',
					assignedHospital: { id: 'h1', name: 'Hospital A' },
				},
				{
					id: 'p2',
					name: 'S. Kumar',
					dob: '1970-01-15',
					assignedHospital: { id: 'h2', name: 'Hospital B' },
				},
				{
					id: 'p3',
					name: 'Shiva K',
					dob: '1970-01-15',
					assignedHospital: { id: 'h3', name: 'Hospital C' },
				},
			]

			const collisions = detectCollisions(patients)

			expect(collisions.length).toBeGreaterThan(0)
			expect(collisions[0].similarityScore).toBeGreaterThanOrEqual(collisions[1]?.similarityScore || 0)
		})
	})

	describe('Collision Alert Aggregation', () => {
		it('should aggregate collisions by hospital', () => {
			const collisions = [
				{
					patientA: {
						id: 'p1',
						name: 'Shiva Kumar',
						assignedHospital: { id: 'h1', name: 'Hospital A' },
					},
					patientB: {
						id: 'p2',
						name: 'S. Kumar',
						assignedHospital: { id: 'h2', name: 'Hospital B' },
					},
					similarityScore: 0.9,
					matchingFields: ['name', 'dob'],
					riskLevel: 'high' as const,
				},
			]

			const alert = getCollisionAlert(collisions as any)

			expect(alert.totalCollisions).toBe(1)
			expect(alert.byHospital['h1']).toBeDefined()
			expect(alert.byHospital['h1'].highRiskCount).toBe(1)
		})
	})

	describe('Reconciliation Workflow', () => {
		let reconciler: InMemoryReconciler

		beforeEach(() => {
			reconciler = new InMemoryReconciler()
		})

		it('should flag collision for review', async () => {
			const collision = await reconciler.flagCollision(
				'p1',
				'p2',
				'h1',
				'h2',
				{
					score: 0.85,
					fields: ['name', 'dob'],
					riskLevel: 'high',
				}
			)

			expect(collision.status).toBe('pending')
			expect(collision.similarityScore).toBe(0.85)
		})

		it('should approve collision', async () => {
			const collision = await reconciler.flagCollision(
				'p1',
				'p2',
				'h1',
				'h2',
				{
					score: 0.85,
					fields: ['name', 'dob'],
					riskLevel: 'high',
				}
			)

			const reviewed = await reconciler.reviewCollision(
				collision.id,
				'approved',
				'keep_a',
				'Confirmed duplicate patient',
				'user123'
			)

			expect(reviewed.status).toBe('approved')
			expect(reviewed.mergeDecision).toBe('keep_a')
			expect(reviewed.notes).toBe('Confirmed duplicate patient')
		})

		it('should merge approved collision', async () => {
			const collision = await reconciler.flagCollision(
				'p1',
				'p2',
				'h1',
				'h2',
				{
					score: 0.85,
					fields: ['name', 'dob'],
					riskLevel: 'high',
				}
			)

			await reconciler.reviewCollision(
				collision.id,
				'approved',
				'keep_a',
				'Confirmed duplicate',
				'user123'
			)

			const result = await reconciler.mergePatients(collision.id, 'p1', 'user123')

			expect(result.success).toBe(true)
			expect(result.mergedPatientId).toBe('p1')
		})

		it('should prevent merge of non-approved collision', async () => {
			const collision = await reconciler.flagCollision(
				'p1',
				'p2',
				'h1',
				'h2',
				{
					score: 0.85,
					fields: ['name', 'dob'],
					riskLevel: 'high',
				}
			)

			await expect(
				reconciler.mergePatients(collision.id, 'p1', 'user123')
			).rejects.toThrow('Collision must be approved before merge')
		})

		it('should track audit trail', async () => {
			const collision = await reconciler.flagCollision(
				'p1',
				'p2',
				'h1',
				'h2',
				{
					score: 0.85,
					fields: ['name', 'dob'],
					riskLevel: 'high',
				}
			)

			await reconciler.reviewCollision(
				collision.id,
				'approved',
				'keep_a',
				'Confirmed',
				'user123'
			)

			const trail = await reconciler.getAuditTrail(collision.id)

			expect(trail.length).toBeGreaterThan(1)
			expect(trail[0].action).toBe('flag')
			expect(trail[1].action).toBe('approve')
		})

		it('should get pending collisions', async () => {
			await reconciler.flagCollision('p1', 'p2', 'h1', 'h2', {
				score: 0.85,
				fields: ['name'],
				riskLevel: 'high',
			})

			await reconciler.flagCollision('p3', 'p4', 'h1', 'h2', {
				score: 0.8,
				fields: ['dob'],
				riskLevel: 'medium',
			})

			const pending = await reconciler.getPendingCollisions()

			expect(pending).toHaveLength(2)
			expect(pending[0].riskLevel).toBe('high')
		})
	})
})
