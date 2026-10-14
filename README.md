# Lightweight IoT Intrusion Detection System (IDS)

An edge-optimized Machine Learning Intrusion Detection System designed for resource-constrained IoT gateways and embedded nodes, evaluated on the **CICIoT2023** flow dataset. This project explores the Pareto trade-offs across **Macro F1 score**, **model footprint (KB)**, and **real-time inference latency (ms)**.

> **Hosted Demo Architecture:** Static website export ready for Vercel Hobby hosting (`output: 'export'`). Does **not** require an always-on Python backend, API routes, or databases. Inference runs client-side in the user's browser via ONNX Runtime Web. Live packet sniffing runs strictly inside an authorized, isolated IDS lab VM.

---

## 1. Project Overview & Key Results

### Multiclass Benchmark Results ($K \in [5, 10, 15, 20]$ Features)
*Evaluated on Held-out Test Split (15%) under stratified sampling from run `benchmark_run_01`.*

| Model Architecture | Features ($K$) | Test Macro F1 | Balanced Accuracy | Median Latency | Serialized Size | Edge Feasibility |
|---|---|---|---|---|---|---|
| **DecisionTree (Champion)** | **5** | **0.8246** | **0.8539** | **1.294 ms** | **7.89 KB** | **Optimal Ultra-Low Footprint** |
| DecisionTree | 10 | 0.8246 | 0.8539 | 1.499 ms | 7.99 KB | Feasible |
| DecisionTree | 15 | 0.9423 | 0.9651 | 1.706 ms | 8.11 KB | High Accuracy Edge |
| **DecisionTree (Champion)** | **20** | **0.9890** | **0.9963** | **1.452 ms** | **8.22 KB** | **Global Edge Champion** |
| LogisticRegression | 5 | 0.6789 | 0.7188 | 1.528 ms | 4.45 KB | Minimal RAM |
| LogisticRegression | 20 | 0.9971 | 0.9958 | 2.819 ms | 5.72 KB | Linear Boundary |
| SmallRandomForest | 5 | 0.7919 | 0.8000 | 25.34 ms | 102.6 KB | High Latency |
| ConstrainedLightGBM | 20 | 1.0000 | 1.0000 | 2.893 ms | 532.9 KB | Heavy (65x footprint) |

### Formal Edge Selection Rule
$$\max(\text{Val\_Macro\_F1}) \quad \text{subject to} \quad \text{Size} \le 50.0\text{ KB}, \quad \text{Median\_Latency} \le 3.0\text{ ms}$$
- **Binary Champion:** `DecisionTree (K=5)` — 99.1% Test Macro-F1, 1.34 ms latency, 4.95 KB disk footprint.
- **Multiclass Champion:** `DecisionTree (K=20)` — 98.9% Test Macro-F1, 1.45 ms latency, 8.22 KB disk footprint.

---

## 2. Repository Layout

```text
lightweight-iot-ids/
├── src/                       # Core ML pipeline, feature selection, evaluation, capture
│   ├── config.py              # Central configuration, taxonomy & schema
│   ├── data_loader.py         # Chunked dataset intake, SHA256 manifest generation
│   ├── preprocess.py          # Leakage-safe scaling & 3-way stratified splitting
│   ├── feature_selection.py   # MI ranking & correlation pruning for K in [5,10,15,20]
│   ├── models.py              # Lightweight model registry (DT, LR, RF, LightGBM)
│   ├── evaluate.py            # Latency benchmarking, metrics & model serialization
│   ├── train.py               # End-to-end training entrypoint
│   ├── plots.py               # Pareto curve & confusion matrix generation
│   ├── export_onnx.py         # ONNX model export & numerical parity check
│   ├── export_dashboard_data.py # Packages verified scorecards for frontend
│   └── live_capture.py        # 5-tuple flow aggregation & live packet sniffer
├── data/
│   ├── raw/                   # Raw CICIoT2023 CSVs + manifest.json (gitignored)
│   └── processed/             # Clean training splits + split_summary.json (gitignored)
├── models/                    # Serialized .joblib artifacts (local only)
├── results/
│   ├── runs/                  # JSON scorecard summaries per run
│   ├── plots/                 # High-resolution evaluation charts
│   ├── scorecard_binary.csv   # Binary task scorecard
│   ├── scorecard_multiclass.csv # Multiclass task scorecard
│   └── model_selection.json   # Machine-readable selection decision
├── web/                       # Next.js 14 static export dashboard (Shopeers-adapted)
│   ├── app/                   # App router pages & layouts
│   ├── components/            # Sidebar, KPI row, Recharts, ONNX simulator, Replay
│   ├── public/data/           # Precomputed JSON scorecards & ONNX models
│   ├── public/ort/            # ONNX Runtime Web client-side assets
│   └── out/                   # Static export output (ready for Vercel Hobby)
├── docs/                      # Architectural decisions, taxonomy & guides
│   ├── DECISIONS.md
│   ├── RUN_LOG.md
│   ├── LABEL_MAPPING.md
│   ├── FEATURE_SCHEMA.md
│   └── LIVE_CAPTURE_GUIDE.md
├── requirements.txt
└── README.md
```

