/**
 * firebaseAdmin.ts — Firebase Admin SDK singleton for server-side use.
 *
 * Used exclusively in Next.js API route handlers (app/api/*).
 * Never import this file from client components or hooks.
 *
 * Credentials are read from FIREBASE_SERVICE_ACCOUNT_JSON (a JSON string
 * of the service account key). In development you can also set the
 * GOOGLE_APPLICATION_CREDENTIALS env var to the path of the key file.
 */

import { cert, getApp, getApps, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import type { App } from 'firebase-admin/app'

function createAdminApp(): App {
  const existing = getApps()
  if (existing.length > 0) return getApp()

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
  if (!serviceAccountJson) {
    throw new Error(
      'FIREBASE_SERVICE_ACCOUNT_JSON environment variable is not set. ' +
        'Set it to the JSON contents of your Firebase service account key.',
    )
  }

  const sa = JSON.parse(serviceAccountJson) as {
    project_id: string
    client_email: string
    private_key: string
  }

  return initializeApp({
    credential: cert({
      projectId: sa.project_id,
      clientEmail: sa.client_email,
      // Unescape newlines that may have been escaped when storing in env
      privateKey: sa.private_key.replace(/\\n/g, '\n'),
    }),
  })
}

/** Returns the Firestore instance for the Admin SDK. */
export function getAdminDb() {
  const app = createAdminApp()
  return getFirestore(app)
}
