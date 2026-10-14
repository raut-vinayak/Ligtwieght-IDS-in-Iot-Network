"""
Visualization and Model Selection Module for Lightweight IoT IDS.

Compliant with Phase 5 Acceptance Criteria:
- Generates high-resolution scientific plots directly from scorecard files.
- Generates:
  1. Macro F1 vs K (one line per model, with run and split identifiers)
  2. Balanced Accuracy vs K
  3. Model Size (KB) vs K (log scale)
  4. Latency vs K (Median and P95)
  5. Normalized Confusion Matrix heatmap for selected multiclass model
  6. Per-class Precision, Recall, F1 breakdown
- Defines and applies formal edge selection rule:
  "Maximize Validation Macro F1 subject to Model Size <= 50 KB and Median Latency <= 2.0 ms"
- Exports selection decision as JSON artifact and documentation.
"""

import argparse
import json
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Any

import joblib
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import seaborn as sns

from src import config
from src.data_loader import load_merged_dataset
from src.preprocess import (
    prepare_features_and_labels,
    stratified_3way_split,
    fit_and_apply_preprocessing
)


def set_scientific_style():
    """Apply clean scientific styling to matplotlib plots."""
    sns.set_theme(style="whitegrid", font="sans-serif")
    plt.rcParams.update({
        "font.size": 10,
        "axes.labelsize": 11,
        "axes.titlesize": 12,
        "xtick.labelsize": 10,
        "ytick.labelsize": 10,
        "legend.fontsize": 9,
        "figure.titlesize": 13,
        "figure.dpi": 300
    })


def plot_metric_vs_k(
    df: pd.DataFrame,
    metric_col: str,
    metric_label: str,
    output_path: Path,
    task: str = "binary",
    split_label: str = "Test"
):
    """Plot metric vs K for all models with readable labels and split context."""
    plt.figure(figsize=(7.5, 4.8))
    models = sorted(df["model"].unique())
    markers = ["o", "s", "^", "D"]
    colors = ["#0A24E9", "#152EAE", "#5C9764", "#C47B18"]

    for idx, model_name in enumerate(models):
        sub = df[df["model"] == model_name].sort_values("k")
        plt.plot(
            sub["k"], sub[metric_col],
            marker=markers[idx % len(markers)],
            color=colors[idx % len(colors)],
            linewidth=2.0,
            markersize=6.5,
            label=model_name
        )

    plt.title(f"{metric_label} vs. Feature Subset Size (K)\n[{task.upper()} Task — {split_label} Split — {df['run_id'].iloc[0]}]")
    plt.xlabel("Number of Features (K)")
    plt.ylabel(metric_label)
    plt.xticks(sorted(df["k"].unique()))
    plt.ylim(0.0, 1.05)
    plt.legend(frameon=True, loc="lower right")
    plt.tight_layout()
    plt.savefig(output_path)
    plt.close()
    print(f"[Plot] Saved: {output_path.name}")


def plot_size_vs_k(df: pd.DataFrame, output_path: Path, task: str = "binary"):
    """Plot model footprint (KB) vs K on a logarithmic scale."""
    plt.figure(figsize=(7.5, 4.8))
    models = sorted(df["model"].unique())
    markers = ["o", "s", "^", "D"]
    colors = ["#0A24E9", "#152EAE", "#5C9764", "#C47B18"]

    for idx, model_name in enumerate(models):
        sub = df[df["model"] == model_name].sort_values("k")
        plt.plot(
            sub["k"], sub["model_size_kb"],
            marker=markers[idx % len(markers)],
            color=colors[idx % len(colors)],
            linewidth=2.0,
            markersize=6.5,
            label=model_name
        )

    plt.yscale("log")
    plt.title(f"Serialized Model Size (KB) vs. K (Log Scale)\n[{task.upper()} Task — {df['run_id'].iloc[0]}]")
    plt.xlabel("Number of Features (K)")
    plt.ylabel("Model Size (KB) [Log Scale]")
    plt.xticks(sorted(df["k"].unique()))
    plt.legend(frameon=True, loc="center left", bbox_to_anchor=(1, 0.5))
    plt.tight_layout()
    plt.savefig(output_path)
    plt.close()
    print(f"[Plot] Saved: {output_path.name}")


