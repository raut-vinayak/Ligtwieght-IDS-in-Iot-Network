"use client";

import React from "react";
import { PieChart } from "lucide-react";

interface ClassDistributionProps {
  task: string;
}

export default function ClassDistributionCard({ task }: ClassDistributionProps) {
  const binaryDistribution = [
    { name: "Benign", count: 5675, pct: 35.5, color: "#10B981" },
    { name: "Attack", count: 10325, pct: 64.5, color: "#EF4444" },
  ];

  const multiclassDistribution = [
    { name: "Benign", count: 5675, pct: 35.5, color: "#10B981" },
    { name: "DDoS", count: 3788, pct: 23.7, color: "#EF4444" },
    { name: "Web-based", count: 1890, pct: 11.8, color: "#3B82F6" },
    { name: "Recon", count: 1536, pct: 9.6, color: "#F59E0B" },
    { name: "DoS", count: 1234, pct: 7.7, color: "#F43F5E" },
    { name: "Mirai", count: 925, pct: 5.8, color: "#8B5CF6" },
    { name: "Spoofing", count: 613, pct: 3.8, color: "#06B6D4" },
    { name: "Brute Force", count: 312, pct: 2.1, color: "#EA580C" },
  ];

  const items = task === "binary" ? binaryDistribution : multiclassDistribution;

  return (
    <div className="bg-white border border-border rounded-2xl p-6 shadow-card hover:shadow-lifted hover:-translate-y-0.5 hover:border-slate-300 transition-all duration-200 ease-out h-full flex flex-col justify-between">
      <div className="flex items-center justify-between pb-4 border-b border-border shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <PieChart className="w-4 h-4 text-blue" />
            <h3 className="text-base font-bold text-ink">Class Distribution</h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Authoritative ground truth split balance</p>
        </div>
        <span className="text-xs font-mono font-medium px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-600 shrink-0">
          16,000 Samples
        </span>
      </div>

      <div className="mt-4 space-y-3.5 overflow-y-auto max-h-[280px] pr-1">
        {items.map((item) => (
          <div key={item.name} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="font-medium text-slate-800 flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full inline-block"
                  style={{ backgroundColor: item.color }}
                ></span>
                {item.name}
              </span>
              <span className="text-slate-500 font-mono text-xs">
                {item.count.toLocaleString()} ({item.pct}%)
              </span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${item.pct}%`, backgroundColor: item.color }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
