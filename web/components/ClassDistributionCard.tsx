"use client";

import React from "react";

interface ClassDistributionProps {
  task: string;
}

export default function ClassDistributionCard({ task }: ClassDistributionProps) {
  const binaryDistribution = [
    { name: "Benign", count: 5675, pct: 35.5, color: "#5C9764" },
    { name: "Attack", count: 10325, pct: 64.5, color: "#0A24E9" },
  ];

  const multiclassDistribution = [
    { name: "Benign", count: 5675, pct: 35.5, color: "#5C9764" },
    { name: "DDoS", count: 3788, pct: 23.7, color: "#0A24E9" },
    { name: "Web-based", count: 1890, pct: 11.8, color: "#152EAE" },
    { name: "Recon", count: 1536, pct: 9.6, color: "#C47B18" },
    { name: "DoS", count: 1234, pct: 7.7, color: "#C94040" },
    { name: "Mirai", count: 925, pct: 5.8, color: "#7B68EE" },
    { name: "Spoofing", count: 613, pct: 3.8, color: "#20B2AA" },
    { name: "Brute Force", count: 312, pct: 2.1, color: "#D2691E" },
  ];

  const items = task === "binary" ? binaryDistribution : multiclassDistribution;

  return (
    <div className="bg-surface border border-border rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div>
          <h3 className="text-sm font-semibold text-ink">Class Distribution</h3>
          <p className="text-xs text-muted mt-0.5">Authoritative ground truth split support</p>
        </div>
        <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-canvas border border-border text-ink">
          16,000 Flows
        </span>
      </div>

      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <div key={item.name} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-ink flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full inline-block"
                  style={{ backgroundColor: item.color }}
                ></span>
                {item.name}
              </span>
              <span className="text-muted font-medium">
                {item.count.toLocaleString()} ({item.pct}%)
              </span>
            </div>
            <div className="w-full h-1.5 bg-canvas rounded-full overflow-hidden border border-border">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${item.pct}%`, backgroundColor: item.color }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
