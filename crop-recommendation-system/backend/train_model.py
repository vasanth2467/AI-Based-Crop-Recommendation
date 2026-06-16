#!/usr/bin/env python3
"""
Agrismart AI - Crop Recommendation ML Model Training
====================================================
Generates synthetic agricultural data and trains a RandomForestClassifier
to predict the optimal crop based on soil and weather conditions.

Usage:
    python train_model.py

Output:
    - crop_model.pkl (trained model + scaler + label encoder)
"""

import os
import random
import warnings
from datetime import datetime

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (accuracy_score, classification_report,
                             confusion_matrix)
from sklearn.model_selection import GridSearchCV, train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler

warnings.filterwarnings("ignore")

# ============================================================
# 1. CROP SPECIFICATIONS — Realistic Agricultural Ranges
# ============================================================

CROP_SPECS = {
    "Rice": {
        "N": (60, 120), "P": (30, 60), "K": (30, 60),
        "ph": (5.0, 6.5), "temperature": (20, 30), "humidity": (70, 90), "rainfall": (150, 300)
    },
    "Wheat": {
        "N": (80, 140), "P": (35, 65), "K": (35, 65),
        "ph": (5.5, 7.0), "temperature": (15, 25), "humidity": (50, 70), "rainfall": (60, 150)
    },
    "Maize": {
        "N": (70, 130), "P": (30, 55), "K": (30, 55),
        "ph": (5.5, 7.0), "temperature": (18, 27), "humidity": (55, 75), "rainfall": (80, 180)
    },
    "Coffee": {
        "N": (50, 110), "P": (25, 50), "K": (40, 70),
        "ph": (5.5, 6.8), "temperature": (18, 25), "humidity": (60, 80), "rainfall": (120, 250)
    },
    "Cotton": {
        "N": (90, 150), "P": (35, 65), "K": (40, 70),
        "ph": (5.8, 7.5), "temperature": (25, 35), "humidity": (40, 65), "rainfall": (50, 120)
    },
    "Mungbean": {
        "N": (20, 50), "P": (20, 40), "K": (20, 40),
        "ph": (6.0, 7.5), "temperature": (25, 35), "humidity": (50, 70), "rainfall": (60, 120)
    },
    "Tea": {
        "N": (60, 120), "P": (25, 50), "K": (35, 65),
        "ph": (4.5, 6.0), "temperature": (15, 25), "humidity": (65, 85), "rainfall": (180, 350)
    },
    "Rubber": {
        "N": (50, 100), "P": (20, 45), "K": (30, 60),
        "ph": (4.5, 6.5), "temperature": (22, 30), "humidity": (70, 90), "rainfall": (200, 400)
    },
    "Apple": {
        "N": (40, 90), "P": (25, 50), "K": (30, 60),
        "ph": (5.5, 7.0), "temperature": (10, 20), "humidity": (55, 75), "rainfall": (80, 180)
    },
    "Orange": {
        "N": (50, 100), "P": (20, 45), "K": (35, 65),
        "ph": (5.5, 7.0), "temperature": (18, 28), "humidity": (55, 80), "rainfall": (100, 200)
    },
    "Sugarcane": {
        "N": (100, 180), "P": (40, 80), "K": (50, 90),
        "ph": (5.5, 7.5), "temperature": (25, 35), "humidity": (60, 85), "rainfall": (120, 280)
    },
    "Lentil": {
        "N": (15, 40), "P": (25, 50), "K": (15, 35),
        "ph": (6.0, 7.5), "temperature": (15, 25), "humidity": (40, 65), "rainfall": (40, 100)
    },
}

FEATURES = ["N", "P", "K", "ph", "temperature", "humidity", "rainfall"]


