"""
Preprocessing Module for Lightweight IoT IDS.

Compliant with Phase 2 Acceptance Criteria:
- Authoritative label mapping from 33 raw attacks + BenignTraffic to 7 attack families.
- Strict detection and reporting of any unmapped/unknown labels (never silently discard).
- Leakage-safe feature cleaning: identifier columns dropped, constant columns detected on train only.
- 3-Way Stratified Split: 70% Train, 15% Validation, 15% Test with fixed seed.
- Imputation & StandardScaler fitted strictly on Train, then applied to Val and Test.
- Class support and proportion verification across all splits.
"""

import argparse
import json
from typing import Dict, List, Optional, Tuple, Any

import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.impute import SimpleImputer

from src import config
from src.data_loader import load_merged_dataset


def audit_label_mapping(df: pd.DataFrame) -> Tuple[pd.DataFrame, List[str]]:
    """
    Perform a complete audit of all raw labels in the dataset against the
    authoritative CICIoT2023 category mapping.

    Returns:
        Tuple[pd.DataFrame, List[str]]: (audit_df, unknown_labels)
    """
    if config.LABEL_COLUMN not in df.columns:
        raise KeyError(f"Label column '{config.LABEL_COLUMN}' not present in dataframe.")

    raw_counts = df[config.LABEL_COLUMN].value_counts().reset_index()
    raw_counts.columns = ["raw_label", "count"]
    total_rows = len(df)

    audit_rows = []
    unknown_labels = []

    for _, row in raw_counts.iterrows():
        raw_lbl = str(row["raw_label"])
        cnt = int(row["count"])
        pct = round((cnt / total_rows) * 100, 2)

        if raw_lbl in config.CATEGORY_MAP:
            mapped_family = config.CATEGORY_MAP[raw_lbl]
            binary_lbl = "Benign" if raw_lbl == "BenignTraffic" else "Attack"
            status = "Mapped"
        else:
            mapped_family = "UNKNOWN_REVIEW"
            binary_lbl = "UNKNOWN_REVIEW"
            status = "UNKNOWN"
            unknown_labels.append(raw_lbl)

        audit_rows.append({
            "Raw Label": raw_lbl,
            "Mapped Family": mapped_family,
            "Binary Label": binary_lbl,
            "Count": cnt,
            "Percentage (%)": pct,
            "Status": status
        })

    audit_df = pd.DataFrame(audit_rows)
    return audit_df, unknown_labels


def clean_raw_data(df: pd.DataFrame) -> Tuple[pd.DataFrame, List[str]]:
    """
    Remove data leakage and identifier columns, sanitize inf and nan.
    Constant column removal is deferred to after the train/test split.

    Returns:
        Tuple[pd.DataFrame, List[str]]: (cleaned_df, dropped_leakage_cols)
    """
    df_clean = df.copy()

    # Drop identifier and target-proxy leakage columns
    dropped_leakage = [col for col in config.LEAKAGE_COLUMNS if col in df_clean.columns]
    if dropped_leakage:
        df_clean = df_clean.drop(columns=dropped_leakage)

    # Sanitize infinities
    numeric_cols = df_clean.select_dtypes(include=[np.number]).columns
    df_clean[numeric_cols] = df_clean[numeric_cols].replace([np.inf, -np.inf], np.nan)

    return df_clean, dropped_leakage


def prepare_features_and_labels(
    df: pd.DataFrame,
    task: str = "binary"
) -> Tuple[pd.DataFrame, pd.Series, pd.DataFrame]:
    """
    Prepare feature matrix X and target vector y with full label mapping validation.

    Args:
        df (pd.DataFrame): Input dataframe.
        task (str): 'binary' or 'multiclass'.

    Returns:
        Tuple[pd.DataFrame, pd.Series, pd.DataFrame]: (X, y, audit_df)
    """
    if task not in ["binary", "multiclass"]:
        raise ValueError(f"Task must be 'binary' or 'multiclass', got '{task}'")

    audit_df, unknown = audit_label_mapping(df)
    if unknown:
        raise ValueError(f"Found {len(unknown)} unknown raw labels requiring manual review: {unknown}")

    df_clean, _ = clean_raw_data(df)
    raw_labels = df_clean[config.LABEL_COLUMN].astype(str)

    if task == "binary":
        # 0 for Benign, 1 for Attack
        y = raw_labels.apply(lambda lbl: 0 if lbl == "BenignTraffic" else 1)
        y.name = "target"
    else:
        # Multiclass: 7 attack families + Benign
        y = raw_labels.map(config.CATEGORY_MAP)
        y.name = "target"

    X = df_clean.drop(columns=[config.LABEL_COLUMN])
    return X, y, audit_df


