# CICIoT2023 Feature Schema & Live Capture Availability

This document provides the authoritative schema, unit definitions, measurement types, and live packet capture feasibility for all 46 numerical flow features in the CICIoT2023 dataset.

---

## 1. Feature Dictionary

| Feature Name | Type | Physical Unit | Live Capture Availability | Description |
|---|---|---|---|---|
| `flow_duration` | float | Seconds (s) | **Available** | Total duration of the network flow from SYN/first packet to FIN/RST or timeout |
| `Header_Length` | float | Bytes (B) | **Available** | Length of network packet headers (IP + Transport) |
| `Protocol Type` | float | IANA Code | **Available** | IP Protocol number (6=TCP, 17=UDP, 1=ICMP) |
| `Duration` | float | Seconds (s) | **Available** | Active bidirectional flow duration |
| `Rate` | float | Packets / sec | **Available** | Aggregate packet transmission rate per second |
| `Srate` | float | Packets / sec | **Available** | Source-to-destination packet rate per second |
| `Drate` | float | Packets / sec | **Available** | Destination-to-source packet rate per second |
| `fin_flag_number` | binary | {0, 1} | **Available** | Indicates if FIN flag is active in current window |
| `syn_flag_number` | binary | {0, 1} | **Available** | Indicates if SYN flag is active in current window |
| `rst_flag_number` | binary | {0, 1} | **Available** | Indicates if RST flag is active in current window |
| `psh_flag_number` | binary | {0, 1} | **Available** | Indicates if PSH flag is active in current window |
| `ack_flag_number` | binary | {0, 1} | **Available** | Indicates if ACK flag is active in current window |
| `ece_flag_number` | binary | {0, 1} | **Available** | Indicates if ECE flag is active in current window |
| `cwr_flag_number` | binary | {0, 1} | **Available** | Indicates if CWR flag is active in current window |
| `ack_count` | float | Count | **Available** | Cumulative count of ACK packets within flow window |
| `syn_count` | float | Count | **Available** | Cumulative count of SYN packets within flow window |
| `fin_count` | float | Count | **Available** | Cumulative count of FIN packets within flow window |
| `urg_count` | float | Count | **Available** | Cumulative count of URG packets within flow window |
| `rst_count` | float | Count | **Available** | Cumulative count of RST packets within flow window |
| `HTTP` | binary | {0, 1} | **Available** | Flow uses HTTP protocol (port 80 or signature) |
| `HTTPS` | binary | {0, 1} | **Available** | Flow uses TLS/HTTPS protocol (port 443) |
| `DNS` | binary | {0, 1} | **Available** | Flow uses DNS protocol (UDP/TCP port 53) |
| `Telnet` | binary | {0, 1} | **Available** | Flow uses Telnet protocol (TCP port 23) |
| `SMTP` | binary | {0, 1} | **Available** | Flow uses SMTP mail protocol (TCP port 25/587) |
| `SSH` | binary | {0, 1} | **Available** | Flow uses SSH protocol (TCP port 22) |
| `IRC` | binary | {0, 1} | **Available** | Flow uses IRC protocol (TCP port 6667) |
| `TCP` | binary | {0, 1} | **Available** | Transport layer protocol is TCP |
| `UDP` | binary | {0, 1} | **Available** | Transport layer protocol is UDP |
| `DHCP` | binary | {0, 1} | **Available** | Flow uses DHCP protocol (UDP 67/68) |
| `ARP` | binary | {0, 1} | **Available** | Packet layer protocol is ARP |
| `ICMP` | binary | {0, 1} | **Available** | Packet layer protocol is ICMP |
| `IPv` | binary | {0, 1} | **Available** | Internet Protocol version (IPv4 vs IPv6) |
| `LLC` | binary | {0, 1} | **Available** | Logical Link Control encapsulation presence |
| `Tot sum` | float | Bytes (B) | **Available** | Sum of packet payload lengths in flow |
| `Min` | float | Bytes (B) | **Available** | Minimum packet payload size observed in flow |
| `Max` | float | Bytes (B) | **Available** | Maximum packet payload size observed in flow |
| `AVG` | float | Bytes (B) | **Available** | Arithmetic mean of packet payload sizes in flow |
| `Std` | float | Bytes (B) | **Available** | Standard deviation of packet sizes in flow |
| `Tot size` | float | Bytes (B) | **Available** | Total aggregate size of packet headers and payloads |
| `IAT` | float | Seconds (s) | **Available** | Mean inter-arrival time between consecutive packets |
| `Number` | float | Count | **Available** | Total packet count in the flow window |
| `Magnitue` | float | Euclidean Norm | **Available** | Vector magnitude: $\sqrt{\text{AVG}^2 + \text{Std}^2}$ |
| `Radius` | float | Bytes (B) | **Available** | Radius metric of packet size distribution: $0.5 \times \text{Std}$ |
| `Covariance` | float | Variance | **Available** | Packet arrival-size covariance approximation |
| `Variance` | float | $\text{Bytes}^2$ | **Available** | Variance of packet sizes in flow: $\text{Std}^2$ |
| `Weight` | float | Weight | **Available** | Packet count weighting coefficient |

---

## 2. Leakage and Identifier Removal Policy

The following columns are **never** fed into feature ranking, training, or inference because they represent identifiers, timestamps, or target-proxies that introduce spurious correlations:
1. `Timestamp` (Temporal leakage)
2. `Flow_ID` (Session identifier)
3. `Src_IP` / `Source IP` (Identity bias)
4. `Dst_IP` / `Destination IP` (Identity bias)
5. `Src_Port` (Ephemeral port noise)
6. `Dst_Port` (Service proxy)
7. `SimillarHTTP` (Post-event payload log)
8. `id` / `Unnamed: 0` (Row indices)
