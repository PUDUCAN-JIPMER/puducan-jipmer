"""
Train a logistic regression model for patient follow-up adherence risk scoring.

This script reads the CSV exported by scripts/exportPatientsToCSV.mjs, engineers
features, trains a logistic regression classifier with Scikit-learn, and exports:
  1. Model weights to lib/ml/model-weights.json
  2. Cross-language test vectors to __tests__/unit/ml/test-vectors.json

The trained model predicts the probability that a patient will NOT adhere to
their follow-up schedule. This probability is surfaced as a "Risk Score"
in the PuduCan UI.

Usage:
    cd puducan-jipmer
    python scripts/ml/train_risk_model.py

Prerequisites:
    pip install -r scripts/ml/requirements.txt

Configuration:
    DEFAULT_ADHERENCE_THRESHOLD_DAYS — see docstring below
"""

import json
import os
import sys
from datetime import datetime

import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
)
from sklearn.model_selection import StratifiedKFold, cross_val_score
from sklearn.preprocessing import StandardScaler

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

# Number of days after treatment start (or registration) without a follow-up
# before a patient is labeled as "non-adherent". This is a PROXY LABEL —
# it does NOT represent a clinical diagnosis. Different cancer treatments
# have different follow-up protocols, so this threshold should be tuned
# per institution or treatment type in future iterations.
DEFAULT_ADHERENCE_THRESHOLD_DAYS = 30

# Paths (relative to project root)
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
CSV_INPUT = os.path.join(PROJECT_ROOT, "data", "patients_export.csv")
WEIGHTS_OUTPUT = os.path.join(PROJECT_ROOT, "lib", "ml", "model-weights.json")
TEST_VECTORS_OUTPUT = os.path.join(
    PROJECT_ROOT, "__tests__", "unit", "ml", "test-vectors.json"
)

# ---------------------------------------------------------------------------
# Categorical encoding maps
#
# IMPORTANT: These maps are the SINGLE SOURCE OF TRUTH. They are exported
# into model-weights.json and consumed by the TypeScript inference engine.
# If you change an encoding here, the TS side picks it up automatically
# from the JSON — there are no hardcoded mappings in TypeScript.
# ---------------------------------------------------------------------------

CATEGORICAL_MAPS = {
    "sex": {"male": 1, "female": 0, "other": 0.5},
    "stageOfTheCancer": {
        "In Situ": 0,
        "Stage I": 1,
        "Stage II": 2,
        "Stage III": 3,
        "Stage IV": 4,
    },
    "insuranceType": {"none": 0, "Government": 1, "Private": 2},
    "rationCardColor": {"none": 0, "yellow": 1, "red": 2},
    "patientStatus": {"Alive": 0, "Not Available": 0.5, "Not Alive": 1},
}

# Ordered feature names — the TypeScript feature extractor produces a
# numeric array in this exact order.
FEATURE_NAMES = [
    "age",
    "sex_encoded",
    "cancer_stage_ordinal",
    "days_since_registration",
    "treatment_duration_days",
    "follow_up_count",
    "days_since_last_follow_up",
    "insurance_type_encoded",
    "has_asha_assigned",
    "is_transferred",
    "ration_card_encoded",
    "patient_status_encoded",
]


def encode_categorical(value, mapping, default=0):
    """Look up a string value in a categorical map, returning default if missing."""
    if pd.isna(value) or value == "":
        return default
    return mapping.get(str(value), default)


# ---------------------------------------------------------------------------
# Data loading and feature engineering
# ---------------------------------------------------------------------------


