"use client";

import React from "react";
import { Download, Database, Sparkles, Bot, ShieldAlert, BarChart3 } from "lucide-react";

interface HeaderProps {
  currentTab: string;
  task: "binary" | "multiclass";
  onTaskChange: (t: "binary" | "multiclass") => void;
  onExport: () => void;
}

export default function Header({ currentTab, task, onTaskChange, onExport }: HeaderProps) {
  const tabTitles: Record<string, { title: string; subtitle: string }> = {
    predict: {
      title: "Live Edge Detection Simulator (K=10 Features)",
      subtitle: "Instant sub-millisecond edge classification with cybersecurity siren alarms and AI explanation",
    },
    scores: {
      title: "Model Benchmark Scores & Evaluation",
      subtitle: "Verified trade-off scorecards between Macro F1, inference latency, and memory footprint",
    },
    assistant: {
      title: "Sentinel AI Security Analyst",
      subtitle: "Plain human language threat diagnosis, root cause explanation, and defense advice",
    },
  };

  const currentInfo = tabTitles[currentTab] || tabTitles.predict;

  return (
    <header className="relative bg-surface border-b-2 border-blue/30 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm shrink-0">
      {/* Subtle Top Gradient Accent Line */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue via-indigo to-positive"></div>

      <div>
        <div className="flex items-center gap-2 text-[11px] text-muted font-black tracking-wider mb-1">
          <span>DASHBOARD</span>
          <span>/</span>
          <span className="capitalize text-blue font-black tracking-wide flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-blue" />
            {currentTab.toUpperCase()}
          </span>
        </div>
        <h2 className="text-xl font-black text-ink tracking-tight">{currentInfo.title}</h2>
        <p className="text-xs text-muted mt-0.5 font-medium">{currentInfo.subtitle}</p>
      </div>

      <div className="flex items-center gap-3 self-start md:self-auto">
        {/* Task Switcher */}
        <div className="bg-blue/5 p-1 rounded-xl border-2 border-blue/40 flex items-center text-xs font-bold shadow-xs">
          <button
            onClick={() => onTaskChange("binary")}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              task === "binary"
                ? "bg-blue text-white shadow-sm font-black"
                : "text-muted hover:text-ink font-bold"
            }`}
          >
            Binary (2-Class)
          </button>
          <button
            onClick={() => onTaskChange("multiclass")}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              task === "multiclass"
                ? "bg-blue text-white shadow-sm font-black"
                : "text-muted hover:text-ink font-bold"
            }`}
          >
            Multiclass (8-Class)
          </button>
        </div>

        {/* Split Chip */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 border-blue/30 bg-blue/5 text-xs font-bold text-ink shadow-xs">
          <Database className="w-3.5 h-3.5 text-blue" />
          <span>Holdout Test Set</span>
        </div>

        {/* Export Action */}
        <button
          onClick={onExport}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-blue to-indigo text-white text-xs font-black hover:opacity-95 transition-all shadow-md border-2 border-blue cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Scorecard</span>
        </button>
      </div>
    </header>
  );
}
