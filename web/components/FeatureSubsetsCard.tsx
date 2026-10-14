"use client";

import React from "react";
import { SlidersHorizontal, Check } from "lucide-react";

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
    <div className="bg-white border border-border rounded-xl p-5 shadow-card overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-border gap-2">
        <div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-blue" />
            <h3 className="text-sm font-semibold text-ink">Feature Selection Matrix</h3>
          </div>
          <p className="text-xs text-muted mt-0.5">
            Mutual Information ranked feature subsets ($K \in [5, 10, 15, 20]$)
          </p>
        </div>

        {/* K Selector Pills */}
        <div className="inline-flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
          {kOptions.map((k) => (
            <button
              key={k}
              onClick={() => onSelectK(k)}
              className={`px-2.5 py-1 rounded-md text-xs font-mono font-medium transition-all cursor-pointer ${
                selectedK === k
                  ? "bg-white text-ink shadow-xs font-semibold"
                  : "text-muted hover:text-ink"
              }`}
            >
              K={k}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3.5 max-h-[260px] overflow-y-auto space-y-1.5 pr-1">
        {activeList.map((feat, idx) => (
          <div
            key={feat.name}
            className="flex items-center justify-between p-2 rounded-lg bg-slate-50/70 border border-slate-200/80 hover:bg-white transition-colors text-xs font-mono"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-[10px] text-slate-400 w-5">#{idx + 1}</span>
              <span className="font-semibold text-slate-800 truncate">{feat.name}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[10px] text-slate-500 bg-white px-1.5 py-0.2 rounded border border-slate-200">
                {feat.unit}
              </span>
              <span className="text-[10px] text-blue bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                {feat.type}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
