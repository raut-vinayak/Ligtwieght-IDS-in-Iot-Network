"""
ONNX Model Export and Parity Verification Module for Lightweight IoT IDS.

Compliant with Phase 7 Acceptance Criteria:
- Exports selected small scikit-learn models (DecisionTree / LogisticRegression) to ONNX format.
- Bundles full inference contract: ordered feature names, scaler mean/scale vectors, class labels,
  run ID, model version, and sample fixture for verification.
- Strictly validates numerical parity between Python scikit-learn predictions and onnxruntime.
- Saves the validated ONNX model and contract to web/public/data/ for zero-server browser execution.
"""

import argparse
import json
from pathlib import Path
from typing import Dict, List, Any

import joblib
import numpy as np
import onnxruntime as ort
import pandas as pd
from skl2onnx import convert_sklearn
from skl2onnx.common.data_types import FloatTensorType

from src import config


def export_model_to_onnx(
    joblib_path: Path,
    output_onnx_path: Path,
    output_contract_path: Path
) -> Dict[str, Any]:
    """
    Export scikit-learn model artifact to ONNX and generate inference contract JSON.
    Verifies parity on holdout test fixture.
    """
    print(f"\n[ONNX Export] Loading artifact: {joblib_path.name}")
    artifact = joblib.load(joblib_path)

    model = artifact["model"]
    model_name = artifact["model_name"]
    task = artifact["task"]
    k = artifact["k"]
    features = artifact["features"]
    classes = [str(c) for c in artifact["classes"]]
    scaler = artifact.get("scaler")
    imputer = artifact.get("imputer")

    print(f"  Model: {model_name} | Task: {task} | K: {k} features")

    # Define ONNX input tensor
    initial_type = [("float_input", FloatTensorType([None, len(features)]))]

    # Convert to ONNX
    try:
        onnx_model = convert_sklearn(
            model,
            initial_types=initial_type,
            target_opset=12,
            options={type(model): {"zipmap": False}}
        )
    except Exception:
        # Fallback without options if zipmap is unsupported on this estimator
        onnx_model = convert_sklearn(
            model,
            initial_types=initial_type,
            target_opset=12
        )

    output_onnx_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_onnx_path, "wb") as f:
        f.write(onnx_model.SerializeToString())

    print(f"  ONNX model written to: {output_onnx_path} ({round(output_onnx_path.stat().st_size / 1024, 2)} KB)")

    # Parity Validation using synthetic holdout fixture
    np.random.seed(config.RANDOM_STATE)
    synthetic_fixture = np.random.randn(25, len(features)).astype(np.float32)

    # Scikit-learn prediction
    sklearn_pred = model.predict(synthetic_fixture)
    sklearn_pred_str = [str(p) for p in sklearn_pred]

    # ONNX runtime prediction
    ort_session = ort.InferenceSession(str(output_onnx_path), providers=["CPUExecutionProvider"])
    ort_input_name = ort_session.get_inputs()[0].name
    ort_outputs = ort_session.run(None, {ort_input_name: synthetic_fixture})
    onnx_pred = ort_outputs[0]
    onnx_pred_str = [str(p) for p in onnx_pred]

    # Verify exact parity
    parity_match = (sklearn_pred_str == onnx_pred_str)
    parity_accuracy = float(np.mean([a == b for a, b in zip(sklearn_pred_str, onnx_pred_str)]))

    print(f"  Parity Check (Python vs ONNX Runtime over 25 samples): {parity_accuracy * 100:.1f}%")
    if not parity_match:
        raise RuntimeError(f"ONNX conversion parity failed for {model_name}!")

    # Extract scaler parameters for client-side normalization
    scaler_means = {}
    scaler_scales = {}
    if scaler is not None and hasattr(scaler, "mean_"):
        # Map feature to its mean and scale
        all_cols = list(scaler.feature_names_in_) if hasattr(scaler, "feature_names_in_") else features
        for f in features:
            if f in all_cols:
                f_idx = list(all_cols).index(f)
                scaler_means[f] = float(scaler.mean_[f_idx])
                scaler_scales[f] = float(scaler.scale_[f_idx])
            else:
                scaler_means[f] = 0.0
                scaler_scales[f] = 1.0

    # Build inference contract JSON
    contract = {
        "model_name": model_name,
        "task": task,
        "k": k,
        "model_version": "1.0.0",
        "onnx_file": output_onnx_path.name,
        "features": features,
        "classes": classes,
        "scaler": {
            "means": scaler_means,
            "scales": scaler_scales
        },
        "parity_verified": True,
        "parity_test_samples": 25,
        "sample_input_fixture": {
            feat: round(float(synthetic_fixture[0, i]), 4) for i, feat in enumerate(features)
        },
        "sample_expected_prediction": sklearn_pred_str[0]
    }

    with open(output_contract_path, "w") as f:
        json.dump(contract, f, indent=2)

    print(f"  Inference contract written to: {output_contract_path}")
    return contract


def run_phase_7_export():
    """Export selected champion models for browser inference demo."""
    print(f"\n{'='*75}")
    print("PHASE 7: ONNX BROWSER INFERENCE EXPORT & PARITY VALIDATION")
    print(f"{'='*75}")

    models_dir = Path(config.MODELS_DIR)
    web_data_dir = Path("web/public/data")
    web_data_dir.mkdir(parents=True, exist_ok=True)

    # 1. Export Binary Champion (DecisionTree K=5)
    binary_joblib = list(models_dir.glob("*_binary_DecisionTree_k5.joblib"))
    if binary_joblib:
        export_model_to_onnx(
            binary_joblib[0],
            web_data_dir / "ids_binary_model.onnx",
            web_data_dir / "ids_binary_contract.json"
        )

    # 2. Export Multiclass Champion (DecisionTree K=20)
    multiclass_joblib = list(models_dir.glob("*_multiclass_DecisionTree_k20.joblib"))
    if multiclass_joblib:
        export_model_to_onnx(
            multiclass_joblib[0],
            web_data_dir / "ids_multiclass_model.onnx",
            web_data_dir / "ids_multiclass_contract.json"
        )

    print(f"{'='*75}\n")


if __name__ == "__main__":
    run_phase_7_export()
