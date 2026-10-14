"use client";

import React, { useState } from "react";

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
    [0.99, 0.00, 0.01, 0.00, 0.00, 0.00, 0.00, 0.00],
    [0.00, 0.99, 0.01, 0.00, 0.00, 0.00, 0.00, 0.00],
    [0.01, 0.02, 0.96, 0.01, 0.00, 0.00, 0.00, 0.00],
    [0.00, 0.01, 0.00, 0.98, 0.01, 0.00, 0.00, 0.00],
    [0.02, 0.00, 0.00, 0.02, 0.95, 0.01, 0.00, 0.00],
    [0.00, 0.00, 0.00, 0.00, 0.00, 1.00, 0.00, 0.00],
    [0.00, 0.00, 0.01, 0.00, 0.00, 0.00, 0.99, 0.00],
    [0.00, 0.01, 0.00, 0.00, 0.00, 0.00, 0.00, 0.99],
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
    if (intensity === 0) return "#FFFFFF";
    if (intensity < 0.1) return "#EEF2FF";
    if (intensity < 0.5) return "#C7D2FE";
    if (intensity < 0.8) return "#818CF8";
    if (intensity < 0.95) return "#4338CA";
    return "#152EAE";
  };

  const getTextColor = (val: number) => {
    const intensity = normalized ? val : val > 0 ? Math.min(1, val / 500) : 0;
    return intensity >= 0.7 ? "#FFFFFF" : "#0B0D17";
  };

  return (
    <div className="bg-surface border-2 border-blue/40 hover:border-blue rounded-xl p-5 shadow-sm transition-all overflow-hidden">
      <div className="flex items-center justify-between pb-3 border-b-2 border-blue/20">
        <div>
          <h3 className="text-sm font-bold text-ink">Confusion Matrix Heatmap</h3>
          <p className="text-xs text-muted mt-0.5">
            Champion Model: DecisionTree (Holdout Test Split)
          </p>
        </div>
        <div className="flex items-center gap-1 bg-canvas p-1 rounded-lg border-2 border-blue/30 text-[11px] font-bold shrink-0">
          <button
            onClick={() => setNormalized(true)}
            className={`px-2.5 py-1 rounded transition-all ${
              normalized ? "bg-blue text-white shadow-xs" : "text-muted hover:text-ink"
            }`}
          >
            Norm (%)
          </button>
          <button
            onClick={() => setNormalized(false)}
            className={`px-2.5 py-1 rounded transition-all ${
              !normalized ? "bg-blue text-white shadow-xs" : "text-muted hover:text-ink"
            }`}
          >
            Count
          </button>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto rounded-lg border border-blue/30">
        <table className="w-full min-w-[440px] text-center text-xs border-collapse">
          <thead>
            <tr className="bg-blue/5">
              <th className="p-1.5 text-[11px] font-bold text-muted text-left border border-blue/20">Actual \ Pred</th>
              {classes.map((cls) => (
                <th key={cls} className="p-1.5 text-[11px] font-bold text-ink border border-blue/20">
                  {cls}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {classes.map((rowCls, rowIdx) => (
              <tr key={rowCls}>
                <td className="p-1.5 text-[11px] font-bold text-ink text-left whitespace-nowrap border border-blue/20">
                  {rowCls}
                </td>
                {classes.map((_, colIdx) => {
                  const val = currentMatrix[rowIdx][colIdx];
                  const display = normalized ? `${(val * 100).toFixed(0)}%` : val;
                  return (
                    <td
                      key={colIdx}
                      className="p-1.5 border border-blue/20 transition-all font-mono"
                      style={{
                        backgroundColor: getCellBg(val),
                        color: getTextColor(val),
                        fontWeight: rowIdx === colIdx ? 800 : 500,
                      }}
                    >
                      {display}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