---

## 3. Environment & Prerequisites

- **Python Version:** 3.14.2 (tested on 64-bit Windows / Linux)
- **Node.js Version:** v20.18.0 LTS, npm 10.8.2
- **Key Python Packages:** `scikit-learn==1.9.1`, `pandas==3.0.6`, `numpy==2.5.2`, `lightgbm==4.7.0`, `scapy==2.7.0`, `matplotlib==3.11.2`, `seaborn==0.13.2`, `skl2onnx==1.20.0`, `onnxruntime==1.31.0`

---

## 4. Step-by-Step Reproduction Guide

### Step 1: Environment Setup
```powershell
# Activate local virtual environment
.\.venv\Scripts\Activate.ps1
# Or on Linux: source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Step 2: Dataset Intake & Schema Inspection (Phase 1)
```powershell
python -m src.data_loader --manifest --inspect
```
*Validates 46 numerical flow features, computes SHA-256 hash, and generates `data/raw/manifest.json`.*

### Step 3: Label Mapping Audit & 3-Way Stratified Split (Phase 2)
```powershell
python -m src.preprocess
```
*Audits all 34 classes against the authoritative taxonomy and validates 70% Train / 15% Val / 15% Test proportions.*

### Step 4: Nested Feature Selection (Phase 3)
```powershell
python -m src.feature_selection --task binary
python -m src.feature_selection --task multiclass
```
*Computes Mutual Information on Train only and asserts strict nested subsets ($S_5 \subset S_{10} \subset S_{15} \subset S_{20}$).*

### Step 5: Train & Benchmark Baseline Models (Phase 4)
```powershell
python -m src.train --task both --sample-fraction 0.10 --run-id benchmark_run_01
```
*Trains 4 models across 4 K-values on Train, selects models on Validation, and evaluates on held-out Test.*

### Step 6: Generate Scientific Plots & Model Selection (Phase 5)
```powershell
python -m src.plots
```
*Generates 10 figures in `results/plots/` and outputs `results/model_selection.json`.*

### Step 7: Export ONNX Browser Models & Dashboard Data (Phase 7)
```powershell
python -m src.export_onnx
python -m src.export_dashboard_data
```
*Validates 100% numerical parity with scikit-learn and outputs `web/public/data/` assets.*

### Step 8: Simulated Live Traffic Replay (Phase 8)
```powershell
python -m src.live_capture --simulate
```
*Generates sanitized 5-tuple flow replay logs in `web/public/data/replay_live_traffic.json`.*

### Step 9: Build Static Dashboard for Vercel (Phase 6 & 9)
```powershell
cd web
npm run build
```
*Produces static export in `web/out/`. Deploy directly to Vercel Hobby with root set to `web` and output set to `out`.*

---

## 5. Vercel Static Deployment Instructions

1. Push repository to GitHub: `git push origin master`.
2. Connect repository to [Vercel](https://vercel.com).
3. In Project Settings:
   - **Framework Preset:** Next.js
   - **Root Directory:** `web`
   - **Build Command:** `npm run build`
   - **Output Directory:** `out`
4. Deploy! The static dashboard requires **zero** Python runtime, **zero** databases, and incurs **zero** monthly server hosting costs.

---

## 6. Citations & Attribution

- **Dataset:** Neto, E. C. P., et al. *"CICIoT2023: A Real-Time Dataset and Benchmark for Large-Scale Attacks in IoT Environments,"* IEEE Internet of Things Journal, 2023.
- **Reference UI:** Adapted from Shopeers B2B Analytics visual composition (pale cool-gray canvas `#F0F2F5`, deep navy navigation `#29315D`, Recharts Pareto plots).