def load_and_prepare_data(csv_path, threshold_days=DEFAULT_ADHERENCE_THRESHOLD_DAYS):
    """
    Load the exported CSV and engineer features + proxy labels.

    The proxy label is:
      - 1 (non-adherent) if the patient has zero follow-ups AND has been
        registered for more than `threshold_days` days
      - 0 (adherent) if the patient has at least one follow-up, OR has been
        registered for fewer than `threshold_days` days

    Deceased patients (patient_status == 'Not Alive') are excluded from
    training since adherence is not meaningful for them.
    """
    print(f"📖 Loading data from {csv_path}")
    df = pd.read_csv(csv_path, encoding="utf-8-sig")

    print(f"   Raw records: {len(df)}")

    # Exclude deceased patients from training
    df = df[df["patient_status"] != "Not Alive"].copy()
    print(f"   After excluding deceased: {len(df)}")

    # Drop rows missing critical fields
    df = df.dropna(subset=["age", "days_since_registration"])
    df = df[df["age"] != ""].copy()
    df = df[df["days_since_registration"] != ""].copy()

    # Convert numeric columns
    df["age"] = pd.to_numeric(df["age"], errors="coerce")
    df["days_since_registration"] = pd.to_numeric(
        df["days_since_registration"], errors="coerce"
    )
    df["treatment_duration_days"] = pd.to_numeric(
        df["treatment_duration_days"], errors="coerce"
    ).fillna(0)
    df["follow_up_count"] = pd.to_numeric(
        df["follow_up_count"], errors="coerce"
    ).fillna(0)
    df["days_since_last_follow_up"] = pd.to_numeric(
        df["days_since_last_follow_up"], errors="coerce"
    )

    # Fill days_since_last_follow_up with days_since_registration when no follow-ups
    df["days_since_last_follow_up"] = df["days_since_last_follow_up"].fillna(
        df["days_since_registration"]
    )

    # Drop any remaining rows with NaN in critical numeric columns
    df = df.dropna(subset=["age", "days_since_registration"]).copy()

    print(f"   After cleaning: {len(df)}")

    if len(df) == 0:
        print("❌ No valid records remaining after cleaning. Cannot train.")
        sys.exit(1)

    # --- Encode categorical features using the maps ---
    df["sex_encoded"] = df["sex"].apply(
        lambda x: encode_categorical(x, CATEGORICAL_MAPS["sex"])
    )
    df["cancer_stage_ordinal"] = df["stage_of_the_cancer"].apply(
        lambda x: encode_categorical(x, CATEGORICAL_MAPS["stageOfTheCancer"])
    )
    df["insurance_type_encoded"] = df["insurance_type"].apply(
        lambda x: encode_categorical(x, CATEGORICAL_MAPS["insuranceType"])
    )
    df["ration_card_encoded"] = df["ration_card_color"].apply(
        lambda x: encode_categorical(x, CATEGORICAL_MAPS["rationCardColor"])
    )
    df["patient_status_encoded"] = df["patient_status"].apply(
        lambda x: encode_categorical(x, CATEGORICAL_MAPS["patientStatus"])
    )
    # pandas may infer "true"/"false" CSV values as bool, so normalize
    # to string before comparing to handle both cases correctly
    df["has_asha_assigned"] = (
        df["has_asha_assigned"].astype(str).str.lower().eq("true")
    ).astype(int)
    df["is_transferred"] = (
        df["transferred"].astype(str).str.lower().eq("true")
    ).astype(int)

    # --- Proxy label: non-adherent = 1, adherent = 0 ---
    df["label"] = (
        (df["follow_up_count"] == 0) & (df["days_since_registration"] > threshold_days)
    ).astype(int)

    print("   Label distribution:")
    print(f"     Adherent (0):     {(df['label'] == 0).sum()}")
    print(f"     Non-adherent (1): {(df['label'] == 1).sum()}")

    # Extract feature matrix
    X = df[FEATURE_NAMES].values.astype(float)
    y = df["label"].values.astype(int)

    return X, y, df


# ---------------------------------------------------------------------------
# Training
# ---------------------------------------------------------------------------


def train_model(X, y):
    """
    Train a logistic regression model with standardization.

    Uses class_weight='balanced' to handle class imbalance, which is
    expected in healthcare data (most patients are adherent).
    """
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    model = LogisticRegression(
        class_weight="balanced",
        max_iter=1000,
        random_state=42,
        solver="lbfgs",
    )
    model.fit(X_scaled, y)

    # Cross-validation for reliable metrics (need at least 2 samples per class)
    min_class_count = min(np.bincount(y)) if len(np.unique(y)) > 1 else 0
    if min_class_count >= 2:
        n_splits = min(5, min_class_count)
        cv = StratifiedKFold(n_splits=n_splits, shuffle=True, random_state=42)
        cv_scores = cross_val_score(model, X_scaled, y, cv=cv, scoring="f1")
        print(f"\n📈 Cross-validated F1 scores: {cv_scores}")
        print(f"   Mean F1: {cv_scores.mean():.4f} (+/- {cv_scores.std():.4f})")
    else:
        print("\n⚠️  Skipping cross-validation (not enough samples per class).")

    # Full-dataset metrics for reporting
    y_pred = model.predict(X_scaled)
    accuracy = accuracy_score(y, y_pred)
    f1 = f1_score(y, y_pred, zero_division=0)

    print("\n📊 Full-dataset metrics:")
    print(f"   Accuracy: {accuracy:.4f}")
    print(f"   F1 Score: {f1:.4f}")
    print("\n   Classification Report:")
    print(classification_report(y, y_pred, zero_division=0))
    print("   Confusion Matrix:")
    print(confusion_matrix(y, y_pred))

    return model, scaler, accuracy, f1


# ---------------------------------------------------------------------------
# Export
# ---------------------------------------------------------------------------


