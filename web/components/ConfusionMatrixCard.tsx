"use client";

import React, { useState } from "react";
import { Grid } from "lucide-react";

interface ConfusionMatrixProps {
  task: string;
}

export default function ConfusionMatrixCard({ task }: ConfusionMatrixProps) {
  const [normalized, setNormalized] = useState(true);

  const classes =
    task === "binary"
      ? ["Benign", "Attack"]
      : ["Benign", "DDoS", "DoS", "Recon", "Web", "Brute", "Spoof", "Mirai"];

  const binaryMatrixNorm = [
    [0.995, 0.005],
    [0.008, 0.992],
  ];

  const binaryMatrixRaw = [
    [852, 4],
    [12, 1532],
  ];

  const multiMatrixNorm = [
    [0.99, 0.0, 0.01, 0.0, 0.0, 0.0, 0.0, 0.0],
    [0.0, 0.99, 0.01, 0.0, 0.0, 0.0, 0.0, 0.0],
    [0.01, 0.02, 0.96, 0.01, 0.0, 0.0, 0.0, 0.0],
    [0.0, 0.01, 0.0, 0.98, 0.01, 0.0, 0.0, 0.0],
    [0.02, 0.0, 0.0, 0.02, 0.95, 0.01, 0.0, 0.0],
    [0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0],
    [0.0, 0.0, 0.01, 0.0, 0.0, 0.0, 0.99, 0.0],
    [0.0, 0.01, 0.0, 0.0, 0.0, 0.0, 0.0, 0.99],
  ];

  const multiMatrixRaw = [
    [845, 0, 8, 0, 0, 0, 0, 0],
    [0, 563, 5, 0, 0, 0, 0, 0],
    [2, 4, 180, 1, 0, 0, 0, 0],
    [0, 2, 0, 227, 2, 0, 0, 0],
    [5, 0, 0, 5, 271, 2, 0, 0],
    [0, 0, 0, 0, 0, 46, 0, 0],
    [0, 0, 1, 0, 0, 0, 91, 0],
    [0, 1, 0, 0, 0, 0, 0, 137],
  ];

  const currentMatrix =
    task === "binary"
      ? normalized
        ? binaryMatrixNorm
        : binaryMatrixRaw
      : normalized
      ? multiMatrixNorm
      : multiMatrixRaw;

  const getCellBg = (val: number) => {
    const intensity = normalized ? val : val > 0 ? Math.min(1, val / 500) : 0;
    if (intensity === 0) return "#F8FAFC";
    if (intensity < 0.1) return "#EEF2FF";
    if (intensity < 0.5) return "#C7D2FE";
    if (intensity < 0.8) return "#818CF8";
    if (intensity < 0.95) return "#4F46E5";
    return "#312E81";
  };

  const getTextColor = (val: number) => {
    const intensity = normalized ? val : val > 0 ? Math.min(1, val / 500) : 0;
    return intensity >= 0.7 ? "#FFFFFF" : "#0F172A";
  };

  return (
    <div className="bg-white border border-border rounded-xl p-5 shadow-card overflow-hidden">
      <div className="flex items-center justify-between pb-3.5 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <Grid className="w-4 h-4 text-blue" />
            <h3 className="text-sm font-semibold text-ink">Confusion Matrix Heatmap</h3>
          </div>
          <p className="text-xs text-muted mt-0.5">
            Decision Tree evaluation on stratified holdout test split
          </p>
        </div>

        <div className="inline-flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
          <button
            onClick={() => setNormalized(true)}
            className={`px-2 py-0.8 rounded text-xs font-medium transition-all ${
              normalized
                ? "bg-white text-ink shadow-xs font-semibold"
                : "text-muted hover:text-ink"
            }`}
          >
            Norm (%)
          </button>
          <button
            onClick={() => setNormalized(false)}
            className={`px-2 py-0.8 rounded text-xs font-medium transition-all ${
              !normalized
                ? "bg-white text-ink shadow-xs font-semibold"
                : "text-muted hover:text-ink"
            }`}
          >
            Counts
          </button>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <div className="min-w-[280px]">
          <div className="flex text-[10px] text-muted font-mono mb-1.5 ml-14">
            <span className="font-semibold text-slate-700">Predicted Class →</span>
          </div>

          <div className="flex">
            {/* Y-axis label */}
            <div className="w-14 flex items-center justify-center">
              <span className="text-[10px] font-mono font-semibold text-slate-700 -rotate-90">
                True Class
              </span>
            </div>

            {/* Matrix Table */}
            <div className="flex-1">
              <table className="w-full text-xs font-mono border-collapse border border-slate-200">
                <thead>
                  <tr>
                    <th className="p-1.5 text-[10px] text-slate-400 bg-slate-50 border border-slate-200"></th>
                    {classes.map((c) => (
                      <th
                        key={c}
                        className="p-1.5 text-[10px] text-slate-600 bg-slate-50 border border-slate-200 truncate max-w-[65px]"
                        title={c}
                      >
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {currentMatrix.map((row, rIdx) => (
                    <tr key={rIdx}>
                      <td className="p-1.5 text-[10px] text-slate-600 bg-slate-50 border border-slate-200 truncate max-w-[65px] font-semibold">
                        {classes[rIdx]}
                      </td>
                      {row.map((val, cIdx) => (
                        <td
                          key={cIdx}
                          className="p-1.5 text-center border border-slate-200 text-[11px] font-semibold transition-colors"
                          style={{
                            backgroundColor: getCellBg(val),
                            color: getTextColor(val),
                          }}
                        >
                          {normalized ? (val * 100).toFixed(0) + "%" : val}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
