// lib/firebase-admin.ts
import 'server-only'
import { cert, getApps, initializeApp, type ServiceAccount } from 'firebase-admin/app'
import { getAuth, type Auth } from 'firebase-admin/auth'
import { getFirestore, type Firestore } from 'firebase-admin/firestore'

let _adminAuth: Auth | null = null
let _adminDb: Firestore | null = null

function init() {
    const projectId = process.env.FIREBASE_PROJECT_ID
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')

    if (!projectId || !clientEmail || !privateKey) {
        throw new Error(
            '[firebase-admin] Missing FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, or FIREBASE_PRIVATE_KEY in env'
        )
    }

    const credential: ServiceAccount = { projectId, clientEmail, privateKey }
    const app = getApps().length > 0 ? getApps()[0] : initializeApp({ credential: cert(credential) })

    _adminAuth = getAuth(app)
    _adminDb = getFirestore(app)
}

export function getAdminAuth(): Auth {
    if (!_adminAuth) init()
    return _adminAuth!
}

export function getAdminDb(): Firestore {
    if (!_adminDb) init()
    return _adminDb!
}