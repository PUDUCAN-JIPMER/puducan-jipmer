/**
 * Collision Review Component
 * Displays pending patient identity collisions for manual review
 */

'use client'

import { useState } from 'react'
import { useCollisionDetection } from '@/hooks/collision/useCollisionDetection'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

type CollisionData = {
	id: string
	patientAId: string
	patientBId: string
	hospitalAId: string
	hospitalBId: string
	hospitalAName: string
	hospitalBName: string
	similarityScore: number
	matchingFields: string[]
	riskLevel: 'high' | 'medium' | 'low'
	status: string
}

export function CollisionReviewPanel({ hospitalId }: { hospitalId?: string }) {
	const { getPendingCollisions, reviewCollision, mergePatients } =
		useCollisionDetection(hospitalId)
	const [selectedCollision, setSelectedCollision] = useState<string | null>(null)
	const [userId, setUserId] = useState<string>('')

	const collisions = (getPendingCollisions.data || []) as CollisionData[]

	const getRiskColor = (riskLevel: string) => {
		switch (riskLevel) {
			case 'high':
				return 'bg-red-100 text-red-800'
			case 'medium':
				return 'bg-yellow-100 text-yellow-800'
			default:
				return 'bg-green-100 text-green-800'
		}
	}

	if (getPendingCollisions.isPending) {
		return <div className="p-4">Loading collisions...</div>
	}

	if (collisions.length === 0) {
		return <div className="p-4 text-gray-600">No pending collisions to review</div>
	}

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h2 className="text-lg font-semibold">Pending Patient Collisions</h2>
				<Badge variant="outline">{collisions.length} to review</Badge>
			</div>

			<div className="space-y-3">
				{collisions.map((collision) => (
					<Card key={collision.id} className="p-4">
						<div className="space-y-3">
							<div className="flex items-start justify-between">
								<div className="flex-1">
									<h3 className="font-semibold">
										{collision.patientAId} ↔️ {collision.patientBId}
									</h3>
									<p className="text-sm text-gray-600">
										{collision.hospitalAName} ↔️ {collision.hospitalBName}
									</p>
								</div>
								<Badge className={getRiskColor(collision.riskLevel)}>
									{collision.riskLevel.toUpperCase()}
								</Badge>
							</div>

							<div className="bg-gray-50 p-3 rounded">
								<div className="flex items-center justify-between mb-2">
									<span className="text-sm font-medium">Similarity Score</span>
									<span className="text-lg font-bold text-blue-600">
										{(collision.similarityScore * 100).toFixed(0)}%
									</span>
								</div>

								<div>
									<span className="text-xs font-medium text-gray-600">Matching Fields</span>
									<div className="flex gap-2 mt-1 flex-wrap">
										{collision.matchingFields.map((field) => (
											<Badge key={field} variant="secondary" className="text-xs">
												{field.replace('_', ' ')}
											</Badge>
										))}
									</div>
								</div>
							</div>

							{selectedCollision === collision.id ? (
								<CollisionDecisionForm
									collisionId={collision.id}
									patientAId={collision.patientAId}
									patientBId={collision.patientBId}
									userId={userId}
									setUserId={setUserId}
									onSubmit={async (decision) => {
										if (decision.decision === 'approved') {
											await reviewCollision.mutateAsync({
												collisionId: collision.id,
												decision: 'approved',
												mergeDecision: decision.mergeDecision,
												notes: decision.notes,
												userId,
											})

											if (decision.mergeDecision !== 'manual_review') {
												const primaryId =
													decision.mergeDecision === 'keep_a'
														? collision.patientAId
														: collision.patientBId
												const secondaryId =
													decision.mergeDecision === 'keep_a'
														? collision.patientBId
														: collision.patientAId

												await mergePatients.mutateAsync({
													collisionId: collision.id,
													primaryPatientId: primaryId,
													secondaryPatientId: secondaryId,
													userId,
												})
											}
										} else {
											await reviewCollision.mutateAsync({
												collisionId: collision.id,
												decision: 'rejected',
												notes: decision.notes,
												userId,
											})
										}
										setSelectedCollision(null)
									}}
									isLoading={
										reviewCollision.isPending || mergePatients.isPending
									}
								/>
							) : (
								<Button
									variant="outline"
									onClick={() => setSelectedCollision(collision.id)}
									className="w-full"
								>
									Review Collision
								</Button>
							)}
						</div>
					</Card>
				))}
			</div>
		</div>
	)
}

function CollisionDecisionForm({
	collisionId,
	patientAId,
	patientBId,
	userId,
	setUserId,
	onSubmit,
	isLoading,
}: {
	collisionId: string
	patientAId: string
	patientBId: string
	userId: string
	setUserId: (id: string) => void
	onSubmit: (data: {
		decision: 'approved' | 'rejected'
		mergeDecision?: 'keep_a' | 'keep_b' | 'manual_review'
		notes?: string
	}) => Promise<void>
	isLoading: boolean
}) {
	const [decision, setDecision] = useState<'approved' | 'rejected'>('approved')
	const [mergeDecision, setMergeDecision] = useState<'keep_a' | 'keep_b' | 'manual_review'>(
		'manual_review'
	)
	const [notes, setNotes] = useState('')

	return (
		<div className="space-y-3 border-t pt-3">
			<div>
				<label className="block text-sm font-medium mb-2">Reviewer ID</label>
				<input
					type="text"
					value={userId}
					onChange={(e) => setUserId(e.target.value)}
					placeholder="Your user ID"
					className="w-full px-3 py-2 border rounded text-sm"
				/>
			</div>

			<div>
				<label className="block text-sm font-medium mb-2">Decision</label>
				<div className="flex gap-2">
					<button
						onClick={() => setDecision('approved')}
						className={`px-3 py-1 rounded text-sm ${
							decision === 'approved'
								? 'bg-green-600 text-white'
								: 'bg-gray-200 text-gray-800'
						}`}
					>
						Approve
					</button>
					<button
						onClick={() => setDecision('rejected')}
						className={`px-3 py-1 rounded text-sm ${
							decision === 'rejected'
								? 'bg-red-600 text-white'
								: 'bg-gray-200 text-gray-800'
						}`}
					>
						Reject
					</button>
				</div>
			</div>

			{decision === 'approved' && (
				<div>
					<label className="block text-sm font-medium mb-2">Merge Decision</label>
					<select
						value={mergeDecision}
						onChange={(e) =>
							setMergeDecision(
								e.target.value as 'keep_a' | 'keep_b' | 'manual_review'
							)
						}
						className="w-full px-3 py-2 border rounded text-sm"
					>
						<option value="manual_review">Manual Review Required</option>
						<option value="keep_a">Keep Patient A ({patientAId})</option>
						<option value="keep_b">Keep Patient B ({patientBId})</option>
					</select>
				</div>
			)}

			<div>
				<label className="block text-sm font-medium mb-2">Review Notes</label>
				<textarea
					value={notes}
					onChange={(e) => setNotes(e.target.value)}
					placeholder="Add notes for this review..."
					className="w-full px-3 py-2 border rounded text-sm"
					rows={2}
				/>
			</div>

			<div className="flex gap-2">
				<Button
					onClick={() =>
						onSubmit({
							decision,
							mergeDecision: decision === 'approved' ? mergeDecision : undefined,
							notes: notes || undefined,
						})
					}
					disabled={isLoading || !userId}
					className="flex-1"
				>
					{isLoading ? 'Processing...' : 'Submit Review'}
				</Button>
			</div>
		</div>
	)
}