def generate_synthetic_dataset(total_rows: int = 1500) -> pd.DataFrame:
    """
    Generate a realistic synthetic agricultural dataset.

    Each crop has defined optimal ranges. We sample from a normal
    distribution centered in each range to create realistic clusters.
    """
    rows_per_crop = total_rows // len(CROP_SPECS)
    data = []

    for crop, specs in CROP_SPECS.items():
        for _ in range(rows_per_crop):
            record = {}
            for feat in FEATURES:
                low, high = specs[feat]
                mu = (low + high) / 2
                sigma = (high - low) / 6  # ~99.7% within range
                val = np.random.normal(mu, sigma)
                # Hard clip to realistic global bounds
                if feat == "ph":
                    val = np.clip(val, 4.0, 9.0)
                elif feat in ("temperature", "humidity"):
                    val = np.clip(val, 0, 100)
                elif feat == "rainfall":
                    val = max(val, 0)
                else:
                    val = max(val, 0)
                record[feat] = round(float(val), 2)
            record["crop"] = crop
            data.append(record)

    df = pd.DataFrame(data)
    df = df.sample(frac=1, random_state=42).reset_index(drop=True)
    return df


def train_and_save_model(df: pd.DataFrame, output_dir: str):
    """
    Train a RandomForestClassifier with hyperparameter tuning,
    evaluate, and persist the full pipeline.
    """
    X = df[FEATURES].values
    y = df["crop"].values

    # Encode labels
    label_encoder = LabelEncoder()
    y_encoded = label_encoder.fit_transform(y)

    # Scale features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # Train / test split
    X_train, X_test, y_train, y_test = train_test_split(
        X_scaled, y_encoded, test_size=0.20, random_state=42, stratify=y_encoded
    )

    # Hyperparameter grid
    param_grid = {
        "n_estimators": [150, 300],
        "max_depth": [12, 20, None],
        "min_samples_split": [2, 5],
        "min_samples_leaf": [1, 2],
        "max_features": ["sqrt", "log2"],
    }

    print("[*] Starting hyperparameter tuning (GridSearchCV) ...")
    base_model = RandomForestClassifier(random_state=42, n_jobs=-1, class_weight="balanced")
    grid = GridSearchCV(
        base_model,
        param_grid,
        cv=4,
        scoring="accuracy",
        n_jobs=-1,
        verbose=1,
    )
    grid.fit(X_train, y_train)

    best_model = grid.best_estimator_
    print(f"[+] Best params: {grid.best_params_}")
    print(f"[+] Best CV accuracy: {grid.best_score_:.4f}")

    # Final evaluation
    y_pred = best_model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"\n[+] Test Accuracy: {acc:.4f} ({acc * 100:.2f}%)")
    print("\n--- Classification Report ---")
    print(classification_report(y_test, y_pred, target_names=label_encoder.classes_))

    # Save artifacts
    os.makedirs(output_dir, exist_ok=True)
    artifact_path = os.path.join(output_dir, "crop_model.pkl")
    joblib.dump(
        {
            "model": best_model,
            "scaler": scaler,
            "label_encoder": label_encoder,
            "features": FEATURES,
            "accuracy": float(acc),
            "trained_at": datetime.utcnow().isoformat(),
        },
        artifact_path,
    )
    print(f"\n[+] Model artifact saved to: {artifact_path}")
    print(f"    Classes: {list(label_encoder.classes_)}")
    return best_model, acc


def main():
    print("=" * 60)
    print(" AgriSmart AI - Crop Recommendation Model Training ")
    print("=" * 60)

    script_dir = os.path.dirname(os.path.abspath(__file__))
    output_dir = script_dir  # Save in same folder as script

    print(f"[*] Generating synthetic dataset ...")
    df = generate_synthetic_dataset(total_rows=1500)
    print(f"[+] Generated {len(df)} rows with {len(CROP_SPECS)} crop classes.")
    print(f"    Crop distribution:")
    for crop, cnt in df["crop"].value_counts().sort_index().items():
        print(f"      {crop:12s}: {cnt} rows")

    print(f"\n[*] Training model ...")
    _, acc = train_and_save_model(df, output_dir)

    print("\n" + "=" * 60)
    print(f" Training Complete — Accuracy: {acc * 100:.2f}% ")
    print("=" * 60)


if __name__ == "__main__":
    main()
