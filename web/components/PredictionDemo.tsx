"use client";

import React, { useState, useEffect } from "react";
import {
  Play,
  FileSpreadsheet,
  Download,
  RefreshCw,
  ShieldCheck,
  ShieldAlert,
  Volume2,
  VolumeX,
  X,
  Zap,
  Activity,
  AlertTriangle,
  Sliders,
  Sparkles,
  ArrowRight,
  Bot
} from "lucide-react";

interface PredictionDemoProps {
  task: "binary" | "multiclass";
  onOpenAiAssistant?: (flow: any) => void;
}

// Synthesize authentic IDS alarm and chime using Web Audio API
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
      osc.frequency.setValueAtTime(987.77, now + 0.3);
      osc.frequency.setValueAtTime(587.33, now + 0.45);
      osc.frequency.setValueAtTime(880, now + 0.6);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.85);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.85);
    } else {
      // Pleasant affirmative dual-tone chime
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.18); // E5

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.5);
    }
  } catch (err) {
    console.warn("Audio playback not allowed until user interaction:", err);
  }
}

// 10 Features Metadata (labels & units)
const featureMeta: Record<string, { label: string; unit: string; desc: string }> = {
  Rate: { label: "Packet Rate", unit: "pkts/s", desc: "Total transmission throughput" },
  syn_count: { label: "SYN Packets", unit: "count", desc: "TCP synchronization probes" },
  ack_count: { label: "ACK Packets", unit: "count", desc: "TCP acknowledged receipts" },
  AVG: { label: "Avg Packet Size", unit: "bytes", desc: "Mean payload window size" },
  Number: { label: "Flow Packet Count", unit: "packets", desc: "Total packets in sliding window" },
  "Tot sum": { label: "Total Volume", unit: "bytes", desc: "Aggregated flow octets" },
  syn_flag_number: { label: "SYN Flag Active", unit: "0 or 1", desc: "SYN flag present in frame" },
  Drate: { label: "Dest Packet Rate", unit: "pkts/s", desc: "Packets delivered to target" },
  Variance: { label: "Payload Variance", unit: "bytes²", desc: "Packet size dispersion" },
  IAT: { label: "Inter-Arrival Time", unit: "seconds", desc: "Delta between arrivals" },
  Srate: { label: "Source Packet Rate", unit: "pkts/s", desc: "Packets sent from client" },
  HTTPS: { label: "HTTPS Port (443)", unit: "0 or 1", desc: "Encrypted web session" },
  ack_flag_number: { label: "ACK Flag Active", unit: "0 or 1", desc: "ACK flag present in frame" },
  "Tot size": { label: "Total Size", unit: "bytes", desc: "Aggregate stream length" },
};

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
  const currentVal = typeof inputs[featureName] === "number" && !isNaN(inputs[featureName]) ? inputs[featureName] : 0;
  if (currentVal <= node.threshold) {
    return evaluateTree(node.left, inputs);
  } else {
    return evaluateTree(node.right, inputs);
  }
}

