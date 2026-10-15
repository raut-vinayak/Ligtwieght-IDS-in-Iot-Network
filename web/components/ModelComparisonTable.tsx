"use client";

import React, { useState } from "react";
import { ArrowUpDown, Check, Award } from "lucide-react";

interface ModelComparisonTableProps {
  scorecardData: any[];
  selectedModel: string;
  selectedK: number;
  onSelectModelRow: (model: string, k: number) => void;
}

export default function ModelComparisonTable({
  scorecardData,
  selectedModel,
  selectedK,
  onSelectModelRow,
}: ModelComparisonTableProps) {
  const [sortField, setSortField] = useState<string>("test_macro_f1");
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const sortedData = [...scorecardData].sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];
    if (typeof valA === "string") valA = valA.toLowerCase();
    if (typeof valB === "string") valB = valB.toLowerCase();
    if (valA < valB) return sortAsc ? -1 : 1;
    if (valA > valB) return sortAsc ? 1 : -1;
    return 0;
  });

  return (
    <div className="bg-white border border-border rounded-2xl p-6 shadow-card hover:shadow-lifted hover:-translate-y-0.5 hover:border-slate-300 transition-all duration-200 ease-out overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border gap-2">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-ink">Model Architecture Scorecard</h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Click any row to synchronize KPI metrics and active decision tree parameters.
          </p>
        </div>
        <span className="text-xs font-mono font-medium text-slate-600 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200 self-start sm:self-auto shrink-0 shadow-xs">
          {scorecardData.length} Benchmark Configurations
        </span>
      </div>

      <div className="mt-4 overflow-x-auto border border-border rounded-xl shadow-xs">
        <table className="w-full min-w-[720px] text-left text-xs sm:text-sm border-collapse font-mono">
          <thead>
            <tr className="border-b border-border bg-slate-50/80 text-slate-600 text-xs">
              <th className="px-4 py-3 font-semibold">Rank</th>
              <th
                className="px-4 py-3 font-semibold cursor-pointer hover:text-slate-900 transition-colors"
                onClick={() => handleSort("model")}
              >
                <div className="flex items-center gap-1.5">
                  <span>Architecture</span>
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </div>
              </th>
              <th
                className="px-4 py-3 font-semibold cursor-pointer hover:text-slate-900 transition-colors"
                onClick={() => handleSort("k")}
              >
                <div className="flex items-center gap-1.5">
                  <span>Subset</span>
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </div>
              </th>
              <th
                className="px-4 py-3 font-semibold cursor-pointer hover:text-slate-900 transition-colors"
                onClick={() => handleSort("test_macro_f1")}
              >
                <div className="flex items-center gap-1.5">
                  <span>Macro F1</span>
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </div>
              </th>
              <th
                className="px-4 py-3 font-semibold cursor-pointer hover:text-slate-900 transition-colors"
                onClick={() => handleSort("test_balanced_acc")}
              >
                <div className="flex items-center gap-1.5">
                  <span>Balanced Acc</span>
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </div>
              </th>
              <th
                className="px-4 py-3 font-semibold cursor-pointer hover:text-slate-900 transition-colors"
                onClick={() => handleSort("median_latency_ms")}
              >
                <div className="flex items-center gap-1.5">
                  <span>Latency</span>
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </div>
              </th>
              <th
                className="px-4 py-3 font-semibold cursor-pointer hover:text-slate-900 transition-colors"
                onClick={() => handleSort("model_size_kb")}
              >
                <div className="flex items-center gap-1.5">
                  <span>Size</span>
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </div>
              </th>
              <th className="px-4 py-3 font-semibold">Split ID</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sortedData.map((row) => {
              const isSelected = row.model === selectedModel && row.k === selectedK;
              const isChampion =
                row.model === "DecisionTree" && (row.k === 5 || row.k === 10 || row.k === 20);

              return (
                <tr
                  key={`${row.model}-${row.k}`}
                  onClick={() => onSelectModelRow(row.model, row.k)}
                  className={`cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-blue-50/70 text-slate-900 font-semibold"
                      : "hover:bg-slate-50/70 text-slate-700"
                  }`}
                >
                  <td className="px-4 py-3.5">
                    {isChampion ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold shadow-xs">
                        <Award className="w-3 h-3 text-emerald-600" />
                        <span>Pareto</span>
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400 font-mono">Ranked</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-ink font-sans font-medium flex items-center gap-2">
                    {isSelected && <Check className="w-4 h-4 text-blue shrink-0" />}
                    <span>{row.model}</span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-600">K={row.k}</td>
                  <td className="px-4 py-3.5 text-blue font-bold">
                    {(row.test_macro_f1 * 100).toFixed(2)}%
                  </td>
                  <td className="px-4 py-3.5 text-slate-800">
                    {(row.test_balanced_acc * 100).toFixed(2)}%
                  </td>
                  <td className="px-4 py-3.5 text-slate-700">{row.median_latency_ms.toFixed(3)} ms</td>
                  <td className="px-4 py-3.5 text-slate-700">{row.model_size_kb.toFixed(1)} KB</td>
                  <td className="px-4 py-3.5 text-slate-400 text-xs">{row.run_id}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
