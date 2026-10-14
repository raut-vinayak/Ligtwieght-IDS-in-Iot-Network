"use client";

import React from "react";
import { BookOpen, ShieldCheck, Database, Layers, CheckCircle2 } from "lucide-react";

export default function MethodologyView() {
  const attackTaxonomy = [
    { family: "Benign", count: "1 Type", details: "BenignTraffic (sensor telemetry, normal web browsing, camera streaming)" },
    { family: "DDoS", count: "12 Attacks", details: "RSTFINFlood, PSHACK_Flood, SYN_Flood, UDP_Flood, TCP_Flood, ICMP_Flood, SynonymousIP_Flood, ACK_Fragmentation, UDP_Fragmentation, ICMP_Fragmentation, SlowLoris, HTTP_Flood" },
    { family: "DoS", count: "4 Attacks", details: "UDP_Flood, TCP_Flood, SYN_Flood, HTTP_Flood" },
    { family: "Recon", count: "5 Attacks", details: "PingSweep, OSScan, PortScan, VulnerabilityScan, HostDiscovery" },
    { family: "Web-based", count: "6 Attacks", details: "SqlInjection, CommandInjection, XSS, Backdoor_Malware, BrowserHijacking, Uploading_Attack" },
    { family: "Brute Force", count: "1 Attack", details: "DictionaryBruteForce (credential spraying against SSH, Telnet, HTTP)" },
    { family: "Spoofing", count: "2 Attacks", details: "MITM-ArpSpoofing, DNS_Spoofing" },
    { family: "Mirai", count: "3 Attacks", details: "Mirai-greeth_flood, Mirai-udpplain, Mirai-greip_flood" },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Taxonomy */}
      <div className="bg-surface border-2 border-blue/40 hover:border-blue rounded-xl p-5 shadow-sm space-y-4 transition-all overflow-hidden">
        <div className="flex items-center gap-2 pb-3 border-b-2 border-blue/20">
          <BookOpen className="w-4 h-4 text-blue" />
          <h3 className="text-sm font-bold text-ink">Authoritative CICIoT2023 Classification Taxonomy</h3>
        </div>
        <p className="text-xs text-muted leading-relaxed font-medium">
          The Canadian Institute for Cybersecurity (CICIoT2023) dataset records 33 distinct attack profiles across 105 IoT devices. This project maps all 33 attacks plus Benign traffic into 7 canonical attack families plus Benign.
        </p>

        <div className="overflow-x-auto border-2 border-blue/20 rounded-xl">
          <table className="w-full min-w-[620px] text-left text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-blue/20 bg-blue/5 text-ink font-bold">
                <th className="p-3">Canonical Family</th>
                <th className="p-3">Profiles</th>
                <th className="p-3">Specific Attacks Included</th>
              </tr>
            </thead>
            <tbody>
              {attackTaxonomy.map((row) => (
                <tr key={row.family} className="border-b border-border hover:bg-blue/5 transition-colors">
                  <td className="p-3 font-bold text-ink">{row.family}</td>
                  <td className="p-3 text-blue font-bold">{row.count}</td>
                  <td className="p-3 text-muted leading-relaxed">{row.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. Leakage Safe Pipeline */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-surface border-2 border-blue/40 hover:border-blue rounded-xl p-5 shadow-sm space-y-3 transition-all overflow-hidden">
          <div className="flex items-center gap-2 pb-2.5 border-b-2 border-blue/20">
            <ShieldCheck className="w-4 h-4 text-positive" />
            <h4 className="text-xs font-bold text-ink uppercase tracking-wider">Data Leakage Prevention</h4>
          </div>
          <ul className="space-y-2 text-xs text-muted leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="w-2 h-2 rounded-full bg-blue shrink-0 mt-1.5"></span>
              <span>
                <strong className="text-ink">Identifier Removal:</strong> IP addresses (Src/Dst), Ports, Timestamps, and Flow IDs are stripped prior to model training to prevent trivial memorization.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-2 h-2 rounded-full bg-blue shrink-0 mt-1.5"></span>
              <span>
                <strong className="text-ink">Fitted on Train Only:</strong> Scalers, imputers, and feature ranking are computed strictly on the 70% training split and applied to val/test without fitting.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-2 h-2 rounded-full bg-blue shrink-0 mt-1.5"></span>
              <span>
                <strong className="text-ink">Investigation Trigger:</strong> Any test Macro-F1 exceeding 0.999 is flagged for immediate audit to ensure no target proxy remains.
              </span>
            </li>
          </ul>
        </div>

        <div className="bg-surface border-2 border-blue/40 hover:border-blue rounded-xl p-5 shadow-sm space-y-3 transition-all">
          <div className="flex items-center gap-2 pb-2.5 border-b-2 border-blue/20">
            <Layers className="w-4 h-4 text-indigo" />
            <h4 className="text-xs font-bold text-ink uppercase tracking-wider">Model Selection Rule</h4>
          </div>
          <p className="text-xs text-muted leading-relaxed">
            To reflect the severe hardware constraints of edge IoT microcontrollers (e.g. ESP32, STM32, Raspberry Pi Zero), the champion model is selected via:
          </p>
          <div className="p-3 rounded-lg bg-blue/5 border-2 border-blue/30 font-mono text-[11px] text-ink font-bold leading-relaxed">
            max(Val_Macro_F1)<br />
            subject to:<br />
            &nbsp;&nbsp;Model_Size &le; 50.0 KB<br />
            &nbsp;&nbsp;Median_Latency &le; 3.0 ms
          </div>
          <p className="text-[11px] text-muted">
            Under this rule, <strong>Decision Tree (K=20)</strong> achieves 98.9% holdout Macro-F1 at 8.2 KB and 1.45 ms latency, beating bloated ensemble models.
          </p>
        </div>
      </div>
    </div>
  );
}
