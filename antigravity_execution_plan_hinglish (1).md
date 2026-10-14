# Lightweight IoT IDS — Development Plan

> A phase-by-phase plan for building, evaluating, demonstrating, and deploying the project. The hosted demo is designed as a static website so it does not require an always-on Python server. Model training and live packet capture remain local to the research environment.

## 1. Project goal

Build a reproducible machine-learning intrusion detection project for IoT network-flow data. It will:

- classify CICIoT2023 flow records as **Benign vs Attack** (binary) and into documented attack families (multiclass);
- compare compact feature sets and baseline classifiers using leakage-safe evaluation;
- present verified results and an optional browser-based prediction demo in a clean dashboard;
- support a separate live-capture experiment on an isolated IDS lab VM;
- publish a free-to-start, static project website on Vercel without requiring a hosted database, background worker, or always-running API.

The website is a research/demo interface, not a production network security appliance. Live capture runs on the IDS VM and is not exposed to the public internet.

## 2. Recommended technology stack

| Area | Choice | Reason |
|---|---|---|
| Data processing and training | Python 3.11, pandas, NumPy, scikit-learn | Mature tooling for CSV-based ML and reproducible experiments |
| Optional boosted-tree model | LightGBM, kept in the research environment | Useful comparison model; do not make the hosted site depend on its native runtime unless browser export is verified |
| Data validation | Pandera or explicit schema checks | Detects missing, extra, non-numeric, and invalid columns early |
| Model evaluation | scikit-learn metrics; matplotlib/seaborn for report plots | Reproducible metrics and figures from saved evaluation outputs |
| Browser UI | Next.js (App Router) + TypeScript + Tailwind CSS + Recharts | Responsive, typed dashboard with a static export for hosting |
| Browser inference (optional) | ONNX Runtime Web + a small ONNX-exported scikit-learn model | Runs a real model locally in the visitor's browser; no prediction API needed |
| Lab packet capture | Python + Scapy on a Linux IDS VM | Capture stays on the isolated network; no public hosting dependency |
| Source control | Git + GitHub | Versioning and Vercel's Git-based deployment workflow |
| Hosting | Vercel Hobby static deployment | Static files are served without a Python function or server process |

### Hosting design and limits

The frontend should use Next.js static export (`output: "export"`) and publish only the generated static site. Do not add Next.js API routes, server actions, server-side rendering, a database, or a server process to the hosted demo. Keep raw CICIoT2023 files, virtual environments, training checkpoints, and large model artifacts out of the deployment.

The site can show committed, precomputed metrics and plots. If browser inference is included, export only a small, supported model and its exact feature/preprocessing metadata; the model runs on the user's device. If conversion or browser inference cannot be validated, ship the site with the prediction demo disabled and retain the local Python prediction command. Do not silently substitute mock predictions.

Vercel supports static assets and Next.js static exports; its Python runtime and function limits are unnecessary for this architecture. Free-plan availability and conditions can change, and no host can guarantee uninterrupted free service. Check Vercel's current Hobby plan terms before publishing. This design minimizes hosting dependencies and avoids relying on a free always-on backend.

