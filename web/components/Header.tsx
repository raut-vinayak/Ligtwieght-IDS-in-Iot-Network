"use client";

import React from "react";
import { Download, Layers, ShieldCheck, Database } from "lucide-react";

interface HeaderProps {
  currentTab: string;
  task: "binary" | "multiclass";
  onTaskChange: (t: "binary" | "multiclass") => void;
  onExport: () => void;
}

export default function Header({ currentTab, task, onTaskChange, onExport }: HeaderProps) {
  const tabTitles: Record<string, { title: string; subtitle: string }> = {
    overview: {
      title: "IDS Overview",
      subtitle: "Verified trade-off benchmarks between Macro F1, inference latency, and memory footprint",
    },
    models: {
      title: "Model Benchmark Results",
      subtitle: "Comparative evaluation across Decision Tree, Logistic Regression, Random Forest & LightGBM",
    },
    predict: {
      title: "Client-Side Prediction Demo",
      subtitle: "Real-time edge inference running locally in your browser via ONNX Runtime Web",
    },
    live: {
      title: "Isolated Lab VM Traffic",
      subtitle: "5-tuple flow aggregation and live packet inspection replay from IDS sensor",
    },
    reports: {
      title: "Reports & Generated Figures",
      subtitle: "Downloadable scorecards, Pareto curves, confusion matrices, and run manifests",
    },
    methodology: {
      title: "Methodology & Limitations",
      subtitle: "CICIoT2023 taxonomy mapping, leakage-safe splitting, and edge deployment constraints",
    },
  };

  const currentInfo = tabTitles[currentTab] || tabTitles.overview;

  return (
    <header className="bg-surface border-b border-border px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-2 text-[11px] text-muted font-medium mb-1">
          <span>Dashboard</span>
          <span>/</span>
          <span className="capitalize text-ink font-semibold">{currentTab}</span>
        </div>
        <h2 className="text-xl font-bold text-ink tracking-tight">{currentInfo.title}</h2>
        <p className="text-xs text-muted mt-0.5">{currentInfo.subtitle}</p>
      </div>

      <div className="flex items-center gap-3 self-start md:self-auto">
        {/* Task Switcher */}
        <div className="bg-canvas p-1 rounded-lg border border-border flex items-center text-xs font-semibold">
          <button
            onClick={() => onTaskChange("binary")}
            className={`px-3 py-1.5 rounded-md transition-all ${
              task === "binary"
                ? "bg-surface text-blue shadow-sm font-bold"
                : "text-muted hover:text-ink"
            }`}
          >
            Binary (2-Class)
          </button>
          <button
            onClick={() => onTaskChange("multiclass")}
            className={`px-3 py-1.5 rounded-md transition-all ${
              task === "multiclass"
                ? "bg-surface text-blue shadow-sm font-bold"
                : "text-muted hover:text-ink"
            }`}
          >
            Multiclass (8-Class)
          </button>
        </div>

        {/* Split Chip */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-canvas text-xs font-medium text-ink">
          <Database className="w-3.5 h-3.5 text-blue" />
          <span>Test Split (Holdout)</span>
        </div>

        {/* Export Action */}
        <button
          onClick={onExport}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue text-white text-xs font-medium hover:bg-indigo transition-all shadow-sm"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Scorecard</span>
        </button>
      </div>
    </header>
  );
}
