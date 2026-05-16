import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import worldMap from "../assets/world-map.jpg";

export const Route = createFileRoute("/")({
  component: CommandCenter,
});

// ---------- mock data ----------
const NAV_LAYERS = [
  { key: "strategic", label: "Strategic" },
  { key: "geospatial", label: "Geospatial", active: true },
  { key: "simulation", label: "Simulation" },
  { key: "collab", label: "Collaboration" },
  { key: "risk", label: "Risk" },
  { key: "federation", label: "Federation" },
  { key: "identity", label: "Identity" },
];

const AGENTS = [
  { id: "SENTINEL", state: "Nominal", tone: "stable" },
  { id: "CRISIS", state: "Active", tone: "critical", pulse: true },
  { id: "FINANCE", state: "Standby", tone: "stable" },
  { id: "CLIMATE", state: "Warning", tone: "warn" },
  { id: "INFRA", state: "Offline", tone: "muted" },
  { id: "ETHICS", state: "Optimal", tone: "stable" },
] as const;

const FEED = [
  {
    id: "SIGINT_ALERT_09",
    tone: "critical",
    conf: 98,
    title: "Anomalous logistics pattern detected near Sector 7 node.",
    rec: "Deploy Sentinel-B",
  },
  {
    id: "OSINT_UPDATE",
    tone: "intel",
    conf: 72,
    title: "Satellite imagery confirms desalination plant completion.",
    rec: "Update climate risk model",
  },
  {
    id: "MACRO_SHIFT",
    tone: "warn",
    conf: 85,
    title: "Sudden liquidity drain observed in sovereign wealth reserve.",
    rec: "Initiate financial hedge",
  },
  {
    id: "CYBER_PROBE",
    tone: "critical",
    conf: 91,
    title: "Coordinated reconnaissance against grid node MERIDIAN-3.",
    rec: "Escalate to Sentinel-A",
  },
  {
    id: "DIPLO_SIGNAL",
    tone: "intel",
    conf: 64,
    title: "Back-channel softening on Strait-of-Hormuz transit posture.",
    rec: "Hold pattern, observe",
  },
];

const MARKERS = [
  { x: 22, y: 38, tone: "intel", label: "NORAM-01" },
  { x: 48, y: 32, tone: "warn", label: "EU-CENTRAL" },
  { x: 56, y: 48, tone: "critical", label: "MENA-04" },
  { x: 74, y: 36, tone: "intel", label: "EAS-12" },
  { x: 80, y: 70, tone: "stable", label: "OCE-02" },
  { x: 34, y: 70, tone: "warn", label: "LATAM-03" },
  { x: 62, y: 58, tone: "critical", label: "IND-07" },
];

const TICKER = [
  "PACIFIC_QUAD_4 // CRISIS AGENT ACTIVE",
  "SIGINT_ALERT_09 // 98% CONF",
  "STRAIT_TRANSIT // VOLUME -12.4%",
  "ORBITAL_PASS NRO-77 // T+04:21",
  "FINANCIAL CORR // 0.81 ↑",
  "ETHICS REVIEW QUEUE // 03 OPEN",
  "INFRA NODE MERIDIAN-3 // ANOMALY",
  "CLIMATE MODEL v9.2 // CONVERGED",
];

const TONE = {
  intel: { text: "text-intel", bg: "bg-intel", border: "border-intel" },
  stable: { text: "text-stable", bg: "bg-stable", border: "border-stable" },
  warn: { text: "text-warn", bg: "bg-warn", border: "border-warn" },
  critical: { text: "text-critical", bg: "bg-critical", border: "border-critical" },
  muted: { text: "text-foreground/30", bg: "bg-foreground/20", border: "border-foreground/10" },
} as const;

// ---------- helpers ----------
function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

function fmtZulu(d: Date) {
  return d.toISOString().slice(11, 19) + " ZULU";
}

