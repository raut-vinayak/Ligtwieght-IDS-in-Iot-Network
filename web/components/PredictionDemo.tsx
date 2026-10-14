"use client";

import React, { useState, useEffect } from "react";
import {
  Upload,
  Play,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Download,
  RefreshCw,
  Cpu,
  ShieldCheck,
  ShieldAlert,
  Volume2,
  VolumeX,
  X,
  Zap,
  Activity
} from "lucide-react";

interface PredictionDemoProps {
  task: "binary" | "multiclass";
}

// Synthesize authentic IDS alarm and chime using Web Audio API (Zero external assets needed)
function playIdsSound(isAttack: boolean) {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (isAttack) {
      // 3-pulse urgency cybersecurity siren beep
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      
      // Siren tone modulation
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.setValueAtTime(587.33, now + 0.15);
      osc.frequency.setValueAtTime(987.77, now + 0.30);
      osc.frequency.setValueAtTime(587.33, now + 0.45);
      osc.frequency.setValueAtTime(880, now + 0.60);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.8);
    } else {
      // Pleasant affirmative dual-tone chime
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.18); // E5

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.45);
    }
  } catch (err) {
    console.warn("Audio playback not allowed until user interaction:", err);
  }
}

// Recursive Decision Tree Evaluator
function evaluateTree(
  node: any,
  inputs: Record<string, number>
): { prediction: string; confidence: number } {
  if (!node) return { prediction: "Benign", confidence: 99.0 };
  if (node.prediction !== undefined) {
    return {
      prediction: String(node.prediction),
      confidence: Number(node.confidence) || 99.0,
    };
  }
  const featureName = node.feature;
  const currentVal = inputs[featureName] !== undefined ? inputs[featureName] : 0;
  if (currentVal <= node.threshold) {
    return evaluateTree(node.left, inputs);
  } else {
    return evaluateTree(node.right, inputs);
  }
}

