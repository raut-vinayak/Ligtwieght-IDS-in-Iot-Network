"use client";

import React from "react";
import { Info, AlertCircle, ShieldAlert, FileText, CheckCircle2, Cpu } from "lucide-react";

interface InsightsRailProps {
  task: string;
  selectedK: number;
}

export default function InsightsRail({ task, selectedK }: InsightsRailProps) {
  return (
    <aside className="w-full xl:w-80 shrink-0 space-y-4">
      {/* 1. Run Summary */}
      <div className="bg-surface border-2 border-blue/35 hover:border-blue rounded-2xl p-4 md:p-5 shadow-xs hover:shadow-md transition-all overflow-hidden">
        <div className="flex items-center gap-2 pb-2.5 border-b-2 border-blue/20">
          <FileText className="w-4 h-4 text-blue" />
          <h4 className="text-xs font-black text-ink uppercase tracking-wider">Run Summary</h4>
        </div>
        <div className="mt-3 space-y-2 text-xs">
          <div className="flex justify-between py-1 border-b border-canvas">
            <span className="text-muted font-bold">Run ID:</span>
            <span className="font-mono font-black text-blue">benchmark_run_01</span>
          </div>
          <div className="flex justify-between py-1 border-b border-canvas">
            <span className="text-muted font-bold">Dataset:</span>
            <span className="font-black text-ink">CICIoT2023 (105 IoT Nodes)</span>
          </div>
          <div className="flex justify-between py-1 border-b border-canvas">
            <span className="text-muted font-bold">Manifest Hash:</span>
            <span className="font-mono text-muted text-[11px] font-bold">5bbaeae9ce86...</span>
          </div>
          <div className="flex justify-between py-1 border-b border-canvas">
            <span className="text-muted font-bold">Evaluation Split:</span>
            <span className="font-black text-ink">70% / 15% / 15% Stratified</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-muted font-bold">Active Subset:</span>
            <span className="font-black text-blue">K = {selectedK} Features</span>
          </div>
        </div>
      </div>

      {/* 2. Analysis Summary */}
      <div className="bg-surface border-2 border-blue/35 hover:border-blue rounded-2xl p-4 md:p-5 shadow-xs hover:shadow-md transition-all overflow-hidden">
        <div className="flex items-center gap-2 pb-2.5 border-b-2 border-blue/20">
          <CheckCircle2 className="w-4 h-4 text-positive" />
          <h4 className="text-xs font-black text-ink uppercase tracking-wider">Analysis Summary</h4>
        </div>
        <div className="mt-3 space-y-2">
          <p className="text-xs text-ink leading-relaxed">
            <strong className="text-blue">Decision Tree</strong> dominates the edge Pareto frontier at{" "}
            <strong>K={selectedK}</strong>, delivering <strong>98.9% Macro-F1</strong> with only{" "}
            <strong>1.45 ms</strong> inference latency and an ultra-compact <strong>8.2 KB</strong> disk footprint.
          </p>
          <div className="p-2.5 rounded-xl bg-blue/5 border border-blue/30 text-[11px] text-muted">
            <span className="font-bold text-ink block mb-0.5">Edge Selection Verdict:</span>
            LightGBM offers marginal accuracy gains (+0.5%) at the expense of a 65x larger memory footprint (532 KB).
          </div>
        </div>
      </div>

      {/* 3. Detection Status */}
      <div className="bg-surface border-2 border-blue/35 hover:border-blue rounded-2xl p-4 md:p-5 shadow-xs hover:shadow-md transition-all overflow-hidden">
        <div className="flex items-center gap-2 pb-2.5 border-b-2 border-blue/20">
          <ShieldAlert className="w-4 h-4 text-warning" />
          <h4 className="text-xs font-black text-ink uppercase tracking-wider">Detection Status</h4>
        </div>
        <div className="mt-3 space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue animate-pulse"></span>
            <span className="text-xs font-bold text-ink">Historical Benchmark Active</span>
          </div>
          <p className="text-[11px] text-muted leading-relaxed font-medium">
            Telemetry shown is generated from offline scientific holdout evaluation. Sensor VM sniffing runs isolated in lab.
          </p>
        </div>
      </div>

      {/* 4. Limitations */}
      <div className="bg-surface border-2 border-blue/35 hover:border-blue rounded-2xl p-4 md:p-5 shadow-xs hover:shadow-md transition-all overflow-hidden">
        <div className="flex items-center gap-2 pb-2.5 border-b-2 border-blue/20">
          <AlertCircle className="w-4 h-4 text-muted" />
          <h4 className="text-xs font-black text-ink uppercase tracking-wider">Research Limitations</h4>
        </div>
        <p className="mt-2.5 text-[11px] text-muted leading-relaxed font-medium">
          Synthetic/lab benchmark test results do not guarantee zero-day resilience on enterprise networks.
          This dashboard is an academic edge ML evaluation tool, not a commercial turnkey appliance.
        </p>
      </div>
    </aside>
  );
}
