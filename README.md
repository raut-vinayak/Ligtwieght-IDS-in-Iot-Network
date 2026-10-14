# Lightweight IoT Intrusion Detection System (IDS)

An edge-optimized Machine Learning Intrusion Detection System for IoT networks, evaluated on the **CICIoT2023** flow dataset. Designed for resource-constrained edge gateways by optimizing trade-offs across **Macro F1 score**, **model footprint (KB)**, and **real-time inference latency (ms)**.

---

## 1. System Architecture

```text
lightweight-iot-ids/
├── src/                       # Core ML pipeline, feature selection, evaluation, capture
│   ├── config.py              # Central configuration, taxonomy & schema
│   ├── data_loader.py         # Dataset discovery, schema validation & intake
│   ├── preprocess.py          # Leakage-safe scaling & stratified splitting
│   ├── feature_selection.py   # MI ranking & correlation pruning for K in [5,10,15,20]
│   ├── models.py              # Lightweight model architectures (DT, LR, RF, LightGBM)
│   ├── evaluate.py            # Latency benchmarking, metrics & model serialization
│   ├── plots.py               # Pareto curve & confusion matrix generation
│   ├── export_c.py            # Embedded C export utility for microcontrollers
│   └── live_capture.py        # Real-time packet sniffer & flow feature extractor
├── tests/                     # Small deterministic unit checks
├── data/
│   ├── raw/                   # Raw CICIoT2023 files (local only, gitignored)
│   └── processed/             # Preprocessed splits (local only, gitignored)
├── models/                    # Serialized models & metadata (local only, gitignored)
├── results/
│   ├── runs/                  # JSON scorecard summaries per run
│   └── plots/                 # High-resolution evaluation charts
├── web/                       # Next.js 14+ static export dashboard (Shopeers-adapted)
│   ├── app/
│   ├── components/
│   └── public/data/           # Precomputed JSON scorecards & ONNX models
├── docs/                      # Decisions, run logs & methodology
│   ├── DECISIONS.md
│   └── RUN_LOG.md
├── .gitignore
├── requirements.txt
├── pyproject.toml
└── README.md
```

---

## 2. Environment & Baseline

- **Python Version:** 3.14.2 (64-bit) in `.venv`
- **Node.js Version:** v20.18.0 (LTS), npm 10.8.2
- **Key Python Libraries:** `scikit-learn==1.9.1`, `pandas==3.0.6`, `numpy==2.5.2`, `lightgbm==4.7.0`, `scapy==2.7.0`, `matplotlib==3.11.2`, `seaborn==0.13.2`, `skl2onnx==1.20.0`, `onnxruntime==1.31.0`
- **Frontend Framework:** Next.js (App Router) + TypeScript + Tailwind CSS + Recharts (`output: "export"`)

---

## 3. Dataset & Taxonomy

- **Dataset Source:** CICIoT2023 (Canadian Institute for Cybersecurity)
- **Features:** 46 numerical flow attributes
- **Binary Classification:** `Benign` vs `Attack`
- **Multiclass Classification:** `Benign` + 7 Attack Families (`DDoS`, `DoS`, `Recon`, `Web-based`, `Brute Force`, `Spoofing`, `Mirai`)
- **Leakage Prevention:** Identifiers (`Src_IP`, `Dst_IP`, `Src_Port`, `Dst_Port`, `Timestamp`, `Flow_ID`) are stripped prior to train/val/test splitting.