def stratified_3way_split(
    X: pd.DataFrame,
    y: pd.Series,
    train_size: float = 0.70,
    val_size: float = 0.15,
    test_size: float = 0.15,
    random_state: int = config.RANDOM_STATE
) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame, pd.Series, pd.Series, pd.Series]:
    """
    Split data into 70% Train, 15% Validation, 15% Test using stratified sampling.
    """
    assert abs(train_size + val_size + test_size - 1.0) < 1e-5, "Split fractions must sum to 1.0"

    # First split off Test (15%)
    X_train_val, X_test, y_train_val, y_test = train_test_split(
        X, y,
        test_size=test_size,
        stratify=y,
        random_state=random_state
    )

    # Next split Train vs Val (0.15 / 0.85 = ~0.17647 of remaining)
    relative_val_size = val_size / (train_size + val_size)
    X_train, X_val, y_train, y_val = train_test_split(
        X_train_val, y_train_val,
        test_size=relative_val_size,
        stratify=y_train_val,
        random_state=random_state
    )

    return X_train, X_val, X_test, y_train, y_val, y_test


def fit_and_apply_preprocessing(
    X_train: pd.DataFrame,
    X_val: pd.DataFrame,
    X_test: pd.DataFrame
) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame, SimpleImputer, StandardScaler, List[str]]:
    """
    Learned preprocessing fitted ONLY on X_train:
    1. Detect and drop zero-variance/constant features on X_train only.
    2. Fit median imputer on X_train only.
    3. Fit StandardScaler on X_train only.
    4. Transform X_train, X_val, X_test.
    """
    # 1. Identify constant features on X_train ONLY
    constant_features = [col for col in X_train.columns if X_train[col].nunique() <= 1]
    if constant_features:
        X_train = X_train.drop(columns=constant_features)
        X_val = X_val.drop(columns=constant_features)
        X_test = X_test.drop(columns=constant_features)

    feature_cols = list(X_train.columns)

    # 2. Imputer
    imputer = SimpleImputer(strategy="median")
    imputer.fit(X_train)

    X_train_imp = imputer.transform(X_train)
    X_val_imp = imputer.transform(X_val)
    X_test_imp = imputer.transform(X_test)

    # 3. Scaler
    scaler = StandardScaler()
    scaler.fit(X_train_imp)

    X_train_scaled = pd.DataFrame(scaler.transform(X_train_imp), columns=feature_cols, index=X_train.index)
    X_val_scaled = pd.DataFrame(scaler.transform(X_val_imp), columns=feature_cols, index=X_val.index)
    X_test_scaled = pd.DataFrame(scaler.transform(X_test_imp), columns=feature_cols, index=X_test.index)

    return X_train_scaled, X_val_scaled, X_test_scaled, imputer, scaler, constant_features


def verify_split_support(
    y_train: pd.Series,
    y_val: pd.Series,
    y_test: pd.Series,
    min_samples: int = 5
) -> pd.DataFrame:
    """
    Check class support and proportions across Train, Validation, and Test splits.
    Raises ValueError if any class has insufficient support for honest evaluation.
    """
    classes = sorted(list(set(y_train.unique()) | set(y_val.unique()) | set(y_test.unique())))
    rows = []

    for cls in classes:
        tr_cnt = int((y_train == cls).sum())
        val_cnt = int((y_val == cls).sum())
        te_cnt = int((y_test == cls).sum())
        total = tr_cnt + val_cnt + te_cnt

        if tr_cnt < min_samples or val_cnt < 1 or te_cnt < 1:
            raise ValueError(f"Class '{cls}' has insufficient support: Train={tr_cnt}, Val={val_cnt}, Test={te_cnt}")

        rows.append({
            "Class": cls,
            "Train Count": tr_cnt,
            "Train %": round((tr_cnt / len(y_train)) * 100, 2),
            "Val Count": val_cnt,
            "Val %": round((val_cnt / len(y_val)) * 100, 2),
            "Test Count": te_cnt,
            "Test %": round((te_cnt / len(y_test)) * 100, 2),
            "Total Samples": total
        })

    return pd.DataFrame(rows)


