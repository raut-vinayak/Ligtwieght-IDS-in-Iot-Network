"use client";

import React, { useState } from "react";
import {
  Bot,
  Send,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Activity,
  Terminal,
  MessageSquare,
  Sparkles,
  Layers,
  ArrowRight,
  RotateCcw,
} from "lucide-react";

interface AiAssistantProps {
  currentFlow?: {
    prediction: string;
    isAttack: boolean;
    confidence: number;
    latencyMs: number;
    riskLevel: string;
    description: string;
    inputs: Record<string, number>;
  };
}

export default function AiAssistant({ currentFlow }: AiAssistantProps) {
  const [language, setLanguage] = useState<"hinglish" | "english">("hinglish");
  const [inputQuestion, setInputQuestion] = useState("");
  const [messages, setMessages] = useState<
    { sender: "user" | "ai"; text: string; time: string }[]
  >([
    {
      sender: "ai",
      text:
        "Main Sentinel AI hoon, aapka IoT Security Analyst. Dashboard par kisi bhi threat, anomalous network flow, ya firewall mitigation ke baare me simple human language me pooch sakte hain.",
      time: "Just now",
    },
  ]);

  const activePred = currentFlow?.prediction || "Benign Traffic";
  const isAttack = currentFlow?.isAttack || false;
  const rate = currentFlow?.inputs?.["Rate"] || currentFlow?.inputs?.["Srate"] || 22;
  const syns = currentFlow?.inputs?.["syn_count"] || 2;
  const acks = currentFlow?.inputs?.["ack_count"] || 14;
  const avgSize = currentFlow?.inputs?.["AVG"] || 140;

  // Generate plain human language breakdown for current alert
  const getHumanExplanation = () => {
    if (language === "hinglish") {
      if (isAttack) {
        if (activePred.includes("DDoS") || activePred.includes("DoS") || activePred.includes("Attack")) {
          return {
            title: "Volumetric SYN Flood Intrusion (DDoS)",
            summary: `Network telemetry par achanak ${rate} packets/sec ka massive burst detect hua hai, jisme ${syns} unacknowledged connection requests (SYNs) aayi hain aur 0 ACKs record huye. Yeh pattern target gateway ke connection pool ko exhaust karke drop karane ke liye bheja gaya hai.`,
            impact: "Edge router aur IoT devices ke memory buffers choke ho jayenge, jisse legitimate sensor data drop ho jayega.",
            action: "Ingress switch par SYN rate-limiting enforce karein aur offending source IP ko firewall drop-table me add karein.",
          };
        } else if (activePred.includes("Mirai") || activePred.includes("Brute") || activePred.includes("SSH")) {
          return {
            title: "Automated Botnet Probe / Credential Scan",
            summary: `Monitored device ke open management ports (Port 22/23) par rapid credential guessing attempts detect huye hain. Average packet payload ${avgSize} bytes ka hai jo standard Mirai scanner fingerprints se match hota hai.`,
            impact: "Default passwords exploit hone par device botnet zombie ban kar unauthorized traffic forward karne lagega.",
            action: "Default telnet/ssh ports ko external internet se isolate karein aur immediate device password rotation enforce karein.",
          };
        } else {
          return {
            title: "Stealth Network Reconnaissance (Port Scan)",
            summary: `Source IP sequential ports ko touch karke open listeners find karne ki koshish kar raha hai (${syns} SYN probes). Yeh actual attack se pehle network topology mapping (reconnaissance) hai.`,
            impact: "Attacker vulnerable IoT ports identify karke targeted payload deliver karne ki taiyari kar raha hai.",
            action: "Source IP ko immediate surveillance watchlist me daalein aur aggressive port-scan drop policy activate karein.",
          };
        }
      } else {
        return {
          title: "Verified Legitimate IoT Telemetry (Benign)",
          summary: `Flow parameters normal IoT communication standards ke mutabiq hain. Packet rate sirf ${rate} pkts/s hai aur valid ACKs (${acks} packets) barabar exchange ho rahe hain. Koi anomalous burst ya malformed flag present nahi hai.`,
          impact: "Network health perfectly stable hai. Latency sub-millisecond range me bani hui hai.",
          action: "Kisi manual intervention ki zaroorat nahi hai. Automatic policy baseline update jaari hai.",
        };
      }
    } else {
      // English
      if (isAttack) {
        return {
          title: `Malicious Intrusion Pattern (${activePred})`,
          summary: `The decision tree identified an anomalous packet burst of ${rate} pkts/sec with ${syns} unacknowledged SYN packets. This pattern matches connection-table saturation and resource exhaustion attacks.`,
          impact: "Gateway state tables may overflow, causing packet loss and disconnection of legitimate IoT sensor streams.",
          action: "Enforce ingress SYN-flood rate limits at the edge switch and quarantine the source IP via firewall ACLs.",
        };
      } else {
        return {
          title: "Verified Legitimate Telemetry (Safe)",
          summary: `All 10 monitored edge features align with baseline sensor behavior. Packet arrival intervals and flag ratios indicate regular periodic telemetry transmission.`,
          impact: "Network parameters remain within nominal operating thresholds with sub-millisecond response latency.",
          action: "No defensive action required. Traffic is authenticated and forwarded normally.",
        };
      }
    }
  };

  const humanBreakdown = getHumanExplanation();

  // Answer user questions intelligently
  const handleAskQuestion = (questionText: string) => {
    if (!questionText.trim()) return;

    const userMsg = {
      sender: "user" as const,
      text: questionText,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    let aiReply = "";
    const qLower = questionText.toLowerCase();

    if (qLower.includes("simple") || qLower.includes("hinglish") || qLower.includes("samjhao") || qLower.includes("kya hai")) {
      aiReply =
        "Aasan bhasha me: IDS aapke IoT network ka digital firewall sensor hai. Normal time par jab temperature sensors ya cameras data bhejte hain, system unhe 'Safe' mark karta hai. Par jab koi attacker hajaron fake connection requests bhejta hai, toh model 0.2 millisecond ke andar alert trigger karta hai taaki router crash na ho.";
    } else if (qLower.includes("ddos") || qLower.includes("flood") || qLower.includes("syn")) {
      aiReply =
        `DDoS attack me attacker target device ko itne packets bhejta hai ki uska buffer full ho jaye. Is sample me Rate=${rate} pkts/s aur syn_count=${syns} normal baseline se 40x zyada hain aur ACK 0 hai, isliye model ne isko Critical Intrusion classify kiya.`;
    } else if (qLower.includes("action") || qLower.includes("mitigation") || qLower.includes("block") || qLower.includes("firewall")) {
      aiReply =
        "Top 3 Immediate Defense Steps:\n1. Edge firewall par SYN flood rate-limiting lagayein (e.g. iptables -A INPUT -p tcp --syn -m limit --limit 50/s -j ACCEPT).\n2. Offending source IP ko temporary 1-hour blocklist me daalein.\n3. Gateway par TCP keepalive aur connection timeout ko 30s par reduce karein taaki idle buffers release ho sakein.";
    } else if (qLower.includes("k=10") || qLower.includes("features") || qLower.includes("10 feature")) {
      aiReply =
        "Aapka model strictly 10 lightweight features par chalta hai: Rate, syn_count, ack_count, AVG, Number, Tot sum, syn_flag, Drate, Variance, aur IAT. Isse Raspberry Pi ya ESP32 jaise low-power chips par bhi bina delay ke detection ho jata hai.";
    } else if (qLower.includes("esp32") || qLower.includes("raspberry") || qLower.includes("hardware")) {
      aiReply =
        "Haan, Decision Tree model ka total footprint sirf 5.2 KB hai! Yeh ESP32 (520 KB SRAM) aur Raspberry Pi par easily fit ho jata hai aur single flow prediction me sirf 0.04 ms lagte hain.";
    } else {
      aiReply =
        language === "hinglish"
          ? `Current flow '${activePred}' classify hua hai with ${(currentFlow?.confidence || 100)}% confidence. Monitored rate ${rate} pkts/s hai. Kisi specific metric ya defense step ke baare me pooch sakte hain.`
          : `Current telemetry is classified as '${activePred}' with ${(currentFlow?.confidence || 100)}% confidence based on 10 edge feature attributes. Inquire about specific metrics or firewall rules as needed.`;
    }

    const aiMsg = {
      sender: "ai" as const,
      text: aiReply,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg, aiMsg]);
    setInputQuestion("");
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-[#0B0F19] border border-slate-800 rounded-2xl p-6 text-white shadow-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
              <Bot className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span className="text-xs font-mono font-medium text-slate-400 tracking-wider uppercase">
                  Sentinel AI Intelligence
                </span>
                <span className="text-slate-600 font-mono text-xs">•</span>
                <span className="text-xs font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20">
                  Telemetry Explainer
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mt-1">
                Security Analyst & Threat Diagnosis
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5 max-w-2xl">
                Translates complex edge telemetry and ML classification trees into plain, actionable human language.
              </p>
            </div>
          </div>

          {/* Language Switcher */}
          <div className="inline-flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs sm:text-sm self-start md:self-auto shrink-0 font-mono shadow-inner">
            <button
              onClick={() => setLanguage("hinglish")}
              className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                language === "hinglish"
                  ? "bg-slate-800 text-white shadow-sm font-semibold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Hinglish (Aasan Bhasha)
            </button>
            <button
              onClick={() => setLanguage("english")}
              className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                language === "english"
                  ? "bg-slate-800 text-white shadow-sm font-semibold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              English
            </button>
          </div>
        </div>
      </div>

      {/* 2. Active Flow Telemetry Breakdown */}
      <div className="bg-white border border-border rounded-2xl p-6 shadow-card space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border gap-2">
          <div className="flex items-center gap-2.5">
            <Activity className="w-5 h-5 text-blue" />
            <h4 className="text-base font-bold text-ink">Active Telemetry Diagnostic</h4>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-mono font-semibold px-2.5 py-1 rounded-md border shadow-xs ${
                isAttack
                  ? "bg-rose-100 text-rose-800 border-rose-200"
                  : "bg-emerald-100 text-emerald-800 border-emerald-200"
              }`}
            >
              {isAttack ? `THREAT: ${activePred.toUpperCase()}` : "CLEAN: BENIGN TELEMETRY"}
            </span>
            <span className="text-xs sm:text-sm text-slate-500 font-mono">K=10 Features</span>
          </div>
        </div>

        {/* Structured 3-Part Assessment Box */}
        <div className="space-y-3.5">
          {/* Section 1: Observation */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-xs font-mono font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Observation (Kya Hua):
            </div>
            <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
              {humanBreakdown.summary}
            </p>
          </div>

          {/* Section 2: Two-column grid (Impact + Defensive Action) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-xs font-mono font-semibold text-rose-700 uppercase tracking-wider mb-1.5">
                Hardware & Network Impact (Khatra):
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                {humanBreakdown.impact}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-xs font-mono font-semibold text-emerald-700 uppercase tracking-wider mb-1.5">
                Recommended Defense Action (Kya Karein):
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                {humanBreakdown.action}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Interactive Copilot Console */}
      <div className="bg-white border border-border rounded-2xl p-6 shadow-card space-y-5">
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <MessageSquare className="w-5 h-5 text-blue" />
            <h4 className="text-base font-bold text-ink">Interactive Security Copilot</h4>
          </div>
          <span className="text-xs font-mono text-slate-500">Client-Side Diagnostic Engine</span>
        </div>

        {/* Prompt Chips */}
        <div>
          <div className="text-xs font-mono font-semibold text-slate-500 uppercase tracking-wider mb-2.5">
            Suggested Queries (Click to Ask):
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              "Is alert ko simple aasan bhasha me samjhao",
              "Is attack ko block karne ke 3 steps kya hain?",
              "K=10 features me se konse parameters trigger huye?",
              "Is this flow safe for an ESP32 microcontroller?",
              "Decision Tree ne itni jaldi (<0.2 ms) kaise detect kiya?",
            ].map((q) => (
              <button
                key={q}
                onClick={() => handleAskQuestion(q)}
                className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs sm:text-sm font-mono transition-colors text-left cursor-pointer shadow-xs"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Message History */}
        <div className="p-4 sm:p-5 rounded-xl bg-slate-50/70 border border-slate-200 max-h-80 overflow-y-auto space-y-3.5">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${
                m.sender === "user" ? "items-end" : "items-start"
              }`}
            >
              <div className="text-xs font-mono text-slate-400 mb-1 px-1">
                {m.sender === "user" ? "Security Admin" : "Sentinel AI"} • {m.time}
              </div>
              <div
                className={`max-w-[85%] p-3.5 sm:p-4 rounded-xl text-xs sm:text-sm leading-relaxed ${
                  m.sender === "user"
                    ? "bg-slate-900 text-white font-medium"
                    : "bg-white text-slate-800 border border-slate-200 shadow-xs"
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
        </div>

        {/* Input Bar */}
        <div className="flex items-center gap-2.5 pt-1">
          <input
            type="text"
            value={inputQuestion}
            onChange={(e) => setInputQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAskQuestion(inputQuestion);
            }}
            placeholder={
              language === "hinglish"
                ? "Kuch bhi poochiye (e.g. 'is attack ko kaise prevent karein?')..."
                : "Ask Sentinel AI about this flow, features, or firewall rules..."
            }
            className="flex-1 text-xs sm:text-sm font-mono px-4 py-3 rounded-xl border border-slate-200 bg-white text-ink focus:outline-none focus:border-blue focus:ring-2 focus:ring-blue/20 transition-all shadow-xs"
          />
          <button
            onClick={() => handleAskQuestion(inputQuestion)}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold transition-colors shadow-sm border border-slate-900 cursor-pointer"
          >
            <span>Ask</span>
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
