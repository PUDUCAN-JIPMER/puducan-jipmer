import { db } from '@/firebase'
import { collection, getCountFromServer } from 'firebase/firestore'

const PAGES_PER_RECORD = 10

export async function getPaperSavedCount(): Promise<number> {
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