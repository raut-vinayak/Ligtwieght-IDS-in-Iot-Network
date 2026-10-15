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
  Sun,
  Moon,
} from "lucide-react";

export type TabId = "predict" | "scores" | "assistant";

interface SidebarProps {
  currentTab: TabId;
  onSelectTab: (tab: TabId) => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
  theme?: "light" | "dark";
  onToggleTheme?: () => void;
}

export default function Sidebar({
  currentTab,
  onSelectTab,
  mobileOpen = false,
  onCloseMobile,
  theme = "light",
  onToggleTheme,
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
      badge: "Copilot",
    },
  ];

  const content = (
    <div className="flex flex-col h-full bg-[#0B0F19] text-slate-300 border-r border-slate-800/90 shadow-lg">
      {/* Brand Header */}
      <div className="px-5 py-5 border-b border-slate-800/90 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
            <Shield className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold tracking-tight text-white">
                Lightweight IDS
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                v2.1
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">CICIoT2023 Engine</p>
          </div>
        </div>

        {/* Mobile close button */}
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Main Navigation */}
      <div className="flex-1 px-3.5 py-5 space-y-6 overflow-y-auto">
        <div>
          <div className="px-3 pb-2.5 text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
            Security Operations
          </div>
          <nav className="space-y-1.5">
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
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-left transition-all group ${
                    isActive
                      ? "bg-slate-800 text-white font-medium shadow-md border border-slate-700/80"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <Icon
                      className={`w-5 h-5 shrink-0 transition-colors ${
                        isActive
                          ? "text-blue-400"
                          : "text-slate-400 group-hover:text-slate-200"
                      }`}
                    />
                    <div className="truncate">
                      <div className="text-sm leading-tight font-medium">{item.label}</div>
                      <div className="text-xs text-slate-400 mt-1 leading-tight font-mono">
                        {item.description}
                      </div>
                    </div>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border leading-none ${
                        isActive
                          ? "bg-blue-500/15 text-blue-300 border-blue-500/30 font-semibold"
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
        <div className="px-3 pt-5 border-t border-slate-800/70">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono mb-3">
            Edge Budget
          </div>
          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-slate-800/50">
              <span className="text-slate-400">Feature Cap:</span>
              <span className="font-mono text-slate-200 font-semibold">K = 10 Max</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-800/50">
              <span className="text-slate-400">Inference Budget:</span>
              <span className="font-mono text-emerald-400 font-semibold">&lt; 1.5 ms</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-800/50">
              <span className="text-slate-400">Memory Footprint:</span>
              <span className="font-mono text-slate-200 font-semibold">5.22 KB</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-400">Runtime Target:</span>
              <span className="font-mono text-blue-400 font-semibold">MicroPython / C</span>
            </div>
          </div>
        </div>
      </div>

      {/* Edge Status & Theme Footer */}
      <div className="p-3.5 border-t border-slate-800/90 bg-slate-900/70 space-y-2">
        <div className="flex items-center gap-3 px-2.5 py-2 rounded-lg bg-slate-800/50 border border-slate-800">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></div>
          <div className="min-w-0">
            <div className="text-xs font-medium text-slate-200 leading-tight truncate">
              Local Inference Engine
            </div>
            <div className="text-[11px] text-slate-400 font-mono mt-0.5 leading-tight">
              Deterministic Tree (0 Remote Calls)
            </div>
          </div>
        </div>

        {onToggleTheme && (
          <button
            onClick={onToggleTheme}
            className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-xs font-mono text-slate-300 transition-colors cursor-pointer"
            title="Toggle Dashboard Theme"
          >
            <div className="flex items-center gap-2">
              {theme === "dark" ? (
                <Sun className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
              )}
              <span className="text-[11px]">Theme: {theme === "dark" ? "Night / Dark" : "Light Mode"}</span>
            </div>
            <span className="text-[10px] text-slate-400 font-semibold px-1.5 py-0.5 bg-slate-700/50 rounded">
              Switch
            </span>
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Permanent) */}
      <aside className="hidden lg:block w-64 shrink-0 h-screen">
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
