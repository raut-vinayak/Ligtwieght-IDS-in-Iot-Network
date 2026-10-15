"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  Zap,
  Volume2,
  VolumeX,
  Upload,
  Play,
  RotateCcw,
  Sparkles,
  Info,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Bot,
  Sliders,
  X,
  SlidersHorizontal,
  ChevronRight,
  Activity,
  Layers,
} from "lucide-react";

interface PredictionDemoProps {
  task: "binary" | "multiclass";
  onOpenAiAssistant?: (flow: {
    prediction: string;
    isAttack: boolean;
    confidence: number;
    latencyMs: number;
    riskLevel: string;
    description: string;
    inputs: Record<string, number>;
  }) => void;
}

// Minimal Audio Synthesizer for Clean Telemetry Feedback
function playIdsSound(isAttack: boolean) {
  try {
    const AudioContext =
      window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    if (isAttack) {
      // Clean dual-tone security chime for intrusion detection
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = "sawtooth";
      osc2.type = "sine";
      osc1.frequency.setValueAtTime(660, ctx.currentTime);
      osc1.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.25);
      osc2.frequency.setValueAtTime(880, ctx.currentTime);
      osc2.frequency.exponentialRampToValueAtTime(550, ctx.currentTime + 0.25);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 0.32);
      osc2.stop(ctx.currentTime + 0.32);
    } else {
      // Gentle harmonic chime for verified safe telemetry
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08); // E5

      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.26);
    }
  } catch (e) {
    console.debug("Web Audio blocked or unavailable:", e);
  }
}

// Exact Recursive Decision Tree Evaluator
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
  const currentVal =
    typeof inputs[featureName] === "number" && !isNaN(inputs[featureName])
      ? inputs[featureName]
      : 0;
  if (currentVal <= node.threshold) {
    return evaluateTree(node.left, inputs);
  } else {
    return evaluateTree(node.right, inputs);
  }
}

// Feature Metadata (Labels, Units, Ranges)
const FEATURE_METADATA: Record<
  string,
  { label: string; unit: string; step: number; min: number; desc: string }
