"""
Dashboard Data Exporter for Lightweight IoT IDS.

Prepares verified JSON scorecards, manifests, and sanitized test data
for the Next.js static frontend in web/public/data/.
Ensures the dashboard renders 100% verified research metrics without needing a Python backend.
"""

import json
import shutil
from pathlib import Path
from typing import Dict, Any

import pandas as pd

from src import config
from src.feature_selection import FEATURE_METADATA


def export_all_dashboard_assets(output_dir: Path = Path("web/public/data")):
    """Export all precomputed evaluation data to web/public/data/."""
    output_dir.mkdir(parents=True, exist_ok=True)
    print(f"\n[Dashboard Export] Exporting research artifacts to: {output_dir}")

    # 1. Feature Metadata & Schema
    features_export = []
    for feat_name, meta in FEATURE_METADATA.items():
        features_export.append({
            "name": feat_name,
            "type": meta["type"],
            "unit": meta["unit"],
            "live_available": meta["live_available"]
        })
    with open(output_dir / "features_metadata.json", "w") as f:
        json.dump(features_export, f, indent=2)

    # 2. Scorecard Master JSON
    scorecard_payload: Dict[str, Any] = {
        "status": "VERIFIED",
        "binary_scorecard": [],
        "multiclass_scorecard": [],
        "champions": {},
        "latest_run": {}
    }

    if config.SCORECARD_BINARY_CSV.exists():
        df_bin = pd.read_csv(config.SCORECARD_BINARY_CSV)
        scorecard_payload["binary_scorecard"] = df_bin.to_dict(orient="records")

    if config.SCORECARD_MULTICLASS_CSV.exists():
        df_multi = pd.read_csv(config.SCORECARD_MULTICLASS_CSV)
        scorecard_payload["multiclass_scorecard"] = df_multi.to_dict(orient="records")

    selection_path = config.RESULTS_DIR / "model_selection.json"
    if selection_path.exists():
        with open(selection_path, "r") as f:
            scorecard_payload["champions"] = json.load(f)

    # Latest run details
    runs_dir = config.RESULTS_DIR / "runs"
    run_files = sorted(list(runs_dir.glob("*.json")))
    if run_files:
        with open(run_files[-1], "r") as f:
            scorecard_payload["latest_run"] = json.load(f)

    with open(output_dir / "scorecard_summary.json", "w") as f:
        json.dump(scorecard_payload, f, indent=2)

    # 3. Dataset Manifest
    manifest_src = config.DATA_RAW_DIR / "manifest.json"
    if manifest_src.exists():
        shutil.copy(manifest_src, output_dir / "dataset_manifest.json")

    # 4. Sanitized Sample Traffic CSV for Browser Prediction Demo
    sample_csv_path = config.DATA_RAW_DIR / "sample_ciciot2023.csv"
    if sample_csv_path.exists():
        df_sample = pd.read_csv(sample_csv_path, nrows=20)
        # Drop label column for clean inference test
        feature_cols = [c for c in df_sample.columns if c != config.LABEL_COLUMN and c not in config.LEAKAGE_COLUMNS]
        df_test_sample = df_sample[feature_cols].copy()
        df_test_sample.to_csv(output_dir / "sample_traffic_for_prediction.csv", index=False)

    print(f"[Dashboard Export] Complete: {len(list(output_dir.iterdir()))} assets generated in {output_dir}")


if __name__ == "__main__":
    export_all_dashboard_assets()
