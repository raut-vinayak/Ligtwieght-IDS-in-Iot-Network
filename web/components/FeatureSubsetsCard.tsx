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
    <div className="bg-white border border-border rounded-2xl p-6 shadow-card hover:shadow-lifted hover:-translate-y-0.5 hover:border-slate-300 transition-all duration-200 ease-out overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border gap-2">
        <div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-blue" />
            <h3 className="text-base font-bold text-ink">Feature Selection Matrix</h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Mutual Information ranked feature subsets ($K \in [5, 10, 15, 20]$)
          </p>
        </div>

        {/* K Selector Pills */}
        <div className="inline-flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs sm:text-sm shadow-inner">
          {kOptions.map((k) => (
            <button
              key={k}
              onClick={() => onSelectK(k)}
              className={`px-3 py-1 rounded-lg text-xs sm:text-sm font-mono font-medium transition-all cursor-pointer ${
                selectedK === k
                  ? "bg-white text-ink shadow-sm font-semibold"
                  : "text-slate-600 hover:text-ink"
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
            className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/70 border border-slate-200/90 hover:bg-white hover:border-blue-300 hover:shadow-xs transition-all duration-150 text-xs sm:text-sm font-mono cursor-default"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-xs text-slate-400 w-6">#{idx + 1}</span>
              <span className="font-semibold text-slate-800 truncate">{feat.name}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                {feat.unit}
              </span>
              <span className="text-[11px] text-blue bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-medium">
                {feat.type}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
