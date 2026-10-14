"""
Feature Selection Module for Lightweight IoT IDS.

Compliant with Phase 3 Acceptance Criteria:
- Operates strictly on training split (no test or validation leakage).
- Ranks features via Mutual Information (capturing non-linear relationships).
- Applies greedy pairwise Pearson correlation pruning (threshold rho >= 0.85).
- Guarantees and programmatically asserts strict nested subsets: S_5 c S_10 c S_15 c S_20.
- Attaches explicit data types, physical units, and live-capture feasibility metadata.
- Exports reproducible feature rankings and subsets as JSON artifacts.
"""

import argparse
import json
from pathlib import Path
from typing import Dict, List, Tuple, Any

import numpy as np
import pandas as pd
from sklearn.feature_selection import mutual_info_classif

from src import config
from src.data_loader import load_merged_dataset
from src.preprocess import prepare_features_and_labels, stratified_3way_split, fit_and_apply_preprocessing

FEATURE_METADATA: Dict[str, Dict[str, Any]] = {
    "flow_duration": {"type": "float", "unit": "seconds", "live_available": True},
    "Header_Length": {"type": "float", "unit": "bytes", "live_available": True},
    "Protocol Type": {"type": "float", "unit": "IANA code", "live_available": True},
    "Duration": {"type": "float", "unit": "seconds", "live_available": True},
    "Rate": {"type": "float", "unit": "pkts/sec", "live_available": True},
    "Srate": {"type": "float", "unit": "pkts/sec", "live_available": True},
    "Drate": {"type": "float", "unit": "pkts/sec", "live_available": True},
    "fin_flag_number": {"type": "binary", "unit": "indicator", "live_available": True},
    "syn_flag_number": {"type": "binary", "unit": "indicator", "live_available": True},
    "rst_flag_number": {"type": "binary", "unit": "indicator", "live_available": True},
    "psh_flag_number": {"type": "binary", "unit": "indicator", "live_available": True},
    "ack_flag_number": {"type": "binary", "unit": "indicator", "live_available": True},
    "ece_flag_number": {"type": "binary", "unit": "indicator", "live_available": True},
    "cwr_flag_number": {"type": "binary", "unit": "indicator", "live_available": True},
    "ack_count": {"type": "float", "unit": "count", "live_available": True},
    "syn_count": {"type": "float", "unit": "count", "live_available": True},
    "fin_count": {"type": "float", "unit": "count", "live_available": True},
    "urg_count": {"type": "float", "unit": "count", "live_available": True},
    "rst_count": {"type": "float", "unit": "count", "live_available": True},
    "HTTP": {"type": "binary", "unit": "indicator", "live_available": True},
    "HTTPS": {"type": "binary", "unit": "indicator", "live_available": True},
    "DNS": {"type": "binary", "unit": "indicator", "live_available": True},
    "Telnet": {"type": "binary", "unit": "indicator", "live_available": True},
    "SMTP": {"type": "binary", "unit": "indicator", "live_available": True},
    "SSH": {"type": "binary", "unit": "indicator", "live_available": True},
    "IRC": {"type": "binary", "unit": "indicator", "live_available": True},
    "TCP": {"type": "binary", "unit": "indicator", "live_available": True},
    "UDP": {"type": "binary", "unit": "indicator", "live_available": True},
    "DHCP": {"type": "binary", "unit": "indicator", "live_available": True},
    "ARP": {"type": "binary", "unit": "indicator", "live_available": True},
    "ICMP": {"type": "binary", "unit": "indicator", "live_available": True},
    "IPv": {"type": "binary", "unit": "indicator", "live_available": True},
    "LLC": {"type": "binary", "unit": "indicator", "live_available": True},
    "Tot sum": {"type": "float", "unit": "bytes", "live_available": True},
    "Min": {"type": "float", "unit": "bytes", "live_available": True},
    "Max": {"type": "float", "unit": "bytes", "live_available": True},
    "AVG": {"type": "float", "unit": "bytes", "live_available": True},
    "Std": {"type": "float", "unit": "bytes", "live_available": True},
    "Tot size": {"type": "float", "unit": "bytes", "live_available": True},
    "IAT": {"type": "float", "unit": "seconds", "live_available": True},
    "Number": {"type": "float", "unit": "count", "live_available": True},
    "Magnitue": {"type": "float", "unit": "euclidean norm", "live_available": True},
    "Radius": {"type": "float", "unit": "bytes", "live_available": True},
    "Covariance": {"type": "float", "unit": "variance", "live_available": True},
    "Variance": {"type": "float", "unit": "bytes^2", "live_available": True},
    "Weight": {"type": "float", "unit": "coefficient", "live_available": True}
}


def compute_mutual_information(X_train: pd.DataFrame, y_train: pd.Series) -> pd.Series:
    """Compute Mutual Information classification scores on training data only."""
    mi_scores = mutual_info_classif(
        X_train, y_train,
        discrete_features="auto",
        random_state=config.RANDOM_STATE
    )
    return pd.Series(mi_scores, index=X_train.columns).sort_values(ascending=False)


def prune_correlated_features(
    ranked_features: List[str],
    X_train: pd.DataFrame,
    threshold: float = config.CORRELATION_THRESHOLD
) -> Tuple[List[str], List[Dict[str, Any]]]:
    """
    Greedy correlation pruning on training data:
    Iterate by descending MI rank. If a candidate feature exhibits absolute Pearson
    correlation >= threshold with an already-selected feature, prune it as redundant.
    """
    corr_matrix = X_train[ranked_features].corr().abs()
    selected = []
    pruned_details = []

    for feat in ranked_features:
        redundant_with = None
        redundant_corr = 0.0

        for s in selected:
            val = corr_matrix.loc[feat, s]
            if val >= threshold:
                redundant_with = s
                redundant_corr = float(val)
                break

        if redundant_with is None:
            selected.append(feat)
        else:
            pruned_details.append({
                "pruned_feature": feat,
                "correlated_with": redundant_with,
                "correlation": round(redundant_corr, 4)
            })

    return selected, pruned_details


