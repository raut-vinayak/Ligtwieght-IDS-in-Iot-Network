"use client";

import React, { useState, useEffect } from "react";
import Sidebar, { TabId } from "../components/Sidebar";
import Header from "../components/Header";
import KpiRow from "../components/KpiCard";
import PerformanceChart from "../components/PerformanceChart";
import ClassDistributionCard from "../components/ClassDistributionCard";
import ConfusionMatrixCard from "../components/ConfusionMatrixCard";
import FeatureSubsetsCard from "../components/FeatureSubsetsCard";
import InsightsRail from "../components/InsightsRail";
import ModelComparisonTable from "../components/ModelComparisonTable";
import PredictionDemo from "../components/PredictionDemo";
import LiveLabView from "../components/LiveLabView";
import ReportsView from "../components/ReportsView";
import MethodologyView from "../components/MethodologyView";

export default function DashboardPage() {
  const [currentTab, setCurrentTab] = useState<TabId>("overview");
  const [task, setTask] = useState<"binary" | "multiclass">("multiclass");
  const [selectedK, setSelectedK] = useState<number>(20);
  const [selectedModel, setSelectedModel] = useState<string>("DecisionTree");

  const [summaryData, setSummaryData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
      k: 20,
      test_macro_f1: 0.989,
      test_balanced_acc: 0.9963,
      median_latency_ms: 1.452,
      model_size_kb: 8.22,
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
    <div className="flex min-h-screen bg-canvas">
      {/* 1. Left Sidebar */}
      <Sidebar currentTab={currentTab} onSelectTab={setCurrentTab} />

      {/* 2. Main Content Canvas */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          currentTab={currentTab}
          task={task}
          onTaskChange={(t) => {
            setTask(t);
            setSelectedK(t === "binary" ? 5 : 20);
          }}
          onExport={handleExport}
        />

        <main className="flex-1 p-5 md:p-7 overflow-y-auto">
          {currentTab === "overview" && (
            <div className="flex flex-col xl:flex-row gap-6">
              {/* Center Workspace */}
              <div className="flex-1 space-y-6 min-w-0">
                {/* KPI Row */}
                <KpiRow
                  macroF1={activeRow.test_macro_f1 || 0.989}
                  balancedAcc={activeRow.test_balanced_acc || 0.996}
                  medianLatencyMs={activeRow.median_latency_ms || 1.45}
                  modelSizeKb={activeRow.model_size_kb || 8.2}
                  modelName={activeRow.model || selectedModel}
                  k={activeRow.k || selectedK}
                />

                {/* Main Performance Chart & Class Distribution */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <PerformanceChart
                      scorecardData={activeScorecard}
                      task={task}
                    />
                  </div>
                  <div>
                    <ClassDistributionCard task={task} />
                  </div>
                </div>

                {/* Confusion Matrix & Feature Subsets */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ConfusionMatrixCard task={task} />
                  <FeatureSubsetsCard
                    selectedK={selectedK}
                    onSelectK={setSelectedK}
                    task={task}
                  />
                </div>

                {/* Model Comparison Table */}
                <ModelComparisonTable
                  scorecardData={activeScorecard}
                  selectedModel={selectedModel}
                  selectedK={selectedK}
                  onSelectModelRow={handleSelectModelRow}
                />
              </div>

              {/* Right Insights Rail */}
              <InsightsRail task={task} selectedK={selectedK} />
            </div>
          )}

          {currentTab === "models" && (
            <div className="space-y-6">
              <KpiRow
                macroF1={activeRow.test_macro_f1 || 0.989}
                balancedAcc={activeRow.test_balanced_acc || 0.996}
                medianLatencyMs={activeRow.median_latency_ms || 1.45}
                modelSizeKb={activeRow.model_size_kb || 8.2}
                modelName={activeRow.model || selectedModel}
                k={activeRow.k || selectedK}
              />
              <PerformanceChart scorecardData={activeScorecard} task={task} />
              <ModelComparisonTable
                scorecardData={activeScorecard}
                selectedModel={selectedModel}
                selectedK={selectedK}
                onSelectModelRow={handleSelectModelRow}
              />
            </div>
          )}

          {currentTab === "predict" && <PredictionDemo task={task} />}

          {currentTab === "live" && <LiveLabView />}

          {currentTab === "reports" && <ReportsView />}

          {currentTab === "methodology" && <MethodologyView />}
        </main>
      </div>
    </div>
  );
}
