import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export function useCollisionDetection(hospitalId?: string) {
	const queryClient = useQueryClient()

	const analyzeCollisions = useMutation({
		mutationFn: async () => {
			const response = await fetch('/api/collisions/analyze', { method: 'POST' })
			if (!response.ok) throw new Error('Failed to analyze collisions')
			return response.json()
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['collisions'] })
		},
	})

	const getPendingCollisions = useQuery({
		queryKey: ['collisions', 'pending', hospitalId],
		queryFn: async () => {
			const url = `/api/collisions/pending${hospitalId ? `?hospitalId=${hospitalId}` : ''}`
			const response = await fetch(url)
			if (!response.ok) throw new Error('Failed to fetch pending collisions')
			const data = await response.json()
			return data.collisions
		},
	})

	const reviewCollision = useMutation({
		mutationFn: async ({
			collisionId,
			decision,
			mergeDecision,
			notes,
			userId,
		}: {
			collisionId: string
			decision: 'approved' | 'rejected'
			mergeDecision?: 'keep_a' | 'keep_b' | 'manual_review'
			notes?: string
			userId?: string
		}) => {
			const response = await fetch(`/api/collisions/${collisionId}/review`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ decision, mergeDecision, notes, userId }),
			})
			if (!response.ok) throw new Error('Failed to review collision')
			return response.json()
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['collisions'] })
		},
	})

	const mergePatients = useMutation({
		mutationFn: async ({
			collisionId,
			primaryPatientId,
			secondaryPatientId,
			userId,
		}: {
			collisionId: string
			primaryPatientId: string
			secondaryPatientId: string
			userId?: string
		}) => {
			const response = await fetch(`/api/collisions/${collisionId}/merge`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ primaryPatientId, secondaryPatientId, userId }),
			})
			if (!response.ok) throw new Error('Failed to merge patients')
			return response.json()
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['collisions'] })
		},
	})

	const getHospitalSummary = useQuery({
		queryKey: ['collisions', 'hospital', hospitalId],
		queryFn: async () => {
			if (!hospitalId) return null
			const response = await fetch(`/api/collisions/hospital/${hospitalId}/summary`)
			if (!response.ok) throw new Error('Failed to fetch summary')
			return response.json()
		},
		enabled: !!hospitalId,
	})

	return {
		analyzeCollisions,
		getPendingCollisions,
		reviewCollision,
		mergePatients,
		getHospitalSummary,
	}
}
