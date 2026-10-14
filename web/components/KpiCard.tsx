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
      icon: <Target className="w-5 h-5 text-blue" />,
      tag: "Holdout Split",
      iconBg: "bg-blue/10 border-blue/30",
    },
    {
      label: "Balanced Accuracy",
      value: (balancedAcc * 100).toFixed(1) + "%",
      subtext: "Compensates class skew",
      icon: <CheckCircle2 className="w-5 h-5 text-positive" />,
      tag: "Holdout Split",
      iconBg: "bg-positive/10 border-positive/30",
    },
    {
      label: "Median Latency",
      value: medianLatencyMs.toFixed(3) + " ms",
      subtext: "Single-flow response time",
      icon: <Zap className="w-5 h-5 text-warning" />,
      tag: "Benchmarked",
      iconBg: "bg-warning/10 border-warning/30",
    },
    {
      label: "Model Footprint",
      value: modelSizeKb < 1024 ? `${modelSizeKb.toFixed(1)} KB` : `${(modelSizeKb / 1024).toFixed(2)} MB`,
      subtext: "Embedded Flash/RAM cost",
      icon: <HardDrive className="w-5 h-5 text-indigo" />,
      tag: "Artifact",
      iconBg: "bg-indigo/10 border-indigo/30",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c, i) => (
        <div
          key={i}
          className="bg-gradient-to-br from-white via-white to-blue-50/40 border-2 border-blue/35 hover:border-blue rounded-2xl p-4 md:p-5 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 overflow-hidden flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-black text-muted uppercase tracking-wider">{c.label}</span>
              <div className={`p-2 rounded-xl border ${c.iconBg} shadow-xs`}>
                {c.icon}
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-ink tracking-tight">{c.value}</span>
              <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-blue/10 text-blue border border-blue/30">
                {c.tag}
              </span>
            </div>
          </div>
          <p className="text-[11px] text-muted font-bold mt-2 pt-2 border-t border-blue/10">{c.subtext}</p>
        </div>
      ))}
    </div>
  );
}
