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
      subtext: `${modelName} (K=${k})`,
      icon: Target,
      tag: "Holdout",
      tagColor: "bg-blue-50 text-blue-700 border-blue-200",
      iconColor: "text-blue",
    },
    {
      label: "Balanced Accuracy",
      value: (balancedAcc * 100).toFixed(1) + "%",
      subtext: "Class skew compensated",
      icon: CheckCircle2,
      tag: "Verified",
      tagColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      iconColor: "text-emerald-500",
    },
    {
      label: "Median Latency",
      value: medianLatencyMs.toFixed(3) + " ms",
      subtext: "Single flow inference",
      icon: Zap,
      tag: "Edge Cap",
      tagColor: "bg-amber-50 text-amber-700 border-amber-200",
      iconColor: "text-amber-500",
    },
    {
      label: "Memory Footprint",
      value:
        modelSizeKb < 1024
          ? `${modelSizeKb.toFixed(1)} KB`
          : `${(modelSizeKb / 1024).toFixed(2)} MB`,
      subtext: "Flash/RAM storage cost",
      icon: HardDrive,
      tag: "Embedded",
      tagColor: "bg-slate-100 text-slate-700 border-slate-200",
      iconColor: "text-slate-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div
            key={i}
            className="bg-white border border-border rounded-xl p-4 shadow-card hover:border-slate-300 transition-colors flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono font-medium text-slate-500 uppercase tracking-wider">
                  {c.label}
                </span>
                <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-200/80">
                  <Icon className={`w-3.5 h-3.5 ${c.iconColor}`} />
                </div>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-mono font-semibold text-ink tracking-tight">
                  {c.value}
                </span>
                <span
                  className={`text-[9px] font-mono font-medium px-1.5 py-0.2 rounded border ${c.tagColor}`}
                >
                  {c.tag}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-muted font-mono mt-2 pt-2 border-t border-slate-100">
              {c.subtext}
            </p>
          </div>
        );
      })}
    </div>
  );
}
