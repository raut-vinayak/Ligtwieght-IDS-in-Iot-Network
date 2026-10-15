"use client";

import React, { useState, useEffect } from "react";
import Sidebar, { TabId } from "../components/Sidebar";
import Header from "../components/Header";
import PredictionDemo from "../components/PredictionDemo";
import ScoresView from "../components/ScoresView";
import AiAssistant from "../components/AiAssistant";

export default function DashboardPage() {
  const [currentTab, setCurrentTab] = useState<TabId>("predict");
  const [task, setTask] = useState<"binary" | "multiclass">("multiclass");
  const [selectedK, setSelectedK] = useState<number>(10);
  const [selectedModel, setSelectedModel] = useState<string>("DecisionTree");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const [summaryData, setSummaryData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Sync theme with localStorage and documentElement class on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("ids_theme") as "light" | "dark" | null;
      if (saved === "dark" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
        setTheme("dark");
        document.documentElement.classList.add("dark");
      } else {
        setTheme("light");
        document.documentElement.classList.remove("dark");
      }
    } catch (e) {
      console.debug("Could not read theme preference:", e);
    }
  }, []);

  const handleToggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    try {
      localStorage.setItem("ids_theme", nextTheme);
      if (nextTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } catch (e) {
      console.debug("Could not store theme preference:", e);
    }
  };

  // Active Flow diagnosed by AI Assistant
  const [recentFlow, setRecentFlow] = useState<{
    prediction: string;
    isAttack: boolean;
    confidence: number;
    latencyMs: number;
    riskLevel: string;
    description: string;
    inputs: Record<string, number>;
  }>({
    prediction: "Benign Traffic",
    isAttack: false,
    confidence: 100.0,
    latencyMs: 0.18,
    riskLevel: "SAFE",
    description: "Monitored flow features strictly conform to standard IoT edge telemetry. Rates, interval arrival times, and flag distributions match legitimate sensor baselines.",
    inputs: {
      Rate: 22.0,
      syn_count: 2,
      ack_count: 14,
      AVG: 140.0,
      Number: 16,
      "Tot sum": 2240.0,
      syn_flag_number: 0,
      Drate: 2.0,
      Variance: 45.0,
      IAT: 0.085,
    },
  });

  useEffect(() => {
    fetch("/data/scorecard_summary.json")
      .then((res) => res.json())
      .then((data) => {
        setSummaryData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load scorecard summary:", err);
        setLoading(false);
      });
  }, []);

  // Filter current scorecard based on active task
  const activeScorecard = summaryData
    ? task === "binary"
      ? summaryData.binary_scorecard
      : summaryData.multiclass_scorecard
    : [];

  // Active selected row in scorecard
  const activeRow =
    activeScorecard.find(
      (r: any) => r.model === selectedModel && r.k === selectedK
    ) ||
    activeScorecard[0] || {
      model: "DecisionTree",
      k: 10,
      test_macro_f1: 0.9817,
      test_balanced_acc: 0.9844,
      median_latency_ms: 1.06,
      model_size_kb: 5.22,
    };

  const handleExport = () => {
    const csvFile =
      task === "binary"
        ? "/data/scorecard_binary.csv"
        : "/data/scorecard_multiclass.csv";
    const a = document.createElement("a");
    a.href = csvFile;
    a.download = `ids_scorecard_${task}.csv`;
    a.click();
  };

  const handleSelectModelRow = (model: string, k: number) => {
    setSelectedModel(model);
    setSelectedK(k);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-canvas dark:bg-[#070B14] text-ink dark:text-slate-100 transition-colors duration-200">
      {/* 1. Left Sidebar (Collapsible Mobile Drawer + Desktop Fixed) */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        mobileOpen={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* 2. Main Content Canvas */}
      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden">
        <Header
          currentTab={currentTab}
          task={task}
          onTaskChange={(t) => {
            setTask(t);
            setSelectedK(10);
          }}
          onExport={handleExport}
          onOpenMobileNav={() => setMobileNavOpen(true)}
          theme={theme}
          onToggleTheme={handleToggleTheme}
        />

        <main className="flex-1 p-4 sm:p-6 overflow-y-auto min-w-0 scroll-smooth">
          <div className="max-w-7xl mx-auto w-full space-y-6 pb-8">
            {/* Center 1: Live Detection Simulator (K=10 Features + Alerts) */}
            {currentTab === "predict" && (
              <PredictionDemo
                task={task}
                onOpenAiAssistant={(flow) => {
                  setRecentFlow(flow);
                  setCurrentTab("assistant");
                }}
              />
            )}

            {/* Center 2: Model Benchmark Scores & Evaluation */}
            {currentTab === "scores" && (
              <ScoresView
                task={task}
                selectedK={selectedK}
                onSelectK={setSelectedK}
                selectedModel={selectedModel}
                onSelectModelRow={handleSelectModelRow}
                activeScorecard={activeScorecard}
                activeRow={activeRow}
              />
            )}

            {/* Center 3: Sentinel AI Cybersecurity Assistant */}
            {currentTab === "assistant" && (
              <AiAssistant currentFlow={recentFlow} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
