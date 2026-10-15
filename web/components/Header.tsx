"use client";

import React from "react";
import { Download, Database, Menu, Moon, Sun } from "lucide-react";

interface HeaderProps {
  currentTab: string;
  task: "binary" | "multiclass";
  onTaskChange: (t: "binary" | "multiclass") => void;
  onExport: () => void;
  onOpenMobileNav?: () => void;
  theme?: "light" | "dark";
  onToggleTheme?: () => void;
}

export default function Header({
  currentTab,
  task,
  onTaskChange,
  onExport,
  onOpenMobileNav,
  theme = "light",
  onToggleTheme,
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
    <header className="bg-surface dark:bg-[#0E1526] border-b border-border/80 dark:border-slate-800/90 px-5 sm:px-7 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 shadow-subtle transition-colors duration-200">
      {/* Left: Mobile Toggle & Title */}
      <div className="flex items-center gap-3.5">
        {onOpenMobileNav && (
          <button
            onClick={onOpenMobileNav}
            className="lg:hidden p-2 -ml-1 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg border border-border dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div>
          <div className="flex items-center gap-2 text-xs text-muted dark:text-slate-400 font-mono tracking-wider">
            <span>{currentInfo.category}</span>
            <span className="text-slate-300 dark:text-slate-600">•</span>
            <span className="text-blue dark:text-blue-400 font-semibold">K=10 BUDGET</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-ink dark:text-white tracking-tight mt-0.5">
            {currentInfo.title}
          </h2>
          <p className="hidden md:block text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-normal mt-0.5 max-w-xl">
            {currentInfo.subtitle}
          </p>
        </div>
      </div>

      {/* Right: Controls & Actions */}
      <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
        {/* Task Segmented Control */}
        <div className="inline-flex bg-slate-100 dark:bg-slate-800/90 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm shadow-inner">
          <button
            onClick={() => onTaskChange("binary")}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer ${
              task === "binary"
                ? "bg-white dark:bg-slate-700 text-ink dark:text-white shadow-sm font-semibold"
                : "text-slate-600 dark:text-slate-400 hover:text-ink dark:hover:text-white"
            }`}
          >
            Binary (2-Class)
          </button>
          <button
            onClick={() => onTaskChange("multiclass")}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer ${
              task === "multiclass"
                ? "bg-white dark:bg-slate-700 text-ink dark:text-white shadow-sm font-semibold"
                : "text-slate-600 dark:text-slate-400 hover:text-ink dark:hover:text-white"
            }`}
          >
            Multiclass (8-Class)
          </button>
        </div>

        {/* Evaluation Dataset Pill */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-600 dark:text-slate-300 font-mono shadow-xs">
          <Database className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
          <span>CICIoT2023 Test Split</span>
        </div>

        {/* Dark / Night Mode Toggle Button */}
        {onToggleTheme && (
          <button
            onClick={onToggleTheme}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs sm:text-sm font-medium transition-all shadow-xs cursor-pointer ${
              theme === "dark"
                ? "bg-slate-800/90 border-slate-700 text-amber-300 hover:bg-slate-700 hover:text-amber-200"
                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900"
            }`}
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Night / Dark Mode"}
            aria-label="Toggle night mode"
          >
            {theme === "dark" ? (
              <>
                <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
                <span className="font-mono text-xs">Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-indigo-500" />
                <span className="font-mono text-xs">Night Mode</span>
              </>
            )}
          </button>
        )}

        {/* Export Button */}
        <button
          onClick={onExport}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 dark:bg-blue-600 text-white hover:bg-slate-800 dark:hover:bg-blue-500 text-xs sm:text-sm font-medium transition-colors shadow-sm border border-slate-900 dark:border-blue-600 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV</span>
        </button>
      </div>
    </header>
  );
}
