# Isolated VM Live Packet Capture Guide & Feature Contract

This document specifies the operational design, network topology, security permissions, flow reconstruction logic, and exact feature extraction parity for the real-time intrusion detection sniffer running on the isolated IDS sensor VM.

---

## 1. Network Topology & Safety Boundaries

```text
       Isolated IDS Lab Network (192.168.100.0/24)
   ┌───────────────────────────────────────────────┐
   │                                               │
   │   [Target Device / IoT Node]                  │
   │        192.168.100.10                         │
   │               ▲                               │
   │               │ Mirrored SPAN / Tap           │
   │               ▼                               │
   │   [Lightweight IDS Sensor VM]                 │
   │        eth0 (Management, 192.168.100.5)       │
   │        eth1 (Promiscuous Sniffing Interface)  │
   │               ▲                               │
   │               │                               │
   │   [Controlled Traffic Generator / Kali]       │
   │        192.168.100.50                         │
   └───────────────────────────────────────────────┘
```

> [!CAUTION]
> **Strict Isolation Warning:** Live packet capture and traffic simulation must occur ONLY inside an isolated, non-routable lab VLAN. Never attach sniffing interfaces directly to public, corporate, or external production networks without explicit written authorization.

---

## 2. Sniffer Permissions & Interface Setup

On the Linux IDS VM:
```bash
# 1. Enable promiscuous mode on sniffing interface
sudo ip link set eth1 promisc on
sudo ip link set eth1 up

# 2. Grant Python packet capture capabilities without root
sudo setcap cap_net_raw,cap_net_admin=eip $(which python3)

# 3. Launch live detection daemon
python3 -m src.live_capture --interface eth1 --window-seconds 2.0 --model-k 10
```

---

## 3. Flow Aggregation & 5-Tuple Policy

- **5-Tuple Key:** `(Source IP, Destination IP, Source Port, Destination Port, IP Protocol)`
- **Sliding Flow Window:** 2.0 seconds default.
- **Bidirectional Correlation:** Inactive flows expiring past window timeout are flushed, summarized into statistical features, and evaluated against the champion model.
- **No Payload Storage:** In accordance with privacy and performance best practices, raw packet payloads are never persisted to disk. Only derived numerical flow statistics are logged.

---

## 4. Feature Parity Table: Training vs. Live Flow Reconstruction

| Feature Name | Training Formula / Source | Live Capture Sniffer Extraction Source | Parity Status |
|---|---|---|---|
| `flow_duration` | Session duration ($t_{\text{last}} - t_{\text{start}}$) | `last_packet_timestamp - first_packet_timestamp` (sec) | **Exact Parity** |
| `Header_Length` | Cumulative IP + TCP/UDP header length | Cumulative length of IP + Transport header bytes across flow | **Exact Parity** |
| `Protocol Type` | IANA protocol number (6, 17, 1) | `packet[IP].proto` | **Exact Parity** |
| `Rate` | Total packets / duration | $\text{count}(\text{packets}) / \Delta t$ | **Exact Parity** |
| `Srate` | Forward packets / duration | Directional packets from initiator / $\Delta t$ | **Exact Parity** |
| `Drate` | Backward packets / duration | Reverse packets from responder / $\Delta t$ | **Exact Parity** |
| `syn_count` | Count of SYN packets in window | Cumulative packets with TCP flag `S` | **Exact Parity** |
| `ack_count` | Count of ACK packets in window | Cumulative packets with TCP flag `A` | **Exact Parity** |
| `rst_count` | Count of RST packets in window | Cumulative packets with TCP flag `R` | **Exact Parity** |
| `Min` | Minimum packet payload size | $\min(\text{packet\_sizes})$ | **Exact Parity** |
| `Max` | Maximum packet payload size | $\max(\text{packet\_sizes})$ | **Exact Parity** |
| `AVG` | Mean packet payload size | $\text{mean}(\text{packet\_sizes})$ | **Exact Parity** |
| `Std` | Std dev of packet sizes | $\text{std}(\text{packet\_sizes})$ | **Exact Parity** |
| `Tot size` | Sum of packet bytes in flow | $\sum \text{packet\_sizes}$ | **Exact Parity** |
| `IAT` | Mean inter-arrival time | $\Delta t / \max(1, \text{packets} - 1)$ | **Exact Parity** |
| `TCP` / `UDP` / `ICMP` | Protocol binary indicators | Verified from IP header protocol number | **Exact Parity** |
| `HTTP` / `HTTPS` / `DNS` | Port / service indicator | Inspected from L4 port (80, 443, 53) | **Exact Parity** |

---

## 5. Streaming JSONL Logging & Replay Format

Predictions are streamed locally to `results/live_predictions.jsonl`:
```json
{
  "timestamp": "2026-10-15 01:15:30.142",
  "src_ip": "192.168.100.50",
  "dst_ip": "192.168.100.10",
  "src_port": 49152,
  "dst_port": 80,
  "protocol": "TCP",
  "prediction": "DDoS",
  "confidence_pct": 98.4,
  "latency_ms": 0.452
}
```
A sanitized replay log is exported to `web/public/data/replay_live_traffic.jsonl` for offline presentation and dashboard display.
