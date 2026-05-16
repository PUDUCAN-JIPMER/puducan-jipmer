import { db } from '@/firebase'
import { collection, getCountFromServer } from 'firebase/firestore'

const PAGES_PER_RECORD = 10 // avg pages a paper form would have used

export async function getPaperSavedLabel(): Promise<string> {
    try {
        const snap = await getCountFromServer(collection(db, 'patients'))
        const totalRecords = snap.data().count
        const sheetsSaved = totalRecords * PAGES_PER_RECORD
        return `🌿 ${sheetsSaved.toLocaleString()} sheets saved`
    } catch {
        return `🌿 Sheets saved by going digital`
    }
}