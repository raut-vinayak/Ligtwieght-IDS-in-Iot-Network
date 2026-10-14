"use client";

import React from "react";
import { Download, FileText, Image as ImageIcon } from "lucide-react";

export default function ReportsView() {
  const artifacts = [
    {
      title: "Binary Classification Scorecard (CSV)",
      desc: "Full evaluation metrics (Macro F1, Balanced Acc, latency, size) across DT, LR, RF, LightGBM for K in [5,10,15,20]",
      url: "/data/scorecard_binary.csv",
      filename: "scorecard_binary.csv",
    },
    {
      title: "Multiclass Classification Scorecard (CSV)",
      desc: "Full evaluation metrics across 8 classes for all models and K subsets",
      url: "/data/scorecard_multiclass.csv",
      filename: "scorecard_multiclass.csv",
    },
    {
      title: "Dataset Intake Manifest (JSON)",
      desc: "SHA-256 hashes, file sizes, row counts, label distribution for CICIoT2023",
      url: "/data/dataset_manifest.json",
      filename: "dataset_manifest.json",
    },
    {
      title: "Sanitized Sensor VM Flow Replay (JSON)",
      desc: "Real-time flow log from isolated IDS sensor VM with latency benchmarks",
      url: "/data/replay_live_traffic.json",
      filename: "replay_live_traffic.json",
    },
  ];

  const figures = [
    {
      title: "Macro F1 vs K (Multiclass)",
      subtitle: "Pareto frontier comparison across 4 edge models",
      src: "/plots/multiclass_macro_f1_vs_k.png",
    },
    {
      title: "Confusion Matrix Heatmap (Champion DecisionTree)",
      subtitle: "Normalized holdout test evaluation across 8 classes",
      src: "/plots/confusion_matrix_chosen_multiclass.png",
    },
    {
      title: "Per-Class Performance (Precision, Recall, F1)",
      subtitle: "Detailed breakdown for champion DecisionTree (K=20)",
      src: "/plots/per_class_metrics_chosen_multiclass.png",
    },
    {
      title: "Serialized Model Footprint (KB) on Log Scale",
      subtitle: "DecisionTree (8 KB) vs LightGBM (532 KB)",
      src: "/plots/multiclass_model_size_vs_k.png",
    },
    {
      title: "Inference Latency per Sample (ms) vs K",
      subtitle: "Median and P95 latency after hardware warm-up",
      src: "/plots/multiclass_latency_vs_k.png",
    },
    {
      title: "Binary Task Macro F1 vs K",
      subtitle: "Comparison for Benign vs Attack classification",
      src: "/plots/binary_macro_f1_vs_k.png",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Downloadable Artifacts */}
      <div className="bg-surface border-2 border-blue/40 hover:border-blue rounded-xl p-5 shadow-sm space-y-4 transition-all overflow-hidden">
        <div className="flex items-center gap-2 pb-3 border-b-2 border-blue/20">
          <FileText className="w-4 h-4 text-blue" />
          <h3 className="text-sm font-bold text-ink">Reproducible Research Artifacts</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {artifacts.map((art) => (
            <div
              key={art.title}
              className="p-3.5 rounded-xl bg-blue/5 border-2 border-blue/30 flex items-start justify-between gap-3 hover:border-blue transition-all overflow-hidden"
            >
              <div className="space-y-1 min-w-0">
                <h4 className="text-xs font-bold text-ink truncate">{art.title}</h4>
                <p className="text-[11px] text-muted leading-relaxed font-medium">{art.desc}</p>
              </div>
              <a
                href={art.url}
                download={art.filename}
                className="shrink-0 p-2.5 rounded-lg bg-surface border-2 border-blue text-blue hover:bg-blue hover:text-white transition-all shadow-xs"
                title={`Download ${art.filename}`}
              >
                <Download className="w-4 h-4" />
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Generated Figures Gallery */}
      <div className="bg-surface border-2 border-blue/40 hover:border-blue rounded-xl p-5 shadow-sm space-y-4 transition-all overflow-hidden">
        <div className="flex items-center gap-2 pb-3 border-b-2 border-blue/20">
          <ImageIcon className="w-4 h-4 text-indigo" />
          <h3 className="text-sm font-bold text-ink">Scientific Evaluation Figures</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {figures.map((fig) => (
            <div
              key={fig.title}
              className="border-2 border-blue/30 rounded-xl overflow-hidden bg-canvas/30 hover:border-blue hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="p-3 bg-blue/5 border-b-2 border-blue/20">
                <h4 className="text-xs font-bold text-ink leading-tight">{fig.title}</h4>
                <p className="text-[10px] text-muted mt-0.5 font-medium">{fig.subtitle}</p>
              </div>
              <div className="p-2 flex items-center justify-center bg-white">
                <img
                  src={fig.src}
                  alt={fig.title}
                  className="max-h-56 w-auto object-contain rounded"
                  loading="lazy"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
