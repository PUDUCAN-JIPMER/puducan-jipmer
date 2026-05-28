/**
 * seed.mjs — Master seed script.
 *
 * Runs all three seeders in dependency order:
 *   1. Hospitals  (patients reference hospital IDs)
 *   2. Users      (independent of hospitals / patients)
 *   3. Patients   (require hospital IDs to exist)
 *
 * Credentials:
 *   Priority 1 — FIREBASE_SERVICE_ACCOUNT_BASE64 env var
 *                (base64-encoded JSON of your service account key)
 *   Priority 2 — serviceAccountKey.json in the project root
 *
 * Usage:
 *   node scripts/seed.mjs
 *   # or via npm:
 *   pnpm seed:fresh
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { readFileSync, existsSync } from 'fs';
import { defaultHospitals } from '../data/hospitals.mjs';
import { defaultUsers } from '../data/users.mjs';
import { defaultPatients } from '../data/patients.mjs';

// ── Firebase Admin initialisation ────────────────────────────────────────────

function resolveServiceAccount() {
  const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  if (b64) {
    console.log('🔑  Using FIREBASE_SERVICE_ACCOUNT_BASE64 from environment.');
    return JSON.parse(Buffer.from(b64, 'base64').toString('utf8'));
  }
  const keyPath = './serviceAccountKey.json';
  if (existsSync(keyPath)) {
    console.log('🔑  Using serviceAccountKey.json from project root.');
    return JSON.parse(readFileSync(keyPath, 'utf8'));
  }
  throw new Error(
    'No Firebase credentials found.\n' +
    'Set FIREBASE_SERVICE_ACCOUNT_BASE64 or place serviceAccountKey.json in the project root.\n' +
    'See .env.example for details.'
  );
}

if (!getApps().length) {
  initializeApp({ credential: cert(resolveServiceAccount()) });
}

const db = getFirestore();

// ── Helpers ───────────────────────────────────────────────────────────────────

const LINE = '─'.repeat(52);
function section(title) { console.log(`\n${LINE}\n  ${title}\n${LINE}`); }
function ok(msg)   { console.log(`  ✅  ${msg}`); }
function skip(msg) { console.log(`  ⚠️   ${msg}`); }
function fail(msg) { console.error(`  ❌  ${msg}`); }

// ── 1. Seed hospitals ─────────────────────────────────────────────────────────

async function seedHospitals() {
  section('1 / 3  Seeding hospitals');
  const col = db.collection('hospitals');
  let added = 0, skipped = 0;

  for (const hospital of defaultHospitals) {
    const { id, ...data } = hospital;
    const snap = await col.doc(id).get();
    if (snap.exists) {
      skip(`Hospital already exists: ${hospital.name} (${id})`);
      skipped++;
    } else {
      await col.doc(id).set(data);
      ok(`Added hospital: ${hospital.name} (${id})`);
      added++;
    }
  }
  console.log(`\n  Result → ${added} added, ${skipped} skipped`);
}

// ── 2. Seed users ─────────────────────────────────────────────────────────────

async function seedUsers() {
  section('2 / 3  Seeding users');
  const col = db.collection('users');
  let added = 0, skipped = 0;

  for (const user of defaultUsers) {
    const snap = await col.where('email', '==', user.email).get();
    if (!snap.empty) {
      skip(`User already exists: ${user.email}`);
      skipped++;
    } else {
      await col.add({ ...user, createdAt: Timestamp.now() });
      ok(`Added ${user.role}: ${user.name} (${user.email})`);
      added++;
    }
  }
  console.log(`\n  Result → ${added} added, ${skipped} skipped`);
}

// ── 3. Seed patients ──────────────────────────────────────────────────────────

async function seedPatients() {
  section('3 / 3  Seeding patients');
  const col = db.collection('patients');
  let added = 0, skipped = 0;

  for (const patient of defaultPatients) {
    if (patient.aadhaarId) {
      const snap = await col.where('aadhaarId', '==', patient.aadhaarId).get();
      if (!snap.empty) {
        skip(`Patient already exists: ${patient.name} (Aadhaar: ${patient.aadhaarId})`);
        skipped++;
        continue;
      }
    }
    await col.add({ ...patient, createdAt: Timestamp.now() });
    ok(`Added patient: ${patient.name} → ${patient.assignedHospital.name}`);
    added++;
  }
  console.log(`\n  Result → ${added} added, ${skipped} skipped`);
}

// ── Run ───────────────────────────────────────────────────────────────────────

async function run() {
  console.log('\n🚀  PuduCan — Database Seed');
  const start = Date.now();

  try {
    await seedHospitals();
    await seedUsers();
    await seedPatients();
    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    console.log(`\n${LINE}`);
    console.log(`  ✅  Seeding complete in ${elapsed}s`);
    console.log(LINE);
  } catch (err) {
    fail(`Seeding failed: ${err.message}`);
    console.error(err);
    process.exit(1);
  }
}

run();
