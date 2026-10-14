"use client";

import React from "react";
import KpiRow from "./KpiCard";
import PerformanceChart from "./PerformanceChart";
import ClassDistributionCard from "./ClassDistributionCard";
import ConfusionMatrixCard from "./ConfusionMatrixCard";
import FeatureSubsetsCard from "./FeatureSubsetsCard";
import ModelComparisonTable from "./ModelComparisonTable";
import InsightsRail from "./InsightsRail";

interface ScoresViewProps {
  task: "binary" | "multiclass";
  selectedK: number;
  onSelectK: (k: number) => void;
  selectedModel: string;
  onSelectModelRow: (model: string, k: number) => void;
  activeScorecard: any[];
  activeRow: any;
}

export default function ScoresView({
  task,
  selectedK,
  onSelectK,
  selectedModel,
  onSelectModelRow,
  activeScorecard,
  activeRow,
}: ScoresViewProps) {
  return (
    <div className="flex flex-col xl:flex-row gap-6 items-start">
      {/* Center Workspace */}
      <div className="flex-1 space-y-6 min-w-0 w-full">
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          <div className="lg:col-span-2 min-w-0">
            <PerformanceChart scorecardData={activeScorecard} task={task} />
          </div>
          <div className="min-w-0">
            <ClassDistributionCard task={task} />
          </div>
        </div>

        {/* Confusion Matrix & Feature Subsets */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div className="min-w-0">
            <ConfusionMatrixCard task={task} />
          </div>
          <div className="min-w-0">
            <FeatureSubsetsCard
              selectedK={selectedK}
              onSelectK={onSelectK}
              task={task}
            />
          </div>
        </div>

        {/* Model Comparison Table */}
        <div className="min-w-0">
          <ModelComparisonTable
            scorecardData={activeScorecard}
            selectedModel={selectedModel}
            selectedK={selectedK}
            onSelectModelRow={onSelectModelRow}
          />
        </div>
      </div>

      {/* Right Insights Rail */}
      <div className="w-full xl:w-80 shrink-0 min-w-0">
        <InsightsRail task={task} selectedK={selectedK} />
      </div>
    </div>
  );
}