> = {
  Rate: { label: "Flow Rate", unit: "pkts/s", step: 5, min: 0, desc: "Total packet rate per second" },
  syn_count: { label: "SYN Count", unit: "pkts", step: 1, min: 0, desc: "TCP synchronization flags" },
  ack_count: { label: "ACK Count", unit: "pkts", step: 1, min: 0, desc: "TCP acknowledgement flags" },
  AVG: { label: "Avg Packet Size", unit: "bytes", step: 10, min: 0, desc: "Mean packet payload size" },
  Number: { label: "Packet Count", unit: "pkts", step: 1, min: 0, desc: "Packets recorded in flow" },
  "Tot sum": { label: "Total Volume", unit: "bytes", step: 100, min: 0, desc: "Sum of packet lengths" },
  syn_flag_number: { label: "SYN Flag Ratio", unit: "ratio", step: 0.1, min: 0, desc: "Ratio of SYN packets" },
  Drate: { label: "Destination Rate", unit: "pkts/s", step: 2, min: 0, desc: "Packets to destination/sec" },
  Variance: { label: "Size Variance", unit: "σ²", step: 5, min: 0, desc: "Packet length dispersion" },
  IAT: { label: "Inter-Arrival", unit: "sec", step: 0.005, min: 0, desc: "Time interval between packets" },
  Srate: { label: "Source Rate", unit: "pkts/s", step: 5, min: 0, desc: "Packets sent from source/sec" },
  HTTPS: { label: "TLS/HTTPS", unit: "flag", step: 1, min: 0, desc: "Encrypted traffic identifier" },
  ack_flag_number: { label: "ACK Flag Ratio", unit: "ratio", step: 0.1, min: 0, desc: "Ratio of ACK packets" },
  "Tot size": { label: "Total Payload", unit: "bytes", step: 100, min: 0, desc: "Aggregated flow byte size" },
};

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
  const [activePresetName, setActivePresetName] = useState<string>("Normal Sensor Telemetry");

  // Active Live Verdict on Page
  const [liveVerdict, setLiveVerdict] = useState<{
    prediction: string;
    isAttack: boolean;
    confidence: number;
    latencyMs: number;
    riskLevel: "CRITICAL" | "HIGH" | "ELEVATED" | "SAFE";
    description: string;
    actionAdvice: string;
    humanExplanationHinglish: string;
    flowKeySummary: string;
  }>({
    prediction: "Benign Traffic",
    isAttack: false,
    confidence: 100.0,
    latencyMs: 0.22,
    riskLevel: "SAFE",
    description: "Monitored flow features strictly conform to standard IoT edge telemetry. Rates, arrival intervals, and flag distributions match legitimate sensor baselines.",
    actionAdvice: "No defensive action required. Edge gateway permits uninterrupted flow forwarding.",
    humanExplanationHinglish: "Yeh flow completely SAFE hai. Packet rate aur intervals normal limits ke andar hain, aur SYN requests ke against valid ACKs barabar exchange ho rahe hain.",
    flowKeySummary: "10 Features Evaluated • Normal Sensor Baseline",
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
        setActivePresetName("Normal Telemetry");
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
        setActivePresetName("IP Camera Stream");
      } else if (presetKey === "ddos") {
        updated = {
          Number: 850,
          ack_count: 0,
          IAT: 0.0002,
          Srate: 4200.0,
          syn_count: 820,
          AVG: 54.0,
          HTTPS: 0,
          ack_flag_number: 0,
          syn_flag_number: 1,
          "Tot size": 45900.0,
        };
        setActivePresetName("DDoS SYN Flood");
      } else if (presetKey === "recon") {
        updated = {
          Number: 42,
          ack_count: 0,
          IAT: 0.012,
          Srate: 85.0,
          syn_count: 40,
          AVG: 48.0,
          HTTPS: 0,
          ack_flag_number: 0,
          syn_flag_number: 1,
          "Tot size": 2016.0,
        };
        setActivePresetName("Stealth Port Scan");
      } else if (presetKey === "mirai") {
        updated = {
          Number: 120,
          ack_count: 4,
          IAT: 0.0018,
          Srate: 750.0,
          syn_count: 95,
          AVG: 68.0,
          HTTPS: 0,
          ack_flag_number: 0,
          syn_flag_number: 1,
          "Tot size": 8160.0,
        };
        setActivePresetName("Mirai Telnet Probe");
      } else if (presetKey === "ssh") {
        updated = {
          Number: 65,
          ack_count: 3,
          IAT: 0.0045,
          Srate: 280.0,
          syn_count: 30,
          AVG: 92.0,
          HTTPS: 0,
          ack_flag_number: 0,
          syn_flag_number: 1,
          "Tot size": 5980.0,
        };
        setActivePresetName("SSH Brute Force");
      }
    } else {
      // Multiclass Top 10
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
        setActivePresetName("Normal Telemetry");
      } else if (presetKey === "cam") {
        updated = {
          Rate: 48.0,
          syn_count: 1,
          ack_count: 28,
          AVG: 950.0,
          Number: 32,
          "Tot sum": 30400.0,
          syn_flag_number: 0,
          Drate: 8.0,
          Variance: 120.0,
          IAT: 0.025,
        };
        setActivePresetName("IP Camera Stream");
      } else if (presetKey === "ddos") {
        updated = {
          Rate: 8450.0,
          syn_count: 980,
          ack_count: 0,
          AVG: 54.0,
          Number: 1020,
          "Tot sum": 55080.0,
          syn_flag_number: 1,
          Drate: 0.0,
          Variance: 12.0,
          IAT: 0.0004,
        };
        setActivePresetName("DDoS SYN Flood");
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
        setActivePresetName("Stealth Port Scan");
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
        setActivePresetName("Mirai Telnet Probe");
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
        setActivePresetName("SSH Brute Force");
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
        throw new Error("Inference engine loading. Please try in a moment.");
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
      let desc = "Flow parameters conform to standard IoT telemetry. Packet rates and flag ratios match legitimate sensor communication.";
      let advice = "No action required. Flow signature verified as legitimate IoT traffic.";
      let hinglishExplanation = "Yeh flow completely SAFE hai. Packet rates aur interval timings baseline standards ke mutabiq hain.";

      if (isAttack) {
        if (finalLabel.includes("DDoS") || finalLabel.includes("DoS") || finalLabel === "Attack Traffic") {
          risk = "CRITICAL";
          desc = `Volumetric flood anomaly detected. Packet arrival rate (${manualInputs["Rate"] || manualInputs["Srate"] || 0} pkts/s) severely exceeds baseline with 0 ACK acknowledgements.`;
          advice = "Enforce rate-limiting ACL on ingress edge switch. Drop offending 5-tuple immediately.";
          hinglishExplanation = `Critical Alert: DDoS SYN Flood detect hua hai! Attacker flow me abnormal packets (${manualInputs["Rate"] || manualInputs["Srate"] || 0} pkts/s) bhej kar device buffers ko exhaust kar raha hai. Edge switch par rate-limiting enforce karein.`;
        } else if (finalLabel.includes("Mirai") || finalLabel.includes("Brute") || finalLabel.includes("SSH")) {
          risk = "HIGH";
          desc = `Unauthorized credential probing / automated botnet scanning pattern identified across TCP attributes.`;
          advice = "Block device MAC address at edge switch and rotate management passwords.";
          hinglishExplanation = `High Risk: Botnet ya brute-force probe detect hua hai. Default IoT management ports (22/23) par scanning chal rahi hai. Internet-facing management ports turant disable karein.`;
        } else {
          risk = "ELEVATED";
          desc = `Stealth reconnaissance pattern detected (${manualInputs["syn_count"] || 0} unacknowledged probes).`;
          advice = "Quarantine source IP in gateway drop list and monitor surrounding subnet.";
          hinglishExplanation = `Elevated Risk: Network reconnaissance / port scan detect hua hai. Attacker open ports probe kar raha hai taaki vulnerability find kar sake. Is IP ko quarantine karein.`;
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
        humanExplanationHinglish: hinglishExplanation,
        flowKeySummary: `K=10 Features • Latency: ${Number(latencyMs.toFixed(3))} ms • Confidence: ${Number(evalRes.confidence.toFixed(1))}%`,
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

  const handleInputChange = (featureName: string, value: string) => {
    const num = parseFloat(value);
    setManualInputs((prev) => ({
      ...prev,
      [featureName]: isNaN(num) ? 0 : num,
    }));
  };

  // CSV Batch Upload Handler
  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setValidationError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.trim().split("\n");
        if (lines.length < 2) {
          throw new Error("CSV file must contain a header row and data rows.");
        }

        const headers = lines[0].split(",").map((h) => h.trim());
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
      {/* 1. Distinct In-Page Telemetry HUD Card (Clear Soft Tint & Shadow) */}
      <div
        className={`p-5 sm:p-6 rounded-2xl border-2 transition-all duration-300 ease-out shadow-sm hover:-translate-y-1 hover:shadow-xl ${
          liveVerdict.isAttack
            ? "border-rose-300 dark:border-rose-900/60 bg-rose-50/70 dark:bg-rose-950/25 hover:border-rose-400 dark:hover:border-rose-700"
            : "border-emerald-300 dark:border-emerald-900/60 bg-emerald-50/70 dark:bg-emerald-950/25 hover:border-emerald-400 dark:hover:border-emerald-700"
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Status Left */}
          <div className="flex items-start sm:items-center gap-4">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border shadow-xs ${
                liveVerdict.isAttack
                  ? "bg-rose-500 text-white border-rose-600"
                  : "bg-emerald-500 text-white border-emerald-600"
              }`}
            >
              {liveVerdict.isAttack ? (
                <ShieldAlert className="w-6 h-6 text-white" />
              ) : (
                <ShieldCheck className="w-6 h-6 text-white" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <span
                  className={`text-xs font-mono font-semibold px-2.5 py-0.5 rounded-md border shadow-xs ${
                    liveVerdict.riskLevel === "CRITICAL"
                      ? "bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-200 border-rose-200 dark:border-rose-800"
                      : liveVerdict.riskLevel === "HIGH"
                      ? "bg-rose-100/80 dark:bg-rose-950/80 text-rose-800 dark:text-rose-200 border-rose-200 dark:border-rose-800"
                      : liveVerdict.riskLevel === "ELEVATED"
                      ? "bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-800"
                      : "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800"
                  }`}
                >
                  STATUS: {liveVerdict.riskLevel}
                </span>

                <span className="text-slate-300 dark:text-slate-600">•</span>

                <span className="text-xs sm:text-sm font-mono text-slate-600 dark:text-slate-400">
                  Latency: <strong className="text-slate-900 dark:text-slate-100 font-semibold">{liveVerdict.latencyMs} ms</strong>
                </span>

                <span className="text-slate-300 dark:text-slate-600">•</span>

                <span className="text-xs sm:text-sm font-mono text-slate-600 dark:text-slate-400">
                  Confidence: <strong className="text-slate-900 dark:text-slate-100 font-semibold">{liveVerdict.confidence}%</strong>
                </span>
              </div>

              <h3 className="text-base sm:text-lg font-bold text-ink dark:text-white mt-1">
                {liveVerdict.isAttack ? (
                  <span className="text-rose-800 dark:text-rose-300">Threat Detected: {liveVerdict.prediction}</span>
                ) : (
                  <span className="text-emerald-800 dark:text-emerald-300">Clean Flow: {liveVerdict.prediction}</span>
                )}
              </h3>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 self-start md:self-auto shrink-0 flex-wrap">
            {onOpenAiAssistant && (
              <button
                onClick={() =>
                  onOpenAiAssistant({ ...liveVerdict, inputs: manualInputs })
                }
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs sm:text-sm font-medium transition-colors shadow-xs cursor-pointer"
              >
                <Bot className="w-4 h-4 text-blue dark:text-blue-400" />
                <span>Explain in Sentinel AI</span>
              </button>
            )}

            <button
              onClick={() => {
                setModalResult(liveVerdict);
                setShowModal(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 dark:bg-blue-600 text-white hover:bg-slate-800 dark:hover:bg-blue-500 text-xs sm:text-sm font-medium transition-colors shadow-sm cursor-pointer"
            >
              <Info className="w-4 h-4" />
              <span>View Incident Details</span>
            </button>
          </div>
        </div>

        {/* Human Language Summary Bar */}
        <div className="mt-4 pt-3.5 border-t border-slate-200/90 dark:border-slate-800 text-xs sm:text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2.5">
          <Bot className="w-4 h-4 text-blue dark:text-blue-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-slate-900 dark:text-white font-semibold">Sentinel AI Analysis: </strong>
            {liveVerdict.humanExplanationHinglish}
          </p>
        </div>
      </div>

      {/* 2. Main Edge Telemetry Matrix Card (With Crisp Dark Mode) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-blue-400/80 dark:hover:border-blue-500/80 hover:shadow-xl rounded-2xl p-6 shadow-sm transition-all duration-300 ease-out space-y-6">
        {/* Top Controls: Preset selector + Mode tabs + Audio toggle */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-4 border-b border-border dark:border-slate-800 gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-sm sm:text-base font-bold text-ink dark:text-white tracking-tight">
                Edge Flow Telemetry Matrix
              </span>
              <span className="px-2.5 py-0.5 rounded-md text-xs font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-semibold">
                K = 10 Features
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Deterministic inference evaluated directly against unscaled Decision Tree rules.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Audio Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-xl border text-xs sm:text-sm font-medium flex items-center gap-2 transition-colors cursor-pointer ${
                soundEnabled
                  ? "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 shadow-xs"
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500"
              }`}
              title={soundEnabled ? "Audio chime enabled" : "Audio muted"}
              aria-label="Toggle audio alarms"
            >
              {soundEnabled ? (
                <>
                  <Volume2 className="w-4 h-4 text-blue dark:text-blue-400" />
                  <span className="hidden sm:inline text-xs font-mono">Sound ON</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                  <span className="hidden sm:inline text-xs font-mono">Muted</span>
                </>
              )}
            </button>

            {/* Manual vs CSV Tab */}
            <div className="inline-flex bg-slate-100 dark:bg-slate-800/90 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm shadow-inner">
              <button
                onClick={() => setActiveTab("manual")}
                className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                  activeTab === "manual"
                    ? "bg-white dark:bg-slate-700 text-ink dark:text-white shadow-sm font-semibold"
                    : "text-slate-600 dark:text-slate-400 hover:text-ink dark:hover:text-white"
                }`}
              >
                Manual Flow
              </button>
              <button
                onClick={() => setActiveTab("csv")}
                className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                  activeTab === "csv"
                    ? "bg-white dark:bg-slate-700 text-ink dark:text-white shadow-sm font-semibold"
                    : "text-slate-600 dark:text-slate-400 hover:text-ink dark:hover:text-white"
                }`}
              >
                CSV Batch
              </button>
            </div>
          </div>
        </div>

        {/* Validation Errors */}
        {validationError && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span className="font-medium">{validationError}</span>
          </div>
        )}

        {/* Scenario Presets Bar */}
        {activeTab === "manual" && (
          <div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono mb-2.5">
              Test Presets (Click to Load):
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {[
                { key: "benign", label: "Baseline Normal" },
                { key: "cam", label: "Camera Stream" },
                { key: "ddos", label: "DDoS SYN Flood" },
                { key: "recon", label: "Port Recon" },
                { key: "mirai", label: "Mirai Probe" },
                { key: "ssh", label: "SSH Brute" },
              ].map((p) => {
                const isSelected = activePresetName.toLowerCase().includes(p.label.toLowerCase());
                return (
                  <button
                    key={p.key}
                    onClick={() => applyPreset(p.key as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all border shadow-xs cursor-pointer ${
                      isSelected
                        ? "bg-slate-900 dark:bg-blue-600 text-white border-slate-900 dark:border-blue-600 font-semibold"
                        : "bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 1: Manual 10-Feature Inputs (Distinct Interactive Cards) */}
        {activeTab === "manual" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {activeFeatures.map((feat) => {
                const meta = FEATURE_METADATA[feat] || {
                  label: feat,
                  unit: "val",
                  step: 1,
                  min: 0,
                  desc: feat,
                };
                const val = manualInputs[feat] !== undefined ? manualInputs[feat] : 0;

                return (
                  <div
                    key={feat}
                    className="p-3.5 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out flex flex-col justify-between group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <label
                        htmlFor={`input-${feat}`}
                        className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 truncate"
                        title={meta.desc}
                      >
                        {meta.label}
                      </label>
                      <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                        {meta.unit}
                      </span>
                    </div>

                    <div className="relative mt-1">
                      <input
                        id={`input-${feat}`}
                        type="number"
                        step={meta.step}
                        min={meta.min}
                        value={val}
                        onChange={(e) => handleInputChange(feat, e.target.value)}
                        className="w-full px-3 py-2 text-sm font-mono font-bold bg-slate-50/70 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:border-blue focus:ring-2 focus:ring-blue/20 transition-all"
                      />
                    </div>

                    <div className="mt-2 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 font-mono">
                      <span>{feat}</span>
                      <span>±{meta.step}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800 flex-wrap gap-3">
              <button
                onClick={() => {
                  setManualInputs(defaultBenignValues);
                  setActivePresetName("Normal Telemetry");
                }}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs sm:text-sm font-medium transition-colors shadow-xs cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset Defaults</span>
              </button>

              <button
                onClick={handleClassify}
                disabled={loading}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue dark:bg-blue-600 text-white hover:bg-blue/90 dark:hover:bg-blue-500 text-sm font-semibold transition-all shadow-sm border border-blue dark:border-blue-600 cursor-pointer disabled:opacity-50"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{loading ? "Evaluating Flow..." : "Classify Flow Sample"}</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Batch CSV Upload */}
        {activeTab === "csv" && (
          <div className="space-y-4">
            <div className="p-8 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl text-center bg-slate-50/60 dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
              <Upload className="w-10 h-10 text-slate-400 dark:text-slate-500 mx-auto mb-3" />
              <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Upload CSV File with 10 Monitored Features
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                Evaluates first 25 network flows through the lightweight decision tree engine in client-side memory.
              </p>
              <input
                type="file"
                accept=".csv"
                onChange={handleCsvUpload}
                className="mt-4 text-xs sm:text-sm text-slate-500 dark:text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-900 dark:file:bg-blue-600 file:text-white hover:file:bg-slate-800 dark:hover:file:bg-blue-500 cursor-pointer"
              />
            </div>

            {csvResults.length > 0 && (
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto shadow-xs">
                <table className="w-full text-xs sm:text-sm text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-600 dark:text-slate-300">
                    <tr>
                      <th className="px-4 py-3">Row #</th>
                      <th className="px-4 py-3">Feature Snapshot</th>
                      <th className="px-4 py-3">Verdict</th>
                      <th className="px-4 py-3">Confidence</th>
                      <th className="px-4 py-3">Latency</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                    {csvResults.map((r) => (
                      <tr key={r.rowIdx} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50">
                        <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{r.rowIdx}</td>
                        <td className="px-4 py-3 text-slate-800 dark:text-slate-200">{r.featuresSample}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-semibold ${
                              r.isAttack
                                ? "bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                                : "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                            }`}
                          >
                            {r.predicted}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{r.confidence}%</td>
                        <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{r.latencyMs} ms</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. Professional Incident Modal Dialog (Clear Elevation & Readable Text) */}
      {showModal && modalResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
            onClick={() => setShowModal(false)}
          />

          {/* Modal Container */}
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-float border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 z-10 space-y-4">
            {/* Header with Close */}
            <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border shadow-xs ${
                    modalResult.isAttack
                      ? "bg-rose-500 text-white border-rose-600"
                      : "bg-emerald-500 text-white border-emerald-600"
                  }`}
                >
                  {modalResult.isAttack ? (
                    <ShieldAlert className="w-6 h-6 text-white" />
                  ) : (
                    <ShieldCheck className="w-6 h-6 text-white" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-mono font-semibold px-2 py-0.5 rounded border shadow-xs ${
                        modalResult.riskLevel === "CRITICAL"
                          ? "bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-200 border-rose-200 dark:border-rose-800"
                          : modalResult.riskLevel === "HIGH"
                          ? "bg-rose-100/80 dark:bg-rose-950/80 text-rose-800 dark:text-rose-200 border-rose-200 dark:border-rose-800"
                          : modalResult.riskLevel === "ELEVATED"
                          ? "bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-800"
                          : "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800"
                      }`}
                    >
                      {modalResult.riskLevel}
                    </span>
                    <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                      {modalResult.latencyMs} ms • {modalResult.confidence}% confidence
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-ink dark:text-white mt-1">
                    {modalResult.isAttack
                      ? `Incident Alert: ${modalResult.prediction}`
                      : "Verified Clean Telemetry"}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Technical Behavior Assessment */}
            <div className="space-y-1.5">
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">
                Technical Behavior Assessment
              </div>
              <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 font-medium">
                {modalResult.description}
              </p>
            </div>

            {/* Sentinel AI Plain Language Diagnosis */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono flex items-center gap-2">
                  <Bot className="w-4 h-4 text-blue dark:text-blue-400" />
                  <span>Sentinel AI Diagnosis (Aasan Bhasha)</span>
                </span>
                <span className="text-xs font-mono text-blue dark:text-blue-400 font-semibold">
                  Plain Language
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 text-slate-800 dark:text-slate-200 text-xs sm:text-sm leading-relaxed font-medium">
                {modalResult.humanExplanationHinglish}
              </div>
            </div>

            {/* Recommended Defensive Protocol */}
            <div className="space-y-1.5">
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">
                Recommended Defense Action
              </div>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-xs">
                {modalResult.actionAdvice}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
              {onOpenAiAssistant && (
                <button
                  onClick={() => {
                    setShowModal(false);
                    onOpenAiAssistant({ ...modalResult, inputs: manualInputs });
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-blue dark:border-blue-500 text-blue dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-xs sm:text-sm font-medium transition-colors cursor-pointer"
                >
                  <Bot className="w-4 h-4" />
                  <span>Open in AI Assistant</span>
                </button>
              )}

              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-blue-600 text-white hover:bg-slate-800 dark:hover:bg-blue-500 text-xs sm:text-sm font-medium transition-colors shadow-sm cursor-pointer"
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
