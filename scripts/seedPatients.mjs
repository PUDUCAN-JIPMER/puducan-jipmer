import { initializeApp, cert, getApp, getApps } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { defaultPatients } from '../data/patients.mjs';

// Initialize Firebase only if not already initialized
if (!getApps().length) {
  const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));
  initializeApp({ credential: cert(serviceAccount) });
}

const db = getFirestore();

async function seedPatients() {
  console.log('⏳ Seeding 10 patients...');
  const collectionRef = db.collection('patients');

  try {
    for (const patient of defaultPatients) {
      // Logic: If patient with this Aadhaar exists, skip to avoid duplicates
      if (patient.aadhaarId) {
        const snapshot = await collectionRef.where('aadhaarId', '==', patient.aadhaarId).get();
        if (!snapshot.empty) {
          console.log(`⚠️ Skipping ${patient.name} (Already exists)`);
          continue;
        }
      }

      await collectionRef.add({
        ...patient,
        createdAt: Timestamp.now(),
      });
      console.log(`✅ Added Patient: ${patient.name}`);
    }
    console.log('🚀 Patient seeding complete!');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

seedPatients();
