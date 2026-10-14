"use client";

import React from "react";
import {
  ShieldAlert,
  BarChart3,
  Cpu,
  Radio,
  FileText,
  BookOpen,
  CheckCircle2,
  ExternalLink
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
    <aside className="w-64 bg-navy text-white flex flex-col justify-between shrink-0 min-h-screen border-r border-[#1E2445]">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-[#3A4378] flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue flex items-center justify-center text-white shadow-md">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-wide text-white leading-tight">Lightweight IDS</h1>
            <p className="text-[11px] text-muted leading-tight mt-0.5">IoT Flow Defense</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          <div className="px-3 py-2 text-[10px] font-semibold tracking-wider text-muted uppercase">
            Navigation
          </div>
          {navItems.map((item) => {
            const active = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  active
                    ? "bg-blue text-white shadow-sm font-semibold"
                    : "text-gray-300 hover:bg-[#343E73] hover:text-white"
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
      <div className="p-4 border-t border-[#3A4378]">
        <div className="bg-[#1E2445] rounded-lg p-3 border border-[#343E73]">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-positive animate-pulse"></span>
            <span className="text-[11px] font-semibold tracking-wide text-white">STATIC PREVIEW</span>
          </div>
          <p className="text-[11px] text-muted leading-relaxed">
            Zero-server client evaluation. ONNX inference runs locally in browser.
          </p>
        </div>
      </div>
    </aside>
  );
}
