import { initializeApp, cert, getApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { defaultUsers } from '../data/users.mjs';

if (!getApps().length) {
  const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));
  initializeApp({ credential: cert(serviceAccount) });
}

const db = getFirestore();

async function seedUsers() {
  console.log('⏳ Seeding users...');
  const collectionRef = db.collection('users');

  try {
    for (const user of defaultUsers) {
      const snapshot = await collectionRef.where('email', '==', user.email).get();
      if (!snapshot.empty) {
        console.log(`⚠️ Skipping User: ${user.email} (Already exists)`);
        continue;
      }

      await collectionRef.add(user);
      console.log(`✅ Added ${user.role}: ${user.name}`);
    }
    console.log('🚀 User seeding complete!');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

seedUsers();
