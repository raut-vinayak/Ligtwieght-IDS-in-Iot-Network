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
  CartesianGrid
} from "recharts";

interface PerformanceChartProps {
  scorecardData: any[];
  task: string;
}

export default function PerformanceChart({ scorecardData, task }: PerformanceChartProps) {
  // Pivot data for Recharts: rows = K values, columns = model Macro F1
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

  const modelColors: Record<string, string> = {
    DecisionTree: "#0A24E9",
    LogisticRegression: "#152EAE",
    SmallRandomForest: "#5C9764",
    ConstrainedLightGBM: "#C47B18",
  };

  const models = ["DecisionTree", "LogisticRegression", "SmallRandomForest", "ConstrainedLightGBM"];

  return (
    <div className="bg-surface border border-border rounded-xl p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border gap-2">
        <div>
          <h3 className="text-sm font-semibold text-ink">Model Performance by Feature Count</h3>
          <p className="text-xs text-muted mt-0.5">
            Test Macro-F1 across nested feature subsets $K \in [5, 10, 15, 20]$ ({task.toUpperCase()} Task)
          </p>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-medium text-muted">
          <span className="w-2.5 h-2.5 rounded-full bg-blue inline-block"></span>
          <span>DecisionTree is Edge Champion (K=5 / K=20)</span>
        </div>
      </div>

      <div className="h-72 w-full pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E6EC" />
            <XAxis
              dataKey="k"
              tick={{ fontSize: 12, fill: "#8C9BA5" }}
              axisLine={{ stroke: "#CACED6" }}
              tickLine={false}
            />
            <YAxis
              domain={[0.5, 1.02]}
              tick={{ fontSize: 11, fill: "#8C9BA5" }}
              axisLine={{ stroke: "#CACED6" }}
              tickLine={false}
              tickFormatter={(val) => `${(val * 100).toFixed(0)}%`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#FFFFFF",
                borderColor: "#CACED6",
                borderRadius: "8px",
                fontSize: "12px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
              }}
              formatter={(value: any, name: any) => [
                `${(Number(value) * 100).toFixed(2)}%`,
                name,
              ]}
            />
            <Legend
              wrapperStyle={{ paddingTop: "12px", fontSize: "11px" }}
              iconType="circle"
              iconSize={8}
            />
            {models.map((model) => (
              <Line
                key={model}
                type="monotone"
                dataKey={model}
                stroke={modelColors[model] || "#0A24E9"}
                strokeWidth={model === "DecisionTree" ? 3 : 2}
                dot={{ r: 4, strokeWidth: 1.5, fill: "#FFFFFF" }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
