/**
 * Export Firestore patient data to CSV for ML model training.
 *
 * This script follows the same pattern as seedPatients.mjs — it uses
 * firebase-admin with a service account key to read all patient documents
 * from Firestore, flattens them into a tabular format, and writes a CSV
 * file to data/patients_export.csv.
 *
 * Usage:
 *   node scripts/exportPatientsToCSV.mjs
 *
 * Prerequisites:
 *   - serviceAccountKey.json in the project root (same as seed scripts)
 *
 * The exported CSV is gitignored. It serves as the input to the Python
 * training script (scripts/ml/train_risk_model.py).
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// ---------------------------------------------------------------------------
// Firebase Admin initialization (same pattern as seedPatients.mjs)
// ---------------------------------------------------------------------------

if (!getApps().length) {
  const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));
  initializeApp({ credential: cert(serviceAccount) });
}

const db = getFirestore();

// ---------------------------------------------------------------------------
// CSV helpers
// ---------------------------------------------------------------------------

/** Escape a value for CSV — handles quoting and neutralizes formula injection */
function csvEscape(value) {
  if (value === null || value === undefined) return '';
  let str = String(value);

  // Neutralize CSV formula injection — values starting with these characters
  // can be interpreted as formulas by Excel/Sheets
  if (/^[=+\-@\t\r]/.test(str)) {
    str = "'" + str;
  }

  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// ---------------------------------------------------------------------------
// Feature computation helpers
// ---------------------------------------------------------------------------

/** Calculates age in years from a date-of-birth string */
function computeAge(dob) {
  if (!dob) return '';
  const birth = new Date(dob);
  if (isNaN(birth.getTime())) return '';
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

/** Calculates days between two date strings */
function daysBetween(startStr, endStr) {
  if (!startStr || !endStr) return '';
  const start = new Date(startStr);
  const end = new Date(endStr);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return '';
  return Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

// ---------------------------------------------------------------------------
// Main export function
// ---------------------------------------------------------------------------

async function exportPatientsToCSV() {
  console.log('⏳ Fetching all patient records from Firestore...');

  const patientsSnap = await db.collection('patients').get();

  if (patientsSnap.empty) {
    console.log('⚠️  No patient records found in Firestore.');
    return;
  }

  console.log(`📊 Found ${patientsSnap.size} patient records.`);

  const todayStr = new Date().toISOString().split('T')[0];

  // Define CSV columns — these are the raw + derived features for training
  const columns = [
    'id',
    'name',
    'age',
    'sex',
    'dob',
    'blood_group',
    'address',
    'religion',
    'ration_card_color',
    'diseases',
    'assigned_hospital_id',
    'assigned_hospital_name',
    'assigned_asha',
    'patient_status',
    'diagnosed_date',
    'hospital_registration_date',
    'treatment_start_date',
    'treatment_end_date',
    'stage_of_the_cancer',
    'transferred',
    'has_aadhaar',
    'suspected_case',
    'insurance_type',
    'insurance_id',
    'follow_up_count',
    'most_recent_follow_up_date',
    'days_since_registration',
    'treatment_duration_days',
    'days_since_last_follow_up',
    'has_asha_assigned',
    'patient_death_date',
  ];

  const rows = [];

  patientsSnap.forEach((doc) => {
    const p = doc.data();
    const id = doc.id;

    // Compute derived features
    const age = computeAge(p.dob);
    const daysSinceRegistration = daysBetween(p.hospitalRegistrationDate, todayStr);
    const treatmentDurationDays = daysBetween(
      p.treatmentStartDate,
      p.treatmentEndDate || todayStr
    );

    // Follow-up analysis
    const followUps = p.followUps || [];
    const followUpCount = followUps.length;
    let mostRecentFollowUpDate = '';
    let daysSinceLastFollowUp = '';

    if (followUpCount > 0) {
      // Parse dates as timestamps to correctly find the most recent one
      // (lexicographic string sort breaks on non-ISO or non-zero-padded dates)
      const parsedDates = followUps
        .map((f) => f.date)
        .filter((d) => d && d !== '')
        .map((d) => ({ dateStr: d, timestamp: new Date(d).getTime() }))
        .filter((d) => !isNaN(d.timestamp))
        .sort((a, b) => b.timestamp - a.timestamp);

      if (parsedDates.length > 0) {
        mostRecentFollowUpDate = parsedDates[0].dateStr;
        daysSinceLastFollowUp = daysBetween(parsedDates[0].dateStr, todayStr);
      }
    }

    // Flatten the patient record into a CSV row
    const row = [
      id,
      p.name || '',
      age,
      p.sex || '',
      p.dob || '',
      p.bloodGroup || '',
      p.address || '',
      p.religion || '',
      p.rationCardColor || '',
      (p.diseases || []).join('; '),
      p.assignedHospital?.id || '',
      p.assignedHospital?.name || '',
      p.assignedAsha || '',
      p.patientStatus || '',
      p.diagnosedDate || '',
      p.hospitalRegistrationDate || '',
      p.treatmentStartDate || '',
      p.treatmentEndDate || '',
      p.stageOfTheCancer || '',
      p.transferred ? 'true' : 'false',
      p.hasAadhaar ? 'true' : 'false',
      p.suspectedCase ? 'true' : 'false',
      p.insurance?.type || '',
      p.insurance?.id || '',
      followUpCount,
      mostRecentFollowUpDate,
      daysSinceRegistration,
      treatmentDurationDays,
      daysSinceLastFollowUp,
      (p.assignedAsha && p.assignedAsha.trim() !== '') ? 'true' : 'false',
      p.patientDeathDate || '',
    ];

    rows.push(row.map(csvEscape));
  });

  // Write CSV file
  const csvHeader = columns.join(',');
  const csvBody = rows.map((row) => row.join(',')).join('\n');
  const csvContent = '\uFEFF' + csvHeader + '\n' + csvBody; // UTF-8 BOM for Excel

  // Get the project root directory
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const projectRoot = join(__dirname, '..');

  const outputDir = join(projectRoot, 'data');
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = join(outputDir, 'patients_export.csv');
  writeFileSync(outputPath, csvContent, 'utf8');

  console.log(`✅ Exported ${rows.length} patients to ${outputPath}`);
  console.log('📁 This file is gitignored. Use it as input for scripts/ml/train_risk_model.py');
}

exportPatientsToCSV().catch((error) => {
  console.error('❌ Export failed:', error);
  process.exit(1);
});
