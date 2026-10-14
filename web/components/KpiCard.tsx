import React from "react";
import { Zap, HardDrive, Target, CheckCircle2 } from "lucide-react";

interface KpiRowProps {
  macroF1: number;
  balancedAcc: number;
  medianLatencyMs: number;
  modelSizeKb: number;
  modelName: string;
  k: number;
}

export default function KpiRow({
  macroF1,
  balancedAcc,
  medianLatencyMs,
  modelSizeKb,
  modelName,
  k,
}: KpiRowProps) {
  const cards = [
    {
      label: "Test Macro F1",
      value: (macroF1 * 100).toFixed(1) + "%",
      subtext: `${modelName} @ K=${k}`,
      icon: <Target className="w-4 h-4 text-blue" />,
      tag: "Holdout",
    },
    {
      label: "Balanced Accuracy",
      value: (balancedAcc * 100).toFixed(1) + "%",
      subtext: "Compensates class skew",
      icon: <CheckCircle2 className="w-4 h-4 text-positive" />,
      tag: "Holdout",
    },
    {
      label: "Median Inference",
      value: medianLatencyMs.toFixed(3) + " ms",
      subtext: "Single-flow response time",
      icon: <Zap className="w-4 h-4 text-warning" />,
      tag: "Benchmarked",
    },
    {
      label: "Model Footprint",
      value: modelSizeKb < 1024 ? `${modelSizeKb.toFixed(1)} KB` : `${(modelSizeKb / 1024).toFixed(2)} MB`,
      subtext: "Embedded RAM/Flash cost",
      icon: <HardDrive className="w-4 h-4 text-indigo" />,
      tag: "Artifact",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c, i) => (
        <div
          key={i}
          className="bg-surface border border-border rounded-xl p-4 shadow-sm hover:border-muted transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted">{c.label}</span>
            <div className="p-1.5 rounded-lg bg-canvas border border-border">
              {c.icon}
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-ink tracking-tight">{c.value}</span>
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-canvas text-muted border border-border">
              {c.tag}
            </span>
          </div>
          <p className="text-[11px] text-muted mt-1">{c.subtext}</p>
        </div>
      ))}
    </div>
  );
}
