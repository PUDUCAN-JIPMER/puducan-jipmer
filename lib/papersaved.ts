import { auth, db } from '@/firebase'
import { collection, getCountFromServer } from 'firebase/firestore'

const PAGES_PER_RECORD = 10

/**
 * Returns the number of patient records from Firestore.
 * Only runs when Firebase Auth has a signed-in user; returns 0 otherwise
 * to prevent permission-denied errors on unauthenticated requests.
 */
export async function getPaperSavedCount(): Promise<number> {
    // Guard: do not run the aggregation query before auth is initialised
    // or when there is no authenticated user.
    const currentUser = auth?.currentUser
    if (!currentUser) return 0

    try {
        const snapshot = await getCountFromServer(collection(db, 'patients'))
        return snapshot.data().count
    } catch {
        return 0
    }
}

export function calculateSheetsSaved(count: number): number {
    return count * PAGES_PER_RECORD
}