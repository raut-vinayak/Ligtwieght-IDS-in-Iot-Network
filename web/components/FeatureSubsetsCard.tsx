"use client";

import React from "react";
import { SlidersHorizontal } from "lucide-react";

interface FeatureSubsetsCardProps {
  selectedK: number;
  onSelectK: (k: number) => void;
  task: string;
}

export default function FeatureSubsetsCard({
  selectedK,
  onSelectK,
  task,
}: FeatureSubsetsCardProps) {
  const featureSets: Record<
    number,
    { name: string; unit: string; type: string; live: boolean }[]
  > = {
    5: [
      { name: "Number", unit: "count", type: "float", live: true },
      { name: "ack_count", unit: "count", type: "float", live: true },
      { name: "IAT", unit: "seconds", type: "float", live: true },
      { name: "Srate", unit: "pkts/sec", type: "float", live: true },
      { name: "AVG", unit: "bytes", type: "float", live: true },
    ],
    10: [
      { name: "Number", unit: "count", type: "float", live: true },
      { name: "ack_count", unit: "count", type: "float", live: true },
      { name: "IAT", unit: "seconds", type: "float", live: true },
      { name: "Srate", unit: "pkts/sec", type: "float", live: true },
      { name: "AVG", unit: "bytes", type: "float", live: true },
      { name: "syn_count", unit: "count", type: "float", live: true },
      { name: "HTTPS", unit: "indicator", type: "binary", live: true },
      { name: "syn_flag_number", unit: "indicator", type: "binary", live: true },
      { name: "Tot size", unit: "bytes", type: "float", live: true },
      { name: "ack_flag_number", unit: "indicator", type: "binary", live: true },
    ],
    15: [
      { name: "Number", unit: "count", type: "float", live: true },
      { name: "ack_count", unit: "count", type: "float", live: true },
      { name: "IAT", unit: "seconds", type: "float", live: true },
      { name: "Srate", unit: "pkts/sec", type: "float", live: true },
      { name: "AVG", unit: "bytes", type: "float", live: true },
      { name: "syn_count", unit: "count", type: "float", live: true },
      { name: "HTTPS", unit: "indicator", type: "binary", live: true },
      { name: "syn_flag_number", unit: "indicator", type: "binary", live: true },
      { name: "Tot size", unit: "bytes", type: "float", live: true },
      { name: "ack_flag_number", unit: "indicator", type: "binary", live: true },
      { name: "Variance", unit: "bytes^2", type: "float", live: true },
      { name: "Drate", unit: "pkts/sec", type: "float", live: true },
      { name: "psh_flag_number", unit: "indicator", type: "binary", live: true },
      { name: "DNS", unit: "indicator", type: "binary", live: true },
      { name: "TCP", unit: "indicator", type: "binary", live: true },
    ],
    20: [
      { name: "Number", unit: "count", type: "float", live: true },
      { name: "ack_count", unit: "count", type: "float", live: true },
      { name: "IAT", unit: "seconds", type: "float", live: true },
      { name: "Srate", unit: "pkts/sec", type: "float", live: true },
      { name: "AVG", unit: "bytes", type: "float", live: true },
      { name: "syn_count", unit: "count", type: "float", live: true },
      { name: "HTTPS", unit: "indicator", type: "binary", live: true },
      { name: "syn_flag_number", unit: "indicator", type: "binary", live: true },
      { name: "Tot size", unit: "bytes", type: "float", live: true },
      { name: "ack_flag_number", unit: "indicator", type: "binary", live: true },
      { name: "Variance", unit: "bytes^2", type: "float", live: true },
      { name: "Drate", unit: "pkts/sec", type: "float", live: true },
      { name: "psh_flag_number", unit: "indicator", type: "binary", live: true },
      { name: "DNS", unit: "indicator", type: "binary", live: true },
      { name: "TCP", unit: "indicator", type: "binary", live: true },
      { name: "rst_flag_number", unit: "indicator", type: "binary", live: true },
      { name: "Duration", unit: "seconds", type: "float", live: true },
      { name: "fin_flag_number", unit: "indicator", type: "binary", live: true },
      { name: "UDP", unit: "indicator", type: "binary", live: true },
      { name: "fin_count", unit: "count", type: "float", live: true },
    ],
  };

  const kOptions = [5, 10, 15, 20];
  const activeList = featureSets[selectedK] || featureSets[10];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-xl hover:-translate-y-1 rounded-2xl p-6 shadow-sm transition-all duration-300 ease-out overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border dark:border-slate-800 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-blue dark:text-blue-400" />
            <h3 className="text-base font-bold text-ink dark:text-white">Feature Selection Matrix</h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Mutual Information ranked feature subsets ($K \in [5, 10, 15, 20]$)
          </p>
        </div>

        {/* K Selector Pills */}
        <div className="inline-flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm shadow-inner">
          {kOptions.map((k) => (
            <button
              key={k}
              onClick={() => onSelectK(k)}
              className={`px-3 py-1 rounded-lg text-xs sm:text-sm font-mono font-medium transition-all cursor-pointer ${
                selectedK === k
                  ? "bg-white dark:bg-slate-700 text-ink dark:text-white shadow-sm font-semibold"
                  : "text-slate-600 dark:text-slate-400 hover:text-ink dark:hover:text-white"
              }`}
            >
              K={k}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 max-h-[280px] overflow-y-auto space-y-2 pr-1">
        {activeList.map((feat, idx) => (
          <div
            key={feat.name}
            className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/60 border border-slate-200/90 dark:border-slate-700/80 hover:bg-white dark:hover:bg-slate-800 hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-xs transition-all duration-150 text-xs sm:text-sm font-mono cursor-default"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-xs text-slate-400 dark:text-slate-500 w-6">#{idx + 1}</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">{feat.name}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-700 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-600">
                {feat.unit}
              </span>
              <span className="text-[11px] text-blue dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800 font-medium">
                {feat.type}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
