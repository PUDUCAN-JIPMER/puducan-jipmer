import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { defaultHospitals } from '../data/hospitals.mjs';

if (!getApps().length) {
  const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));
  initializeApp({ credential: cert(serviceAccount) });
}

const db = getFirestore();

async function seedHospitals() {
  console.log('⏳ Seeding 10 hospitals...');
  const collectionRef = db.collection('hospitals');

  try {
    for (const hospital of defaultHospitals) {
      const { id, ...data } = hospital;

      // Using .doc(id).set() to ensure the IDs are predictable and consistent
      await collectionRef.doc(id).set(data, { merge: true });
      console.log(`✅ Synced Hospital: ${hospital.name} (ID: ${id})`);
    }
    console.log('🚀 Hospital seeding complete!');
  } catch (error) {
    console.error('❌ Error seeding hospitals:', error);
  }
}

seedHospitals();
