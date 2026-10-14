# Authoritative CICIoT2023 Label Mapping & Taxonomy

This document specifies the authoritative classification taxonomy mapping from 33 raw attack types + Benign traffic into high-level attack families as defined in the official CICIoT2023 benchmark publication:

> **Citation:**  
> E. C. P. Neto et al., "CICIoT2023: A Real-Time Dataset and Benchmark for Large-Scale Attacks in IoT Environments," *IEEE Internet of Things Journal*, 2023.

---

## 1. Mapping Table (Raw Label → Attack Family)

| # | Raw Label in CICIoT2023 | Canonical Multiclass Family | Binary Task Label | Description |
|---|---|---|---|---|
| 1 | `BenignTraffic` | `Benign` | `Benign` (0) | Normal IoT sensor telemetry, web, video streaming |
| 2 | `DDoS-RSTFINFlood` | `DDoS` | `Attack` (1) | Distributed TCP RST/FIN flag flood |
| 3 | `DDoS-PSHACK_Flood` | `DDoS` | `Attack` (1) | Distributed TCP PSH/ACK flag flood |
| 4 | `DDoS-SYN_Flood` | `DDoS` | `Attack` (1) | Distributed TCP SYN half-open exhaustion |
| 5 | `DDoS-UDP_Flood` | `DDoS` | `Attack` (1) | Distributed high-volume UDP datagram flood |
| 6 | `DDoS-TCP_Flood` | `DDoS` | `Attack` (1) | Distributed raw TCP segment flood |
| 7 | `DDoS-ICMP_Flood` | `DDoS` | `Attack` (1) | Distributed ICMP Echo request blast |
| 8 | `DDoS-SynonymousIP_Flood` | `DDoS` | `Attack` (1) | Distributed flood spoofing identical source/dest IP |
| 9 | `DDoS-ACK_Fragmentation` | `DDoS` | `Attack` (1) | Distributed fragmented ACK packet flood |
| 10 | `DDoS-UDP_Fragmentation` | `DDoS` | `Attack` (1) | Distributed oversized UDP packet fragmentation |
| 11 | `DDoS-ICMP_Fragmentation` | `DDoS` | `Attack` (1) | Distributed ICMP ping fragmentation attack |
| 12 | `DDoS-SlowLoris` | `DDoS` | `Attack` (1) | Low-bandwidth slow HTTP request exhaustion |
| 13 | `DDoS-HTTP_Flood` | `DDoS` | `Attack` (1) | Volumetric HTTP GET/POST layer-7 flood |
| 14 | `DoS-UDP_Flood` | `DoS` | `Attack` (1) | Single-source UDP buffer saturation |
| 15 | `DoS-TCP_Flood` | `DoS` | `Attack` (1) | Single-source TCP connection table exhaustion |
| 16 | `DoS-SYN_Flood` | `DoS` | `Attack` (1) | Single-source SYN queue filling |
| 17 | `DoS-HTTP_Flood` | `DoS` | `Attack` (1) | Single-source volumetric HTTP flood |
| 18 | `Recon-PingSweep` | `Recon` | `Attack` (1) | ICMP discovery across address space |
| 19 | `Recon-OSScan` | `Recon` | `Attack` (1) | TCP/IP fingerprinting probe |
| 20 | `Recon-PortScan` | `Recon` | `Attack` (1) | Port enumeration sweep |
| 21 | `VulnerabilityScan` | `Recon` | `Attack` (1) | Automated vulnerability probing |
| 22 | `Recon-HostDiscovery` | `Recon` | `Attack` (1) | ARP/ICMP broadcast network scan |
| 23 | `SqlInjection` | `Web-based` | `Attack` (1) | SQL payload exploitation |
| 24 | `CommandInjection` | `Web-based` | `Attack` (1) | Shellcode / remote command injection |
| 25 | `XSS` | `Web-based` | `Attack` (1) | Cross-site scripting payload injection |
| 26 | `Backdoor_Malware` | `Web-based` | `Attack` (1) | Trojan backdoor connection |
| 27 | `BrowserHijacking` | `Web-based` | `Attack` (1) | Browser redirection and payload execution |
| 28 | `Uploading_Attack` | `Web-based` | `Attack` (1) | Malicious file upload exploitation |
| 29 | `DictionaryBruteForce` | `Brute Force` | `Attack` (1) | Credential guessing against SSH/Telnet/HTTP |
| 30 | `MITM-ArpSpoofing` | `Spoofing` | `Attack` (1) | ARP cache poisoning man-in-the-middle |
| 31 | `DNS_Spoofing` | `Spoofing` | `Attack` (1) | DNS cache poisoning / fake response injection |
| 32 | `Mirai-greeth_flood` | `Mirai` | `Attack` (1) | Mirai botnet GRE Ethernet encapsulated flood |
| 33 | `Mirai-udpplain` | `Mirai` | `Attack` (1) | Mirai botnet raw UDP plain datagram blast |
| 34 | `Mirai-greip_flood` | `Mirai` | `Attack` (1) | Mirai botnet GRE IP encapsulated flood |

---

## 2. Policy for Unknown or Unmapped Labels

Under the project evaluation policy:
1. **Never silently map or drop unknown labels.**
2. Any row containing a label not present in the authoritative 34-class taxonomy will cause a validation alert during data intake.
3. Unknown labels will be tagged as `Unknown_Review_Required` and halted for operator review before inclusion in training splits.
