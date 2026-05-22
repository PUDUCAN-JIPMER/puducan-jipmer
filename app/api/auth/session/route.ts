// app/api/auth/session/route.ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getAdminAuth } from '@/lib/firebase-admin'

const SESSION_COOKIE_NAME = 'session'
const SESSION_DURATION_MS = 5 * 24 * 60 * 60 * 1000 // 5 days

export async function POST(req: Request) {
    try {
        const { idToken } = await req.json()
        if (!idToken || typeof idToken !== 'string') {
            return NextResponse.json({ error: 'missing_id_token' }, { status: 400 })
        }

        // Verify the token is real (not just well-formed)
        const decoded = await getAdminAuth().verifyIdToken(idToken)

        // Issue a long-lived session cookie
        const sessionCookie = await getAdminAuth().createSessionCookie(idToken, {
            expiresIn: SESSION_DURATION_MS,
        })

        const cookieStore = await cookies()
        cookieStore.set(SESSION_COOKIE_NAME, sessionCookie, {
            maxAge: SESSION_DURATION_MS / 1000,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
        })

        return NextResponse.json({ uid: decoded.uid })
    } catch (err) {
        console.error('[auth/session] failed', err)
        return NextResponse.json({ error: 'invalid_id_token' }, { status: 401 })
    }
}

export async function DELETE() {
    const cookieStore = await cookies()
    cookieStore.delete(SESSION_COOKIE_NAME)
    return NextResponse.json({ ok: true })
}