def run_phase_2_pipeline(sample_fraction: Optional[float] = None) -> Dict[str, Any]:
    """Execute complete Phase 2 audit and verification."""
    print(f"\n{'='*75}")
    print("PHASE 2: LABEL MAPPING AUDIT, LEAKAGE REMOVAL & 3-WAY STRATIFIED SPLIT")
    print(f"{'='*75}")

    raw_df = load_merged_dataset(sample_fraction=sample_fraction)
    print(f"Loaded {len(raw_df):,} raw records.")

    # 1. Audit
    audit_df, unknown = audit_label_mapping(raw_df)
    print(f"\n[Audit] Unique raw labels audited: {len(audit_df)}")
    print(f"[Audit] Unknown labels: {len(unknown)}")
    print(audit_df.head(10).to_string(index=False))

    # 2. Binary Pipeline
    print("\n--- Binary Task: 3-Way Stratified Split Verification ---")
    X_bin, y_bin, _ = prepare_features_and_labels(raw_df, task="binary")
    X_tr_b, X_val_b, X_te_b, y_tr_b, y_val_b, y_te_b = stratified_3way_split(X_bin, y_bin)
    support_bin = verify_split_support(y_tr_b, y_val_b, y_te_b)
    print(support_bin.to_string(index=False))

    # 3. Multiclass Pipeline
    print("\n--- Multiclass Task: 3-Way Stratified Split Verification ---")
    X_multi, y_multi, _ = prepare_features_and_labels(raw_df, task="multiclass")
    X_tr_m, X_val_m, X_te_m, y_tr_m, y_val_m, y_te_m = stratified_3way_split(X_multi, y_multi)
    support_multi = verify_split_support(y_tr_m, y_val_m, y_te_m)
    print(support_multi.to_string(index=False))

    # 4. Leakage-Safe Scaling Test
    print("\n--- Leakage-Safe Preprocessing Fit (Train Only) ---")
    X_tr_s, X_val_s, X_te_s, imputer, scaler, dropped_const = fit_and_apply_preprocessing(X_tr_m, X_val_m, X_te_m)
    print(f"Features after constant removal: {X_tr_s.shape[1]} (Dropped constant features: {dropped_const})")
    print(f"Train scaled shape: {X_tr_s.shape}")
    print(f"Val scaled shape:   {X_val_s.shape}")
    print(f"Test scaled shape:  {X_te_s.shape}")
    print(f"Scaler mean vector length: {len(scaler.mean_)} (fitted strictly on X_train)")

    summary = {
        "status": "VERIFIED",
        "total_rows": len(raw_df),
        "binary_support": support_bin.to_dict(orient="records"),
        "multiclass_support": support_multi.to_dict(orient="records"),
        "train_samples": len(X_tr_m),
        "val_samples": len(X_val_m),
        "test_samples": len(X_te_m),
        "features_retained": X_tr_s.shape[1],
        "dropped_constant_features": dropped_const
    }

    # Save summary artifact
    summary_path = config.DATA_PROCESSED_DIR / "split_summary.json"
    with open(summary_path, "w") as f:
        json.dump(summary, f, indent=2)
    print(f"\n[Phase 2] Preprocessing split summary saved to: {summary_path}")
    print(f"{'='*75}\n")
    return summary


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Phase 2 Preprocessing & Split Validation")
    parser.add_argument("--sample-fraction", type=float, default=None, help="Fraction of data to process")
    args = parser.parse_args()
    run_phase_2_pipeline(sample_fraction=args.sample_fraction)