References: [Next.js static exports](https://nextjs.org/docs/app/building-your-application/deploying/static-exports), [Vercel static and framework deployment](https://vercel.com/docs/deployments), [Vercel Hobby terms](https://vercel.com/legal/terms).

## 3. Repository layout

```text
lightweight-iot-ids/
├── src/                       # Python data, training, evaluation, export, capture code
├── tests/                     # Small deterministic checks; never include the dataset
├── data/
│   ├── raw/                   # Local only; gitignored
│   └── processed/             # Local only; gitignored
├── models/                    # Local training outputs; only approved small export is published
├── results/
│   ├── runs/                  # Run metadata and scorecards
│   └── plots/                 # Generated evaluation figures
├── web/                       # Next.js static dashboard
│   ├── app/
│   ├── components/
│   └── public/data/            # Small, reviewed JSON and optional ONNX assets
├── docs/                      # Label mapping, methodology, limitations, report notes
├── .gitignore
├── requirements.txt
├── pyproject.toml             # Optional Python tooling and formatting config
├── README.md
└── DEVELOPMENT_PLAN.md
```

Before starting, inspect the provided scaffold and preserve working code. If files are elsewhere, locate and document them before changing the layout. Never commit dataset files, credentials, `.venv`, caches, or unreviewed generated artifacts.

## 4. Phase-by-phase execution

For every phase: make the smallest coherent change, record the command and outcome, and satisfy the acceptance criteria before moving on. Keep a `docs/DECISIONS.md` with important choices and a `docs/RUN_LOG.md` with dataset/run identifiers.

### Phase 0 — Inventory and baseline

1. List all existing files and read the README, Python modules, dependency files, and Git status.
2. Explain the current pipeline and identify unfinished functions, assumptions, and duplicated configuration.
3. Record Python/Node versions and how the project is currently run.
4. Add or update `.gitignore` before handling data or model artifacts.

**Acceptance:** an accurate architecture summary exists; current code and uncommitted user work are preserved; private/large data paths are ignored.

### Phase 1 — Dataset intake and schema

1. Download CICIoT2023 files manually from the official dataset source; store them under `data/raw/` locally.
2. Inspect file names, sizes, headers, row counts, dtypes, missing values, duplicate rows, and label column using a small sample first.
3. Implement a loader that reads one file or bounded chunks, validates required columns, and gives actionable errors.
4. Save a local manifest (file names, sizes, hashes, row counts, label column); do not publish raw records.
5. Record license/attribution requirements and cite the dataset source in the README/report.

**Acceptance:** the loader identifies the label column consistently, reports unknown/missing labels, and can inspect data without loading the entire corpus into memory.

### Phase 2 — Label map, cleaning, and split policy

1. Create one documented mapping from every observed raw label to `Benign` or an attack family. Use a cited authoritative source and keep unknown labels visible as errors/review items—never silently map or discard them.
2. Define the task labels (`binary`, `multiclass`) in one configuration module.
3. Remove duplicates and invalid rows using documented rules. Drop label-derived, post-event, target-proxy, and identifier fields only after explaining why.
4. Split train/validation/test before fitting any learned preprocessing. Use a fixed seed and stratification where valid.
5. Fit imputation, scaling, feature selection, and any class balancing only on training data; apply fitted transforms to validation/test.
6. Check class support in every split. If a class is too rare to stratify or evaluate, report that and define a defensible grouping/sampling rule.

**Acceptance:** a mapping audit shows raw label → mapped label → count; no unknown label is hidden; split class counts and proportions are reported; preprocessing has no test-data fit.

### Phase 3 — Reproducible feature selection

1. Define an explicit feature schema and feature units.
2. Rank features using mutual information on training data only; perform redundancy pruning using training data only.
3. Produce candidate sets for K=5, 10, 15, 20. If nested sets are required, implement that property deliberately and assert it; otherwise document why ranking/pruning can change membership.
4. Flag IDs, near-constant columns, suspiciously label-revealing columns, and features unavailable to the live-capture pipeline.
5. Save feature rankings and chosen columns as run artifacts.

**Acceptance:** feature lists and ranking are reproducible for a fixed seed; no test split is used in selection; each selected feature has a name, type, unit, and availability note.

### Phase 4 — Baseline models and honest evaluation

Train at least Decision Tree, Logistic Regression, Random Forest, and (optional) LightGBM for each task and K value. Use a scikit-learn `Pipeline` or equivalent so fitted preprocessing and model are saved together.

1. First run on a documented, reproducible development sample; then run the largest practical full-data experiment locally.
2. Keep test data untouched until the model/feature choices are fixed. Use validation data for model selection.
3. Report macro-F1, per-class precision/recall/F1, balanced accuracy, confusion matrix, and class support. For binary classification also report ROC-AUC and PR-AUC when meaningful.
4. Measure prediction latency after warm-up over many rows; report median and p95 with hardware/software context. Record serialized size.
5. Treat a near-perfect result as an investigation trigger: inspect leakage, duplicate overlap, split policy, label proxies, and evaluation code. Do not assume it proves leakage or celebrate it without checks.
6. Store one row per task/model/K/seed with dataset manifest ID, features, metrics, timing method, and artifact path.

**Acceptance:** results can be reproduced from run metadata; scorecards distinguish binary and multiclass; no model is selected on test results; per-class failure modes are visible.

### Phase 5 — Report figures and model selection

Generate plots from scorecard files—not manually entered values:

- macro-F1 and balanced accuracy vs K, one line per model;
- model size vs K;
- median and p95 latency vs K;
- normalized confusion matrix for the chosen multiclass model;
- per-class precision/recall/F1 for both tasks.

Define the selection rule before choosing the final models (for example, highest validation macro-F1 subject to a stated size and latency budget). Refit the selected configuration on train+validation only if appropriate, evaluate once on test, and label that result clearly.

**Acceptance:** plots match the machine-readable scorecards, have readable labels, and include task, split, and run identifiers.

### Phase 6 — Static dashboard UI

Follow the complete dashboard visual specification in Section 8 of this document. Build a responsive Next.js + TypeScript dashboard under `web/` with:

- **Overview:** project summary, dataset/methodology, and clearly labeled latest verified results.
- **Model comparison:** filters for task, model, and K; charts for scores, size, and latency.
- **Class performance:** confusion matrix and per-class metrics.
- **Prediction demo:** optional CSV/one-row upload with strict schema validation and a clear local-browser privacy note.
- **Live lab status:** explain that packet capture is performed on the isolated VM; do not imply the public site is sniffing traffic.
- **Methodology and limitations:** labels, split policy, feature definitions, hardware, run date, and caveats.

Use accessible contrast, keyboard-operable controls, loading/empty/error states, responsive layouts, and restrained color. Never fabricate results or present placeholder values as real metrics. Keep data as small generated JSON in `web/public/data/`.

**Acceptance:** the dashboard works with a static export and remains useful when no prediction model is published; all numbers show task and evaluation split.

### Phase 7 — Optional browser inference export

This phase is optional and must not block the static dashboard.

1. Select a small model supported by a verified ONNX conversion path (initially test a scikit-learn Logistic Regression or Decision Tree; treat Random Forest as conditional). LightGBM browser compatibility is not assumed.
2. Export the full inference contract: ordered input features, preprocessing, output class names, model version, and training run ID. Do not export just a model if preprocessing is required.
3. Validate ONNX predictions against Python predictions over a fixed holdout fixture, including probabilities if exposed.
4. Run inference fully in the browser. Validate uploaded CSV size, row count, types, missing values, extra columns, and invalid numbers before inference. Do not upload user rows to a server.
5. If model conversion, bundle size, or parity checks fail, omit the browser model and show a clear message with instructions for local Python inference.

**Acceptance:** browser predictions match Python output on the fixture and invalid files receive useful errors. No mock prediction is used as a fallback.

### Phase 8 — Isolated VM live capture

Live capture runs only on the IDS VM in the authorized isolated lab.

1. Document topology, interface, permissions, packet-capture filter, and safe test traffic.
2. Define a flow window, 5-tuple, timeouts, bidirectional-flow policy, and feature calculations.
3. Build a feature parity table comparing every training feature to its live-capture source/formula. CICIoT flow-statistic features may not be derivable from a short packet window; do not invent approximations without validation.
4. Start with offline packet/flow fixtures and compare computed features with known expected values. Then run controlled lab traffic.
5. Log timestamp, flow metadata, predicted class, model/run version, and latency locally. Avoid storing payloads or unnecessary personal data. Write JSONL with rotation and retention guidance.
6. Keep the live process independent of the website. For a presentation, export a small sanitized sample log to a file and display it as a labeled replay, not as a live public feed.

**Acceptance:** captured features use the same definitions and units as training, or the model is retrained on the live-compatible feature set. Tests use only authorized isolated lab traffic. Capture failure does not affect the static website.

### Phase 9 — Static deployment and release check

1. Configure Next.js static export (`output: "export"`) and Vercel to build from `web/` with the generated output directory.
2. Build locally and preview the static output before deploying. Use relative-safe routes and verify direct navigation/reload on every page.
3. Confirm no API routes, server actions, server-only runtime dependencies, secrets, raw data, or bulky training artifacts are included.
4. Check the deployed bundle size, browser console, mobile layout, chart loading, missing-data state, and optional ONNX model loading.
5. Connect the Git repository to Vercel for preview deployments and production deploys. Keep the project within the current Hobby plan's terms and usage limits.
6. Save deployment instructions and rollback steps in the README.

**Acceptance:** clean production static build; preview and production URLs load without a Python server; all dashboard routes and assets work after refresh; the Vercel build does not require raw dataset files.

### Phase 10 — Final documentation and handoff

Update README with prerequisites, data setup, environment setup, commands, label mapping, training/evaluation reproduction, dashboard development/build, Vercel deployment, VM capture, limitations, and citations. Add a concise results table generated from the final scorecard and state the hardware used.

**Acceptance:** a new user can reproduce a small development run from the documentation; results and demo limitations are explicit; generated report numbers match saved artifacts.

## 5. Suggested commands (adapt to actual scaffold)

```powershell
# Python environment
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt

# Example research workflow; implement these entry points in the project
python -m src.data_loader --inspect --sample-rows 1000
python -m src.train --task binary --sample-fraction 0.05 --seed 42
python -m src.evaluate --run-id <run-id>
python -m src.export_dashboard_data --run-id <run-id>

# Web UI
cd web
npm ci
npm run dev
npm run build
npm run preview
```

Use the project's actual command names if the scaffold already defines them. Do not use `--break-system-packages`; work inside the virtual environment.

## 6. Definition of done

- Data, labels, splits, feature lists, and run settings are documented and reproducible.
- Evaluation reports class-level results and has leakage checks.
- Static dashboard displays only verified generated results.
- Optional browser inference is validated against Python or clearly unavailable.
- Live packet capture is isolated to the lab and has a documented feature contract.
- Vercel deployment is a static build with no required always-on backend, database, or packet-capture service.
- README explains free-hosting assumptions and notes that plan terms and quotas can change.

## 7. Important project limits

- “Free hosting with no problem” cannot be guaranteed; providers can change free-plan eligibility, quotas, or terms. A static site reduces moving parts but does not guarantee uptime.
- A public static site cannot capture packets from a visitor's network. Live detection requires the IDS VM or another authorized host.
- Dataset test results do not establish production security effectiveness. Include limitations and avoid presenting this academic prototype as a production IDS.
- Browser inference is optional and depends on model conversion support, asset size, and exact preprocessing parity.

## 8. Dashboard visual specification — Shopeers reference

### 8.1 Goal and reference

Build the Lightweight IoT IDS dashboard with the **same overall visual language and page composition** as the supplied [Shopeers — AI-Powered B2B eCommerce Analytics Dashboard](https://dribbble.com/shots/26628350-Shopeers-AI-Powered-B2B-eCommerce-Analytics-Dashboard) reference: pale cool-gray canvas, deep navy left navigation, compact metric cards, a chart-led overview, clean tables, and a right-side insights panel.

Use the reference for composition, spacing, density, color, and visual hierarchy. Replace its e-commerce brand, wording, icons, imagery, and data with original IDS-specific content. Do not reuse the Shopeers logo, product copy, assets, or fabricated sample statistics. The result should feel like a close visual adaptation, not an e-commerce dashboard with labels swapped.

### 8.2 Design principles

- **Light and data-first:** cool-gray background, white cards, dark navy typography, and restrained blue, indigo, and green accents.
- **Desktop dashboard first:** persistent left sidebar, top utility/header row, and a wide content canvas. Keep tablet and mobile usable.
- **Compact but breathable:** fit useful modules above the fold at 1440×900 while keeping card padding and gaps consistent.
- **Real data only:** read displayed values from generated scorecard/summary JSON. Missing data gets an empty state; never invent metrics.
- **Research clarity:** show task, split, model, K, run ID, and data freshness wherever needed to interpret a metric.
- **No unnecessary effects:** no glassmorphism, gradients, glowing borders, heavy shadows, animated backgrounds, or oversized hero sections.

### 8.3 Color palette

Use CSS variables or Tailwind theme tokens consistently throughout the app. The supplied Dribbble reference lists these colors.

| Token | Hex | Use |
|---|---|---|
| `canvas` | `#F0F2F5` | Main app background |
| `surface` | `#FFFFFF` | Cards, menus, table rows |
| `border` | `#CACED6` | Thin dividers and subtle outlines |
| `ink` | `#0B0D17` | Headings and primary text |
| `navy` | `#29315D` | Sidebar and dark selected surfaces |
| `blue` | `#0A24E9` | Primary actions, selected states, main chart series |
| `indigo` | `#152EAE` | Secondary chart series and accents |
| `muted` | `#A9B6C0` | Secondary text, inactive icons, quiet grid lines |
| `positive` | `#5C9764` | Favorable/healthy status only |

Add semantic red or amber for IDS alerts and use green for benign/healthy status. Status colors must not be the only indication; pair them with labels/icons. Use green for metric improvement only when the comparison really is favorable.

```css
:root {
  --canvas: #f0f2f5;
  --surface: #ffffff;
  --border: #caced6;
  --ink: #0b0d17;
  --navy: #29315d;
  --blue: #0a24e9;
  --indigo: #152eae;
  --muted: #a9b6c0;
  --positive: #5c9764;
  --danger: #c94040;
  --warning: #c47b18;
}
```

### 8.4 Typography, shape, and spacing

- Use Inter or a system sans-serif fallback. Use tabular numerals for KPI values and tables.
- Page title: 24–28 px semibold. Section title: 16–18 px semibold. Card label: 12–13 px. Body: 13–15 px. Helper text: 12–13 px.
- Use sentence case; avoid all-caps labels except small optional eyebrow text.
- Main canvas padding: 20–28 px on desktop. Grid gaps: 16–20 px. Card padding: 18–22 px.
- Cards are white with 10–14 px radius, thin border, and minimal or no shadow.
- Expanded sidebar: approximately 230–250 px. Main content must resize cleanly if the sidebar collapses.
- Use one consistent line icon family (Lucide recommended), 18–20 px. Avoid emoji and mixed icon styles.

### 8.5 Desktop composition

Use 1440×900 as the primary visual QA viewport. The desktop view has three zones: left navigation, main workspace, and a narrower right insights column when width permits.

```text
┌────────────────┬───────────────────────────────────────┬────────────────────┐
│ IDS brand      │ Breadcrumb / page title    Search/user │                    │
│                ├───────────────────────────────────────┤                    │
│ Overview       │ Task + run filters          Export     │                    │
│ Model results  ├────────────┬────────────┬─────────────┤                    │
│ Predictions    │ KPI card   │ KPI card   │ KPI card    │ Run summary /      │
│ Live lab       ├─────────────────────────┬─────────────┤ analysis summary   │
│ Reports        │ Main performance chart  │ Class split │                    │
│ Settings       ├─────────────────────────┴─────────────┤                    │
│                │ Model comparison / recent detections  │                    │
└────────────────┴───────────────────────────────────────┴────────────────────┘
```

#### Left sidebar

Use a deep navy (`#29315D`) vertical sidebar with white/soft-gray text. At the top, show an original compact shield/network-node mark and **Lightweight IDS**. The active item gets a brighter blue rounded rectangle or a slim left accent.

Navigation order:

1. Overview (default selected)
2. Model Results
3. Prediction Demo
4. Live Lab
5. Reports

Add a divider, then Methodology and Settings/About if implemented. At the bottom show an environment badge such as `DEMO MODE` or `VM CAPTURE`. Do not show `LIVE` unless an actual live feed is connected. On mobile, convert the sidebar to a drawer.

#### Header and controls

- Left: breadcrumb (`Dashboard / Overview`), title **IDS Overview**, and subtitle “Model performance and detection summary”.
- Right: compact search only if it searches visible data; notification icon only if real notifications exist. Do not add a decorative avatar without user identity functionality.
- Put task (`Binary` / `Multiclass`) and evaluation run selectors in a compact filter row, with an `Export report` action only if it works.
- Put K filtering on model result views instead of cluttering every page.
- Show evaluation split (for example, **Test set**) near the metrics. Static ML results should not use an ambiguous “today” date filter.

#### KPI row

Use four equally sized cards in the main column. Each has a small label, prominent value, contextual line, and optional icon:

1. **Macro F1** — selected task/model/K test metric.
2. **Balanced Accuracy** — test metric.
3. **Median Inference** — milliseconds per sample, with hardware/run context available.
4. **Model Size** — serialized artifact size in KB/MB.

Show comparison deltas only if a real baseline/previous run exists, and label the comparison. Do not use e-commerce metrics such as sales, revenue, orders, or visitors. Do not show fictional percentage changes. Add a `Test` or `Validation` chip to make the split clear.

#### Main performance card

The largest center card is **Model Performance by Feature Count**. Include:

- line chart of macro-F1 vs K with one line per model;
- task reflected in chart title/subtitle;
- readable legend with consistent model colors;
- minimal horizontal grid lines, clear axes (`Number of features`, `Macro F1`), and no heavy frame;
- tooltip with model, K, score, run ID, and split;
- accessible textual summary or table alternative.

Use blue for the selected/best model, indigo for another series, muted gray-blue for other models, and green only where its meaning is valid. Keep all series readable.

#### Supporting charts and cards

Beside the main chart (or below it at narrower widths), include **Class Distribution** for the selected evaluation split. Use a compact horizontal bar or donut with labels and counts. A donut includes its total and readable legend; do not rely on colors alone.

Below the main chart, use two balanced cards:

- **Confusion Matrix:** selected model/task, readable labels, count/normalized toggle if both outputs exist, restrained navy/blue scale. Keep many-class labels legible.
- **Feature Importance / Selected Features:** actual feature names for the selected K. Show importance only when the method supports a valid interpretation; otherwise show the feature list and ranking method.

#### Right insights rail

On wide screens, use a 280–320 px right column with white stacked cards. Echo the reference's insight widgets without pretending an AI service exists.

1. **Run summary:** run ID, dataset manifest, run date, split, task, selected model/K.
2. **Analysis summary:** rule-based statement derived from actual results, such as “Model X has the highest test macro-F1 at K=10”, with a link to the comparison. If there are no results, say “Run an evaluation to generate insights.”
3. **Detection status:** label as `Historical evaluation`, `Demo prediction`, `Replay`, or `VM capture disconnected`. Never fabricate live counts.
4. **Limitations:** note that benchmark results do not establish production detection quality.

Do not label a static result “AI insight” unless an actual, documented AI-generated insight feature exists. Call it **Analysis summary** initially.

#### Model comparison table

At the bottom of Overview or on Model Results, show:

`Model | Features (K) | Macro F1 | Balanced Acc. | Median latency | P95 latency | Size | Run`

Provide sorting, selected-row state, horizontal overflow on small screens, and a useful empty state. Row selection can update charts if the behavior is clear and keyboard accessible.

### 8.6 Page-specific layouts

#### Model Results

Keep the shared shell and palette. Put task/model/K filters above a compact metrics row, then performance chart, confusion matrix, per-class metrics, and feature list. Label every metric with split and run metadata.

#### Prediction Demo

Use a centered white card with two tabs: **Upload CSV** and **Enter one row**. Explain the accepted schema and whether inference runs locally in the browser. Show predicted class, model version, inference latency, and probability only if valid/calibrated. Put validation errors beside the relevant control. State that this is a research demo, not a live network detector.

#### Live Lab

Make the boundary between website and VM explicit. Show `Not connected` by default, required setup, and lab instructions. For sanitized JSONL replay, show a persistent **Replay data** badge and timestamp/source. Never imply the site can capture visitor traffic.

#### Reports

Show generated downloadable scorecards/plots and a concise reproducibility summary. Expose only sanitized, publication-ready files.

### 8.7 Responsive behavior

- **≥1280 px:** full sidebar + main area + right insights rail; four KPI cards in one row; chart and secondary widget side-by-side.
- **768–1279 px:** collapsible sidebar; move insights below the main chart; 2×2 KPI grid; stack charts when labels become cramped.
- **<768 px:** sidebar drawer; one-column cards; filters wrap or become compact selects; tables scroll horizontally; no clipped dialogs or hidden actions.
- Touch targets should be at least 44×44 CSS px on small screens. Respect reduced-motion preferences.

### 8.8 Interactions, data, and states

Implement visible controls; remove decorative fake buttons:

- task/run/model/K filters update metrics and charts from the selected dataset;
- export generates a real download or is not shown;
- search works against visible data or is omitted;
- sidebar links navigate to implemented pages;
- predictions use an actual available model and strict validation;
- live status reflects actual connection/replay state.

Every data view must support loading, empty, missing-artifact, malformed-data, and error states. Pair benign/attack status colors with text. Tooltips must not contain essential instructions that are otherwise hidden.

### 8.9 Instructions for the coding agent

1. Read the full `DEVELOPMENT_PLAN.md` and inspect the repository before edits. Preserve existing Python research code and the static Vercel strategy.
2. Build the UI in `web/` with Next.js App Router, TypeScript, Tailwind, Lucide icons, and Recharts. Keep it compatible with static export; no server-only routes or server actions.
3. Implement the shared shell (sidebar, header, content grid, right rail) first, then Overview and the remaining pages.
4. Define color, spacing, and typography tokens once. Avoid hard-coded one-off styles and default component-library themes that conflict with this palette.
5. Define a typed schema for generated dashboard JSON and use actual scorecards. Any seeded preview data must say `Preview data` and must not appear as final published results.
6. Match the reference hierarchy and density while keeping all branding, content, charts, and metrics specific to Lightweight IDS.
7. Review screenshots at desktop (1440×900), tablet (1024×768), and mobile (390×844). Fix overflow, alignment, contrast, chart labels, and empty states.
8. Run the static production build and inspect output. Do not add a backend just to make the interface appear dynamic.

### 8.10 UI definition of done

- Desktop layout follows this spec: navy left rail, light-gray canvas, top filters, KPI cards, large performance chart, supporting cards/table, and right insights rail.
- Palette and IDS semantic status colors are applied consistently.
- Displayed figures come from verified project outputs; absent results show designed empty states.
- Every control works or is removed; no fake notifications, AI chat, live traffic, or inert buttons.
- Tablet/mobile remain usable and the UI passes a static production build.

Quick review checklist:

- [ ] At 1440×900, sidebar, main canvas, and insights rail align with consistent gutters.
- [ ] The interface feels light and structured, not glossy or over-decorated.
- [ ] KPI cards show units and evaluation context.
- [ ] Charts have meaningful axes, legends, tooltips, and no invented data.
- [ ] Text and controls have adequate contrast on white cards and navy sidebar.
- [ ] Attack/benign states have text labels and consistent status colors.
- [ ] No e-commerce copy or Shopeers identity/assets remain.
- [ ] Mobile has no page-level horizontal overflow; navigation and filters work.
- [ ] Static build succeeds without a running backend or raw dataset.
