"use client";

import React from "react";
import {
  ShieldAlert,
  BarChart3,
  Cpu,
  Radio,
  FileText,
  BookOpen
} from "lucide-react";

export type TabId = "overview" | "models" | "predict" | "live" | "reports" | "methodology";

interface SidebarProps {
  currentTab: TabId;
  onSelectTab: (tab: TabId) => void;
}

export default function Sidebar({ currentTab, onSelectTab }: SidebarProps) {
  const navItems: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: "overview", label: "Overview", icon: <BarChart3 className="w-4 h-4" /> },
    { id: "models", label: "Model Results", icon: <Cpu className="w-4 h-4" /> },
    { id: "predict", label: "Prediction Demo", icon: <ShieldAlert className="w-4 h-4" /> },
    { id: "live", label: "Live Lab Replay", icon: <Radio className="w-4 h-4" /> },
    { id: "reports", label: "Reports & Artifacts", icon: <FileText className="w-4 h-4" /> },
    { id: "methodology", label: "Methodology", icon: <BookOpen className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-64 bg-navy text-white flex flex-col justify-between shrink-0 h-screen border-r-2 border-blue/40 shadow-xl overflow-y-auto">
      <div>
        {/* Brand Header with blue accent border */}
        <div className="p-5 border-b-2 border-blue/30 flex items-center gap-3 bg-[#1E2445]/50">
          <div className="w-10 h-10 rounded-xl bg-blue flex items-center justify-center text-white shadow-md border-2 border-white/20">
            <ShieldAlert className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-wide text-white leading-tight">Lightweight IDS</h1>
            <p className="text-[11px] text-blue font-bold leading-tight mt-0.5">IoT Defense Hub</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1.5">
          <div className="px-3 py-2 text-[10px] font-bold tracking-wider text-muted uppercase">
            Operations Menu
          </div>
          {navItems.map((item) => {
            const active = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all border-2 ${
                  active
                    ? "bg-blue border-blue text-white shadow-md scale-[1.02]"
                    : "border-transparent text-gray-300 hover:bg-[#343E73] hover:text-white hover:border-blue/30"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Environment Status Badge */}
      <div className="p-4 border-t-2 border-blue/30 bg-[#1E2445]/80">
        <div className="bg-[#152EAE]/30 rounded-xl p-3 border-2 border-blue/50">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-positive animate-pulse"></span>
            <span className="text-[11px] font-bold tracking-wide text-white">EDGE-READY DEMO</span>
          </div>
          <p className="text-[11px] text-gray-300 leading-relaxed font-medium">
            Zero-server client evaluation. ONNX inference runs locally in browser.
          </p>
        </div>
      </div>
    </aside>
  );
}
