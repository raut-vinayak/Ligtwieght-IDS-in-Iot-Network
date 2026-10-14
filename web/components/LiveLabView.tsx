"use client";

import React, { useState, useEffect } from "react";
import { Radio, ShieldAlert, Terminal, AlertTriangle, RefreshCw, Server, Network } from "lucide-react";

export default function LiveLabView() {
  const [replayData, setReplayData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/data/replay_live_traffic.json")
      .then((res) => res.json())
      .then((data) => {
        setReplayData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading replay data:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-6">
      {/* 1. VM Boundary Warning */}
      <div className="bg-amber-50 border-2 border-warning/50 rounded-xl p-4 flex items-start gap-3 shadow-xs">
        <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
        <div className="text-xs text-ink space-y-1">
          <strong className="font-bold text-warning block">Operational Lab Boundary Notice</strong>
          <p className="text-muted leading-relaxed">
            The hosted website is a static research dashboard and does <strong>NOT</strong> have network socket access to sniff packets from your machine. Real-time packet sniffing operates exclusively on an isolated IDS virtual machine inside a dedicated test lab. The telemetry displayed below is an authentic, sanitized packet-flow replay generated from Phase 8 laboratory captures.
          </p>
        </div>
      </div>

      {/* 2. Network Topology & VM Setup */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-surface border-2 border-blue/40 hover:border-blue rounded-xl p-5 shadow-sm space-y-3 transition-all">
          <div className="flex items-center gap-2 pb-2.5 border-b-2 border-blue/20">
            <Network className="w-4 h-4 text-blue" />
            <h4 className="text-xs font-bold text-ink uppercase tracking-wider">Isolated Lab Topology</h4>
          </div>
          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-lg bg-blue/5 border-2 border-blue/20 flex justify-between">
              <span className="text-muted font-bold">Target IoT Node:</span>
              <span className="font-mono font-bold text-ink">192.168.100.10</span>
            </div>
            <div className="p-2.5 rounded-lg bg-blue/5 border-2 border-blue/20 flex justify-between">
              <span className="text-muted font-bold">IDS Sensor VM (Promiscuous eth1):</span>
              <span className="font-mono font-bold text-blue">192.168.100.5</span>
            </div>
            <div className="p-2.5 rounded-lg bg-blue/5 border-2 border-blue/20 flex justify-between">
              <span className="text-muted font-bold">Traffic Injector (Kali Node):</span>
              <span className="font-mono font-bold text-danger">192.168.100.50</span>
            </div>
          </div>
        </div>

        <div className="bg-surface border-2 border-blue/40 hover:border-blue rounded-xl p-5 shadow-sm space-y-3 transition-all">
          <div className="flex items-center gap-2 pb-2.5 border-b-2 border-blue/20">
            <Terminal className="w-4 h-4 text-indigo" />
            <h4 className="text-xs font-bold text-ink uppercase tracking-wider">IDS Sniffer Launch Command</h4>
          </div>
          <p className="text-xs text-muted">
            Run on the Linux sensor node with promiscuous permissions:
          </p>
          <pre className="p-3 rounded-lg bg-[#1E2445] text-green-400 font-mono text-[11px] overflow-x-auto border-2 border-blue/40">
{`# On IDS Sensor VM (promiscuous mode)
sudo python3 -m src.live_capture \\
  --interface eth1 \\
  --window 2.0 \\
  --model_path models/model_binary_DecisionTree_k10.joblib`}
          </pre>
        </div>
      </div>

      {/* 3. Replay Stream Table */}
      <div className="bg-surface border-2 border-blue/40 hover:border-blue rounded-xl p-5 shadow-sm transition-all">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b-2 border-blue/20 gap-2">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue animate-pulse"></span>
            <h3 className="text-sm font-bold text-ink">Sanitized Sensor VM Flow Replay</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black px-2.5 py-1 rounded bg-blue/10 border-2 border-blue text-blue">
              REPLAY DATA STREAM
            </span>
            <span className="text-[11px] text-muted font-bold">15 Flows Monitored</span>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto border-2 border-blue/20 rounded-xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-blue/20 bg-blue/5 text-ink font-bold">
                <th className="p-3">Timestamp</th>
                <th className="p-3">Flow 5-Tuple (Src -&gt; Dst)</th>
                <th className="p-3">Protocol</th>
                <th className="p-3">Classification</th>
                <th className="p-3">Confidence</th>
                <th className="p-3">Latency</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-muted">
                    Loading sensor replay flows...
                  </td>
                </tr>
              ) : (
                replayData.map((row, idx) => {
                  const isAttack = row.prediction !== "Benign";
                  return (
                    <tr key={idx} className="border-b border-border hover:bg-blue/5 transition-colors">
                      <td className="p-3 font-mono text-muted text-[11px]">{row.timestamp}</td>
                      <td className="p-3 font-mono font-bold text-ink">
                        {row.src_ip}:{row.src_port} &rarr; {row.dst_ip}:{row.dst_port}
                      </td>
                      <td className="p-3 text-muted font-bold">{row.protocol}</td>
                      <td className="p-3">
                        <span
                          className={`px-2.5 py-1 rounded-md text-[11px] font-bold border-2 ${
                            isAttack
                              ? "bg-danger/10 text-danger border-danger"
                              : "bg-positive/10 text-positive border-positive"
                          }`}
                        >
                          {isAttack ? `🚨 [ALERT] ${row.prediction}` : "🛡️ [NORMAL] Benign"}
                        </span>
                      </td>
                      <td className="p-3 text-ink font-bold">{row.confidence_pct}%</td>
                      <td className="p-3 font-mono text-muted">{row.latency_ms.toFixed(3)} ms</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
