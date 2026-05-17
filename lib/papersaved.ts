import { db } from '@/firebase'
import { collection, getCountFromServer } from 'firebase/firestore'

const PAGES_PER_RECORD = 10
const FALLBACK_RECORDS = 2400

export async function getPaperSavedLabel(): Promise<string> {
    try {
        const ref = collection(db, 'patients')
        const snapshot = await getCountFromServer(ref)
        const count = snapshot.data().count
        const sheets = count * PAGES_PER_RECORD
        return `🌿 ${sheets.toLocaleString()} sheets saved`
    } catch {
        const sheets = FALLBACK_RECORDS * PAGES_PER_RECORD
        return `🌿 ${sheets.toLocaleString()} sheets saved`
    }
}