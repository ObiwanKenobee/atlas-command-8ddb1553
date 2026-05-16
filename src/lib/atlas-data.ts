// Mock data + types for Atlas Sanctum command center.

export type Tone = "intel" | "stable" | "warn" | "critical" | "muted";
export type Severity = "critical" | "high" | "medium" | "low";

export type FeedItem = {
  id: string;
  stream: StreamKey;
  tone: Tone;
  severity: Severity;
  conf: number;
  title: string;
  rec: string;
  source: string;
  region: string;
  timeAgo: string;
};

export type StreamKey = "all" | "sigint" | "osint" | "macro" | "cyber" | "humint";

export const STREAMS: { key: StreamKey; label: string }[] = [
  { key: "all", label: "All Channels" },
  { key: "sigint", label: "SIGINT" },
  { key: "osint", label: "OSINT" },
  { key: "macro", label: "Macro" },
  { key: "cyber", label: "Cyber" },
  { key: "humint", label: "HUMINT" },
];

export const FEED: FeedItem[] = [
  { id: "SIGINT_ALERT_09", stream: "sigint", tone: "critical", severity: "critical", conf: 98, title: "Anomalous logistics pattern detected near Sector 7 node.", rec: "Deploy Sentinel-B", source: "SAT-IR · OSINT", region: "PAC-Q4", timeAgo: "00:02" },
  { id: "CYBER_PROBE_22", stream: "cyber", tone: "critical", severity: "critical", conf: 91, title: "Coordinated reconnaissance against grid node MERIDIAN-3.", rec: "Escalate to Sentinel-A", source: "Honeypot · IDS", region: "NA-E", timeAgo: "00:06" },
  { id: "MACRO_SHIFT_14", stream: "macro", tone: "warn", severity: "high", conf: 85, title: "Sudden liquidity drain observed in sovereign wealth reserve.", rec: "Initiate financial hedge", source: "SWIFT · Bloomberg", region: "MENA-04", timeAgo: "00:09" },
  { id: "OSINT_UPDATE_31", stream: "osint", tone: "intel", severity: "medium", conf: 72, title: "Satellite imagery confirms desalination plant completion.", rec: "Update climate risk model", source: "SAT-RGB", region: "MENA-02", timeAgo: "00:14" },
  { id: "HUMINT_DLT_03", stream: "humint", tone: "warn", severity: "high", conf: 68, title: "Asset reports unscheduled cabinet reshuffle in regional capital.", rec: "Brief diplomatic desk", source: "Field Asset", region: "EU-S", timeAgo: "00:18" },
  { id: "DIPLO_SIGNAL_07", stream: "humint", tone: "intel", severity: "low", conf: 64, title: "Back-channel softening on Strait-of-Hormuz transit posture.", rec: "Hold pattern, observe", source: "Cable Traffic", region: "MENA-03", timeAgo: "00:22" },
  { id: "SIGINT_BURST_18", stream: "sigint", tone: "warn", severity: "medium", conf: 77, title: "Encrypted burst traffic spike across maritime relay nodes.", rec: "Increase ELINT coverage", source: "ELINT", region: "OCE-02", timeAgo: "00:26" },
  { id: "CYBER_DDOS_44", stream: "cyber", tone: "warn", severity: "high", conf: 88, title: "Volumetric DDoS targeting financial clearing infrastructure.", rec: "Reroute via shadow path", source: "Edge Telemetry", region: "EU-W", timeAgo: "00:31" },
  { id: "MACRO_FX_09", stream: "macro", tone: "intel", severity: "low", conf: 56, title: "Reserve currency basket variance widening beyond 2σ band.", rec: "Re-balance hedge book", source: "FX Desk", region: "GLOBAL", timeAgo: "00:37" },
  { id: "OSINT_SOCIAL_88", stream: "osint", tone: "warn", severity: "medium", conf: 74, title: "Coordinated information operation across vernacular social vectors.", rec: "Engage counter-narrative", source: "Social · CSE", region: "LATAM-03", timeAgo: "00:41" },
];

export const SECTORS = [
  { key: "geopolitical", label: "Geopolitical", score: 0.82, delta: +0.14, tone: "critical" as Tone },
  { key: "financial", label: "Financial", score: 0.71, delta: +0.09, tone: "warn" as Tone },
  { key: "cyber", label: "Cyber", score: 0.88, delta: +0.21, tone: "critical" as Tone },
  { key: "climate", label: "Climate", score: 0.54, delta: -0.03, tone: "warn" as Tone },
  { key: "infrastructure", label: "Infrastructure", score: 0.47, delta: +0.02, tone: "intel" as Tone },
  { key: "humanitarian", label: "Humanitarian", score: 0.38, delta: -0.05, tone: "stable" as Tone },
];

export const TIMELINE_12H = [0.42, 0.38, 0.55, 0.48, 0.6, 0.52, 0.58, 0.67, 0.7, 0.74, 0.82, 0.88];

export const PREFILL_PROMPTS = [
  "Predict flood impact in East Africa over the next 72 hours.",
  "Model telecom disruption risk in Sector 7 if MERIDIAN-3 falls.",
  "Simulate port closure effects on Strait of Malacca shipping.",
  "Analyze regional instability across MENA-04 with confidence bands.",
  "Generate crisis response options for sovereign liquidity event.",
];

export const SCENARIO_OUTPUT = {
  headline: "Scenario S-07 · Convergent Maritime Disruption",
  summary:
    "Closure of MERIDIAN-3 combined with FX basket variance creates a 71% probability of cascading liquidity stress within 96 hours. Defensive posture recommended.",
  steps: [
    { t: "T+00:00", body: "Re-route 38% of clearing traffic via shadow path SP-02." },
    { t: "T+04:15", body: "Pre-position Sentinel-B; raise ELINT collection cadence to 4×." },
    { t: "T+12:00", body: "Authorize sovereign hedge tranche A (cap 1.4B)." },
    { t: "T+24:00", body: "Open diplomatic back-channel via EU-S desk; brief executive." },
  ],
  agents: [
    { name: "CRISIS", action: "Coordinating multi-domain response" },
    { name: "FINANCE", action: "Hedge book modelling +/- 2σ" },
    { name: "INFRA", action: "Failover path simulation" },
    { name: "ETHICS", action: "Reviewing intervention thresholds" },
  ],
  confidence: 0.79,
};

export const TONE_CLASS: Record<Tone, { text: string; bg: string; border: string; bgSoft: string }> = {
  intel: { text: "text-intel", bg: "bg-intel", border: "border-intel", bgSoft: "bg-intel/10" },
  stable: { text: "text-stable", bg: "bg-stable", border: "border-stable", bgSoft: "bg-stable/10" },
  warn: { text: "text-warn", bg: "bg-warn", border: "border-warn", bgSoft: "bg-warn/10" },
  critical: { text: "text-critical", bg: "bg-critical", border: "border-critical", bgSoft: "bg-critical/10" },
  muted: { text: "text-foreground/30", bg: "bg-foreground/20", border: "border-foreground/10", bgSoft: "bg-foreground/5" },
};

export const SEVERITY_RANK: Record<Severity, number> = { critical: 4, high: 3, medium: 2, low: 1 };
