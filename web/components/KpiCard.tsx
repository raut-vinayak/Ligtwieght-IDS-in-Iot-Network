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
      tagColor: "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
      iconColor: "text-blue dark:text-blue-400",
    },
    {
      label: "Balanced Accuracy",
      value: (balancedAcc * 100).toFixed(1) + "%",
      subtext: "Compensates class skew",
      icon: CheckCircle2,
      tag: "Verified",
      tagColor: "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
      iconColor: "text-emerald-500 dark:text-emerald-400",
    },
    {
      label: "Median Latency",
      value: medianLatencyMs.toFixed(3) + " ms",
      subtext: "Single flow inference",
      icon: Zap,
      tag: "Edge Cap",
      tagColor: "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
      iconColor: "text-amber-500 dark:text-amber-400",
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
      tagColor: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700",
      iconColor: "text-slate-600 dark:text-slate-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div
            key={i}
            className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-xl hover:-translate-y-1.5 rounded-2xl p-5.5 shadow-sm transition-all duration-300 ease-out flex flex-col justify-between cursor-default group"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {c.label}
                </span>
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 shadow-xs">
                  <Icon className={`w-4 h-4 ${c.iconColor}`} />
                </div>
              </div>

              <div className="flex items-baseline gap-2.5">
                <span className="text-3xl font-mono font-bold text-slate-900 dark:text-white tracking-tight">
                  {c.value}
                </span>
                <span
                  className={`text-xs font-mono font-semibold px-2 py-0.5 rounded-md border shadow-xs ${c.tagColor}`}
                >
                  {c.tag}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              {c.subtext}
            </p>
          </div>
        );
      })}
    </div>
  );
}
