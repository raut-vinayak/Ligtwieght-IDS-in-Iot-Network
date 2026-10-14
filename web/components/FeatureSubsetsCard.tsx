"use client";

import React from "react";
import { CheckCircle2, Radio } from "lucide-react";

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
      { name: "Telnet", unit: "indicator", type: "binary", live: true },
      { name: "SMTP", unit: "indicator", type: "binary", live: true },
      { name: "UDP", unit: "indicator", type: "binary", live: true },
      { name: "ece_flag_number", unit: "indicator", type: "binary", live: true },
      { name: "ICMP", unit: "indicator", type: "binary", live: true },
    ],
  };

  const currentFeatures = featureSets[selectedK] || featureSets[10];

  return (
    <div className="bg-surface border-2 border-blue/40 hover:border-blue rounded-xl p-5 shadow-sm transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b-2 border-blue/20 gap-2">
        <div>
          <h3 className="text-sm font-bold text-ink">Nested Feature Sets (K={selectedK})</h3>
          <p className="text-xs text-muted mt-0.5">
            Mutual Information ranked & Pearson correlation pruned (ρ &lt; 0.85)
          </p>
        </div>
        <div className="flex items-center gap-1.5 bg-canvas p-1 rounded-lg border-2 border-blue/30 text-xs font-bold">
          {[5, 10, 15, 20].map((k) => (
            <button
              key={k}
              onClick={() => onSelectK(k)}
              className={`px-3 py-1 rounded transition-all ${
                selectedK === k
                  ? "bg-blue text-white shadow-xs"
                  : "text-muted hover:text-ink"
              }`}
            >
              K={k}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
        {currentFeatures.map((f, idx) => (
          <div
            key={f.name}
            className="flex items-center justify-between p-2.5 rounded-lg bg-blue/5 border border-blue/30 text-xs"
          >
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue text-white text-[10px] font-bold flex items-center justify-center">
                {idx + 1}
              </span>
              <div>
                <span className="font-bold text-ink">{f.name}</span>
                <span className="text-[10px] text-muted ml-1.5 font-mono">({f.unit})</span>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-positive/10 border border-positive/30 text-positive flex items-center gap-1">
              <Radio className="w-2.5 h-2.5" />
              Live
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
