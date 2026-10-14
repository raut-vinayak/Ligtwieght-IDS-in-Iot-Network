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
    <div className="bg-surface border-2 border-blue/40 hover:border-blue rounded-xl p-5 shadow-sm transition-all overflow-hidden h-full flex flex-col justify-between">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b-2 border-blue/20 gap-2 shrink-0">
        <div>
          <h3 className="text-sm font-bold text-ink">Model Performance by Feature Count</h3>
          <p className="text-xs text-muted mt-0.5 font-medium">
            Test Macro-F1 across nested feature subsets $K \in [5, 10, 15, 20]$ ({task.toUpperCase()} Task)
          </p>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-bold text-blue bg-blue/10 px-2.5 py-1 rounded-md border border-blue/30 self-start sm:self-auto shrink-0">
          <span className="w-2.5 h-2.5 rounded-full bg-blue inline-block"></span>
          <span>DecisionTree is Edge Champion</span>
        </div>
      </div>

      <div className="h-72 w-full pt-4 min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E6EC" />
            <XAxis
              dataKey="k"
              tick={{ fontSize: 12, fill: "#8C9BA5", fontWeight: 600 }}
              axisLine={{ stroke: "#0A24E9", strokeWidth: 1.5 }}
              tickLine={false}
            />
            <YAxis
              domain={[0.5, 1.02]}
              tick={{ fontSize: 11, fill: "#8C9BA5", fontWeight: 600 }}
              axisLine={{ stroke: "#0A24E9", strokeWidth: 1.5 }}
              tickLine={false}
              tickFormatter={(val) => `${(val * 100).toFixed(0)}%`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#FFFFFF",
                borderColor: "#0A24E9",
                borderWidth: "2px",
                borderRadius: "10px",
                fontSize: "12px",
                fontWeight: "bold",
                boxShadow: "0 4px 14px rgba(10,36,233,0.12)",
              }}
              formatter={(value: any, name: any) => [
                `${(Number(value) * 100).toFixed(2)}%`,
                name,
              ]}
            />
            <Legend
              wrapperStyle={{ paddingTop: "12px", fontSize: "11px", fontWeight: "bold" }}
              iconType="circle"
              iconSize={8}
            />
            {models.map((model) => (
              <Line
                key={model}
                type="monotone"
                dataKey={model}
                stroke={modelColors[model] || "#0A24E9"}
                strokeWidth={model === "DecisionTree" ? 3.5 : 2}
                dot={{ r: 4.5, strokeWidth: 2, fill: "#FFFFFF" }}
                activeDot={{ r: 7 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
