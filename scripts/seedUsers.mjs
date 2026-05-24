import { initializeApp, cert, getApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { readFileSync } from 'fs';
import { defaultUsers } from '../data/users.mjs';

if (!getApps().length) {
  const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));
  initializeApp({ credential: cert(serviceAccount) });
}

const db = getFirestore();
const auth = getAuth();

async function seedUsers() {
  console.log('⏳ Seeding users and provisioning Auth credentials...');
  const collectionRef = db.collection('users');

  try {
    for (const user of defaultUsers) {
      let authUser;
      try {
        // Check if user already exists in Firebase Auth
        authUser = await auth.getUserByEmail(user.email);
        console.log(`ℹ️ Auth User already exists: ${user.email}`);
      } catch (error) {
        if (error.code === 'auth/user-not-found') {
          // Create user in Firebase Auth
          authUser = await auth.createUser({
            email: user.email,
            password: 'jipmer', // Default password for seeded users
            displayName: user.name,
            phoneNumber: user.phoneNumber || undefined,
          });
          console.log(`✅ Created Auth credentials for: ${user.email}`);
        } else {
          throw error;
        }
      }

      // Find and delete any existing Firestore document with this email to avoid duplicates
      const snapshot = await collectionRef.where('email', '==', user.email).get();
      for (const doc of snapshot.docs) {
        if (doc.id !== authUser.uid) {
          await doc.ref.delete();
          console.log(`🗑️ Deleted old non-UID Firestore document for: ${user.email}`);
        }
      }

      // Save/Overwrite the Firestore document keyed on the Auth UID
      await collectionRef.doc(authUser.uid).set({
        ...user,
        createdAt: new Date(),
      });
      console.log(`✅ Saved Firestore profile for: ${user.email}`);
    }
    console.log('\n🚀 User seeding complete! Default login credentials for all accounts:');
    console.log('🔑 Password: jipmer\n');
  } catch (error) {
    console.error('❌ Error seeding users:', error);
  }
}

seedUsers();