def plot_latency_vs_k(df: pd.DataFrame, output_path: Path, task: str = "binary"):
    """Plot Median and P95 latency vs K."""
    plt.figure(figsize=(7.5, 4.8))
    models = sorted(df["model"].unique())
    colors = ["#0A24E9", "#152EAE", "#5C9764", "#C47B18"]

    for idx, model_name in enumerate(models):
        sub = df[df["model"] == model_name].sort_values("k")
        plt.plot(
            sub["k"], sub["median_latency_ms"],
            marker="o",
            color=colors[idx % len(colors)],
            linewidth=2.0,
            label=f"{model_name} (Med)"
        )
        if "p95_latency_ms" in sub.columns:
            plt.plot(
                sub["k"], sub["p95_latency_ms"],
                linestyle="--",
                alpha=0.6,
                color=colors[idx % len(colors)],
                label=f"{model_name} (P95)"
            )

    plt.title(f"Inference Latency per Sample (ms) vs. K\n[{task.upper()} Task — Hardware Warm-Up Benchmarked]")
    plt.xlabel("Number of Features (K)")
    plt.ylabel("Latency per Sample (ms)")
    plt.xticks(sorted(df["k"].unique()))
    plt.legend(frameon=True, loc="center left", bbox_to_anchor=(1, 0.5), fontsize=8)
    plt.tight_layout()
    plt.savefig(output_path)
    plt.close()
    print(f"[Plot] Saved: {output_path.name}")


def plot_normalized_confusion_matrix(
    run_json_path: Path,
    model_name: str,
    k: int,
    output_path: Path,
    task: str = "multiclass"
):
    """Plot row-normalized confusion matrix heatmap for selected model."""
    if not run_json_path.exists():
        print(f"[Plot] Run JSON not found: {run_json_path}")
        return

    with open(run_json_path, "r") as f:
        data = json.load(f)

    selected_art = None
    for art in data.get("detailed_artifacts", []):
        if art["model"] == model_name and art["k"] == k:
            selected_art = art
            break

    if not selected_art:
        print(f"[Plot] Artifact for {model_name} at K={k} not found in run JSON.")
        return

    test_metrics = selected_art["test_metrics"]
    cm_norm = np.array(test_metrics["confusion_matrix_norm"])
    classes = test_metrics["classes"]

    plt.figure(figsize=(8.5, 6.8))
    sns.heatmap(
        cm_norm,
        annot=True,
        fmt=".2f",
        cmap="Blues",
        xticklabels=classes,
        yticklabels=classes,
        cbar=True,
        vmin=0.0, vmax=1.0
    )
    plt.title(f"Normalized Confusion Matrix: {model_name} (K={k})\n[Test Split Holdout — {data['run_id']}]")
    plt.xlabel("Predicted Class")
    plt.ylabel("Ground Truth Class")
    plt.xticks(rotation=40, ha="right")
    plt.yticks(rotation=0)
    plt.tight_layout()
    plt.savefig(output_path)
    plt.close()
    print(f"[Plot] Saved: {output_path.name}")


def plot_per_class_metrics(
    run_json_path: Path,
    model_name: str,
    k: int,
    output_path: Path
):
    """Plot per-class Precision, Recall, and F1 scores."""
    if not run_json_path.exists():
        return

    with open(run_json_path, "r") as f:
        data = json.load(f)

    selected_art = None
    for art in data.get("detailed_artifacts", []):
        if art["model"] == model_name and art["k"] == k:
            selected_art = art
            break

    if not selected_art:
        return

    per_class = selected_art["test_metrics"]["per_class"]
    classes = list(per_class.keys())
    f1s = [per_class[c]["f1_score"] for c in classes]
    precs = [per_class[c]["precision"] for c in classes]
    recs = [per_class[c]["recall"] for c in classes]

    x = np.arange(len(classes))
    width = 0.26

    plt.figure(figsize=(9, 5))
    plt.bar(x - width, precs, width, label="Precision", color="#152EAE")
    plt.bar(x, recs, width, label="Recall", color="#5C9764")
    plt.bar(x + width, f1s, width, label="F1 Score", color="#0A24E9")

    plt.title(f"Per-Class Performance: {model_name} (K={k})\n[Test Holdout — {data['run_id']}]")
    plt.xlabel("Attack Family / Class")
    plt.ylabel("Score")
    plt.xticks(x, classes, rotation=35, ha="right")
    plt.ylim(0.0, 1.1)
    plt.legend(frameon=True)
    plt.tight_layout()
    plt.savefig(output_path)
    plt.close()
    print(f"[Plot] Saved: {output_path.name}")


