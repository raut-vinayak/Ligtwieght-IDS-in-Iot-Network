"use client";

import React from "react";
import { Cpu, CheckCircle2, Sliders, Layers } from "lucide-react";

interface InsightsRailProps {
  task: string;
  selectedK: number;
}

export default function InsightsRail({ task, selectedK }: InsightsRailProps) {
  return (
    <aside className="w-full xl:w-80 shrink-0 space-y-4">
      {/* 1. Evaluation Specs */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-xl hover:-translate-y-1.5 rounded-2xl p-5 shadow-sm transition-all duration-300 ease-out">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
          <Layers className="w-4 h-4 text-blue dark:text-blue-400" />
          <h4 className="text-xs sm:text-sm font-semibold text-ink dark:text-white font-mono uppercase tracking-wider">
            Evaluation Scope
          </h4>
        </div>
        <div className="mt-3.5 space-y-2.5 text-xs sm:text-sm font-mono">
          <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800/60">
            <span className="text-slate-500 dark:text-slate-400">Dataset:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">CICIoT2023</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800/60">
            <span className="text-slate-500 dark:text-slate-400">Test Split:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">15% Stratified</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800/60">
            <span className="text-slate-500 dark:text-slate-400">Task Mode:</span>
            <span className="font-semibold text-blue dark:text-blue-400 capitalize">{task}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-500 dark:text-slate-400">Feature Cap:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">K = {selectedK}</span>
          </div>
        </div>
      </div>

      {/* 2. Pareto Efficiency Verdict */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-xl hover:-translate-y-1.5 rounded-2xl p-5 shadow-sm transition-all duration-300 ease-out">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
          <h4 className="text-xs sm:text-sm font-semibold text-ink dark:text-white font-mono uppercase tracking-wider">
            Pareto Verdict
          </h4>
        </div>
        <div className="mt-3.5 space-y-2.5 text-xs sm:text-sm">
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
            <strong className="text-slate-900 dark:text-white font-semibold">Decision Tree</strong> establishes the Pareto frontier at{" "}
            <strong>K={selectedK}</strong>, delivering <strong>98.2% Macro-F1</strong> with sub-millisecond response and a compact{" "}
            <strong>5.2 KB</strong> footprint.
          </p>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-mono">
            Ensemble alternatives (Random Forest / LightGBM) incur a 60x memory overhead for &lt; 0.6% F1 gain.
          </div>
        </div>
      </div>

      {/* 3. Hardware Deployment Compatibility */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-xl hover:-translate-y-1.5 rounded-2xl p-5 shadow-sm transition-all duration-300 ease-out">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
          <Cpu className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          <h4 className="text-xs sm:text-sm font-semibold text-ink dark:text-white font-mono uppercase tracking-wider">
            Hardware Suitability
          </h4>
        </div>
        <div className="mt-3.5 space-y-2 text-xs sm:text-sm font-mono">
          <div className="flex items-center justify-between py-1.5 border-b border-slate-50 dark:border-slate-800/60">
            <span className="text-slate-700 dark:text-slate-300 font-medium">Raspberry Pi 4 / 5</span>
            <span className="text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800 font-semibold">
              Verified
            </span>
          </div>
          <div className="flex items-center justify-between py-1.5 border-b border-slate-50 dark:border-slate-800/60">
            <span className="text-slate-700 dark:text-slate-300 font-medium">ESP32 / MicroPython</span>
            <span className="text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800 font-semibold">
              Compatible
            </span>
          </div>
          <div className="flex items-center justify-between py-1.5">
            <span className="text-slate-700 dark:text-slate-300 font-medium">Edge Gateway (OpenWrt)</span>
            <span className="text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800 font-semibold">
              Ready
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
