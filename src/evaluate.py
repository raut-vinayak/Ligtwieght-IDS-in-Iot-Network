"""
Training, Benchmarking, and Honest Evaluation Module for Lightweight IoT IDS.

Compliant with Phase 4 Acceptance Criteria:
- Benchmarks 4 edge architectures: Decision Tree, Logistic Regression, Small Random Forest, LightGBM.
- Models trained on Train split with nested feature subsets K in [5, 10, 15, 20].
- Model selection performed strictly on Validation split; Test set used for honest final reporting.
- Reports Macro F1, Balanced Accuracy, Weighted F1, Per-Class Precision/Recall/F1/Support.
- For binary task: reports ROC-AUC and PR-AUC (Average Precision).
- Evaluates confusion matrix (both raw counts and row-normalized).
- Measures inference latency with warm-up: reports median latency (ms) and p95 latency (ms).
- Records serialized artifact footprint on disk (KB).
- Flags potential data leakage (> 0.999 score).
- Saves comprehensive machine-readable scorecards (CSV + JSON) with dataset manifest metadata.
"""

import argparse
import json
import os
import platform
import time
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Any

import joblib
import numpy as np
import pandas as pd
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import (
    accuracy_score,
    balanced_accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    average_precision_score,
    confusion_matrix,
    classification_report
)

from src import config
from src.data_loader import load_merged_dataset, get_raw_csv_files, compute_file_sha256
from src.preprocess import (
    prepare_features_and_labels,
    stratified_3way_split,
    fit_and_apply_preprocessing
)
from src.feature_selection import extract_nested_subsets, FEATURE_METADATA
from src.models import get_model_registry


def measure_inference_latencies(
    model: Any,
    X_sample: pd.DataFrame,
    warmup_runs: int = 15,
    timed_runs: int = 100
) -> Tuple[float, float]:
    """
    Measure single-sample inference latency with explicit warm-up.
    Returns:
        Tuple[float, float]: (median_latency_ms, p95_latency_ms)
    """
    n_rows = min(len(X_sample), 50)
    test_rows = X_sample.iloc[:n_rows]

    # Warmup
    for _ in range(warmup_runs):
        _ = model.predict(test_rows)

    row_latencies = []
    # Time single sample inference
    for i in range(min(timed_runs, n_rows)):
        single_row = test_rows.iloc[[i]]
        t0 = time.perf_counter()
        _ = model.predict(single_row)
        t1 = time.perf_counter()
        row_latencies.append((t1 - t0) * 1000.0)

    # If timed_runs > n_rows, repeat
    while len(row_latencies) < timed_runs:
        idx = len(row_latencies) % n_rows
        single_row = test_rows.iloc[[idx]]
        t0 = time.perf_counter()
        _ = model.predict(single_row)
        t1 = time.perf_counter()
        row_latencies.append((t1 - t0) * 1000.0)

    median_lat = float(np.median(row_latencies))
    p95_lat = float(np.percentile(row_latencies, 95))
    return round(median_lat, 4), round(p95_lat, 4)


def measure_model_size_kb(file_path: Path) -> float:
    """Return model file size on disk in Kilobytes."""
    if not file_path.exists():
        return 0.0
    return round(os.path.getsize(file_path) / 1024.0, 2)