def export_model_weights(model, scaler, accuracy, f1, n_samples):
    """Export model coefficients, scaler params, and categorical maps to JSON."""
    weights_data = {
        "version": "1.0.0",
        "trainedAt": datetime.utcnow().isoformat() + "Z",
        "features": FEATURE_NAMES,
        "weights": model.coef_[0].tolist(),
        "intercept": float(model.intercept_[0]),
        "scaler": {
            "mean": scaler.mean_.tolist(),
            "std": scaler.scale_.tolist(),
        },
        "categoricalMaps": CATEGORICAL_MAPS,
        "metrics": {
            "accuracy": round(accuracy, 4),
            "f1": round(f1, 4),
            "samplesUsed": n_samples,
        },
    }

    os.makedirs(os.path.dirname(WEIGHTS_OUTPUT), exist_ok=True)
    with open(WEIGHTS_OUTPUT, "w", encoding="utf-8") as f:
        json.dump(weights_data, f, indent=2)

    print(f"\n✅ Model weights exported to {WEIGHTS_OUTPUT}")
    return weights_data


def export_test_vectors(model, scaler, n_vectors=5):
    """
    Generate test vectors for cross-language precision validation.

    Creates synthetic patient feature vectors, runs them through the Python
    model, and saves both the raw features and expected scores. The
    TypeScript test suite loads this file and asserts that its output
    matches Python's within a tolerance of 1e-5.
    """
    rng = np.random.RandomState(42)

    test_vectors = []
    for i in range(n_vectors):
        # Generate plausible feature values
        raw = {
            "age": float(rng.randint(25, 80)),
            "sex_encoded": float(rng.choice([0, 0.5, 1])),
            "cancer_stage_ordinal": float(rng.randint(0, 5)),
            "days_since_registration": float(rng.randint(10, 400)),
            "treatment_duration_days": float(rng.randint(0, 300)),
            "follow_up_count": float(rng.randint(0, 8)),
            "days_since_last_follow_up": float(rng.randint(0, 200)),
            "insurance_type_encoded": float(rng.choice([0, 1, 2])),
            "has_asha_assigned": float(rng.choice([0, 1])),
            "is_transferred": float(rng.choice([0, 1])),
            "ration_card_encoded": float(rng.choice([0, 1, 2])),
            "patient_status_encoded": float(rng.choice([0, 0.5, 1])),
        }

        # Build feature vector in the correct order
        feature_vec = np.array([raw[f] for f in FEATURE_NAMES]).reshape(1, -1)

        # Standardize and predict
        feature_scaled = scaler.transform(feature_vec)
        prob = model.predict_proba(feature_scaled)[0][1]  # P(non-adherent)

        test_vectors.append(
            {"rawFeatures": raw, "expectedScore": float(prob)}
        )

    os.makedirs(os.path.dirname(TEST_VECTORS_OUTPUT), exist_ok=True)
    with open(TEST_VECTORS_OUTPUT, "w", encoding="utf-8") as f:
        json.dump(test_vectors, f, indent=2)

    print(f"✅ Test vectors exported to {TEST_VECTORS_OUTPUT}")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------


def main():
    print("=" * 60)
    print("  PuduCan — ML Risk Model Training")
    print("=" * 60)
    print(
        f"\n⚙️  Adherence threshold: {DEFAULT_ADHERENCE_THRESHOLD_DAYS} days"
        "\n   (patients with 0 follow-ups after this many days = non-adherent)"
    )

    if not os.path.exists(CSV_INPUT):
        print(f"\n❌ CSV not found at {CSV_INPUT}")
        print("   Run `node scripts/exportPatientsToCSV.mjs` first.")
        sys.exit(1)

    X, y, df = load_and_prepare_data(CSV_INPUT)

    # LogisticRegression.fit() crashes with only one class — exit gracefully
    if len(np.unique(y)) < 2:
        print("\n❌ Only one class present in the data.")
        print("   LogisticRegression requires at least 2 classes to train.")
        print("   This is expected with very small datasets. Re-train when more")
        print("   patient data accumulates with both adherent and non-adherent cases.")
        sys.exit(1)

    model, scaler, accuracy, f1 = train_model(X, y)
    weights_data = export_model_weights(model, scaler, accuracy, f1, len(y))
    export_test_vectors(model, scaler)

    print("\n" + "=" * 60)
    print("  Training complete!")
    print("=" * 60)
    print(f"\n  Model version: {weights_data['version']}")
    print(f"  Features:      {len(FEATURE_NAMES)}")
    print(f"  Samples:       {len(y)}")
    print(f"  Accuracy:      {accuracy:.4f}")
    print(f"  F1 Score:      {f1:.4f}")
    print("\n  Next steps:")
    print("    1. Commit lib/ml/model-weights.json")
    print("    2. Commit __tests__/unit/ml/test-vectors.json")
    print("    3. Run `pnpm test` to validate cross-language parity")
    print("    4. Start the app with `pnpm dev` and check the risk badges")


if __name__ == "__main__":
    main()
