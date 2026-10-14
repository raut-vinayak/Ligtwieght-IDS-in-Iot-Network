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
    <div className="bg-surface border border-border rounded-xl p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-border gap-2">
        <div>
          <h3 className="text-sm font-semibold text-ink">Comprehensive Model Scorecard</h3>
          <p className="text-xs text-muted mt-0.5">
            Click any row to sync KPI cards and active model highlights
          </p>
        </div>
        <span className="text-[11px] font-semibold text-muted">
          Showing {scorecardData.length} Evaluated Configurations
        </span>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-border bg-canvas/60 text-muted font-semibold">
              <th className="p-2.5">Status</th>
              <th
                className="p-2.5 cursor-pointer hover:text-ink transition-colors"
                onClick={() => handleSort("model")}
              >
                <div className="flex items-center gap-1">
                  <span>Model</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                className="p-2.5 cursor-pointer hover:text-ink transition-colors"
                onClick={() => handleSort("k")}
              >
                <div className="flex items-center gap-1">
                  <span>K Features</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                className="p-2.5 cursor-pointer hover:text-ink transition-colors"
                onClick={() => handleSort("test_macro_f1")}
              >
                <div className="flex items-center gap-1">
                  <span>Macro F1</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                className="p-2.5 cursor-pointer hover:text-ink transition-colors"
                onClick={() => handleSort("test_balanced_acc")}
              >
                <div className="flex items-center gap-1">
                  <span>Balanced Acc</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                className="p-2.5 cursor-pointer hover:text-ink transition-colors"
                onClick={() => handleSort("median_latency_ms")}
              >
                <div className="flex items-center gap-1">
                  <span>Median Latency</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                className="p-2.5 cursor-pointer hover:text-ink transition-colors"
                onClick={() => handleSort("p95_latency_ms")}
              >
                <div className="flex items-center gap-1">
                  <span>P95 Latency</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                className="p-2.5 cursor-pointer hover:text-ink transition-colors"
                onClick={() => handleSort("model_size_kb")}
              >
                <div className="flex items-center gap-1">
                  <span>Size (KB)</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="p-2.5">Run ID</th>
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
                      ? "bg-blue/10 border-blue/40 font-semibold"
                      : "hover:bg-canvas/50"
                  }`}
                >
                  <td className="p-2.5">
                    {isChampion ? (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-positive/10 text-positive border border-positive/30">
                        CHAMPION
                      </span>
                    ) : (
                      <span className="text-[10px] text-muted">BENCH</span>
                    )}
                  </td>
                  <td className="p-2.5 text-ink font-semibold flex items-center gap-1.5">
                    {isSelected && <Check className="w-3.5 h-3.5 text-blue" />}
                    <span>{row.model}</span>
                  </td>
                  <td className="p-2.5 text-ink">K={row.k}</td>
                  <td className="p-2.5 text-blue font-bold">
                    {(row.test_macro_f1 * 100).toFixed(2)}%
                  </td>
                  <td className="p-2.5 text-ink font-medium">
                    {(row.test_balanced_acc * 100).toFixed(2)}%
                  </td>
                  <td className="p-2.5 text-ink font-mono">{row.median_latency_ms.toFixed(3)} ms</td>
                  <td className="p-2.5 text-muted font-mono">{row.p95_latency_ms.toFixed(3)} ms</td>
                  <td className="p-2.5 text-ink font-mono">{row.model_size_kb.toFixed(1)} KB</td>
                  <td className="p-2.5 text-muted font-mono text-[10px]">{row.run_id}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