def evaluate_split_performance(
    model: Any,
    X_eval: pd.DataFrame,
    y_eval: pd.Series,
    task: str,
    class_labels: List[str]
) -> Dict[str, Any]:
    """
    Compute comprehensive classification metrics on an evaluation split (Val or Test).
    """
    y_pred = model.predict(X_eval)

    acc = float(accuracy_score(y_eval, y_pred))
    balanced_acc = float(balanced_accuracy_score(y_eval, y_pred))
    macro_prec = float(precision_score(y_eval, y_pred, average="macro", zero_division=0))
    macro_rec = float(recall_score(y_eval, y_pred, average="macro", zero_division=0))
    macro_f1 = float(f1_score(y_eval, y_pred, average="macro", zero_division=0))
    weighted_f1 = float(f1_score(y_eval, y_pred, average="weighted", zero_division=0))

    # Confusion matrix
    cm = confusion_matrix(y_eval, y_pred, labels=class_labels)
    with np.errstate(divide="ignore", invalid="ignore"):
        cm_norm = np.nan_to_num(cm.astype(float) / cm.sum(axis=1, keepdims=True), 0.0)

    # Per-class report
    cls_report = classification_report(
        y_eval, y_pred,
        labels=class_labels,
        output_dict=True,
        zero_division=0
    )

    per_class_metrics = {}
    for lbl in class_labels:
        str_lbl = str(lbl)
        if str_lbl in cls_report:
            per_class_metrics[str_lbl] = {
                "precision": round(float(cls_report[str_lbl]["precision"]), 4),
                "recall": round(float(cls_report[str_lbl]["recall"]), 4),
                "f1_score": round(float(cls_report[str_lbl]["f1-score"]), 4),
                "support": int(cls_report[str_lbl]["support"])
            }

    # Binary specific AUC
    roc_auc = None
    pr_auc = None
    if task == "binary":
        try:
            if hasattr(model, "predict_proba"):
                y_proba = model.predict_proba(X_eval)[:, 1]
                roc_auc = round(float(roc_auc_score(y_eval, y_proba)), 4)
                pr_auc = round(float(average_precision_score(y_eval, y_proba)), 4)
        except Exception:
            pass

    return {
        "accuracy": round(acc, 4),
        "balanced_accuracy": round(balanced_acc, 4),
        "precision_macro": round(macro_prec, 4),
        "recall_macro": round(macro_rec, 4),
        "macro_f1": round(macro_f1, 4),
        "weighted_f1": round(weighted_f1, 4),
        "roc_auc": roc_auc,
        "pr_auc": pr_auc,
        "per_class": per_class_metrics,
        "confusion_matrix": cm.tolist(),
        "confusion_matrix_norm": [[round(val, 4) for val in row] for row in cm_norm.tolist()],
        "classes": [str(c) for c in class_labels]
    }