export default function PredictionDemo({ task }: PredictionDemoProps) {
  const [activeTab, setActiveTab] = useState<"manual" | "csv">("manual");
  const [engineData, setEngineData] = useState<any>(null);
  const [contract, setContract] = useState<any>(null);
  const [manualInputs, setManualInputs] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [csvResults, setCsvResults] = useState<any[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Popup Modal Alert State
  const [showModal, setShowModal] = useState(false);
  const [modalResult, setModalResult] = useState<{
    prediction: string;
    isAttack: boolean;
    confidence: number;
    latencyMs: number;
    riskLevel: "CRITICAL" | "HIGH" | "ELEVATED" | "SAFE";
    description: string;
    actionAdvice: string;
    flowKeySummary: string;
  } | null>(null);

  const [soundEnabled, setSoundEnabled] = useState(true);

  // Load inference engine and contract
  useEffect(() => {
    fetch("/data/exact_inference_engine.json")
      .then((res) => res.json())
      .then((data) => setEngineData(data))
      .catch((err) => console.error("Could not load inference engine:", err));

    const contractUrl =
      task === "binary"
        ? "/data/ids_binary_contract.json"
        : "/data/ids_multiclass_contract.json";
    fetch(contractUrl)
      .then((res) => res.json())
      .then((data) => {
        setContract(data);
        if (data.sample_input_fixture) {
          setManualInputs(data.sample_input_fixture);
        }
      })
      .catch((err) => console.error("Could not load inference contract:", err));
  }, [task]);

  // Traffic Scenario Presets
  const applyPreset = (presetType: "benign" | "ddos" | "recon" | "mirai") => {
    if (!contract) return;
    const base: Record<string, number> = {};
    contract.features.forEach((f: string) => {
      base[f] = 0;
    });

    if (presetType === "benign") {
      base["Number"] = 18;
      base["ack_count"] = 14;
      base["syn_count"] = 2;
      base["Srate"] = 18.5;
      base["Rate"] = 22.0;
      base["AVG"] = 140.0;
      base["Tot size"] = 2520.0;
      base["IAT"] = 0.085;
      base["HTTPS"] = 1;
      base["TCP"] = 1;
      base["Protocol Type"] = 6;
    } else if (presetType === "ddos") {
      base["Number"] = 250;
      base["syn_count"] = 180;
      base["ack_count"] = 0;
      base["Srate"] = 1850.0;
      base["Rate"] = 2100.0;
      base["AVG"] = 64.0;
      base["Tot size"] = 16000.0;
      base["IAT"] = 0.0008;
      base["syn_flag_number"] = 1;
      base["TCP"] = 1;
      base["Protocol Type"] = 6;
    } else if (presetType === "recon") {
      base["Number"] = 15;
      base["syn_count"] = 14;
      base["ack_count"] = 0;
      base["rst_count"] = 8;
      base["Srate"] = 45.0;
      base["Rate"] = 45.0;
      base["AVG"] = 44.0;
      base["syn_flag_number"] = 1;
      base["TCP"] = 1;
      base["Protocol Type"] = 6;
    } else if (presetType === "mirai") {
      base["Number"] = 120;
      base["Rate"] = 850.0;
      base["Srate"] = 850.0;
      base["Telnet"] = 1;
      base["syn_count"] = 55;
      base["AVG"] = 72.0;
      base["TCP"] = 1;
      base["Protocol Type"] = 6;
    }

    setManualInputs(base);
    setValidationError(null);
  };

  // Perform classification
  const handleClassify = () => {
    setLoading(true);
    setValidationError(null);

    const t0 = performance.now();
    try {
      if (!engineData) {
        throw new Error("Inference engine rules still loading. Please try again in 1 second.");
      }

      const activeTree =
        task === "binary"
          ? engineData.binary_tree_raw
          : engineData.multiclass_tree_raw;

      const evalResult = evaluateTree(activeTree, manualInputs);
      const latencyMs = Math.max(0.15, performance.now() - t0);

      const rawPred = evalResult.prediction;
      const isAttack =
        rawPred !== "Benign" &&
        rawPred !== "0" &&
        rawPred.toLowerCase() !== "benign";

      const finalLabel =
        task === "binary"
          ? isAttack
            ? "Attack Traffic"
            : "Benign Traffic"
          : rawPred;

      // Risk profiling
      let risk: "CRITICAL" | "HIGH" | "ELEVATED" | "SAFE" = "SAFE";
      let desc = "Flow parameters conform to standard IoT telemetry. Normal data transfer approved.";
      let advice = "No action required. Traffic authenticated as legitimate IoT node transmission.";

      if (isAttack) {
        if (finalLabel === "DDoS" || finalLabel === "DoS" || finalLabel === "Attack Traffic") {
          risk = "CRITICAL";
          desc = `Volumetric flood anomaly detected! Packet rate (${manualInputs["Rate"] || 0} pkts/s) exceeds normal baseline with abnormal flag distribution.`;
          advice = "Trigger rate-limiting ACL on ingress edge switch. Drop suspicious flow 5-tuple immediately.";
        } else if (finalLabel === "Mirai" || finalLabel === "Brute Force") {
          risk = "HIGH";
          desc = `Unauthorized credential probing / botnet beacon detected (Telnet/SSH signature active).`;
          advice = "Block device MAC address and initiate credential rotation on IoT gateway.";
        } else {
          risk = "ELEVATED";
          desc = `Reconnaissance / scanning pattern detected (${manualInputs["syn_count"] || 0} unacknowledged probes).`;
          advice = "Flag source IP for observation and enable strict port-scanning drop policy.";
        }
      }

      const modalPayload = {
        prediction: finalLabel,
        isAttack,
        confidence: evalResult.confidence,
        latencyMs: Number(latencyMs.toFixed(3)),
        riskLevel: risk,
        description: desc,
        actionAdvice: advice,
        flowKeySummary: `Rate: ${manualInputs["Rate"] || 0} pkts/s | syn_count: ${manualInputs["syn_count"] || 0} | AVG: ${manualInputs["AVG"] || 0} B`,
      };

      setModalResult(modalPayload);
      setShowModal(true);

      // Trigger Audio Alert
      if (soundEnabled) {
        playIdsSound(isAttack);
      }
    } catch (err: any) {
      setValidationError(err.message || "Classification failed.");
    } finally {
      setLoading(false);
    }
  };

  // CSV Batch Classification
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setValidationError(null);
    setLoading(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split("\n").filter((l) => l.trim().length > 0);
        if (lines.length < 2) throw new Error("CSV file is empty or missing headers.");

        const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
        const activeTree =
          task === "binary"
            ? engineData.binary_tree_raw
            : engineData.multiclass_tree_raw;

        const parsedRows = [];
        let anyAttackInBatch = false;

        for (let i = 1; i < Math.min(lines.length, 25); i++) {
          const cells = lines[i].split(",").map((c) => parseFloat(c.trim()));
          const rowObj: Record<string, number> = {};
          headers.forEach((h, idx) => {
            rowObj[h] = isNaN(cells[idx]) ? 0 : cells[idx];
          });

          const t0 = performance.now();
          const res = evaluateTree(activeTree, rowObj);
          const rowLat = Math.max(0.1, performance.now() - t0);

          const isAtk =
            res.prediction !== "Benign" &&
            res.prediction !== "0" &&
            res.prediction.toLowerCase() !== "benign";

          if (isAtk) anyAttackInBatch = true;

          parsedRows.push({
            rowIdx: i,
            featuresSample: `Rate=${rowObj["Rate"] || 0}, syn=${rowObj["syn_count"] || 0}, AVG=${rowObj["AVG"] || 0}`,
            predicted: isAtk ? res.prediction : "Benign",
            isAttack: isAtk,
            confidence: res.confidence,
            latencyMs: Number(rowLat.toFixed(3)),
          });
        }

        setCsvResults(parsedRows);

        if (soundEnabled) {
          playIdsSound(anyAttackInBatch);
        }
      } catch (err: any) {
        setValidationError(err.message || "Failed to process CSV file.");
      } finally {
        setLoading(false);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Main Container Card with prominent blue border */}
      <div className="bg-surface border-2 border-blue/50 rounded-xl p-6 shadow-md hover:border-blue transition-all">
        {/* Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b-2 border-blue/20 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue animate-pulse"></span>
              <h3 className="text-base font-bold text-ink">Interactive Edge Detection Simulator</h3>
            </div>
            <p className="text-xs text-muted mt-1">
              Test live flows. Generates real-time classification, audio alarm alerts, and risk assessments.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Audio Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-lg border-2 text-xs font-semibold flex items-center gap-1.5 transition-all ${
                soundEnabled
                  ? "bg-blue/10 border-blue text-blue"
                  : "bg-canvas border-border text-muted"
              }`}
              title={soundEnabled ? "Audio Alarm Alert is ON" : "Audio Alarm Alert is MUTED"}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-blue" /> : <VolumeX className="w-4 h-4" />}
              <span className="text-[11px]">{soundEnabled ? "Audio Alert ON" : "Audio Muted"}</span>
            </button>

            {/* Mode Switcher */}
            <div className="flex items-center gap-1 bg-canvas p-1 rounded-lg border-2 border-blue/30 text-xs font-semibold">
              <button
                onClick={() => setActiveTab("manual")}
                className={`px-3 py-1.5 rounded transition-all ${
                  activeTab === "manual" ? "bg-blue text-white shadow-xs font-bold" : "text-muted hover:text-ink"
                }`}
              >
                Enter One Row
              </button>
              <button
                onClick={() => setActiveTab("csv")}
                className={`px-3 py-1.5 rounded transition-all ${
                  activeTab === "csv" ? "bg-blue text-white shadow-xs font-bold" : "text-muted hover:text-ink"
                }`}
              >
                Upload CSV
              </button>
            </div>
          </div>
        </div>

        {/* Validation Errors */}
        {validationError && (
          <div className="mt-4 p-3.5 rounded-lg bg-danger/10 border-2 border-danger text-danger text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span className="font-semibold">{validationError}</span>
          </div>
        )}

        {/* Tab 1: Manual Input */}
        {activeTab === "manual" && contract && (
          <div className="mt-5 space-y-5">
            {/* Presets Toolbar */}
            <div className="p-3.5 rounded-xl bg-canvas border-2 border-blue/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-blue" />
                  Quick Test Scenarios (Click to Load)
                </span>
                <button
                  onClick={() => applyPreset("benign")}
                  className="text-xs text-blue hover:underline flex items-center gap-1 font-semibold"
                >
                  <RefreshCw className="w-3 h-3" />
                  Reset to Normal
                </button>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  onClick={() => applyPreset("benign")}
                  className="px-3 py-1.5 rounded-lg border-2 border-positive/50 bg-positive/10 hover:bg-positive/20 text-positive text-xs font-bold transition-all"
                >
                  🟢 Normal IoT Telemetry (Safe)
                </button>
                <button
                  onClick={() => applyPreset("ddos")}
                  className="px-3 py-1.5 rounded-lg border-2 border-danger/50 bg-danger/10 hover:bg-danger/20 text-danger text-xs font-bold transition-all"
                >
                  🔴 High-Rate DDoS Flood (Attack)
                </button>
                <button
                  onClick={() => applyPreset("recon")}
                  className="px-3 py-1.5 rounded-lg border-2 border-warning/50 bg-warning/10 hover:bg-warning/20 text-warning text-xs font-bold transition-all"
                >
                  🟡 Stealth Port Scanning (Attack)
                </button>
                <button
                  onClick={() => applyPreset("mirai")}
                  className="px-3 py-1.5 rounded-lg border-2 border-indigo/50 bg-indigo/10 hover:bg-indigo/20 text-indigo text-xs font-bold transition-all"
                >
                  🟣 Mirai Botnet Probe (Attack)
                </button>
              </div>
            </div>

            {/* Input Grid */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-muted uppercase tracking-wider block">
                Feature Attributes ({contract.k} Features Active)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-72 overflow-y-auto p-1">
                {contract.features.map((feat: string) => (
                  <div key={feat} className="space-y-1">
                    <label className="text-[11px] font-bold text-ink block truncate" title={feat}>
                      {feat}
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={manualInputs[feat] !== undefined ? manualInputs[feat] : 0}
                      onChange={(e) =>
                        setManualInputs({
                          ...manualInputs,
                          [feat]: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full text-xs font-mono font-semibold px-2.5 py-1.5 rounded-lg border-2 border-blue/30 bg-white focus:outline-none focus:border-blue transition-all"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-4">
              <button
                onClick={handleClassify}
                disabled={loading}
                className="px-6 py-3 rounded-lg bg-blue hover:bg-indigo text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 border-2 border-blue cursor-pointer"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Play className="w-4 h-4 fill-white" />
                )}
                <span>Classify Flow Sample (Run IDS)</span>
              </button>

              <span className="text-xs text-muted">
                ⚡ Executes in &lt;1 ms locally via trained Decision Tree engine with sound alert.
              </span>
            </div>
          </div>
        )}

        {/* Tab 2: Upload CSV */}
        {activeTab === "csv" && (
          <div className="mt-5 space-y-4">
            <div className="border-2 border-dashed border-blue/50 rounded-xl p-8 text-center bg-blue/5 hover:bg-blue/10 transition-all">
              <FileSpreadsheet className="w-10 h-10 text-blue mx-auto mb-2" />
              <h4 className="text-sm font-bold text-ink">Upload Unlabeled Flow CSV</h4>
              <p className="text-xs text-muted mt-1 max-w-md mx-auto">
                Batch flows are parsed and evaluated locally row-by-row on your device.
              </p>

              <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                <label className="cursor-pointer px-4 py-2.5 rounded-lg bg-blue text-white text-xs font-bold hover:bg-indigo transition-all shadow-md border-2 border-blue">
                  <span>Choose CSV File</span>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                <a
                  href="/data/sample_traffic_for_prediction.csv"
                  download="sample_traffic_for_prediction.csv"
                  className="px-4 py-2.5 rounded-lg border-2 border-blue/40 bg-surface text-blue text-xs font-bold hover:bg-blue/10 transition-all flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Sample CSV</span>
                </a>
              </div>
            </div>

            {/* Batch Table */}
            {csvResults.length > 0 && (
              <div className="mt-4 border-2 border-blue/30 rounded-xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b-2 border-blue/20 bg-blue/10 text-ink font-bold">
                      <th className="p-3">Flow #</th>
                      <th className="p-3">Flow Attributes Summary</th>
                      <th className="p-3">Classification</th>
                      <th className="p-3">Latency</th>
                    </tr>
                  </thead>
                  <tbody>
                    {csvResults.map((r) => (
                      <tr key={r.rowIdx} className="border-b border-border hover:bg-canvas/40">
                        <td className="p-3 font-mono font-bold text-muted">Flow #{r.rowIdx}</td>
                        <td className="p-3 font-mono text-ink">{r.featuresSample}</td>
                        <td className="p-3">
                          <span
                            className={`px-2.5 py-1 rounded-md text-[11px] font-bold border-2 ${
                              r.isAttack
                                ? "bg-danger/10 text-danger border-danger"
                                : "bg-positive/10 text-positive border-positive"
                            }`}
                          >
                            {r.isAttack ? `🚨 ${r.predicted}` : `🛡️ ${r.predicted}`}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-muted">{r.latencyMs} ms</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* POPUP ALERT MODAL (Triggered immediately upon clicking Classify)           */}
      {/* ========================================================================= */}
      {showModal && modalResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className={`relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border-4 transition-all ${
              modalResult.isAttack
                ? "border-danger shadow-danger/20"
                : "border-positive shadow-positive/20"
            }`}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-canvas hover:bg-border text-muted hover:text-ink transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header Icon + Title */}
            <div className="flex items-start gap-4 mb-4">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border-2 ${
                  modalResult.isAttack
                    ? "bg-danger/10 border-danger text-danger animate-bounce"
                    : "bg-positive/10 border-positive text-positive"
                }`}
              >
                {modalResult.isAttack ? (
                  <ShieldAlert className="w-8 h-8 text-danger" />
                ) : (
                  <ShieldCheck className="w-8 h-8 text-positive" />
                )}
              </div>

              <div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                    modalResult.riskLevel === "CRITICAL"
                      ? "bg-danger text-white border-danger"
                      : modalResult.riskLevel === "HIGH"
                      ? "bg-danger/80 text-white border-danger"
                      : modalResult.riskLevel === "ELEVATED"
                      ? "bg-warning text-white border-warning"
                      : "bg-positive text-white border-positive"
                  }`}
                >
                  RISK: {modalResult.riskLevel}
                </span>

                <h3 className="text-xl font-black text-ink mt-1">
                  {modalResult.isAttack
                    ? `🚨 INTRUSION DETECTED: ${modalResult.prediction.toUpperCase()}`
                    : "🛡️ SAFE: NORMAL BENIGN TRAFFIC"}
                </h3>

                <p className="text-xs text-muted mt-0.5">
                  Evaluated in <strong className="text-ink">{modalResult.latencyMs} ms</strong> with{" "}
                  <strong className="text-ink">{modalResult.confidence}% confidence</strong>.
                </p>
              </div>
            </div>

            {/* Body Description Box */}
            <div
              className={`p-4 rounded-xl border-2 mb-4 space-y-2 ${
                modalResult.isAttack
                  ? "bg-danger/5 border-danger/30 text-ink"
                  : "bg-positive/5 border-positive/30 text-ink"
              }`}
            >
              <div className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5" />
                <span>Behavioral Assessment</span>
              </div>
              <p className="text-xs leading-relaxed">{modalResult.description}</p>
              <div className="pt-1 text-[11px] font-mono text-muted">
                {modalResult.flowKeySummary}
              </div>
            </div>

            {/* Action Advice Box */}
            <div className="p-3.5 rounded-xl bg-canvas border-2 border-border mb-5">
              <span className="text-[11px] font-bold text-ink uppercase tracking-wider block mb-1">
                Recommended Action:
              </span>
              <p className="text-xs text-muted leading-relaxed">
                {modalResult.actionAdvice}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  if (soundEnabled) playIdsSound(modalResult.isAttack);
                }}
                className="px-3.5 py-2 rounded-lg border-2 border-border bg-canvas text-ink text-xs font-bold hover:bg-border transition-all flex items-center gap-1.5"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Replay Alert Sound</span>
              </button>

              <button
                onClick={() => setShowModal(false)}
                className={`px-5 py-2 rounded-lg text-white text-xs font-bold transition-all shadow-md ${
                  modalResult.isAttack
                    ? "bg-danger hover:bg-red-700 border-2 border-danger"
                    : "bg-positive hover:bg-green-700 border-2 border-positive"
                }`}
              >
                Acknowledge & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
