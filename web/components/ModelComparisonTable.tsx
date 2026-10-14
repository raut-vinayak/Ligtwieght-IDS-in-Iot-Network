"use client";

import React, { useState } from "react";
import { ArrowUpDown, Check } from "lucide-react";

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
    <div className="bg-surface border-2 border-blue/40 hover:border-blue rounded-xl p-5 shadow-sm transition-all overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b-2 border-blue/20 gap-2">
        <div>
          <h3 className="text-sm font-bold text-ink">Comprehensive Model Scorecard</h3>
          <p className="text-xs text-muted mt-0.5">
            Click any row to sync KPI cards and active model highlights
          </p>
        </div>
        <span className="text-[11px] font-bold text-blue bg-blue/10 px-2.5 py-1 rounded-md border border-blue/30 self-start sm:self-auto shrink-0">
          {scorecardData.length} Configurations Benchmarked
        </span>
      </div>

      <div className="mt-4 overflow-x-auto border-2 border-blue/20 rounded-xl">
        <table className="w-full min-w-[720px] text-left text-xs border-collapse">
          <thead>
            <tr className="border-b-2 border-blue/20 bg-blue/5 text-ink font-bold">
              <th className="p-3">Status</th>
              <th
                className="p-3 cursor-pointer hover:text-blue transition-colors"
                onClick={() => handleSort("model")}
              >
                <div className="flex items-center gap-1">
                  <span>Model</span>
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </div>
              </th>
              <th
                className="p-3 cursor-pointer hover:text-blue transition-colors"
                onClick={() => handleSort("k")}
              >
                <div className="flex items-center gap-1">
                  <span>K Features</span>
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </div>
              </th>
              <th
                className="p-3 cursor-pointer hover:text-blue transition-colors"
                onClick={() => handleSort("test_macro_f1")}
              >
                <div className="flex items-center gap-1">
                  <span>Macro F1</span>
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </div>
              </th>
              <th
                className="p-3 cursor-pointer hover:text-blue transition-colors"
                onClick={() => handleSort("test_balanced_acc")}
              >
                <div className="flex items-center gap-1">
                  <span>Balanced Acc</span>
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </div>
              </th>
              <th
                className="p-3 cursor-pointer hover:text-blue transition-colors"
                onClick={() => handleSort("median_latency_ms")}
              >
                <div className="flex items-center gap-1">
                  <span>Median Latency</span>
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </div>
              </th>
              <th
                className="p-3 cursor-pointer hover:text-blue transition-colors"
                onClick={() => handleSort("p95_latency_ms")}
              >
                <div className="flex items-center gap-1">
                  <span>P95 Latency</span>
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </div>
              </th>
              <th
                className="p-3 cursor-pointer hover:text-blue transition-colors"
                onClick={() => handleSort("model_size_kb")}
              >
                <div className="flex items-center gap-1">
                  <span>Size (KB)</span>
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </div>
              </th>
              <th className="p-3">Run ID</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row) => {
              const isSelected = row.model === selectedModel && row.k === selectedK;
              const isChampion =
                row.model === "DecisionTree" && (row.k === 5 || row.k === 20);

              return (
                <tr
                  key={`${row.model}-${row.k}`}
                  onClick={() => onSelectModelRow(row.model, row.k)}
                  className={`border-b border-border cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-blue/15 border-blue font-bold"
                      : "hover:bg-blue/5"
                  }`}
                >
                  <td className="p-3">
                    {isChampion ? (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded bg-positive/10 text-positive border border-positive/40">
                        CHAMPION
                      </span>
                    ) : (
                      <span className="text-[10px] text-muted font-bold">BENCH</span>
                    )}
                  </td>
                  <td className="p-3 text-ink font-bold flex items-center gap-1.5">
                    {isSelected && <Check className="w-4 h-4 text-blue shrink-0" />}
                    <span>{row.model}</span>
                  </td>
                  <td className="p-3 text-ink font-semibold">K={row.k}</td>
                  <td className="p-3 text-blue font-black">
                    {(row.test_macro_f1 * 100).toFixed(2)}%
                  </td>
                  <td className="p-3 text-ink font-bold">
                    {(row.test_balanced_acc * 100).toFixed(2)}%
                  </td>
                  <td className="p-3 text-ink font-mono font-semibold">{row.median_latency_ms.toFixed(3)} ms</td>
                  <td className="p-3 text-muted font-mono">{row.p95_latency_ms.toFixed(3)} ms</td>
                  <td className="p-3 text-ink font-mono font-bold">{row.model_size_kb.toFixed(1)} KB</td>
                  <td className="p-3 text-muted font-mono text-[10px]">{row.run_id}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
