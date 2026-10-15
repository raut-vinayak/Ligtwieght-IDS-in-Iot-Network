"use client";

import React, { useState } from "react";
import { Grid } from "lucide-react";

interface ConfusionMatrixProps {
  task: string;
}

export default function ConfusionMatrixCard({ task }: ConfusionMatrixProps) {
  const [normalized, setNormalized] = useState(true);
  const [isDark, setIsDark] = useState(false);

  React.useEffect(() => {
    const checkDark = () => setIsDark(document.documentElement.classList.contains("dark"));
    checkDark();
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

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
    if (intensity === 0) return isDark ? "#0F172A" : "#F8FAFC";
    if (intensity < 0.1) return isDark ? "#1E1B4B" : "#EEF2FF";
    if (intensity < 0.5) return isDark ? "#312E81" : "#C7D2FE";
    if (intensity < 0.8) return isDark ? "#4338CA" : "#818CF8";
    if (intensity < 0.95) return isDark ? "#4F46E5" : "#4F46E5";
    return isDark ? "#6366F1" : "#312E81";
  };

  const getTextColor = (val: number) => {
    const intensity = normalized ? val : val > 0 ? Math.min(1, val / 500) : 0;
    return intensity >= 0.7 ? "#FFFFFF" : isDark ? "#F8FAFC" : "#0F172A";
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-xl hover:-translate-y-1 rounded-2xl p-6 shadow-sm transition-all duration-300 ease-out overflow-hidden">
      <div className="flex items-center justify-between pb-4 border-b border-border dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Grid className="w-4 h-4 text-blue dark:text-blue-400" />
            <h3 className="text-base font-bold text-ink dark:text-white">Confusion Matrix Heatmap</h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Decision Tree evaluation on stratified holdout test split
          </p>
        </div>

        <div className="inline-flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm shadow-inner">
          <button
            onClick={() => setNormalized(true)}
            className={`px-3 py-1 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer ${
              normalized
                ? "bg-white dark:bg-slate-700 text-ink dark:text-white shadow-sm font-semibold"
                : "text-slate-600 dark:text-slate-400 hover:text-ink dark:hover:text-white"
            }`}
          >
            Norm (%)
          </button>
          <button
            onClick={() => setNormalized(false)}
            className={`px-3 py-1 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer ${
              !normalized
                ? "bg-white dark:bg-slate-700 text-ink dark:text-white shadow-sm font-semibold"
                : "text-slate-600 dark:text-slate-400 hover:text-ink dark:hover:text-white"
            }`}
          >
            Counts
          </button>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <div className="min-w-[300px]">
          <div className="flex text-xs text-slate-500 dark:text-slate-400 font-mono mb-2 ml-16">
            <span className="font-semibold text-slate-800 dark:text-slate-200">Predicted Class →</span>
          </div>

          <div className="flex">
            {/* Y-axis label */}
            <div className="w-16 flex items-center justify-center">
              <span className="text-xs font-mono font-semibold text-slate-800 dark:text-slate-200 -rotate-90">
                True Class
              </span>
            </div>

            {/* Matrix Table */}
            <div className="flex-1">
              <table className="w-full text-xs sm:text-sm font-mono border-collapse border border-slate-200 dark:border-slate-700">
                <thead>
                  <tr>
                    <th className="p-2 text-xs text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700"></th>
                    {classes.map((c) => (
                      <th
                        key={c}
                        className="p-2 text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 truncate max-w-[75px]"
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
                      <td className="p-2 text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 truncate max-w-[75px] font-semibold">
                        {classes[rIdx]}
                      </td>
                      {row.map((val, cIdx) => (
                        <td
                          key={cIdx}
                          className="p-2.5 text-center border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-semibold transition-colors"
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