def execute_full_benchmark(
    task: str = "binary",
    sample_fraction: float = config.DEV_SAMPLE_FRACTION,
    run_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Run complete Phase 4 training and evaluation pipeline for all models and K values.
    """
    active_run_id = run_id or f"run_{task}_{int(time.time())}"
    print(f"\n{'='*75}")
    print(f"PHASE 4: BENCHMARK & EVALUATION RUN ({active_run_id.upper()})")
    print(f"Task: {task.upper()} | Sample Fraction: {sample_fraction}")
    print(f"{'='*75}")

    # 1. Dataset Intake & Manifest Tracking
    raw_files = get_raw_csv_files()
    if not raw_files:
        raise FileNotFoundError(f"No CSV data in {config.DATA_RAW_DIR}")
    dataset_manifest_hash = compute_file_sha256(raw_files[0])
    raw_df = load_merged_dataset(sample_fraction=sample_fraction)

    # 2. Preprocess & 3-Way Split
    X, y, _ = prepare_features_and_labels(raw_df, task=task)
    X_train, X_val, X_test, y_train, y_val, y_test = stratified_3way_split(X, y)
    X_train_scaled, X_val_scaled, X_test_scaled, imputer, scaler, dropped_const = fit_and_apply_preprocessing(
        X_train, X_val, X_test
    )

    # Multiclass labels
    if task == "binary":
        classes = [0, 1]
    else:
        classes = sorted(list(set(y_train.unique())))

    # 3. Extract Feature Subsets (Train ONLY)
    feature_subsets, _, _, _ = extract_nested_subsets(X_train_scaled, y_train, k_values=config.K_VALUES)

    hardware_info = {
        "platform": platform.platform(),
        "processor": platform.processor(),
        "python_version": platform.python_version(),
        "numpy_version": np.__version__,
        "pandas_version": pd.__version__
    }

    scorecard_records = []
    run_artifacts_details = []

    models_to_test = get_model_registry(task=task)

    for k in config.K_VALUES:
        k_features = feature_subsets[k]
        X_tr_k = X_train_scaled[k_features]
        X_val_k = X_val_scaled[k_features]
        X_te_k = X_test_scaled[k_features]

        print(f"\n>>> Benchmarking K={k} ({', '.join(k_features[:3])}...)")

        for model_name, model_inst in models_to_test.items():
            t_start = time.perf_counter()
            # Train model
            model_inst.fit(X_tr_k, y_train)
            train_time = round(time.perf_counter() - t_start, 3)

            # Evaluate on Validation split (Strict model selection split)
            val_metrics = evaluate_split_performance(model_inst, X_val_k, y_val, task, classes)

            # Evaluate on Test split (Honest unseen holdout)
            test_metrics = evaluate_split_performance(model_inst, X_te_k, y_test, task, classes)

            # Measure inference latency with warm-up
            med_lat, p95_lat = measure_inference_latencies(model_inst, X_te_k)

            # Red flag check
            if test_metrics["macro_f1"] > 0.999:
                print(f"  [INVESTIGATION TRIGGER] {model_name} (K={k}) achieved Macro F1 = {test_metrics['macro_f1']:.4f} > 0.999!")

            # Serialize model artifact
            model_filename = f"{active_run_id}_{task}_{model_name}_k{k}.joblib"
            model_path = config.MODELS_DIR / model_filename
            artifact_payload = {
                "run_id": active_run_id,
                "model_name": model_name,
                "task": task,
                "k": k,
                "features": k_features,
                "classes": [str(c) for c in classes],
                "model": model_inst,
                "scaler": scaler,
                "imputer": imputer
            }
            joblib.dump(artifact_payload, model_path)
            size_kb = measure_model_size_kb(model_path)

            record = {
                "run_id": active_run_id,
                "task": task,
                "model": model_name,
                "k": k,
                "dataset_hash": dataset_manifest_hash[:12],
                # Validation scores (used for selection)
                "val_macro_f1": val_metrics["macro_f1"],
                "val_balanced_acc": val_metrics["balanced_accuracy"],
                "val_accuracy": val_metrics["accuracy"],
                # Test scores (honest reporting)
                "test_macro_f1": test_metrics["macro_f1"],
                "test_balanced_acc": test_metrics["balanced_accuracy"],
                "test_accuracy": test_metrics["accuracy"],
                "test_precision_macro": test_metrics["precision_macro"],
                "test_recall_macro": test_metrics["recall_macro"],
                "test_weighted_f1": test_metrics["weighted_f1"],
                "test_roc_auc": test_metrics["roc_auc"],
                "test_pr_auc": test_metrics["pr_auc"],
                # Operational edge constraints
                "median_latency_ms": med_lat,
                "p95_latency_ms": p95_lat,
                "model_size_kb": size_kb,
                "train_time_sec": train_time,
                "artifact_path": str(model_path.name)
            }
            scorecard_records.append(record)

            run_artifacts_details.append({
                "model": model_name,
                "k": k,
                "val_metrics": val_metrics,
                "test_metrics": test_metrics,
                "latencies": {"median_ms": med_lat, "p95_ms": p95_lat},
                "size_kb": size_kb,
                "features": k_features
            })

            print(f"  [{model_name:20s}] Val Macro F1: {val_metrics['macro_f1']:.4f} | Test Macro F1: {test_metrics['macro_f1']:.4f} | Latency: {med_lat:.3f} ms | Size: {size_kb:.1f} KB")

    # Save Scorecards
    scorecard_df = pd.DataFrame(scorecard_records)
    scorecard_df = scorecard_df.sort_values(by=["k", "val_macro_f1"], ascending=[True, False])

    scorecard_csv = config.RESULTS_DIR / f"scorecard_{task}.csv"
    scorecard_df.to_csv(scorecard_csv, index=False)
    scorecard_df.to_csv(config.SCORECARD_CSV, index=False)

    # Save Run JSON
    run_json_path = config.RESULTS_DIR / "runs" / f"{active_run_id}.json"
    run_payload = {
        "run_id": active_run_id,
        "date": time.strftime("%Y-%m-%d %H:%M:%S"),
        "task": task,
        "sample_fraction": sample_fraction,
        "train_samples": len(X_train),
        "val_samples": len(X_val),
        "test_samples": len(X_test),
        "dataset_manifest_hash": dataset_manifest_hash,
        "hardware_info": hardware_info,
        "scorecard": scorecard_records,
        "detailed_artifacts": run_artifacts_details
    }
    with open(run_json_path, "w") as f:
        json.dump(run_payload, f, indent=2)

    print(f"\n[Phase 4] Scorecard saved to: {scorecard_csv}")
    print(f"[Phase 4] Run details saved to: {run_json_path}")
    print(f"{'='*75}\n")

    return run_payload


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Phase 4 Training & Honest Evaluation Runner")
    parser.add_argument("--task", type=str, default="both", choices=["binary", "multiclass", "both"])
    parser.add_argument("--sample-fraction", type=float, default=None)
    parser.add_argument("--run-id", type=str, default=None)
    args = parser.parse_args()

    frac = args.sample_fraction if args.sample_fraction else config.DEV_SAMPLE_FRACTION

    if args.task in ["binary", "both"]:
        execute_full_benchmark(task="binary", sample_fraction=frac, run_id=args.run_id)
    if args.task in ["multiclass", "both"]:
        execute_full_benchmark(task="multiclass", sample_fraction=frac, run_id=args.run_id)
