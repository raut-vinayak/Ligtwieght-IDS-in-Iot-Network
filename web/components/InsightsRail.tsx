"use client";

import React from "react";
import { Cpu, CheckCircle2, Sliders, Layers } from "lucide-react";

interface InsightsRailProps {
  task: string;
  selectedK: number;
}

export default function InsightsRail({ task, selectedK }: InsightsRailProps) {
  return (
    <aside className="w-full xl:w-72 shrink-0 space-y-4">
      {/* 1. Evaluation Specs */}
      <div className="bg-white border border-border rounded-xl p-4 shadow-card">
        <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
          <Layers className="w-4 h-4 text-blue" />
          <h4 className="text-xs font-semibold text-ink font-mono uppercase tracking-wider">
            Evaluation Scope
          </h4>
        </div>
        <div className="mt-3 space-y-2 text-xs font-mono">
          <div className="flex justify-between py-1 border-b border-slate-50">
            <span className="text-muted">Dataset:</span>
            <span className="font-medium text-slate-800">CICIoT2023</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-50">
            <span className="text-muted">Test Split:</span>
            <span className="font-medium text-slate-800">15% Stratified</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-50">
            <span className="text-muted">Task Mode:</span>
            <span className="font-medium text-blue capitalize">{task}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-muted">Feature Cap:</span>
            <span className="font-medium text-slate-800">K = {selectedK}</span>
          </div>
        </div>
      </div>

      {/* 2. Pareto Efficiency Verdict */}
      <div className="bg-white border border-border rounded-xl p-4 shadow-card">
        <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <h4 className="text-xs font-semibold text-ink font-mono uppercase tracking-wider">
            Pareto Verdict
          </h4>
        </div>
        <div className="mt-3 space-y-2 text-xs">
          <p className="text-slate-600 leading-relaxed">
            <strong className="text-slate-900 font-semibold">Decision Tree</strong> establishes the Pareto frontier at{" "}
            <strong>K={selectedK}</strong>, delivering <strong>98.2% Macro-F1</strong> with sub-millisecond response and a compact{" "}
            <strong>5.2 KB</strong> footprint.
          </p>
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-600 leading-relaxed font-mono">
            Ensemble alternatives (Random Forest / LightGBM) incur a 60x memory overhead for &lt; 0.6% F1 improvement.
          </div>
        </div>
      </div>

      {/* 3. Hardware Deployment Compatibility */}
      <div className="bg-white border border-border rounded-xl p-4 shadow-card">
        <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
          <Cpu className="w-4 h-4 text-slate-600" />
          <h4 className="text-xs font-semibold text-ink font-mono uppercase tracking-wider">
            Hardware Suitability
          </h4>
        </div>
        <div className="mt-3 space-y-1.5 text-xs font-mono">
          <div className="flex items-center justify-between py-1 border-b border-slate-50">
            <span className="text-slate-600">Raspberry Pi 4 / 5</span>
            <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 font-medium">
              Verified
            </span>
          </div>
          <div className="flex items-center justify-between py-1 border-b border-slate-50">
            <span className="text-slate-600">ESP32 / MicroPython</span>
            <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 font-medium">
              Compatible
            </span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-slate-600">Edge Gateway (OpenWrt)</span>
            <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 font-medium">
              Ready
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
