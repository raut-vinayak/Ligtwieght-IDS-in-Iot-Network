"use client";

import React from "react";
import {
  ShieldAlert,
  BarChart3,
  Cpu,
  Radio,
  FileText,
  BookOpen,
  Sparkles
} from "lucide-react";

export type TabId = "overview" | "models" | "predict" | "live" | "reports" | "methodology";

interface SidebarProps {
  currentTab: TabId;
  onSelectTab: (tab: TabId) => void;
}

export default function Sidebar({ currentTab, onSelectTab }: SidebarProps) {
  const navItems: { id: TabId; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: "overview", label: "Overview", icon: <BarChart3 className="w-4 h-4" /> },
    { id: "models", label: "Model Results", icon: <Cpu className="w-4 h-4" /> },
    { id: "predict", label: "Prediction Demo", icon: <ShieldAlert className="w-4 h-4" />, badge: "K=10" },
    { id: "live", label: "Live Lab Replay", icon: <Radio className="w-4 h-4" /> },
    { id: "reports", label: "Reports & Artifacts", icon: <FileText className="w-4 h-4" /> },
    { id: "methodology", label: "Methodology", icon: <BookOpen className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-64 bg-navy text-white flex flex-col justify-between shrink-0 h-screen border-r-2 border-blue/40 shadow-2xl overflow-y-auto">
      <div>
        {/* Brand Header with gradient cyber border */}
        <div className="p-5 border-b-2 border-blue/30 flex items-center gap-3.5 bg-gradient-to-b from-[#1E2445] to-[#151a36]">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue to-indigo-500 flex items-center justify-center text-white shadow-lg border-2 border-white/20">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-black tracking-wide text-white leading-tight">Lightweight IDS</h1>
              <span className="w-1.5 h-1.5 rounded-full bg-blue animate-ping"></span>
            </div>
            <p className="text-[11px] text-blue-300 font-bold leading-tight mt-0.5 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-blue-400" />
              <span>IoT Defense Hub</span>
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3.5 space-y-1.5">
          <div className="px-3 py-2 text-[10px] font-black tracking-wider text-muted uppercase">
            Operations Menu
          </div>
          {navItems.map((item) => {
            const active = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all border-2 cursor-pointer ${
                  active
                    ? "bg-gradient-to-r from-blue to-indigo text-white border-blue shadow-lg scale-[1.02]"
                    : "border-transparent text-gray-300 hover:bg-[#343E73]/70 hover:text-white hover:border-blue/30"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={active ? "text-white" : "text-gray-400"}>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${
                      active
                        ? "bg-white/20 text-white border-white/40"
                        : "bg-blue/20 text-blue-300 border-blue/40"
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

      {/* Environment Status Badge */}
      <div className="p-4 border-t-2 border-blue/30 bg-[#1E2445]/90">
        <div className="bg-gradient-to-br from-[#152EAE]/30 to-blue/10 rounded-xl p-3 border-2 border-blue/40 shadow-inner">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-positive animate-pulse"></span>
            <span className="text-[11px] font-black tracking-wide text-white uppercase">Client-Side Engine</span>
          </div>
          <p className="text-[11px] text-gray-300 leading-relaxed font-medium">
            Zero-server client evaluation. Browser-native inference with sub-millisecond response.
          </p>
        </div>
      </div>
    </aside>
  );
}
