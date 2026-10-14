"use client";

import React from "react";
import { Download, Database, Menu, Shield, Cpu } from "lucide-react";

interface HeaderProps {
  currentTab: string;
  task: "binary" | "multiclass";
  onTaskChange: (t: "binary" | "multiclass") => void;
  onExport: () => void;
  onOpenMobileNav?: () => void;
}

export default function Header({
  currentTab,
  task,
  onTaskChange,
  onExport,
  onOpenMobileNav,
}: HeaderProps) {
  const tabTitles: Record<string, { title: string; subtitle: string; category: string }> = {
    predict: {
      category: "REAL-TIME TELEMETRY",
      title: "Edge Decision Engine",
      subtitle: "Deterministic 10-feature tree execution with immediate human-language diagnosis",
    },
    scores: {
      category: "BENCHMARK ANALYSIS",
      title: "Model Performance Matrix",
      subtitle: "Evaluated on stratified CICIoT2023 holdout test split across 5 lightweight architectures",
    },
    assistant: {
      category: "SECURITY INTELLIGENCE",
      title: "Sentinel AI Security Analyst",
      subtitle: "Conversational threat root cause analysis, telemetry diagnostics, and mitigation advice",
    },
  };

  const currentInfo = tabTitles[currentTab] || tabTitles.predict;

  return (
    <header className="bg-surface border-b border-border px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 shadow-subtle">
      {/* Left: Mobile Toggle & Title */}
      <div className="flex items-center gap-3">
        {onOpenMobileNav && (
          <button
            onClick={onOpenMobileNav}
            className="lg:hidden p-2 -ml-1 text-slate-600 hover:text-slate-900 rounded-lg border border-border hover:bg-slate-50 transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}

        <div>
          <div className="flex items-center gap-2 text-[10px] text-muted font-mono tracking-wider">
            <span>{currentInfo.category}</span>
            <span className="text-slate-300">•</span>
            <span className="text-blue font-medium">K=10 BUDGET</span>
          </div>
          <h2 className="text-base sm:text-lg font-semibold text-ink tracking-tight">
            {currentInfo.title}
          </h2>
          <p className="hidden md:block text-xs text-muted font-normal mt-0.5 max-w-xl">
            {currentInfo.subtitle}
          </p>
        </div>
      </div>

      {/* Right: Controls & Actions */}
      <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
        {/* Task Segmented Control */}
        <div className="inline-flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
          <button
            onClick={() => onTaskChange("binary")}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
              task === "binary"
                ? "bg-white text-ink shadow-xs font-semibold"
                : "text-muted hover:text-ink"
            }`}
          >
            Binary (2-Class)
          </button>
          <button
            onClick={() => onTaskChange("multiclass")}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
              task === "multiclass"
                ? "bg-white text-ink shadow-xs font-semibold"
                : "text-muted hover:text-ink"
            }`}
          >
            Multiclass (8-Class)
          </button>
        </div>

        {/* Evaluation Dataset Pill */}
        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-border bg-slate-50 text-[11px] text-muted font-mono">
          <Database className="w-3 h-3 text-slate-400" />
          <span>CICIoT2023 Test Split</span>
        </div>

        {/* Export Button */}
        <button
          onClick={onExport}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800 text-xs font-medium transition-colors shadow-subtle border border-slate-900 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export CSV</span>
        </button>
      </div>
    </header>
  );
}
