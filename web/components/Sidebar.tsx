"use client";

import React from "react";
import {
  Shield,
  Activity,
  BarChart2,
  Bot,
  X,
  Radio,
  Sliders,
  CheckCircle,
  Layers,
} from "lucide-react";

export type TabId = "predict" | "scores" | "assistant";

interface SidebarProps {
  currentTab: TabId;
  onSelectTab: (tab: TabId) => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export default function Sidebar({
  currentTab,
  onSelectTab,
  mobileOpen = false,
  onCloseMobile,
}: SidebarProps) {
  const navItems: {
    id: TabId;
    label: string;
    description: string;
    icon: React.ElementType;
    badge?: string;
  }[] = [
    {
      id: "predict",
      label: "Edge Telemetry",
      description: "10-Feature Inference",
      icon: Activity,
      badge: "K=10",
    },
    {
      id: "scores",
      label: "Model Benchmarks",
      description: "Pareto & F1 Metrics",
      icon: BarChart2,
      badge: "CICIoT",
    },
    {
      id: "assistant",
      label: "Sentinel AI Analyst",
      description: "Threat Explainer",
      icon: Bot,
      badge: "AI Copilot",
    },
  ];

  const content = (
    <div className="flex flex-col h-full bg-[#0B0F19] text-slate-300 border-r border-slate-800/80">
      {/* Brand Header */}
      <div className="px-5 py-4 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Shield className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold tracking-tight text-white">
                Lightweight IDS
              </span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                v2.1
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">CICIoT2023 Engine</p>
          </div>
        </div>

        {/* Mobile close button */}
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-slate-800"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Main Navigation */}
      <div className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
        <div>
          <div className="px-3 pb-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider font-mono">
            Security Operations
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    if (onCloseMobile) onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-all group ${
                    isActive
                      ? "bg-slate-800/90 text-white font-medium shadow-sm border border-slate-700/60"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive
                          ? "text-blue-400"
                          : "text-slate-400 group-hover:text-slate-200"
                      }`}
                    />
                    <div className="truncate">
                      <div className="text-xs leading-none">{item.label}</div>
                      <div className="text-[10px] text-slate-400 mt-1 leading-none font-mono">
                        {item.description}
                      </div>
                    </div>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded border leading-none ${
                        isActive
                          ? "bg-blue-500/10 text-blue-300 border-blue-500/30"
                          : "bg-slate-800/80 text-slate-400 border-slate-700/60"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Telemetry Architecture Specs */}
        <div className="px-3 pt-4 border-t border-slate-800/60">
          <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider font-mono mb-2.5">
            Edge Constraint Budget
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between text-[11px] py-1 border-b border-slate-800/40">
              <span className="text-slate-400">Feature Cap:</span>
              <span className="font-mono text-slate-200 font-semibold">K = 10 Max</span>
            </div>
            <div className="flex items-center justify-between text-[11px] py-1 border-b border-slate-800/40">
              <span className="text-slate-400">Inference Budget:</span>
              <span className="font-mono text-emerald-400 font-semibold">&lt; 1.5 ms</span>
            </div>
            <div className="flex items-center justify-between text-[11px] py-1 border-b border-slate-800/40">
              <span className="text-slate-400">RAM Ceiling:</span>
              <span className="font-mono text-slate-200 font-semibold">&lt; 500 KB</span>
            </div>
            <div className="flex items-center justify-between text-[11px] py-1">
              <span className="text-slate-400">Runtime Target:</span>
              <span className="font-mono text-blue-400 font-semibold">MicroPython / C</span>
            </div>
          </div>
        </div>
      </div>

      {/* Edge Status Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-900/60">
        <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-md bg-slate-800/40 border border-slate-800">
          <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></div>
          <div className="min-w-0">
            <div className="text-[11px] font-medium text-slate-300 leading-none truncate">
              Local Inference Engine
            </div>
            <div className="text-[9px] text-slate-400 font-mono mt-0.5 leading-none">
              Client-Side Tree (0 Server Calls)
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Permanent) */}
      <aside className="hidden lg:block w-60 shrink-0 h-screen">
        {content}
      </aside>

      {/* Mobile Drawer (Responsive Overlay) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          {/* Drawer */}
          <div className="fixed inset-y-0 left-0 w-72 max-w-full z-10 shadow-2xl">
            {content}
          </div>
        </div>
      )}
    </>
  );
}
