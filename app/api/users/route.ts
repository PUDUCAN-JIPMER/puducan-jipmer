import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, password, name, role, orgId, orgName, sex, phoneNumber } = await request.json();

    if (!email || !password || !name || !role || !orgId || !orgName) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: email, password, name, role, orgId, orgName.' },
        { status: 400 }
      );
    }

    // Step 1 — Create credentials in Firebase Auth
    let authUser;
    try {
      authUser = await adminAuth.createUser({
        email,
        password,
        displayName: name,
        phoneNumber: phoneNumber || undefined,
      });
    } catch (authError: any) {
      console.error('Error creating user in Firebase Auth:', authError);
      return NextResponse.json(
        { success: false, error: authError.message || 'Failed to create user credentials.' },
        { status: 400 }
      );
    }

    // Step 2 — Write Firestore record keyed on the Auth UID
    try {
      await adminDb.collection('users').doc(authUser.uid).set({
        name,
        email,
        role,
        orgId,
        orgName,
        sex: sex || null,
        phoneNumber: phoneNumber || null,
        createdAt: new Date(),
      });
    } catch (dbError: any) {
      console.error('Error writing Firestore user, cleaning up Auth user:', dbError);
      try {
        await adminAuth.deleteUser(authUser.uid);
      } catch (deleteError) {
        console.error('Failed to clean up orphaned Auth user:', deleteError);
      }
      return NextResponse.json(
        { success: false, error: dbError.message || 'Failed to save user profile.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, uid: authUser.uid });
  } catch (error: any) {
    console.error('Server error during user provisioning:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'An unexpected server error occurred.' },
      { status: 500 }
    );
  }
}
