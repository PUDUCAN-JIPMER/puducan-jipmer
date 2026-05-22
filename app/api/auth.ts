// lib/api/auth.ts
import 'server-only'
import { cookies } from 'next/headers'
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin'
import { FieldValue, type Transaction } from 'firebase-admin/firestore'

const SESSION_COOKIE_NAME = 'session'

export type UserRole = 'asha' | 'nurse' | 'doctor' | 'admin'

export interface AuthenticatedUser {
    uid: string
    role: UserRole
    email?: string
    userId: string
}

/**
 * Throws a Response (caught by Next.js, returned to client) if:
 * - no session cookie
 * - session cookie invalid/expired
 * - user doc missing or has no role
 * - user role not in `allowed`
 */
export async function requireRole(
    _req: Request,
    allowed: UserRole[]
): Promise<AuthenticatedUser> {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value
    if (!sessionCookie) {
        throw unauthorized('No session cookie')
    }

    let decoded
    try {
        // `true` = check revocation, slightly slower but correct after sign-out
        decoded = await getAdminAuth().verifySessionCookie(sessionCookie, true)
    } catch {
        throw unauthorized('Invalid or expired session')
    }

    const email = decoded.email?.trim().toLowerCase()
    if (!email) {
        throw forbidden('User has no email in session token')
    }

    const userQuery = await getAdminDb()
        .collection('users')
        .where('email', '==', email)
        .limit(1)
        .get()

    if (userQuery.empty) {
        throw forbidden('User record not found')
    }

    const userDoc = userQuery.docs[0]
    const role = userDoc.data().role as UserRole | undefined
    if (!role) {
        throw forbidden('User has no role assigned')
    }
    if (!allowed.includes(role)) {
        throw forbidden(`Role "${role}" not permitted for this endpoint`)
    }

    return {
        uid: decoded.uid,
        role,
        email: decoded.email,
        userId: userDoc.id,
    }
}

/**
 * Firestore-backed sliding-window rate limiter.
 *
 * Stores per-user counters under `rate_limits/{uid}_{key}`.
 * If the counter exceeds `max` within `windowMs`, throws a 429.
 *
 * NOT distributed-safe under high contention (last-write-wins on the
 * counter), but fine for the scale we're targeting (30 req/min per ASHA
 * worker). For higher throughput, use Upstash or a dedicated service.
 */
export async function assertRateLimit(
    uid: string,
    key: string,
    max: number,
    windowMs: number
): Promise<void> {
    const docId = `${uid}_${key}`
    const docRef = getAdminDb().collection('rate_limits').doc(docId)
    const now = Date.now()
    const windowStart = now - windowMs

    await getAdminDb().runTransaction(async (tx: Transaction) => {
        const snap = await tx.get(docRef)
        const data = snap.data() as { timestamps?: number[] } | undefined
        const recent = (data?.timestamps ?? []).filter((t) => t > windowStart)

        if (recent.length >= max) {
            throw tooManyRequests(
                `Rate limit exceeded: ${max} requests per ${windowMs / 1000}s`
            )
        }

        tx.set(
            docRef,
            {
                timestamps: [...recent, now],
                updatedAt: FieldValue.serverTimestamp(),
            },
            { merge: true }
        )
    })
}

// ─── Error helpers (throw Response, Next.js handles it) ───────────────

function unauthorized(message: string) {
    return new Response(JSON.stringify({ error: 'unauthorized', message }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
    })
}

function forbidden(message: string) {
    return new Response(JSON.stringify({ error: 'forbidden', message }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
    })
}

function tooManyRequests(message: string) {
    return new Response(JSON.stringify({ error: 'rate_limit_exceeded', message }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
    })
}