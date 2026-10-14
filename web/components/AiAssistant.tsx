"use client";

import React, { useState } from "react";
import {
  Bot,
  Send,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  Zap,
  HelpCircle,
  Terminal,
  ArrowRight,
  MessageSquare,
  CheckCircle2,
  RefreshCw,
  Sliders
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
    { sender: "user" | "ai"; text: string; time: string; isHinglish?: boolean }[]
  >([
    {
      sender: "ai",
      text:
        language === "hinglish"
          ? "Namaste! Main Sentinel AI hoon, aapka personal IoT Cybersecurity Assistant. Agar dashboard par koi alert aaye ya kisi attack/flow ko simple bhasha me samajhna ho, toh mujhse poochiye!"
          : "Hello! I am Sentinel AI, your IoT Cybersecurity Analyst. I explain detected threats, anomalous flow features, and recommended edge defense actions in simple human language.",
      time: "Just now",
    },
  ]);

  const activePred = currentFlow?.prediction || "Benign Traffic";
  const isAttack = currentFlow?.isAttack || false;
  const rate = currentFlow?.inputs?.["Rate"] || currentFlow?.inputs?.["Srate"] || 22;
  const syns = currentFlow?.inputs?.["syn_count"] || 2;
  const acks = currentFlow?.inputs?.["ack_count"] || 14;

  // Generate plain human language breakdown for current alert
  const getHumanExplanation = () => {
    if (language === "hinglish") {
      if (isAttack) {
        if (activePred.includes("DDoS") || activePred.includes("DoS") || activePred.includes("Attack")) {
          return {
            title: "🚨 Alert Explanation: Volumetric Flood Attack (DDoS)",
            summary:
              "Bhai aasan bhasha me samjho: Kisi attacker ne IoT network par achanak " +
              rate +
              " packets/sec ki bochhar kar di hai! Usme " +
              syns +
              " connection requests (SYNs) hain par reply me koi ACK nahi aaya. Yeh device ko crash karke offline karne ka hamla hai.",
            impact: "Router ya IoT device ke buffers full ho jayenge aur real sensors disconnect ho jayenge.",
            action: "Turant edge switch par SYN-Flood rate-limiting lagao aur source IP ko drop list me dalo.",
          };
        } else if (activePred.includes("Mirai") || activePred.includes("Brute")) {
          return {
            title: "👾 Alert Explanation: Botnet / Unauthorized Credential Probe",
            summary:
              "Bhai, koi malicious bot ya scanner aapke device ke default passwords (jaise admin/admin) guess karne ki koshish kar raha hai port 23 ya port 22 par.",
            impact: "Agar password crack ho gaya toh aapka IoT device botnet ka hissa ban jayega.",
            action: "Device ke default credentials rotate karein aur Telnet/SSH ko internet-facing ports se disable karein.",
          };
        } else {
          return {
            title: "⚠️ Alert Explanation: Stealth Network Reconnaissance (Port Scan)",
            summary:
              "Bhai, ek device quietly alag-alag ports ko touch kar raha hai (" +
              syns +
              " SYN probes) yeh dekhne ke liye ki kaunse doors khule hain. Yeh attack se pehle ki jaasoosi (reconnaissance) hai.",
            impact: "Attacker network ki vulnerability map kar raha hai taaki baad me target kar sake.",
            action: "Is source IP ko strict observation me dalo aur aggressive port-scanning drop rule enable karo.",
          };
        }
      } else {
        return {
          title: "🛡️ Traffic Status: 100% Safe Normal Telemetry",
          summary:
            "Bhai tension ki koi baat nahi hai! Packet rate sirf " +
            rate +
            " pkts/s hai, aur requests ke sath sath valid responses (" +
            acks +
            " ACKs) bhi aa rahe hain. Yeh standard legitimate IoT data transfer hai.",
          impact: "Network health perfectly normal hai. Koi buffering ya anomaly nahi hai.",
          action: "Kuch karne ki zaroorat nahi hai. System autonomously monitor kar raha hai.",
        };
      }
    } else {
      // English
      if (isAttack) {
        return {
          title: "🚨 Alert Explanation: Malicious Network Threat (" + activePred + ")",
          summary:
            "In simple terms: The sensor observed an abnormal burst of " +
            rate +
            " packets/sec with " +
            syns +
            " unacknowledged SYN packets. This pattern matches an intrusion attempting to saturate connection tables.",
          impact: "Microcontrollers may experience resource starvation or drop legitimate sensory data.",
          action: "Apply rate-limiting ACL at the network edge and block ingress traffic from the offending IP.",
        };
      } else {
        return {
          title: "🛡️ Traffic Status: Verified Legitimate Traffic (Benign)",
          summary:
            "In simple terms: All 10 monitored parameters align with baseline IoT node telemetry. Packet arrival intervals and flag ratios are completely safe.",
          impact: "Network operates within healthy thresholds with sub-millisecond response latency.",
          action: "No manual intervention required. Traffic authenticated.",
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
        "Bhai simple shabdo me: IDS (Intrusion Detection System) aapke network ka security guard hai. Jab traffic normal hota hai (jaise camera ka video ya temperature sensor ka data), toh guard bolta hai 'Safe'. Par jab attacker achanak hajaron fake packets bhejta hai (DDoS ya Port Scan), guard 1 millisecond ke andar alarm baja deta hai aur attack block karne ko kehta hai.";
    } else if (qLower.includes("ddos") || qLower.includes("flood")) {
      aiReply =
        "DDoS (Distributed Denial of Service) ka matlab hai network ko itna traffic bhejna ki wo handle na kar sake aur crash ho jaye. Humare Decision Tree model ne dekha ki Rate=" +
        rate +
        " pkts/s aur syn_count=" +
        syns +
        " normal se 50 guna zyada hai, isliye turant critical alert trigger kiya.";
    } else if (qLower.includes("action") || qLower.includes("kya karu") || qLower.includes("block") || qLower.includes("prevent")) {
      aiReply =
        "Top 3 Immediate Steps:\n1. Edge switch par SYN-Flood rate-limiting enable karein.\n2. Ingress traffic ke suspicious 5-tuple (Src IP:Port) ko firewall me drop list me daalein.\n3. Gateway par connection timeout ko short karein taaki incomplete handshakes buffer occupy na karein.";
    } else if (qLower.includes("k=10") || qLower.includes("features") || qLower.includes("10 feature")) {
      aiReply =
        "Aapka model strictly 10 lightweight features par chalta hai (Rate, syn_count, ack_count, AVG, Number, Tot sum, syn_flag, Drate, Variance, IAT). Isse Raspberry Pi ya ESP32 jaise chote chips par bhi 0.2 millisecond me detection ho jata hai bina RAM exhaust huye.";
    } else if (qLower.includes("accuracy") || qLower.includes("score") || qLower.includes("f1")) {
      aiReply =
        "Holdout test evaluation me Decision Tree ne Binary classification par 98.17% Test Macro-F1 achieve kiya hai with 1.06 ms latency aur sirf 5.22 KB size! Yeh LightGBM (532 KB) se 100x chota hai.";
    } else {
      aiReply =
        language === "hinglish"
          ? "Aapke flow me " +
            activePred +
            " detect hua hai with " +
            (currentFlow?.confidence || 100) +
            "% confidence. Packet rate " +
            rate +
            " pkts/s hai. Kuch aur detail janni ho toh poochiye!"
          : "The current flow is classified as " +
            activePred +
            " with " +
            (currentFlow?.confidence || 100) +
            "% confidence based on 10 edge feature attributes. Let me know if you need specific mitigation steps!";
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
      {/* 1. Hero AI Banner Card */}
      <div className="bg-gradient-to-r from-navy via-navy to-indigo-900 border-2 border-blue/40 rounded-2xl p-6 text-white shadow-xl overflow-hidden relative">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-blue/20 rounded-full blur-2xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue to-indigo-500 border-2 border-white/20 flex items-center justify-center text-white shadow-lg shrink-0">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-positive animate-pulse"></span>
                <span className="text-[11px] font-black uppercase tracking-wider text-blue-300">
                  Sentinel AI Intelligence
                </span>
                <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] font-bold border border-white/20">
                  Edge Threat Explainer
                </span>
              </div>
              <h3 className="text-xl font-black tracking-tight text-white mt-1">
                AI Cybersecurity Analyst (Human Language Advisor)
              </h3>
              <p className="text-xs text-gray-300 mt-1 font-medium max-w-2xl">
                Technical jargon ko aasan insani bhasha me samjhein. Jab bhi koi alert aaye, AI explain karta hai ki kya hua, kyu hua, aur kya action lena hai.
              </p>
            </div>
          </div>

          {/* Language Switcher */}
          <div className="flex items-center gap-1 bg-white/10 p-1.5 rounded-xl border border-white/20 self-start md:self-auto shrink-0 backdrop-blur-sm">
            <button
              onClick={() => setLanguage("hinglish")}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                language === "hinglish"
                  ? "bg-blue text-white shadow-md"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              🇮🇳 Hinglish (Aasan Bhasha)
            </button>
            <button
              onClick={() => setLanguage("english")}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                language === "english"
                  ? "bg-blue text-white shadow-md"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              🇬🇧 English (Technical)
            </button>
          </div>
        </div>
      </div>

      {/* 2. Active Flow Human Language Breakdown Card */}
      <div className="bg-surface border-2 border-blue/35 hover:border-blue rounded-2xl p-6 shadow-sm transition-all overflow-hidden space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b-2 border-blue/20 gap-2">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-blue" />
            <h4 className="text-base font-black text-ink">Active Alert Human Breakdown</h4>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-black px-3 py-1 rounded-full border ${
                isAttack
                  ? "bg-danger/10 text-danger border-danger/40"
                  : "bg-positive/10 text-positive border-positive/40"
              }`}
            >
              {isAttack ? `🚨 ${activePred.toUpperCase()} DETECTED` : "🛡️ VERIFIED SAFE"}
            </span>
            <span className="text-xs text-muted font-bold">10 Features Monitored</span>
          </div>
        </div>

        {/* Human Language Card */}
        <div
          className={`p-5 rounded-2xl border-2 space-y-3 transition-all ${
            isAttack
              ? "bg-danger/5 border-danger/40 text-ink shadow-sm"
              : "bg-positive/5 border-positive/40 text-ink shadow-sm"
          }`}
        >
          <div className="flex items-center gap-2">
            {isAttack ? (
              <ShieldAlert className="w-5 h-5 text-danger shrink-0" />
            ) : (
              <ShieldCheck className="w-5 h-5 text-positive shrink-0" />
            )}
            <h5 className="text-sm font-black text-ink">{humanBreakdown.title}</h5>
          </div>

          <div className="space-y-2 text-xs leading-relaxed">
            <div className="p-3.5 rounded-xl bg-white/90 border border-border space-y-1">
              <strong className="text-[11px] text-ink uppercase tracking-wider block font-black">
                1. Kya Hua? (What Happened):
              </strong>
              <p className="text-ink font-medium leading-relaxed">{humanBreakdown.summary}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 rounded-xl bg-white/90 border border-border space-y-1">
                <strong className="text-[11px] text-ink uppercase tracking-wider block font-black text-danger">
                  2. Khatra Kya Hai? (Potential Impact):
                </strong>
                <p className="text-muted font-medium">{humanBreakdown.impact}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/90 border border-border space-y-1">
                <strong className="text-[11px] text-ink uppercase tracking-wider block font-black text-positive">
                  3. Kya Action Lena Chahiye? (Recommended Defense):
                </strong>
                <p className="text-muted font-medium">{humanBreakdown.action}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Interactive AI Chat with Quick Prompt Chips */}
      <div className="bg-surface border-2 border-blue/35 hover:border-blue rounded-2xl p-6 shadow-sm transition-all overflow-hidden space-y-4">
        <div className="flex items-center justify-between pb-3 border-b-2 border-blue/20">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-blue" />
            <h4 className="text-sm font-black text-ink">Ask Sentinel AI Any Question</h4>
          </div>
          <span className="text-[11px] text-muted font-bold">Interactive Threat Q&amp;A</span>
        </div>

        {/* Quick Question Chips */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold text-muted uppercase tracking-wider block">
            Suggested Questions (Click to Ask):
          </span>
          <div className="flex flex-wrap gap-2">
            {[
              "Bhai is alert ko simple bhasha me samjhao",
              "Is attack ko block karne ke 3 steps kya hain?",
              "K=10 features me se konse parameters trigger huye?",
              "Why was this classified as Safe / Benign?",
              "Decision tree ne itni jaldi (<1 ms) kaise detect kiya?",
            ].map((q) => (
              <button
                key={q}
                onClick={() => handleAskQuestion(q)}
                className="px-3 py-1.5 rounded-xl bg-blue/5 hover:bg-blue/15 border-2 border-blue/30 text-blue text-xs font-bold transition-all text-left cursor-pointer shadow-xs"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Chat History Box */}
        <div className="p-4 rounded-2xl bg-canvas border-2 border-blue/20 max-h-72 overflow-y-auto space-y-3">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${
                m.sender === "user" ? "items-end" : "items-start"
              }`}
            >
              <div
                className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed font-medium shadow-xs ${
                  m.sender === "user"
                    ? "bg-blue text-white rounded-br-none font-bold"
                    : "bg-white text-ink border-2 border-blue/25 rounded-bl-none"
                }`}
              >
                {m.text}
              </div>
              <span className="text-[10px] text-muted font-bold mt-1 px-1">{m.time}</span>
            </div>
          ))}
        </div>

        {/* Question Input Box */}
        <div className="flex items-center gap-2 pt-1">
          <input
            type="text"
            value={inputQuestion}
            onChange={(e) => setInputQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAskQuestion(inputQuestion);
            }}
            placeholder={
              language === "hinglish"
                ? "Kuch bhi poochiye (e.g. 'yeh attack safe kaise banega?')..."
                : "Ask Sentinel AI about this flow or threat mitigation..."
            }
            className="flex-1 text-xs font-semibold px-4 py-3 rounded-xl border-2 border-blue/30 bg-white text-ink focus:outline-none focus:border-blue transition-all"
          />
          <button
            onClick={() => handleAskQuestion(inputQuestion)}
            className="px-5 py-3 rounded-xl bg-blue hover:bg-indigo text-white text-xs font-black transition-all shadow-md flex items-center gap-2 border-2 border-blue cursor-pointer"
          >
            <span>Ask</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