def extract_nested_subsets(
    X_train: pd.DataFrame,
    y_train: pd.Series,
    k_values: List[int] = config.K_VALUES,
    threshold: float = config.CORRELATION_THRESHOLD
) -> Tuple[Dict[int, List[str]], pd.Series, List[str], List[Dict[str, Any]]]:
    """
    Extract strictly nested feature subsets for K in [5, 10, 15, 20] from training data only.
    """
    mi_ranking = compute_mutual_information(X_train, y_train)
    pruned_ranking, pruned_details = prune_correlated_features(
        list(mi_ranking.index), X_train, threshold=threshold
    )

    feature_subsets: Dict[int, List[str]] = {}
    for k in sorted(k_values):
        if k > len(pruned_ranking):
            raise ValueError(f"Requested K={k} exceeds available features ({len(pruned_ranking)})")
        feature_subsets[k] = pruned_ranking[:k]

    # Assert strict nested subset property
    sorted_k = sorted(k_values)
    for i in range(len(sorted_k) - 1):
        s_small = set(feature_subsets[sorted_k[i]])
        s_large = set(feature_subsets[sorted_k[i + 1]])
        assert s_small.issubset(s_large) and len(s_small) < len(s_large), (
            f"Nested subset invariant violated between K={sorted_k[i]} and K={sorted_k[i+1]}!"
        )

    return feature_subsets, mi_ranking, pruned_ranking, pruned_details


def run_phase_3_pipeline(
    task: str = "binary",
    sample_fraction: float = config.DEV_SAMPLE_FRACTION
) -> Dict[str, Any]:
    """Execute complete Phase 3 feature selection and save run artifacts."""
    print(f"\n{'='*75}")
    print(f"PHASE 3: REPRODUCIBLE FEATURE SELECTION (Task: {task.upper()})")
    print(f"{'='*75}")

    raw_df = load_merged_dataset(sample_fraction=sample_fraction)
    X, y, _ = prepare_features_and_labels(raw_df, task=task)

    # 3-Way Split: select on Train ONLY
    X_train, X_val, X_test, y_train, y_val, y_test = stratified_3way_split(X, y)
    X_train_scaled, _, _, _, _, dropped_const = fit_and_apply_preprocessing(X_train, X_val, X_test)

    print(f"Dataset split: Train={len(X_train)} | Val={len(X_val)} | Test={len(X_test)} (Test UNTOUCHED)")
    print(f"Candidate features after constant filtering: {X_train_scaled.shape[1]}")

    feature_subsets, mi_ranking, pruned_ranking, pruned_details = extract_nested_subsets(
        X_train_scaled, y_train, k_values=config.K_VALUES
    )

    print(f"\nTop 10 Mutual Information Features (Training Set Only):")
    for r, (feat, score) in enumerate(mi_ranking.head(10).items(), 1):
        meta = FEATURE_METADATA.get(feat, {"type": "float", "unit": "unknown", "live_available": True})
        print(f"  {r:2d}. {feat:25s} | MI: {score:.4f} | Unit: {meta['unit']:15s} | Live: {meta['live_available']}")

    print(f"\nFeatures remaining after correlation pruning (rho < {config.CORRELATION_THRESHOLD}): {len(pruned_ranking)}")
    print(f"Pruned redundant features: {len(pruned_details)}")

    # Display subsets
    subset_export = {}
    for k in config.K_VALUES:
        feats = feature_subsets[k]
        feat_details = []
        for f in feats:
            m = FEATURE_METADATA.get(f, {"type": "float", "unit": "unknown", "live_available": True})
            feat_details.append({
                "name": f,
                "type": m["type"],
                "unit": m["unit"],
                "live_capture_available": m["live_available"],
                "mi_score": round(float(mi_ranking[f]), 4)
            })
        subset_export[str(k)] = {
            "feature_count": k,
            "features": feats,
            "details": feat_details
        }
        print(f"\nSubset K={k} ({k} features):")
        print("  " + ", ".join(feats))

    # Save artifacts
    results_dir = Path(config.RESULTS_DIR) / "runs"
    results_dir.mkdir(parents=True, exist_ok=True)
    out_file = results_dir / f"feature_subsets_{task}.json"

    payload = {
        "task": task,
        "random_state": config.RANDOM_STATE,
        "sample_fraction": sample_fraction,
        "training_samples": len(X_train),
        "correlation_threshold": config.CORRELATION_THRESHOLD,
        "subsets": subset_export,
        "pruned_correlations": pruned_details,
        "nested_subset_property_verified": True
    }

    with open(out_file, "w") as f:
        json.dump(payload, f, indent=2)

    print(f"\n[Phase 3] Feature subsets artifact saved to: {out_file}")
    print(f"{'='*75}\n")
    return payload


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Phase 3 Feature Selection Runner")
    parser.add_argument("--task", type=str, default="binary", choices=["binary", "multiclass"])
    parser.add_argument("--sample-fraction", type=float, default=None)
    args = parser.parse_args()

    frac = args.sample_fraction if args.sample_fraction else config.DEV_SAMPLE_FRACTION
    run_phase_3_pipeline(task=args.task, sample_fraction=frac)