function fmtUptime(d: Date) {
  const base = new Date();
  base.setHours(base.getHours() - 142);
  const diff = Math.floor((d.getTime() - base.getTime()) / 1000);
  const h = String(Math.floor(diff / 3600)).padStart(3, "0");
  const m = String(Math.floor((diff % 3600) / 60)).padStart(2, "0");
  const s = String(diff % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

// ---------- atoms ----------
function NavIcon({ children, active }: { children: React.ReactNode; active?: boolean }) {
  return (
    <button
      className={`size-9 rounded-sm grid place-items-center transition-colors ${
        active
          ? "bg-intel/10 border border-intel/40 text-intel"
          : "border border-transparent text-foreground/40 hover:text-foreground hover:bg-foreground/5"
      }`}
    >
      {children}
    </button>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "warn" | "critical" | "stable" | "intel" }) {
  const c = tone ? TONE[tone].text : "text-foreground";
  return (
    <div className="flex flex-col leading-tight">
      <span className="text-[9px] uppercase font-bold text-foreground/30 tracking-[0.18em]">{label}</span>
      <span className={`text-xs font-mono ${c}`}>{value}</span>
    </div>
  );
}

function Divider() {
  return <div className="h-6 w-px bg-border" />;
}

// ---------- big pieces ----------
function NavRail() {
  return (
    <nav className="w-14 flex flex-col items-center py-5 border-r border-border bg-surface shrink-0">
      <div className="size-9 bg-intel/10 border border-intel/30 rounded-sm grid place-items-center mb-8">
        <div className="size-3 bg-intel shadow-[0_0_10px_rgba(34,211,238,0.7)]" />
      </div>
      <div className="flex flex-col gap-3">
        {NAV_LAYERS.map((l) => (
          <NavIcon key={l.key} active={l.active}>
            <span className="text-[9px] font-mono font-bold uppercase">{l.label.slice(0, 2)}</span>
          </NavIcon>
        ))}
      </div>
      <div className="mt-auto flex flex-col items-center gap-3">
        <div className="size-2 bg-critical rounded-full animate-pulse-dot shadow-[0_0_8px_#EF4444]" />
        <div className="size-7 rounded-sm bg-foreground/5 border border-border" />
      </div>
    </nav>
  );
}

function TopBar() {
  const now = useClock();
  return (
    <header className="h-14 border-b border-border flex items-center px-5 gap-6 shrink-0 bg-surface/40">
      <div className="font-mono text-[11px] font-bold tracking-[0.22em] text-foreground/50 uppercase">
        Atlas Sanctum
        <span className="text-foreground/20"> / Core v4.2</span>
      </div>
      <Divider />
      <div className="flex gap-5 items-center">
        <Stat label="Region" value="PACIFIC_QUAD_4" />
        <Stat label="Threat" value="ELEVATED_ORANGE" tone="warn" />
        <Stat label="Uptime" value={fmtUptime(now)} />
        <Stat label="Clock" value={fmtZulu(now)} tone="intel" />
      </div>
      <Divider />
      <div className="flex-1 min-w-0 overflow-hidden">
        <div className="flex gap-10 whitespace-nowrap animate-ticker text-[10px] font-mono text-foreground/40">
          {[...TICKER, ...TICKER].map((t, i) => (
            <span key={i} className="flex items-center gap-2">
              <span className="size-1 bg-intel/60 rounded-full" />
              {t}
            </span>
          ))}
        </div>
      </div>
      <Divider />
      <div className="flex items-center gap-3">
        <div className="text-right leading-tight">
          <div className="text-xs font-medium uppercase tracking-tight">D. Kincaid</div>
          <div className="text-[10px] text-foreground/40 font-mono">SOVEREIGN_AUTH_01</div>
        </div>
        <div className="size-8 bg-foreground/5 border border-border rounded-sm ring-1 ring-white/5 grid place-items-center text-[10px] font-mono text-intel">
          DK
        </div>
      </div>
    </header>
  );
}

function Marker({ x, y, tone, label }: (typeof MARKERS)[number]) {
  const c = TONE[tone as keyof typeof TONE];
  return (
    <div className="absolute -translate-x-1/2 -translate-y-1/2 group" style={{ left: `${x}%`, top: `${y}%` }}>
      <div className={`size-2 ${c.bg} rounded-full animate-pulse-dot`} style={{ boxShadow: `0 0 12px currentColor` }} />
      <div className={`absolute inset-0 -m-2 rounded-full border ${c.border} opacity-40`} />
      <div className="absolute left-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-[9px] font-mono uppercase bg-background/90 border border-border px-1.5 py-0.5 whitespace-nowrap">
        {label}
      </div>
    </div>
  );
}

function MapPanel() {
  return (
    <section className="flex-1 relative overflow-hidden p-4 bg-[#070708]">
      <div className="absolute inset-4 rounded-sm border border-border overflow-hidden bg-surface/40 scanline">
        <img
          src={worldMap}
          alt="Global intelligence raster"
          width={1920}
          height={1280}
          className="absolute inset-0 w-full h-full object-cover opacity-70"
        />
        {/* grid */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.06]" preserveAspectRatio="none">
          <defs>
            <pattern id="g" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#22D3EE" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#g)" />
        </svg>
        {/* flow lines */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M22 38 Q40 10 74 36" fill="none" stroke="#22D3EE" strokeWidth="0.15" className="flow-line" opacity="0.6" />
          <path d="M56 48 Q60 30 74 36" fill="none" stroke="#EF4444" strokeWidth="0.15" className="flow-line" opacity="0.7" />
          <path d="M34 70 Q50 60 62 58" fill="none" stroke="#F59E0B" strokeWidth="0.15" className="flow-line" opacity="0.5" />
        </svg>

        {MARKERS.map((m) => (
          <Marker key={m.label} {...m} />
        ))}

        {/* corner brackets */}
        {(["tl", "tr", "bl", "br"] as const).map((p) => (
          <div
            key={p}
            className={`absolute size-4 border-intel/60 ${
              p === "tl" ? "top-2 left-2 border-l border-t" :
              p === "tr" ? "top-2 right-2 border-r border-t" :
              p === "bl" ? "bottom-2 left-2 border-l border-b" :
              "bottom-2 right-2 border-r border-b"
            }`}
          />
        ))}

        {/* readouts */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <div className="bg-background/70 backdrop-blur border border-border px-3 py-2 rounded-sm">
            <div className="text-[9px] font-mono uppercase text-foreground/40 tracking-widest">Layer</div>
            <div className="text-xs font-mono text-intel">GEO_PRIMARY · SAT_IR · OSINT</div>
          </div>
          <div className="bg-background/70 backdrop-blur border border-border px-3 py-2 rounded-sm flex gap-3">
            <Stat label="Assets" value="1,402" tone="intel" />
            <Stat label="Events" value="37" tone="warn" />
            <Stat label="Critical" value="04" tone="critical" />
          </div>
        </div>

        <div className="absolute top-4 right-4 bg-background/70 backdrop-blur border border-border px-3 py-2 rounded-sm">
          <div className="text-[9px] font-mono uppercase text-foreground/40 tracking-widest mb-1">Signal Density</div>
          <div className="flex items-end gap-[3px] h-8">
            {[30, 45, 38, 60, 52, 80, 64, 90, 74, 58, 70, 86].map((h, i) => (
              <div key={i} className="w-1.5 bg-intel/70" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>

        <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-foreground/25 absolute bottom-6 left-1/2 -translate-x-1/2">
          Global Live Raster · 03°N 142°E
        </span>
      </div>

      {/* Timeline ribbon */}
      <div className="absolute bottom-6 left-8 right-8 h-14 bg-surface/85 backdrop-blur-md border border-border rounded-sm flex items-center px-4 gap-4">
        <div className="text-[10px] font-mono text-foreground/40 whitespace-nowrap uppercase tracking-[0.18em]">
          T-Minus Timeline
        </div>
        <div className="flex-1 h-px bg-white/5 relative">
          {[
            { l: "12%", t: "stable", lbl: "T-04:00" },
            { l: "28%", t: "warn", lbl: "T-02:40" },
            { l: "44%", t: "intel", lbl: "T-01:15" },
            { l: "62%", t: "critical", lbl: "T-00:08" },
            { l: "78%", t: "intel", lbl: "T+01:30" },
            { l: "92%", t: "warn", lbl: "T+03:00" },
          ].map((m, i) => {
            const c = TONE[m.t as keyof typeof TONE];
            return (
              <div key={i} className="absolute -translate-x-1/2 top-1/2 -translate-y-1/2 group" style={{ left: m.l }}>
                <div className={`size-2 ${c.bg} rotate-45 border border-background`} />
                <div className="absolute left-1/2 -translate-x-1/2 top-3 text-[8px] font-mono text-foreground/40 whitespace-nowrap">{m.lbl}</div>
              </div>
            );
          })}
          <div className="absolute left-[62%] top-1/2 -translate-y-1/2 h-3 w-px bg-critical shadow-[0_0_8px_#EF4444]" />
        </div>
        <div className="text-[10px] font-mono text-intel uppercase tracking-widest">NOW</div>
      </div>
    </section>
  );
}

function CopilotDock() {
  return (
    <footer className="h-24 border-t border-border bg-surface/60 backdrop-blur flex items-center px-5 gap-5 shrink-0">
      <div className="size-12 bg-intel/10 border border-intel/30 rounded-sm grid place-items-center shrink-0">
        <span className="text-intel text-[10px] font-mono font-bold tracking-widest">AEGIS</span>
      </div>
      <div className="flex-1 flex flex-col gap-2 min-w-0">
        <div className="flex gap-1.5 flex-wrap">
          {[
            { l: "Reasoning · Probabilistic", t: "" },
            { l: "Source · Geospatial Signal", t: "intel" },
            { l: "Confidence · 0.87", t: "stable" },
            { l: "Ethics Gate · Cleared", t: "stable" },
          ].map((c) => (
            <span
              key={c.l}
              className={`text-[9px] px-1.5 py-0.5 rounded-sm uppercase font-bold tracking-wider border ${
                c.t === "intel" ? "bg-intel/10 text-intel/90 border-intel/20" :
                c.t === "stable" ? "bg-stable/10 text-stable border-stable/20" :
                "bg-foreground/5 text-foreground/60 border-border"
              }`}
            >
              {c.l}
            </span>
          ))}
        </div>
        <input
          type="text"
          placeholder="Query Atlas Intelligence  →  e.g. simulate port closure effects in Strait of Malacca"
          className="bg-transparent border-none text-sm focus:outline-none placeholder:text-foreground/25 w-full font-mono"
        />
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button className="h-10 px-3 bg-foreground/5 rounded-sm border border-border text-[10px] font-mono font-bold uppercase tracking-widest text-foreground/50 hover:text-foreground hover:border-foreground/20 transition-colors">
          Refine
        </button>
        <button className="h-10 px-4 bg-intel/10 rounded-sm border border-intel/40 text-[10px] font-mono font-bold uppercase tracking-widest text-intel hover:bg-intel/20 transition-colors">
          Execute
        </button>
      </div>
    </footer>
  );
}

function AgentGrid() {
  return (
    <div className="p-4 border-b border-border">
      <div className="flex justify-between items-center mb-3">
        <div className="text-[10px] font-bold text-foreground/40 uppercase tracking-[0.18em]">Operational Agents</div>
        <span className="text-[9px] font-mono text-intel">06 / 06 ONLINE</span>
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {AGENTS.map((a) => {
          const c = TONE[a.tone as keyof typeof TONE];
          return (
            <div key={a.id} className="bg-background/60 border border-border p-2 rounded-sm">
              <div className="text-[10px] font-mono text-foreground/40">{a.id}</div>
              <div className="flex items-center justify-between mt-1">
                <div className={`size-1.5 ${c.bg} rounded-full ${a.pulse ? "animate-pulse-dot" : ""}`} />
                <span className={`text-[9px] font-bold uppercase ${c.text}`}>{a.state}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FeedCard({ item }: { item: (typeof FEED)[number] }) {
  const c = TONE[item.tone as keyof typeof TONE];
  return (
    <div className={`p-3 bg-foreground/[0.02] border-l-2 ${c.border} border-y border-r border-border hover:bg-foreground/[0.04] transition-colors cursor-pointer`}>
      <div className="flex justify-between items-start mb-1.5">
        <span className={`text-[10px] font-mono ${c.text}`}>{item.id}</span>
        <span className="text-[10px] font-mono font-bold text-foreground/80">{item.conf}% CONF</span>
      </div>
      <div className="text-xs font-medium leading-snug mb-2 text-foreground/90 text-pretty">{item.title}</div>
      <div className="h-[3px] bg-white/5 w-full mb-2 overflow-hidden">
        <div className={`h-full ${c.bg}`} style={{ width: `${item.conf}%` }} />
      </div>
      <div className="flex justify-between items-center">
        <div className="text-[10px] uppercase font-bold text-foreground/40 tracking-wider">REC · {item.rec}</div>
        <div className="text-[9px] font-mono text-foreground/30">SAT · OSINT</div>
      </div>
    </div>
  );
}

function IntelStream() {
  return (
    <div className="flex-1 flex flex-col p-4 min-h-0 overflow-hidden">
      <div className="flex justify-between items-center mb-3">
        <div className="text-[10px] font-bold text-foreground/40 uppercase tracking-[0.18em]">Intelligence Stream</div>
        <span className="text-[9px] font-mono text-intel flex items-center gap-1.5">
          <span className="size-1.5 bg-intel rounded-full animate-pulse-dot" />
          LIVE
        </span>
      </div>
      <div className="space-y-2 overflow-y-auto pr-1 -mr-1">
        {FEED.map((f) => <FeedCard key={f.id} item={f} />)}
      </div>
    </div>
  );
}

function RiskVector() {
  const data = [42, 38, 55, 48, 60, 52, 68, 75, 70, 82, 78, 88];
  return (
    <div className="p-4 bg-background border-t border-border flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-[0.18em]">Global Risk Vector</span>
        <span className="text-sm font-mono text-critical font-bold">0.88</span>
      </div>
      <div className="h-10 w-full flex items-end gap-[3px]">
        {data.map((h, i) => (
          <div
            key={i}
            className={`w-full ${i >= data.length - 2 ? "bg-critical" : i >= data.length - 4 ? "bg-critical/50" : "bg-white/10"}`}
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
      <div className="flex justify-between text-[9px] font-mono text-foreground/30 uppercase">
        <span>T-12h</span>
        <span>Δ +0.21</span>
        <span>T+0h</span>
      </div>
    </div>
  );
}

function RightSidebar() {
  return (
    <aside className="w-[340px] border-l border-border bg-surface flex flex-col shrink-0 overflow-hidden">
      <AgentGrid />
      <IntelStream />
      <RiskVector />
    </aside>
  );
}

// ---------- shell ----------
function CommandCenter() {
  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden selection:bg-intel/30">
      <NavRail />
      <main className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <MapPanel />
        <CopilotDock />
      </main>
      <RightSidebar />
    </div>
  );
}
