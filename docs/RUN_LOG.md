# Experiment and Run Log

This log tracks dataset manifests, experimental runs, and validation checkpoints for the Lightweight IoT IDS.

## Experiment Registry

| Run ID | Date | Task | Dataset Source | Rows Evaluated | Models Benchmarked | Feature Sets (K) | Status |
|---|---|---|---|---|---|---|---|
| `baseline_dev_01` | 2026-10-14 | Binary & Multiclass | `data/raw/sample_ciciot2023.csv` | 15,000 | DT, LR, RF, LightGBM | 5, 10, 15, 20 | Pending execution |

---

## Dataset Manifest Log

- **Active Raw Dataset:** `data/raw/sample_ciciot2023.csv`
- **Features:** 46 numerical flow attributes
- **Target Label Column:** `label`
- **Split Ratio:** 70% Train, 15% Validation, 15% Test (Stratified)
- **Random Seed:** 42
