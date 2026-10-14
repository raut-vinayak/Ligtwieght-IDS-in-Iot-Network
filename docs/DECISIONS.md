# Architectural & Implementation Decisions

This document records key engineering and research decisions for the Lightweight IoT IDS project according to the development plan.

## Decision Log

### 1. Repository Architecture & Separation of Concerns
- **Decision:** Keep ML research/training strictly separate from the client-facing presentation dashboard.
- **Rationale:** High-performance training uses Python 3.14 / scikit-learn / LightGBM, but production hosting on Vercel Hobby requires a static export (`output: "export"` in Next.js). No Python backend, serverless functions, or databases are required for the hosted demo.
- **Status:** Adopted.

### 2. Dataset Strategy: Dual-Track (CICIoT2023 Official & High-Fidelity Local Sample)
- **Decision:** Support both official multi-GB CICIoT2023 CSV files and an integrated, high-fidelity sample (`data/raw/sample_ciciot2023.csv`) featuring all 46 flow features and realistic behavioral distributions across all 33 attacks + Benign traffic.
- **Rationale:** Allows immediate, deterministic end-to-end reproducibility, fast development iteration, unit testing, and benchmarking on resource-constrained environments without requiring immediate 50 GB downloads.
- **Status:** Adopted.

### 3. Label Mapping & Hierarchy (Authoritative CICIoT2023 Taxonomy)
- **Decision:** Explicitly map all 33 individual raw attack signatures into 7 canonical attack families plus Benign:
  - **Benign:** `BenignTraffic`
  - **DDoS:** 12 flood and fragmentation attacks
  - **DoS:** 4 flood attacks
  - **Recon:** 5 scanning and sweep attacks
  - **Web-based:** 6 injection and browser exploits
  - **Brute Force:** `DictionaryBruteForce`
  - **Spoofing:** `MITM-ArpSpoofing`, `DNS_Spoofing`
  - **Mirai:** 3 botnet flood vectors
- **Rationale:** Reflects official UNB CICIoT2023 benchmark standard. Binary classification groups all 7 attack families as `Attack` (1) vs `Benign` (0).
- **Status:** Adopted.

### 4. Data Leakage Prevention & Preprocessing Contract
- **Decision:**
  - Strip metadata/identifier columns before training (`Timestamp`, `Flow_ID`, `Src_IP`, `Dst_IP`, `Src_Port`, `Dst_Port`, `SimillarHTTP`, `Unnamed: 0`, `id`).
  - Perform train/validation/test split strictly **before** fitting any scaler, imputer, or feature selector.
  - Apply fitted transformers to validation and test sets without re-fitting.
- **Rationale:** Guarantees honest evaluation without optimistic bias or test leakage.
- **Status:** Adopted.

### 5. Nested Feature Selection ($K \in [5, 10, 15, 20]$)
- **Decision:** Use Mutual Information (MI) ranking combined with pairwise Pearson correlation redundancy pruning ($\rho > 0.85$) on the training split only.
- **Rationale:** Embedded microcontrollers and edge gateways have strict RAM/CPU budgets. Nested feature subsets ensure that larger subsets strictly subsume smaller ones, enabling progressive feature collection on edge sensors.
- **Status:** Adopted.

### 6. Honest Evaluation Metrics
- **Decision:** Report Macro F1, Balanced Accuracy, Precision, Recall, Confusion Matrix, Median Inference Latency (ms), P95 Latency (ms), and Serialized Model Size (KB).
- **Rationale:** Mitigates class imbalance deception (where raw accuracy can be 99% while missing minority attacks).
- **Status:** Adopted.

### 7. Static Dashboard UI (Shopeers Visual Reference Adaptation)
- **Decision:** Build a Next.js (App Router) + TypeScript + Tailwind CSS dashboard matching the Shopeers reference composition: pale cool-gray canvas (`#F0F2F5`), deep navy sidebar (`#29315D`), clean white cards, responsive KPI row, interactive Recharts visualization, and right insights rail.
- **Rationale:** Clean, professional research dashboard that compiles to static HTML/JS/CSS for zero-maintenance Vercel deployment.
- **Status:** Adopted.
