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
      subtext: "Compensates class skew",
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div
            key={i}
            className="bg-white border border-slate-200/90 hover:border-blue-400 hover:shadow-xl hover:-translate-y-1.5 rounded-2xl p-5.5 shadow-sm transition-all duration-300 ease-out flex flex-col justify-between cursor-default group"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-medium text-slate-500 uppercase tracking-wider">
                  {c.label}
                </span>
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/90 shadow-xs">
                  <Icon className={`w-4 h-4 ${c.iconColor}`} />
                </div>
              </div>

              <div className="flex items-baseline gap-2.5">
                <span className="text-3xl font-mono font-bold text-slate-900 tracking-tight">
                  {c.value}
                </span>
                <span
                  className={`text-xs font-mono font-semibold px-2 py-0.5 rounded-md border shadow-xs ${c.tagColor}`}
                >
                  {c.tag}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-500 font-mono mt-3 pt-3 border-t border-slate-100">
              {c.subtext}
            </p>
          </div>
        );
      })}
    </div>
  );
}