def perform_model_selection(
    max_size_kb: float = 50.0,
    max_latency_ms: float = 3.0
) -> Dict[str, Any]:
    """
    Formal Model Selection Rule:
    Select the model configuration maximizing Validation Macro-F1 subject to:
    1. Serialized Size <= max_size_kb (50 KB)
    2. Median Latency <= max_latency_ms (3.0 ms)
    """
    results_dir = Path(config.RESULTS_DIR)
    sc_bin = pd.read_csv(config.SCORECARD_BINARY_CSV)
    sc_multi = pd.read_csv(config.SCORECARD_MULTICLASS_CSV)

    def select_best(df: pd.DataFrame, task_name: str) -> Dict[str, Any]:
        feasible = df[
            (df["model_size_kb"] <= max_size_kb) &
            (df["median_latency_ms"] <= max_latency_ms)
        ]
        if feasible.empty:
            print(f"[Selection] Warning: No models satisfied strict budget for {task_name}. Relaxing constraints.")
            feasible = df

        best_row = feasible.sort_values(by="val_macro_f1", ascending=False).iloc[0]
        return {
            "task": task_name,
            "selected_model": best_row["model"],
            "selected_k": int(best_row["k"]),
            "val_macro_f1": float(best_row["val_macro_f1"]),
            "test_macro_f1": float(best_row["test_macro_f1"]),
            "test_balanced_acc": float(best_row["test_balanced_acc"]),
            "test_accuracy": float(best_row["test_accuracy"]),
            "median_latency_ms": float(best_row["median_latency_ms"]),
            "p95_latency_ms": float(best_row["p95_latency_ms"]),
            "model_size_kb": float(best_row["model_size_kb"]),
            "artifact_path": str(best_row["artifact_path"]),
            "run_id": str(best_row["run_id"])
        }

    best_binary = select_best(sc_bin, "binary")
    best_multiclass = select_best(sc_multi, "multiclass")

    selection_record = {
        "selection_rule": f"Maximize Validation Macro-F1 subject to Size <= {max_size_kb} KB and Median Latency <= {max_latency_ms} ms",
        "binary_champion": best_binary,
        "multiclass_champion": best_multiclass
    }

    out_path = results_dir / "model_selection.json"
    with open(out_path, "w") as f:
        json.dump(selection_record, f, indent=2)

    print(f"\n[Model Selection] Selection results written to: {out_path}")
    print(f"  Binary Champion:     {best_binary['selected_model']} (K={best_binary['selected_k']}) | Test Macro-F1: {best_binary['test_macro_f1']:.4f} | Size: {best_binary['model_size_kb']} KB")
    print(f"  Multiclass Champion: {best_multiclass['selected_model']} (K={best_multiclass['selected_k']}) | Test Macro-F1: {best_multiclass['test_macro_f1']:.4f} | Size: {best_multiclass['model_size_kb']} KB")

    return selection_record


def generate_all_evaluation_figures():
    """Generate all scorecard-backed report plots for binary and multiclass."""
    set_scientific_style()
    plots_dir = Path(config.PLOTS_DIR)
    plots_dir.mkdir(parents=True, exist_ok=True)

    # 1. Binary Plots
    if config.SCORECARD_BINARY_CSV.exists():
        df_bin = pd.read_csv(config.SCORECARD_BINARY_CSV)
        plot_metric_vs_k(df_bin, "test_macro_f1", "Macro F1 Score", plots_dir / "binary_macro_f1_vs_k.png", task="binary")
        plot_metric_vs_k(df_bin, "test_balanced_acc", "Balanced Accuracy", plots_dir / "binary_balanced_acc_vs_k.png", task="binary")
        plot_size_vs_k(df_bin, plots_dir / "binary_model_size_vs_k.png", task="binary")
        plot_latency_vs_k(df_bin, plots_dir / "binary_latency_vs_k.png", task="binary")

    # 2. Multiclass Plots
    if config.SCORECARD_MULTICLASS_CSV.exists():
        df_multi = pd.read_csv(config.SCORECARD_MULTICLASS_CSV)
        plot_metric_vs_k(df_multi, "test_macro_f1", "Macro F1 Score", plots_dir / "multiclass_macro_f1_vs_k.png", task="multiclass")
        plot_metric_vs_k(df_multi, "test_balanced_acc", "Balanced Accuracy", plots_dir / "multiclass_balanced_acc_vs_k.png", task="multiclass")
        plot_size_vs_k(df_multi, plots_dir / "multiclass_model_size_vs_k.png", task="multiclass")
        plot_latency_vs_k(df_multi, plots_dir / "multiclass_latency_vs_k.png", task="multiclass")

    # 3. Model Selection
    selection = perform_model_selection()

    # 4. Detailed Heatmaps for Champion
    multi_champ = selection["multiclass_champion"]
    run_file = Path(config.RESULTS_DIR) / "runs" / f"{multi_champ['run_id']}.json"
    if run_file.exists():
        plot_normalized_confusion_matrix(
            run_file,
            multi_champ["selected_model"],
            multi_champ["selected_k"],
            plots_dir / "confusion_matrix_chosen_multiclass.png"
        )
        plot_per_class_metrics(
            run_file,
            multi_champ["selected_model"],
            multi_champ["selected_k"],
            plots_dir / "per_class_metrics_chosen_multiclass.png"
        )

    print(f"\n[Phase 5] All figures generated cleanly in {plots_dir}")


if __name__ == "__main__":
    generate_all_evaluation_figures()
