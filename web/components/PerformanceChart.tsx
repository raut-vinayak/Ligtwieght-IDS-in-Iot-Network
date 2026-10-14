"use client";

import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import { TrendingUp } from "lucide-react";

interface PerformanceChartProps {
  scorecardData: any[];
  task: string;
}

export default function PerformanceChart({ scorecardData, task }: PerformanceChartProps) {
  const kValues = [5, 10, 15, 20];
  const chartData = kValues.map((k) => {
    const entry: Record<string, any> = { k: `K=${k}` };
    scorecardData
      .filter((row) => row.k === k)
      .forEach((row) => {
        entry[row.model] = row.test_macro_f1;
      });
    return entry;
  });

  const modelConfig: Record<string, { color: string; strokeWidth: number; dash?: string }> = {
    DecisionTree: { color: "#2563EB", strokeWidth: 2.5 },
    SmallRandomForest: { color: "#10B981", strokeWidth: 2 },
    ConstrainedLightGBM: { color: "#F59E0B", strokeWidth: 1.5 },
    LogisticRegression: { color: "#94A3B8", strokeWidth: 1.5, dash: "4 4" },
  };

  const models = ["DecisionTree", "SmallRandomForest", "ConstrainedLightGBM", "LogisticRegression"];

  return (
    <div className="bg-white border border-border rounded-xl p-5 shadow-card h-full flex flex-col justify-between">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-border gap-2 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue" />
            <h3 className="text-sm font-semibold text-ink">
              Macro-F1 Trajectory vs Feature Budget (K)
            </h3>
          </div>
          <p className="text-xs text-muted mt-0.5">
            Holdout evaluation across nested feature subsets $K \in [5, 10, 15, 20]$ ({task.toUpperCase()})
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-mono font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 self-start sm:self-auto shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
          <span>Decision Tree Dominates</span>
        </div>
      </div>

      <div className="h-72 w-full pt-4 min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis
              dataKey="k"
              tick={{ fontSize: 11, fill: "#64748B", fontFamily: "JetBrains Mono, monospace" }}
              axisLine={{ stroke: "#E2E8F0" }}
              tickLine={false}
            />
            <YAxis
              domain={[0.5, 1.02]}
              tick={{ fontSize: 11, fill: "#64748B", fontFamily: "JetBrains Mono, monospace" }}
              axisLine={{ stroke: "#E2E8F0" }}
              tickLine={false}
              tickFormatter={(val) => `${(val * 100).toFixed(0)}%`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0F172A",
                color: "#FFFFFF",
                borderRadius: "8px",
                border: "none",
                fontSize: "11px",
                fontFamily: "JetBrains Mono, monospace",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
              }}
              formatter={(value: any, name: any) => [
                `${(Number(value) * 100).toFixed(2)}%`,
                name,
              ]}
            />
            <Legend
              wrapperStyle={{ paddingTop: "12px", fontSize: "11px", fontFamily: "Inter, sans-serif" }}
              iconType="circle"
              iconSize={7}
            />
            {models.map((model) => {
              const cfg = modelConfig[model] || { color: "#64748B", strokeWidth: 1.5 };
              return (
                <Line
                  key={model}
                  type="monotone"
                  dataKey={model}
                  stroke={cfg.color}
                  strokeWidth={cfg.strokeWidth}
                  strokeDasharray={cfg.dash}
                  dot={{ r: 3, fill: cfg.color }}
                  activeDot={{ r: 5 }}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
