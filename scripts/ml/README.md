# ML Pipeline — Patient Follow-up Adherence Risk Scoring

This directory contains the training pipeline for PuduCan's predictive risk
scoring model. The model predicts the probability that a patient will **not
adhere** to their follow-up schedule, helping ASHA workers and clinicians
prioritize outreach.

## Architecture

```
┌─────────────────────┐    ┌──────────────────────┐    ┌────────────────────┐
│  Firestore          │    │  Python Training     │    │  Next.js App       │
│  (patient records)  │───▶│  (Scikit-learn)      │───▶│  (TS inference)    │
│                     │    │                      │    │                    │
│  exportPatients     │    │  train_risk_model.py │    │  riskScoreEngine.ts│
│  ToCSV.mjs          │    │  ↓                   │    │  ↑                 │
│  ↓                  │    │  model-weights.json  │────│  model-weights.json│
│  patients_export.csv│    │  test-vectors.json   │    │  RiskScoreBadge.tsx│
└─────────────────────┘    └──────────────────────┘    └────────────────────┘
```

**Key design principle:** The model trains offline in Python but **infers in
the browser** using pure TypeScript arithmetic. No Python runtime, no API
calls, no TensorFlow.js — just a 2KB JSON file of coefficients.

## How to Retrain

### Prerequisites

```bash
# Python 3.9+ with pip
pip install -r scripts/ml/requirements.txt

# Firebase service account key (same as seed scripts)
# Place serviceAccountKey.json in the project root
```

### Step 1: Export Data

```bash
node scripts/exportPatientsToCSV.mjs
```

This reads all patient records from Firestore and writes
`data/patients_export.csv`. The CSV is **gitignored** — it may contain
real patient data.

### Step 2: Train the Model

```bash
python scripts/ml/train_risk_model.py
```

This:
1. Reads the CSV
2. Engineers features (age, cancer stage, follow-up count, etc.)
3. Creates **proxy labels** for adherence (see below)
4. Trains a logistic regression with `class_weight='balanced'`
5. Exports `lib/ml/model-weights.json` (the model)
6. Exports `__tests__/unit/ml/test-vectors.json` (cross-language tests)
7. Prints metrics (accuracy, F1, confusion matrix)

### Step 3: Validate

```bash
pnpm test
```

The test suite includes cross-language precision tests that verify the
TypeScript inference engine produces identical output to Python within
a tolerance of **1e-5**.

### Step 4: Commit

```bash
git add lib/ml/model-weights.json __tests__/unit/ml/test-vectors.json
git commit -m "chore(ml): retrain risk model with latest patient data"
```

## Proxy Labeling Strategy

> ⚠️ **This is a proxy label, not a clinical ground truth.**

Since the database does not (yet) have an explicit "adhered / didn't adhere"
field, we derive a proxy label:

- **Non-adherent (1):** Patient has 0 follow-ups AND has been registered for
  more than `DEFAULT_ADHERENCE_THRESHOLD_DAYS` (currently **30 days**)
- **Adherent (0):** Patient has ≥1 follow-up, OR was registered recently
- **Excluded:** Deceased patients (`patientStatus == 'Not Alive'`)

The threshold is configurable in `train_risk_model.py`. Different cancer
treatments have different follow-up protocols — future iterations should
pull target labels from actual clinical adherence flags if they are added
to the database.

## Feature Descriptions

| Feature | Source Field | Type | Description |
|---------|-------------|------|-------------|
| `age` | `dob` | Numeric | Patient age in years |
| `sex_encoded` | `sex` | Categorical | male=1, female=0, other=0.5 |
| `cancer_stage_ordinal` | `stageOfTheCancer` | Ordinal | In Situ=0, I=1, II=2, III=3, IV=4 |
| `days_since_registration` | `hospitalRegistrationDate` | Numeric | Days since registration |
| `treatment_duration_days` | `treatmentStartDate`, `treatmentEndDate` | Numeric | Treatment duration |
| `follow_up_count` | `followUps` | Numeric | Number of follow-up entries |
| `days_since_last_follow_up` | `followUps[].date` | Numeric | Days since most recent follow-up |
| `insurance_type_encoded` | `insurance.type` | Categorical | none=0, Government=1, Private=2 |
| `has_asha_assigned` | `assignedAsha` | Binary | 1 if ASHA worker assigned |
| `is_transferred` | `transferred` | Binary | 1 if patient was transferred |
| `ration_card_encoded` | `rationCardColor` | Categorical | none=0, yellow=1, red=2 |
| `patient_status_encoded` | `patientStatus` | Categorical | Alive=0, Not Available=0.5 |

## Categorical Encoding

All categorical string-to-number mappings are stored in the
`categoricalMaps` section of `model-weights.json`. The TypeScript inference
engine reads them at runtime — there are **zero hardcoded mappings** in TypeScript.

If you add a new category (e.g., a new cancer stage), update the map in
`train_risk_model.py` → `CATEGORICAL_MAPS`, retrain, and the JSON export
will propagate the change to TypeScript automatically.

## Risk Factor Attribution

The "Key contributing factors" shown in the UI tooltip are computed as:

```
contribution_i = standardized_feature_i × weight_i
```

We sort by `|contribution_i|` descending and return the top 3 feature names
with a direction indicator (↑ increases risk, ↓ decreases risk). This is a
first-order linear attribution — mathematically sound for logistic regression
where feature contributions are additive in log-odds space.

## Future Improvements

- [ ] Add explicit clinical adherence labels to the database schema
- [ ] Automated retraining via GitHub Actions (out of scope for initial PR)
- [ ] Per-hospital or per-cancer-type models as data volume grows
- [ ] Feature importance dashboard in the admin panel