export default function PredictionDemo({ task, onOpenAiAssistant }: PredictionDemoProps) {
  const [activeTab, setActiveTab] = useState<"manual" | "csv">("manual");
  const [engineData, setEngineData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [csvResults, setCsvResults] = useState<any[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Active 10 Feature Names
  const activeFeatures =
    task === "binary"
      ? [
          "Number",
          "ack_count",
          "IAT",
          "Srate",
          "syn_count",
          "AVG",
          "HTTPS",
          "ack_flag_number",
          "syn_flag_number",
          "Tot size",
        ]
      : [
          "Rate",
          "syn_count",
          "ack_count",
          "AVG",
          "Number",
          "Tot sum",
          "syn_flag_number",
          "Drate",
          "Variance",
          "IAT",
        ];

  // Default Benign Values (10 features)
  const defaultBenignValues: Record<string, number> =
    task === "binary"
      ? {
          Number: 16,
          ack_count: 14,
          IAT: 0.085,
          Srate: 18.5,
          syn_count: 2,
          AVG: 140.0,
          HTTPS: 1,
          ack_flag_number: 1,
          syn_flag_number: 0,
          "Tot size": 2240.0,
        }
      : {
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
        };

  const [manualInputs, setManualInputs] = useState<Record<string, number>>(defaultBenignValues);
  const [activePresetName, setActivePresetName] = useState<string>("Normal Web Browsing (Safe)");

  // Active Live Verdict on Page
  const [liveVerdict, setLiveVerdict] = useState<{
    prediction: string;
    isAttack: boolean;
    confidence: number;
    latencyMs: number;
    riskLevel: "CRITICAL" | "HIGH" | "ELEVATED" | "SAFE";
    description: string;
    actionAdvice: string;
    flowKeySummary: string;
  }>({
    prediction: "Benign Traffic",
    isAttack: false,
    confidence: 100.0,
    latencyMs: 0.22,
    riskLevel: "SAFE",
    description: "Flow parameters strictly conform to standard IoT device telemetry. Normal latency and packet intervals.",
    actionAdvice: "No action required. Flow signature verified as legitimate IoT communication.",
    flowKeySummary: "10 Features Monitored | Baseline: Normal Traffic",
  });

  // Popup Modal Alert State
  const [showModal, setShowModal] = useState(false);
  const [modalResult, setModalResult] = useState<typeof liveVerdict | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Load inference engine JSON
  useEffect(() => {
    fetch("/data/exact_inference_engine.json")
      .then((res) => res.json())
      .then((data) => {
        setEngineData(data);
      })
      .catch((err) => console.error("Could not load inference engine:", err));

    setManualInputs(defaultBenignValues);
  }, [task]);

  // Apply Presets (10 features strictly)
  const applyPreset = (presetKey: "benign" | "cam" | "ddos" | "recon" | "mirai" | "ssh") => {
    let updated: Record<string, number> = {};

    if (task === "binary") {
      if (presetKey === "benign") {
        updated = {
          Number: 16,
          ack_count: 14,
          IAT: 0.085,
          Srate: 18.5,
          syn_count: 2,
          AVG: 140.0,
          HTTPS: 1,
          ack_flag_number: 1,
          syn_flag_number: 0,
          "Tot size": 2240.0,
        };
        setActivePresetName("Normal Web Browsing (Safe)");
      } else if (presetKey === "cam") {
        updated = {
          Number: 25,
          ack_count: 24,
          IAT: 0.035,
          Srate: 40.0,
          syn_count: 1,
          AVG: 820.0,
          HTTPS: 1,
          ack_flag_number: 1,
          syn_flag_number: 0,
          "Tot size": 20500.0,
        };
        setActivePresetName("Smart Camera Streaming (Safe)");
      } else if (presetKey === "ddos") {
        updated = {
          Number: 260,
          ack_count: 0,
          IAT: 0.0004,
          Srate: 2200.0,
          syn_count: 220,
          AVG: 64.0,
          HTTPS: 0,
          ack_flag_number: 0,
          syn_flag_number: 1,
          "Tot size": 16640.0,
        };
        setActivePresetName("High-Rate DDoS SYN Flood (Attack)");
      } else if (presetKey === "recon") {
        updated = {
          Number: 35,
          ack_count: 0,
          IAT: 0.015,
          Srate: 85.0,
          syn_count: 32,
          AVG: 44.0,
          HTTPS: 0,
          ack_flag_number: 0,
          syn_flag_number: 1,
          "Tot size": 1540.0,
        };
        setActivePresetName("Stealth TCP Port Scan (Attack)");
      } else if (presetKey === "mirai") {
        updated = {
          Number: 110,
          ack_count: 5,
          IAT: 0.002,
          Srate: 850.0,
          syn_count: 85,
          AVG: 72.0,
          HTTPS: 0,
          ack_flag_number: 0,
          syn_flag_number: 1,
          "Tot size": 7920.0,
        };
        setActivePresetName("Mirai Botnet Telnet Flood (Attack)");
      } else if (presetKey === "ssh") {
        updated = {
          Number: 45,
          ack_count: 2,
          IAT: 0.006,
          Srate: 310.0,
          syn_count: 24,
          AVG: 98.0,
          HTTPS: 0,
          ack_flag_number: 0,
          syn_flag_number: 1,
          "Tot size": 4410.0,
        };
        setActivePresetName("SSH Credential Brute Force (Attack)");
      }
    } else {
      // Multiclass 10 features
      if (presetKey === "benign") {
        updated = {
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
        };
        setActivePresetName("Normal Web Browsing (Safe)");
      } else if (presetKey === "cam") {
        updated = {
          Rate: 45.0,
          syn_count: 1,
          ack_count: 24,
          AVG: 820.0,
          Number: 25,
          "Tot sum": 20500.0,
          syn_flag_number: 0,
          Drate: 5.0,
          Variance: 120.0,
          IAT: 0.035,
        };
        setActivePresetName("Smart Camera Streaming (Safe)");
      } else if (presetKey === "ddos") {
        updated = {
          Rate: 2500.0,
          syn_count: 220,
          ack_count: 0,
          AVG: 64.0,
          Number: 260,
          "Tot sum": 16640.0,
          syn_flag_number: 1,
          Drate: 0.0,
          Variance: 12.0,
          IAT: 0.0004,
        };
        setActivePresetName("High-Rate DDoS SYN Flood (Attack)");
      } else if (presetKey === "recon") {
        updated = {
          Rate: 85.0,
          syn_count: 32,
          ack_count: 0,
          AVG: 44.0,
          Number: 35,
          "Tot sum": 1540.0,
          syn_flag_number: 1,
          Drate: 0.0,
          Variance: 4.0,
          IAT: 0.015,
        };
        setActivePresetName("Stealth TCP Port Scan (Attack)");
      } else if (presetKey === "mirai") {
        updated = {
          Rate: 850.0,
          syn_count: 85,
          ack_count: 5,
          AVG: 72.0,
          Number: 110,
          "Tot sum": 7920.0,
          syn_flag_number: 1,
          Drate: 45.0,
          Variance: 18.0,
          IAT: 0.002,
        };
        setActivePresetName("Mirai Botnet Telnet Flood (Attack)");
      } else if (presetKey === "ssh") {
        updated = {
          Rate: 310.0,
          syn_count: 24,
          ack_count: 2,
          AVG: 98.0,
          Number: 45,
          "Tot sum": 4410.0,
          syn_flag_number: 1,
          Drate: 12.0,
          Variance: 35.0,
          IAT: 0.006,
        };
        setActivePresetName("SSH Credential Brute Force (Attack)");
      }
    }

    setManualInputs(updated);
    setValidationError(null);
  };

  // Run Classification on 10 features
  const handleClassify = () => {
    setLoading(true);
    setValidationError(null);

    const t0 = performance.now();
    try {
      if (!engineData) {
        throw new Error("Edge inference rules loading... please wait.");
      }

      const activeTree =
        task === "binary"
          ? engineData.binary_tree_raw
          : engineData.multiclass_tree_raw;

      const evalRes = evaluateTree(activeTree, manualInputs);
      const latencyMs = Math.max(0.12, performance.now() - t0);

      const rawPred = evalRes.prediction;
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

      // Risk level profiling
      let risk: "CRITICAL" | "HIGH" | "ELEVATED" | "SAFE" = "SAFE";
      let desc = "Flow parameters strictly conform to standard IoT telemetry. Packet rate and flag ratios are normal.";
      let advice = "No action required. Traffic authenticated as legitimate IoT node transmission.";

      if (isAttack) {
        if (finalLabel === "DDoS" || finalLabel === "DoS" || finalLabel === "Attack Traffic") {
          risk = "CRITICAL";
          desc = `Volumetric flood anomaly detected! Packet rate (${manualInputs["Rate"] || manualInputs["Srate"] || 0} pkts/s) exceeds edge threshold with abnormal SYN/ACK ratio.`;
          advice = "Trigger rate-limiting ACL on ingress edge switch. Drop suspicious flow 5-tuple immediately.";
        } else if (finalLabel === "Mirai" || finalLabel === "Brute Force") {
          risk = "HIGH";
          desc = `Unauthorized credential probing / botnet signature detected across monitored flow attributes.`;
          advice = "Block device MAC address and initiate credential rotation on IoT gateway.";
        } else {
          risk = "ELEVATED";
          desc = `Reconnaissance scanning pattern detected (${manualInputs["syn_count"] || 0} unacknowledged probes).`;
          advice = "Flag source IP for observation and enable strict port-scanning drop policy.";
        }
      }

      const verdictPayload = {
        prediction: finalLabel,
        isAttack,
        confidence: Number(evalRes.confidence.toFixed(1)),
        latencyMs: Number(latencyMs.toFixed(3)),
        riskLevel: risk,
        description: desc,
        actionAdvice: advice,
        flowKeySummary: `K=10 Features | Pkts: ${manualInputs["Number"] || 0} | SYNs: ${manualInputs["syn_count"] || 0} | ACKs: ${manualInputs["ack_count"] || 0} | AVG: ${manualInputs["AVG"] || 0} B`,
      };

      setLiveVerdict(verdictPayload);
      setModalResult(verdictPayload);
      setShowModal(true);

      // Play Sound
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
            ? engineData?.binary_tree_raw
            : engineData?.multiclass_tree_raw;

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
            featuresSample: `Rate=${rowObj["Rate"] || rowObj["Srate"] || 0}, syn=${rowObj["syn_count"] || 0}, AVG=${rowObj["AVG"] || 0}`,
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
      {/* 1. Main Live Simulator Card */}
      <div className="bg-surface border-2 border-blue/40 hover:border-blue rounded-2xl p-5 md:p-6 shadow-sm transition-all overflow-hidden">
        {/* Card Header with prominent controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b-2 border-blue/20 gap-3">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-blue animate-pulse shrink-0"></span>
              <h3 className="text-base font-bold text-ink">Edge Threat Detection Simulator</h3>
              <span className="px-2.5 py-0.5 rounded-full bg-blue/10 border-2 border-blue/30 text-blue font-black text-[11px] tracking-wide flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-blue" />
                K=10 Features
              </span>
            </div>
            <p className="text-xs text-muted mt-1 font-medium">
              Tested on the top 10 Mutual Information ranked features for resource-constrained IoT nodes.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0">
            {/* Audio Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`px-3 py-1.5 rounded-xl border-2 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                soundEnabled
                  ? "bg-blue/10 border-blue text-blue shadow-xs"
                  : "bg-canvas border-border text-muted"
              }`}
              title={soundEnabled ? "Audio Alarm Siren is ON" : "Audio Muted"}
            >
              {soundEnabled ? (
                <>
                  <Volume2 className="w-4 h-4 text-blue animate-bounce" />
                  <span>Siren Alert ON</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4 text-muted" />
                  <span>Siren Muted</span>
                </>
              )}
            </button>

            {/* Mode Tabs */}
            <div className="flex items-center gap-1 bg-canvas p-1 rounded-xl border-2 border-blue/30 text-xs font-bold">
              <button
                onClick={() => setActiveTab("manual")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === "manual" ? "bg-blue text-white shadow-xs font-bold" : "text-muted hover:text-ink"
                }`}
              >
                10-Feature Flow
              </button>
              <button
                onClick={() => setActiveTab("csv")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === "csv" ? "bg-blue text-white shadow-xs font-bold" : "text-muted hover:text-ink"
                }`}
              >
                Batch CSV
              </button>
            </div>
          </div>
        </div>

        {/* Validation Errors */}
        {validationError && (
          <div className="mt-4 p-3.5 rounded-xl bg-danger/10 border-2 border-danger text-danger text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span className="font-semibold">{validationError}</span>
          </div>
        )}

        {/* Active Verdict Status Card (Permanently Visible on Page) */}
        <div
          className={`mt-5 p-4 rounded-xl border-2 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
            liveVerdict.isAttack
              ? "bg-danger/10 border-danger text-ink shadow-sm"
              : "bg-positive/10 border-positive text-ink shadow-sm"
          }`}
        >
          <div className="flex items-start sm:items-center gap-3.5">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border-2 ${
                liveVerdict.isAttack
                  ? "bg-danger text-white border-danger animate-pulse"
                  : "bg-positive text-white border-positive"
              }`}
            >
              {liveVerdict.isAttack ? (
                <ShieldAlert className="w-6 h-6 text-white" />
              ) : (
                <ShieldCheck className="w-6 h-6 text-white" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-black px-2 py-0.5 rounded text-white ${
                    liveVerdict.isAttack ? "bg-danger" : "bg-positive"
                  }`}
                >
                  {liveVerdict.riskLevel}
                </span>
                <span className="text-xs font-bold text-muted">
                  Active Scenario: <strong className="text-ink">{activePresetName}</strong>
                </span>
              </div>
              <h4 className="text-base font-black text-ink mt-0.5">
                {liveVerdict.isAttack
                  ? `🚨 THREAT DETECTED: ${liveVerdict.prediction.toUpperCase()}`
                  : "🛡️ TRAFFIC VERIFIED: 100% SAFE (BENIGN)"}
              </h4>
              <p className="text-xs text-muted mt-0.5 font-medium">{liveVerdict.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-auto shrink-0 flex-wrap">
            <div className="text-right mr-1">
              <span className="text-[10px] text-muted font-bold block uppercase tracking-wider">Edge Inference</span>
              <span className="text-xs font-mono font-bold text-ink">
                {liveVerdict.latencyMs} ms &bull; {liveVerdict.confidence}% Conf
              </span>
            </div>
            {onOpenAiAssistant && (
              <button
                onClick={() => onOpenAiAssistant({ ...liveVerdict, inputs: manualInputs })}
                className="px-3.5 py-2 rounded-xl bg-blue/10 border-2 border-blue/40 text-blue hover:bg-blue hover:text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                title="Explain this flow in simple human language with Sentinel AI"
              >
                <Bot className="w-4 h-4 text-blue" />
                <span>Explain with AI</span>
              </button>
            )}
            <button
              onClick={() => {
                setModalResult(liveVerdict);
                setShowModal(true);
                if (soundEnabled) playIdsSound(liveVerdict.isAttack);
              }}
              className="px-3.5 py-2 rounded-xl bg-surface border-2 border-blue text-blue hover:bg-blue hover:text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <span>View Alert Modal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Tab 1: Interactive Manual Flow Testing */}
        {activeTab === "manual" && (
          <div className="mt-5 space-y-5">
            {/* 6 Quick Scenario Presets */}
            <div className="p-4 rounded-xl bg-blue/5 border-2 border-blue/30 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-ink uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-blue" />
                  Quick Test Scenarios (1-Click Evaluation)
                </span>
                <button
                  onClick={() => applyPreset("benign")}
                  className="text-xs text-blue hover:underline flex items-center gap-1 font-bold cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  Reset to Safe Baseline
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-1">
                <button
                  onClick={() => applyPreset("benign")}
                  className="p-2.5 rounded-xl border-2 border-positive/50 bg-positive/10 hover:bg-positive/20 text-positive text-xs font-bold transition-all text-left flex flex-col gap-0.5 cursor-pointer shadow-xs"
                >
                  <span>🟢 Normal Web</span>
                  <span className="text-[10px] text-muted font-medium">Safe HTTPS</span>
                </button>
                <button
                  onClick={() => applyPreset("cam")}
                  className="p-2.5 rounded-xl border-2 border-positive/50 bg-positive/10 hover:bg-positive/20 text-positive text-xs font-bold transition-all text-left flex flex-col gap-0.5 cursor-pointer shadow-xs"
                >
                  <span>🟢 Smart Cam</span>
                  <span className="text-[10px] text-muted font-medium">Safe Video Feed</span>
                </button>
                <button
                  onClick={() => applyPreset("ddos")}
                  className="p-2.5 rounded-xl border-2 border-danger/50 bg-danger/10 hover:bg-danger/20 text-danger text-xs font-bold transition-all text-left flex flex-col gap-0.5 cursor-pointer shadow-xs"
                >
                  <span>🔴 DDoS Flood</span>
                  <span className="text-[10px] text-muted font-medium">2,500 pkts/s</span>
                </button>
                <button
                  onClick={() => applyPreset("recon")}
                  className="p-2.5 rounded-xl border-2 border-warning/50 bg-warning/10 hover:bg-warning/20 text-warning text-xs font-bold transition-all text-left flex flex-col gap-0.5 cursor-pointer shadow-xs"
                >
                  <span>🟡 TCP Port Scan</span>
                  <span className="text-[10px] text-muted font-medium">SYN Sweep</span>
                </button>
                <button
                  onClick={() => applyPreset("mirai")}
                  className="p-2.5 rounded-xl border-2 border-indigo/50 bg-indigo/10 hover:bg-indigo/20 text-indigo text-xs font-bold transition-all text-left flex flex-col gap-0.5 cursor-pointer shadow-xs"
                >
                  <span>🟣 Mirai Probe</span>
                  <span className="text-[10px] text-muted font-medium">Botnet Telemetry</span>
                </button>
                <button
                  onClick={() => applyPreset("ssh")}
                  className="p-2.5 rounded-xl border-2 border-danger/50 bg-danger/10 hover:bg-danger/20 text-danger text-xs font-bold transition-all text-left flex flex-col gap-0.5 cursor-pointer shadow-xs"
                >
                  <span>🔴 SSH Spray</span>
                  <span className="text-[10px] text-muted font-medium">Brute Force</span>
                </button>
              </div>
            </div>

            {/* Exactly 10 Parameter Input Cards */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-blue" />
                  Monitored Feature Attributes (Exactly 10 Inputs)
                </span>
                <span className="text-[11px] text-blue font-bold bg-blue/10 px-2 py-0.5 rounded border border-blue/30">
                  K=10 Feature Budget
                </span>
              </div>

              {/* Clean 2-Row / 5-Column Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {activeFeatures.map((feat: string, idx: number) => {
                  const val = manualInputs[feat] !== undefined ? manualInputs[feat] : 0;
                  const meta = featureMeta[feat] || {
                    label: feat,
                    unit: "num",
                    desc: "Feature parameter",
                  };

                  return (
                    <div
                      key={feat}
                      className="p-3 rounded-xl bg-blue/5 border-2 border-blue/25 hover:border-blue transition-all space-y-1.5 overflow-hidden flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="w-5 h-5 rounded-full bg-blue text-white text-[10px] font-black flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <span className="text-[10px] font-mono font-bold text-muted uppercase px-1.5 py-0.5 rounded bg-white/70 border border-border">
                            {meta.unit}
                          </span>
                        </div>
                        <label
                          className="text-xs font-black text-ink block truncate mt-1.5"
                          title={meta.label}
                        >
                          {feat}
                        </label>
                        <p className="text-[10px] text-muted truncate">{meta.label}</p>
                      </div>

                      <input
                        type="number"
                        step="any"
                        value={val}
                        onChange={(e) => {
                          const parsed = parseFloat(e.target.value);
                          setManualInputs({
                            ...manualInputs,
                            [feat]: isNaN(parsed) ? 0 : parsed,
                          });
                          setActivePresetName("Custom Modified Parameters");
                        }}
                        className="w-full text-xs font-mono font-black px-2.5 py-1.5 rounded-lg border-2 border-blue/30 bg-white text-ink focus:outline-none focus:border-blue transition-all mt-1"
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t-2 border-blue/20">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleClassify}
                  disabled={loading}
                  className="px-6 py-3 rounded-xl bg-blue hover:bg-indigo text-white text-xs font-black transition-all shadow-md flex items-center justify-center gap-2 border-2 border-blue cursor-pointer"
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4 fill-white" />
                  )}
                  <span>Classify Flow Sample (Run IDS)</span>
                </button>

                <button
                  onClick={() => applyPreset("benign")}
                  className="px-4 py-3 rounded-xl bg-surface border-2 border-blue/30 hover:border-blue text-ink text-xs font-bold transition-all cursor-pointer shadow-xs"
                >
                  Reset Form
                </button>
              </div>

              <span className="text-xs text-muted font-medium">
                ⚡ Evaluated on 10 edge features in &lt;1 ms with siren alarm.
              </span>
            </div>
          </div>
        )}

        {/* Tab 2: Upload CSV */}
        {activeTab === "csv" && (
          <div className="mt-5 space-y-4">
            <div className="border-2 border-dashed border-blue/50 rounded-2xl p-8 text-center bg-blue/5 hover:bg-blue/10 transition-all overflow-hidden">
              <FileSpreadsheet className="w-10 h-10 text-blue mx-auto mb-2" />
              <h4 className="text-sm font-bold text-ink">Upload 10-Feature Flow CSV</h4>
              <p className="text-xs text-muted mt-1 max-w-md mx-auto">
                Batch flows are parsed and evaluated locally row-by-row on your device with 0 network latency.
              </p>

              <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                <label className="cursor-pointer px-4 py-2.5 rounded-xl bg-blue text-white text-xs font-bold hover:bg-indigo transition-all shadow-md border-2 border-blue">
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
                  className="px-4 py-2.5 rounded-xl border-2 border-blue/40 bg-surface text-blue text-xs font-bold hover:bg-blue/10 transition-all flex items-center gap-1.5 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Sample K=10 CSV</span>
                </a>
              </div>
            </div>

            {/* Batch Table */}
            {csvResults.length > 0 && (
              <div className="mt-4 border-2 border-blue/30 rounded-2xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[560px] text-left text-xs border-collapse">
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
              </div>
            )}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* POPUP ALERT MODAL (Triggered immediately upon clicking Classify)           */}
      {/* ========================================================================= */}
      {showModal && modalResult && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-navy-dark/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className={`relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border-4 transition-all overflow-hidden ${
              modalResult.isAttack
                ? "border-danger shadow-danger/30"
                : "border-positive shadow-positive/30"
            }`}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-xl bg-canvas hover:bg-border text-muted hover:text-ink transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header Icon + Title */}
            <div className="flex items-start gap-4 mb-4">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border-2 ${
                  modalResult.isAttack
                    ? "bg-danger text-white border-danger animate-pulse"
                    : "bg-positive text-white border-positive"
                }`}
              >
                {modalResult.isAttack ? (
                  <ShieldAlert className="w-8 h-8 text-white" />
                ) : (
                  <ShieldCheck className="w-8 h-8 text-white" />
                )}
              </div>

              <div>
                <span
                  className={`text-[10px] font-black px-2.5 py-0.5 rounded text-white ${
                    modalResult.riskLevel === "CRITICAL"
                      ? "bg-danger"
                      : modalResult.riskLevel === "HIGH"
                      ? "bg-danger/90"
                      : modalResult.riskLevel === "ELEVATED"
                      ? "bg-warning"
                      : "bg-positive"
                  }`}
                >
                  RISK: {modalResult.riskLevel}
                </span>

                <h3 className="text-xl font-black text-ink mt-1">
                  {modalResult.isAttack
                    ? `🚨 INTRUSION DETECTED: ${modalResult.prediction.toUpperCase()}`
                    : "🛡️ SAFE: 100% NORMAL BENIGN TRAFFIC"}
                </h3>

                <p className="text-xs text-muted mt-0.5 font-medium">
                  Evaluated on 10 features in <strong className="text-ink">{modalResult.latencyMs} ms</strong> with{" "}
                  <strong className="text-ink">{modalResult.confidence}% confidence</strong>.
                </p>
              </div>
            </div>

            {/* Body Assessment Box */}
            <div
              className={`p-4 rounded-2xl border-2 mb-4 space-y-2 ${
                modalResult.isAttack
                  ? "bg-danger/10 border-danger/40 text-ink"
                  : "bg-positive/10 border-positive/40 text-ink"
              }`}
            >
              <div className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5" />
                <span>Behavioral Assessment</span>
              </div>
              <p className="text-xs leading-relaxed font-medium">{modalResult.description}</p>
              <div className="pt-1 text-[11px] font-mono text-muted">
                {modalResult.flowKeySummary}
              </div>
            </div>

            {/* Sentinel AI Human Language Breakdown */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue/10 via-indigo/10 to-blue/5 border-2 border-blue/30 mb-4 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-ink uppercase tracking-wider flex items-center gap-1.5">
                  <Bot className="w-4 h-4 text-blue" />
                  Sentinel AI (Human Language Breakdown):
                </span>
                <span className="text-[10px] font-black text-blue bg-blue/15 px-2 py-0.5 rounded border border-blue/30">
                  Aasan Bhasha
                </span>
              </div>
              <p className="text-xs text-ink font-semibold leading-relaxed">
                {modalResult.isAttack
                  ? `Bhai dekho: ${modalResult.prediction} attack detect hua hai! Attacker flow me abnormal packets bhej kar connection buffers ko jam karne ki koshish kar raha hai. Turant edge switch par rate-limiting lagao aur IP block karo.`
                  : `Bhai tension mat lo: Yeh flow 100% SAFE hai! Standard IoT device telemetry hai jisme packet rate normal hai aur SYN ke badle ACK barabar mil rahe hain.`}
              </p>
            </div>

            {/* Action Advice Box */}
            <div className="p-3.5 rounded-2xl bg-canvas border-2 border-border mb-5">
              <span className="text-[11px] font-black text-ink uppercase tracking-wider block mb-1">
                Recommended Defensive Action:
              </span>
              <p className="text-xs text-muted leading-relaxed font-medium">
                {modalResult.actionAdvice}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 flex-wrap">
              <button
                onClick={() => {
                  if (soundEnabled) playIdsSound(modalResult.isAttack);
                }}
                className="px-3.5 py-2 rounded-xl border-2 border-border bg-canvas text-ink text-xs font-bold hover:bg-border transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Volume2 className="w-3.5 h-3.5 text-blue" />
                <span>Replay Siren</span>
              </button>

              {onOpenAiAssistant && (
                <button
                  onClick={() => {
                    setShowModal(false);
                    onOpenAiAssistant({ ...modalResult, inputs: manualInputs });
                  }}
                  className="px-4 py-2 rounded-xl bg-blue/10 border-2 border-blue text-blue hover:bg-blue hover:text-white text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>Chat with AI</span>
                </button>
              )}

              <button
                onClick={() => setShowModal(false)}
                className={`px-5 py-2 rounded-xl text-white text-xs font-black transition-all shadow-md cursor-pointer ${
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
