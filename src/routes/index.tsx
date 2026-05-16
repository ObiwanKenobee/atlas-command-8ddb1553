import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import worldMap from "../assets/world-map.jpg";
import {
  FEED,
  PREFILL_PROMPTS,
  SCENARIO_OUTPUT,
  SECTORS,
  SEVERITY_RANK,
  STREAMS,
  TIMELINE_12H,
  TONE_CLASS,
  type FeedItem,
  type Severity,
  type StreamKey,
  type Tone,
} from "../lib/atlas-data";
import {
  MODE_VARS,
  THEME_MODES,
  ThemeModeProvider,
  useThemeMode,
} from "../lib/theme-mode";

export const Route = createFileRoute("/")({
  component: CommandCenterRoot,
});

// ─────────────────────────── shared atoms

const NAV_LAYERS = [
  { key: "strategic", label: "ST" },
  { key: "geospatial", label: "GE", active: true },
  { key: "simulation", label: "SI" },
  { key: "collab", label: "CO" },
  { key: "risk", label: "RI" },
  { key: "federation", label: "FE" },
  { key: "identity", label: "ID" },
];

const AGENTS = [
  { id: "SENTINEL", state: "Nominal", tone: "stable" as Tone },
  { id: "CRISIS", state: "Active", tone: "critical" as Tone, pulse: true },
  { id: "FINANCE", state: "Standby", tone: "stable" as Tone },
  { id: "CLIMATE", state: "Warning", tone: "warn" as Tone },
  { id: "INFRA", state: "Offline", tone: "muted" as Tone },
  { id: "ETHICS", state: "Optimal", tone: "stable" as Tone },
];

const MARKERS = [
  { x: 22, y: 38, tone: "intel" as Tone, label: "NORAM-01" },
  { x: 48, y: 32, tone: "warn" as Tone, label: "EU-CENTRAL" },
  { x: 56, y: 48, tone: "critical" as Tone, label: "MENA-04" },
  { x: 74, y: 36, tone: "intel" as Tone, label: "EAS-12" },
  { x: 80, y: 70, tone: "stable" as Tone, label: "OCE-02" },
  { x: 34, y: 70, tone: "warn" as Tone, label: "LATAM-03" },
  { x: 62, y: 58, tone: "critical" as Tone, label: "IND-07" },
];

const TICKER = [
  "PACIFIC_QUAD_4 // CRISIS AGENT ACTIVE",
  "SIGINT_ALERT_09 // 98% CONF",
  "STRAIT_TRANSIT // VOLUME -12.4%",
  "ORBITAL_PASS NRO-77 // T+04:21",
  "FINANCIAL CORR // 0.81",
  "ETHICS REVIEW QUEUE // 03 OPEN",
  "INFRA NODE MERIDIAN-3 // ANOMALY",
];

function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: Tone;
}) {
  const c = tone ? TONE_CLASS[tone].text : "text-foreground";
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

// ─────────────────────────── theme mode switcher

function ModeSwitcher() {
  const { mode, setMode } = useThemeMode();
  const [open, setOpen] = useState(false);
  const active = THEME_MODES.find((m) => m.key === mode)!;
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="h-8 flex items-center gap-2 px-2.5 border border-border bg-foreground/5 hover:bg-foreground/10 rounded-sm transition-colors"
      >
        <span className="size-2 rounded-full" style={{ background: active.accent, boxShadow: `0 0 8px ${active.accent}` }} />
        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-foreground/80">
          {active.label}
        </span>
        <span className="text-[9px] font-mono text-foreground/40">{active.code}</span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-10 z-50 w-56 bg-surface border border-border rounded-sm shadow-2xl shadow-black/60 p-1.5">
            <div className="text-[9px] font-mono uppercase text-foreground/40 tracking-widest px-2 py-1.5">
              Operational Theme
            </div>
            {THEME_MODES.map((m) => {
              const vars = MODE_VARS[m.key];
              return (
                <button
                  key={m.key}
                  onClick={() => {
                    setMode(m.key);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-2 py-1.5 rounded-sm transition-colors text-left ${
                    m.key === mode ? "bg-foreground/10" : "hover:bg-foreground/5"
                  }`}
                >
                  <div className="flex gap-0.5">
                    <span className="size-2 rounded-sm" style={{ background: vars["--intel"] }} />
                    <span className="size-2 rounded-sm" style={{ background: vars["--warn"] }} />
                    <span className="size-2 rounded-sm" style={{ background: vars["--critical"] }} />
                  </div>
                  <span className="text-[11px] font-medium uppercase tracking-wide flex-1">{m.label}</span>
                  <span className="text-[9px] font-mono text-foreground/40">{m.code}</span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// ─────────────────────────── nav rail

function NavRail() {
  return (
    <nav className="w-14 flex flex-col items-center py-5 border-r border-border bg-surface shrink-0">
      <div className="size-9 bg-intel/10 border border-intel/30 rounded-sm grid place-items-center mb-8">
        <div className="size-3 bg-intel" style={{ boxShadow: "0 0 10px var(--intel)" }} />
      </div>
      <div className="flex flex-col gap-3">
        {NAV_LAYERS.map((l) => (
          <button
            key={l.key}
            className={`size-9 rounded-sm grid place-items-center transition-colors ${
              l.active
                ? "bg-intel/10 border border-intel/40 text-intel"
                : "border border-transparent text-foreground/40 hover:text-foreground hover:bg-foreground/5"
            }`}
          >
            <span className="text-[9px] font-mono font-bold uppercase">{l.label}</span>
          </button>
        ))}
      </div>
      <div className="mt-auto flex flex-col items-center gap-3">
        <div className="size-2 bg-critical rounded-full animate-pulse-dot" />
        <div className="size-7 rounded-sm bg-foreground/5 border border-border" />
      </div>
    </nav>
  );
}

// ─────────────────────────── top command bar

function TopBar({
  layout,
  setLayout,
  sidebarOpen,
  setSidebarOpen,
}: {
  layout: LayoutPreset;
  setLayout: (l: LayoutPreset) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
}) {
  const now = useClock();
  const uptime = useMemo(() => {
    const base = new Date();
    base.setHours(base.getHours() - 142);
    const diff = Math.floor((now.getTime() - base.getTime()) / 1000);
    const h = String(Math.floor(diff / 3600)).padStart(3, "0");
    const m = String(Math.floor((diff % 3600) / 60)).padStart(2, "0");
    const s = String(diff % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  }, [now]);
  return (
    <header className="h-14 border-b border-border flex items-center px-5 gap-5 shrink-0 bg-surface/40">
      <div className="font-mono text-[11px] font-bold tracking-[0.22em] text-foreground/50 uppercase whitespace-nowrap">
        Atlas Sanctum<span className="text-foreground/20"> / Core v4.2</span>
      </div>
      <Divider />
      <div className="flex gap-5 items-center">
        <Stat label="Region" value="PACIFIC_QUAD_4" />
        <Stat label="Threat" value="ELEVATED_ORANGE" tone="warn" />
        <Stat label="Uptime" value={uptime} />
        <Stat label="Clock" value={`${now.toISOString().slice(11, 19)}Z`} tone="intel" />
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
      <LayoutSwitcher value={layout} onChange={setLayout} />
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="h-8 px-2 text-[9px] font-mono font-bold uppercase tracking-widest border border-border rounded-sm hover:bg-foreground/5 text-foreground/60"
        title="Toggle right sidebar"
      >
        {sidebarOpen ? "Hide ▶" : "◀ Show"}
      </button>
      <ModeSwitcher />
      <Divider />
      <div className="flex items-center gap-3">
        <div className="text-right leading-tight">
          <div className="text-xs font-medium uppercase tracking-tight">D. Kincaid</div>
          <div className="text-[10px] text-foreground/40 font-mono">SOVEREIGN_AUTH_01</div>
        </div>
        <div className="size-8 bg-foreground/5 border border-border rounded-sm grid place-items-center text-[10px] font-mono text-intel">
          DK
        </div>
      </div>
    </header>
  );
}

// ─────────────────────────── layout presets

type LayoutPreset = "operations" | "map-focus" | "intel-focus" | "simulation";
const LAYOUT_PRESETS: { key: LayoutPreset; label: string; desc: string }[] = [
  { key: "operations", label: "OPS", desc: "Balanced command grid" },
  { key: "map-focus", label: "GEO", desc: "Geospatial dominant" },
  { key: "intel-focus", label: "INT", desc: "Intel stream dominant" },
  { key: "simulation", label: "SIM", desc: "Copilot simulation expanded" },
];

function LayoutSwitcher({ value, onChange }: { value: LayoutPreset; onChange: (l: LayoutPreset) => void }) {
  return (
    <div className="flex items-center gap-px border border-border rounded-sm overflow-hidden bg-background/40">
      {LAYOUT_PRESETS.map((p) => (
        <button
          key={p.key}
          onClick={() => onChange(p.key)}
          title={p.desc}
          className={`h-8 px-2.5 text-[9px] font-mono font-bold uppercase tracking-widest transition-colors ${
            value === p.key ? "bg-intel/15 text-intel" : "text-foreground/40 hover:text-foreground hover:bg-foreground/5"
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}

// ─────────────────────────── map

type MapLayers = { markers: boolean; flow: boolean; grid: boolean; heatmap: boolean };

function MapPanel({
  layers,
  setLayers,
}: {
  layers: MapLayers;
  setLayers: (l: MapLayers) => void;
}) {
  const toggle = (k: keyof MapLayers) => setLayers({ ...layers, [k]: !layers[k] });
  return (
    <section className="flex-1 relative overflow-hidden p-3 bg-[var(--background)] min-h-0">
      <div className="absolute inset-3 rounded-sm border border-border overflow-hidden bg-surface/40 scanline">
        <img
          src={worldMap}
          alt="Global intelligence raster"
          width={1920}
          height={1280}
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        {layers.heatmap && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle at 56% 48%, var(--accent-glow), transparent 30%), radial-gradient(circle at 22% 38%, var(--accent-glow), transparent 25%), radial-gradient(circle at 80% 70%, var(--accent-glow), transparent 28%)",
              mixBlendMode: "screen",
            }}
          />
        )}
        {layers.grid && (
          <svg className="absolute inset-0 w-full h-full opacity-[0.07]" preserveAspectRatio="none">
            <defs>
              <pattern id="g" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--intel)" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#g)" />
          </svg>
        )}
        {layers.flow && (
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M22 38 Q40 10 74 36" fill="none" stroke="var(--intel)" strokeWidth="0.15" className="flow-line" opacity="0.6" />
            <path d="M56 48 Q60 30 74 36" fill="none" stroke="var(--critical)" strokeWidth="0.15" className="flow-line" opacity="0.7" />
            <path d="M34 70 Q50 60 62 58" fill="none" stroke="var(--warn)" strokeWidth="0.15" className="flow-line" opacity="0.5" />
          </svg>
        )}
        {layers.markers &&
          MARKERS.map((m) => {
            const c = TONE_CLASS[m.tone];
            return (
              <div
                key={m.label}
                className="absolute -translate-x-1/2 -translate-y-1/2 group"
                style={{ left: `${m.x}%`, top: `${m.y}%` }}
              >
                <div className={`size-2 ${c.bg} rounded-full animate-pulse-dot`} style={{ boxShadow: `0 0 12px currentColor` }} />
                <div className={`absolute inset-0 -m-2 rounded-full border ${c.border} opacity-40`} />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-[9px] font-mono uppercase bg-background/90 border border-border px-1.5 py-0.5 whitespace-nowrap">
                  {m.label}
                </div>
              </div>
            );
          })}

        {(["tl", "tr", "bl", "br"] as const).map((p) => (
          <div
            key={p}
            className={`absolute size-4 border-intel/60 ${
              p === "tl"
                ? "top-2 left-2 border-l border-t"
                : p === "tr"
                ? "top-2 right-2 border-r border-t"
                : p === "bl"
                ? "bottom-2 left-2 border-l border-b"
                : "bottom-2 right-2 border-r border-b"
            }`}
          />
        ))}

        {/* layer toggle */}
        <div className="absolute top-4 right-4 bg-background/80 backdrop-blur border border-border rounded-sm p-2 flex flex-col gap-1 w-40">
          <div className="text-[9px] font-mono uppercase text-foreground/40 tracking-widest mb-1">Map Layers</div>
          {(Object.keys(layers) as (keyof MapLayers)[]).map((k) => (
            <button
              key={k}
              onClick={() => toggle(k)}
              className="flex items-center justify-between px-1.5 py-1 hover:bg-foreground/5 rounded-sm transition-colors"
            >
              <span className="text-[10px] font-mono uppercase text-foreground/70">{k}</span>
              <span
                className={`h-3 w-6 rounded-full relative transition-colors ${
                  layers[k] ? "bg-intel/40" : "bg-foreground/10"
                }`}
              >
                <span
                  className={`absolute top-0.5 size-2 rounded-full transition-all ${
                    layers[k] ? "left-3 bg-intel" : "left-0.5 bg-foreground/40"
                  }`}
                />
              </span>
            </button>
          ))}
        </div>

        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <div className="bg-background/80 backdrop-blur border border-border px-3 py-2 rounded-sm">
            <div className="text-[9px] font-mono uppercase text-foreground/40 tracking-widest">Layer</div>
            <div className="text-xs font-mono text-intel">GEO_PRIMARY · SAT_IR · OSINT</div>
          </div>
          <div className="bg-background/80 backdrop-blur border border-border px-3 py-2 rounded-sm flex gap-3">
            <Stat label="Assets" value="1,402" tone="intel" />
            <Stat label="Events" value="37" tone="warn" />
            <Stat label="Critical" value="04" tone="critical" />
          </div>
        </div>

        <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-foreground/25 absolute bottom-6 left-1/2 -translate-x-1/2">
          Global Live Raster · 03°N 142°E
        </span>
      </div>

      {/* Timeline ribbon */}
      <div className="absolute bottom-5 left-7 right-7 h-12 bg-surface/85 backdrop-blur-md border border-border rounded-sm flex items-center px-4 gap-4">
        <div className="text-[10px] font-mono text-foreground/40 whitespace-nowrap uppercase tracking-[0.18em]">
          T-Minus
        </div>
        <div className="flex-1 h-px bg-white/5 relative">
          {[
            { l: "12%", t: "stable" as Tone, lbl: "T-04:00" },
            { l: "28%", t: "warn" as Tone, lbl: "T-02:40" },
            { l: "44%", t: "intel" as Tone, lbl: "T-01:15" },
            { l: "62%", t: "critical" as Tone, lbl: "T-00:08" },
            { l: "78%", t: "intel" as Tone, lbl: "T+01:30" },
            { l: "92%", t: "warn" as Tone, lbl: "T+03:00" },
          ].map((m, i) => {
            const c = TONE_CLASS[m.t];
            return (
              <div
                key={i}
                className="absolute -translate-x-1/2 top-1/2 -translate-y-1/2"
                style={{ left: m.l }}
              >
                <div className={`size-2 ${c.bg} rotate-45 border border-background`} />
                <div className="absolute left-1/2 -translate-x-1/2 top-3 text-[8px] font-mono text-foreground/40 whitespace-nowrap">
                  {m.lbl}
                </div>
              </div>
            );
          })}
          <div className="absolute left-[62%] top-1/2 -translate-y-1/2 h-3 w-px bg-critical" />
        </div>
        <div className="text-[10px] font-mono text-intel uppercase tracking-widest">NOW</div>
      </div>
    </section>
  );
}

// ─────────────────────────── copilot dock with interactions

function CopilotDock({
  expanded,
  setExpanded,
}: {
  expanded: boolean;
  setExpanded: (v: boolean) => void;
}) {
  const [prompt, setPrompt] = useState("");
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [vars, setVars] = useState({ severity: 60, horizon: 24, latitude: 30 });
  const [logs, setLogs] = useState<string[]>([]);

  const run = () => {
    if (!prompt.trim()) return;
    setRunning(true);
    setDone(false);
    setLogs([]);
    const ticks = [
      "[Aegis-7] parsing intent…",
      "[Crisis] cross-referencing geospatial signal",
      "[Finance] modelling hedge bands ±2σ",
      "[Ethics] verifying intervention thresholds",
      "[Aegis-7] synthesizing recommendation",
    ];
    let i = 0;
    const id = setInterval(() => {
      setLogs((l) => [...l, ticks[i]]);
      i += 1;
      if (i >= ticks.length) {
        clearInterval(id);
        setRunning(false);
        setDone(true);
      }
    }, 380);
  };

  return (
    <footer
      className={`border-t border-border bg-surface/60 backdrop-blur flex flex-col shrink-0 transition-[height] duration-300 overflow-hidden ${
        expanded ? "h-[360px]" : "h-24"
      }`}
    >
      {/* compact dock */}
      <div className="h-24 flex items-center px-5 gap-5 shrink-0 border-b border-border">
        <div className="size-12 bg-intel/10 border border-intel/30 rounded-sm grid place-items-center shrink-0">
          <span className="text-intel text-[10px] font-mono font-bold tracking-widest">AEGIS</span>
        </div>
        <div className="flex-1 flex flex-col gap-2 min-w-0">
          <div className="flex gap-1.5 flex-wrap items-center">
            <span className="text-[9px] px-1.5 py-0.5 rounded-sm uppercase font-bold tracking-wider border bg-foreground/5 text-foreground/60 border-border">
              Reasoning · Probabilistic
            </span>
            <span className="text-[9px] px-1.5 py-0.5 rounded-sm uppercase font-bold tracking-wider border bg-intel/10 text-intel/90 border-intel/20">
              Source · Geospatial
            </span>
            <span className="text-[9px] px-1.5 py-0.5 rounded-sm uppercase font-bold tracking-wider border bg-stable/10 text-stable border-stable/20">
              Ethics Gate · Cleared
            </span>
            <button
              onClick={() => setExpanded(!expanded)}
              className="ml-auto text-[9px] px-2 py-0.5 rounded-sm uppercase font-bold tracking-widest border border-border text-foreground/50 hover:text-foreground hover:bg-foreground/5"
            >
              {expanded ? "Collapse ▼" : "Scenarios ▲"}
            </button>
          </div>
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && run()}
            placeholder="Query Atlas Intelligence  →  e.g. simulate port closure effects in Strait of Malacca"
            className="bg-transparent border-none text-sm focus:outline-none placeholder:text-foreground/25 w-full font-mono"
          />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              setPrompt("");
              setDone(false);
              setLogs([]);
            }}
            className="h-10 px-3 bg-foreground/5 rounded-sm border border-border text-[10px] font-mono font-bold uppercase tracking-widest text-foreground/50 hover:text-foreground hover:border-foreground/20"
          >
            Reset
          </button>
          <button
            onClick={run}
            disabled={running}
            className="h-10 px-4 bg-intel/10 rounded-sm border border-intel/40 text-[10px] font-mono font-bold uppercase tracking-widest text-intel hover:bg-intel/20 transition-colors disabled:opacity-50"
          >
            {running ? "Running…" : "Execute"}
          </button>
        </div>
      </div>

      {/* expanded scenario workspace */}
      {expanded && (
        <div className="flex-1 min-h-0 grid grid-cols-12 gap-px bg-border">
          {/* prefilled prompts */}
          <div className="col-span-3 bg-surface p-3 flex flex-col gap-2 overflow-y-auto">
            <div className="text-[10px] font-bold text-foreground/40 uppercase tracking-[0.18em] mb-1">
              Prefilled Queries
            </div>
            {PREFILL_PROMPTS.map((p) => (
              <button
                key={p}
                onClick={() => setPrompt(p)}
                className="text-left text-[11px] leading-snug bg-background/60 border border-border hover:border-intel/40 hover:bg-intel/5 px-2 py-1.5 rounded-sm text-foreground/80"
              >
                {p}
              </button>
            ))}
          </div>

          {/* scenario inputs */}
          <div className="col-span-3 bg-surface p-3 flex flex-col gap-3 overflow-y-auto">
            <div className="text-[10px] font-bold text-foreground/40 uppercase tracking-[0.18em]">
              Scenario Variables
            </div>
            <ScenarioSlider label="Event Severity" unit="%" value={vars.severity} onChange={(v) => setVars({ ...vars, severity: v })} />
            <ScenarioSlider label="Time Horizon" unit="h" min={1} max={168} value={vars.horizon} onChange={(v) => setVars({ ...vars, horizon: v })} />
            <ScenarioSlider label="Latitude Spread" unit="°" min={0} max={90} value={vars.latitude} onChange={(v) => setVars({ ...vars, latitude: v })} />

            <div className="mt-2 grid grid-cols-2 gap-1.5">
              {["Pessimistic", "Baseline", "Optimistic", "Black-Swan"].map((t, i) => (
                <button
                  key={t}
                  className={`text-[9px] font-mono font-bold uppercase tracking-widest py-1.5 border rounded-sm ${
                    i === 1
                      ? "border-intel/40 bg-intel/10 text-intel"
                      : "border-border bg-background/60 text-foreground/50 hover:text-foreground"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* reasoning log */}
          <div className="col-span-3 bg-surface p-3 flex flex-col overflow-hidden">
            <div className="text-[10px] font-bold text-foreground/40 uppercase tracking-[0.18em] mb-2">
              Reasoning Trace
            </div>
            <div className="flex-1 bg-background/60 border border-border rounded-sm p-2 font-mono text-[10px] leading-relaxed overflow-y-auto">
              {logs.length === 0 && !done && (
                <div className="text-foreground/30">› awaiting execute()…</div>
              )}
              {logs.map((l, i) => (
                <div key={i} className="text-foreground/70">{l}</div>
              ))}
              {running && <div className="text-intel">› <span className="animate-pulse-dot inline-block">▮</span></div>}
              {done && (
                <div className="mt-2 text-stable">› complete · {Math.round(SCENARIO_OUTPUT.confidence * 100)}% confidence</div>
              )}
            </div>
          </div>

          {/* output panel */}
          <div className="col-span-3 bg-surface p-3 flex flex-col overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <div className="text-[10px] font-bold text-foreground/40 uppercase tracking-[0.18em]">
                Recommendation
              </div>
              {done && (
                <span className="text-[9px] font-mono text-stable">S-07 · READY</span>
              )}
            </div>
            {!done && (
              <div className="flex-1 grid place-items-center text-[10px] font-mono text-foreground/30 text-center px-4">
                Execute a query to receive an AI-generated action plan, agent assignments, and confidence band.
              </div>
            )}
            {done && (
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-foreground uppercase tracking-wide leading-tight">
                  {SCENARIO_OUTPUT.headline}
                </div>
                <p className="text-[11px] text-foreground/70 leading-snug">{SCENARIO_OUTPUT.summary}</p>
                <div className="space-y-1">
                  {SCENARIO_OUTPUT.steps.map((s) => (
                    <div key={s.t} className="flex gap-2 text-[10px] leading-snug">
                      <span className="font-mono text-intel shrink-0">{s.t}</span>
                      <span className="text-foreground/70">{s.body}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-2 mt-2 border-t border-border space-y-1">
                  {SCENARIO_OUTPUT.agents.map((a) => (
                    <div key={a.name} className="flex justify-between text-[10px] font-mono">
                      <span className="text-foreground/50">{a.name}</span>
                      <span className="text-foreground/70">{a.action}</span>
                    </div>
                  ))}
                </div>
                <button className="w-full h-8 mt-2 bg-critical/10 hover:bg-critical/20 border border-critical/40 text-critical text-[10px] font-mono font-bold uppercase tracking-widest rounded-sm">
                  ⚠ Authorize Response
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </footer>
  );
}

function ScenarioSlider({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  unit = "",
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  unit?: string;
}) {
  return (
    <label className="flex flex-col gap-1">
      <div className="flex justify-between">
        <span className="text-[10px] font-mono uppercase text-foreground/50 tracking-wider">{label}</span>
        <span className="text-[10px] font-mono text-intel">{value}{unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[var(--intel)] h-1"
      />
    </label>
  );
}

// ─────────────────────────── intel stream

function SeverityBanner({ critical }: { critical: FeedItem[] }) {
  if (critical.length === 0) return null;
  const top = critical[0];
  return (
    <div className="border border-critical/50 bg-critical/10 rounded-sm p-2.5 flex items-start gap-2.5 mb-3">
      <span className="size-2 bg-critical rounded-full animate-pulse-dot mt-1.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-critical">
            CRITICAL · {critical.length} ACTIVE
          </span>
          <span className="text-[9px] font-mono text-critical/70">{top.id}</span>
        </div>
        <div className="text-[11px] text-foreground font-medium leading-snug">{top.title}</div>
        <button className="mt-1.5 text-[9px] font-mono font-bold uppercase tracking-widest text-critical hover:underline">
          Escalate now →
        </button>
      </div>
    </div>
  );
}

function IntelStream() {
  const [stream, setStream] = useState<StreamKey>("all");
  const [query, setQuery] = useState("");
  const [minSev, setMinSev] = useState<Severity>("low");

  const filtered = useMemo(() => {
    return FEED.filter((f) => {
      if (stream !== "all" && f.stream !== stream) return false;
      if (SEVERITY_RANK[f.severity] < SEVERITY_RANK[minSev]) return false;
      if (query && !`${f.id} ${f.title} ${f.region} ${f.source}`.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [stream, query, minSev]);

  const critical = filtered.filter((f) => f.severity === "critical");

  return (
    <div className="flex-1 flex flex-col p-3 min-h-0 overflow-hidden">
      <div className="flex justify-between items-center mb-2">
        <div className="text-[10px] font-bold text-foreground/40 uppercase tracking-[0.18em]">Intelligence Stream</div>
        <span className="text-[9px] font-mono text-intel flex items-center gap-1.5">
          <span className="size-1.5 bg-intel rounded-full animate-pulse-dot" />
          LIVE · {filtered.length}
        </span>
      </div>

      {/* stream tabs */}
      <div className="flex flex-wrap gap-1 mb-2">
        {STREAMS.map((s) => (
          <button
            key={s.key}
            onClick={() => setStream(s.key)}
            className={`text-[9px] font-mono font-bold uppercase tracking-widest px-1.5 py-1 rounded-sm border transition-colors ${
              stream === s.key
                ? "bg-intel/15 border-intel/40 text-intel"
                : "border-border text-foreground/50 hover:text-foreground hover:bg-foreground/5"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* search + severity */}
      <div className="flex gap-1.5 mb-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="search id, region, source…"
          className="flex-1 bg-background/60 border border-border rounded-sm px-2 py-1 text-[10px] font-mono focus:outline-none focus:border-intel/50 placeholder:text-foreground/30"
        />
        <select
          value={minSev}
          onChange={(e) => setMinSev(e.target.value as Severity)}
          className="bg-background/60 border border-border rounded-sm px-2 py-1 text-[10px] font-mono focus:outline-none focus:border-intel/50"
        >
          <option value="low">≥ LOW</option>
          <option value="medium">≥ MED</option>
          <option value="high">≥ HIGH</option>
          <option value="critical">CRIT</option>
        </select>
      </div>

      <div className="overflow-y-auto pr-1 -mr-1 flex-1">
        <SeverityBanner critical={critical} />
        <div className="space-y-2">
          {filtered.map((f) => {
            const c = TONE_CLASS[f.tone];
            return (
              <div
                key={f.id}
                className={`p-2.5 bg-foreground/[0.02] border-l-2 ${c.border} border-y border-r border-border hover:bg-foreground/[0.05] transition-colors cursor-pointer`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className={`text-[10px] font-mono ${c.text}`}>{f.id}</span>
                  <span className="text-[10px] font-mono font-bold text-foreground/80">{f.conf}%</span>
                </div>
                <div className="text-[11px] font-medium leading-snug mb-1.5 text-foreground/90 text-pretty">{f.title}</div>
                <div className="h-[3px] bg-white/5 w-full mb-1.5 overflow-hidden">
                  <div className={`h-full ${c.bg}`} style={{ width: `${f.conf}%` }} />
                </div>
                <div className="flex justify-between items-center gap-2">
                  <div className="text-[9px] uppercase font-bold text-foreground/40 tracking-wider truncate">REC · {f.rec}</div>
                  <div className="text-[9px] font-mono text-foreground/30 shrink-0">{f.source} · T-{f.timeAgo}</div>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="text-center text-[10px] font-mono text-foreground/30 py-8">
              ∅ No signals match current filters
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────── agent grid + risk

function AgentGrid() {
  return (
    <div className="p-3 border-b border-border">
      <div className="flex justify-between items-center mb-2">
        <div className="text-[10px] font-bold text-foreground/40 uppercase tracking-[0.18em]">Operational Agents</div>
        <span className="text-[9px] font-mono text-intel">06 / 06</span>
      </div>
      <div className="grid grid-cols-3 gap-1">
        {AGENTS.map((a) => {
          const c = TONE_CLASS[a.tone];
          const pulse = "pulse" in a && a.pulse;
          return (
            <div key={a.id} className="bg-background/60 border border-border p-1.5 rounded-sm">
              <div className="text-[9px] font-mono text-foreground/40">{a.id}</div>
              <div className="flex items-center justify-between mt-0.5">
                <div className={`size-1.5 ${c.bg} rounded-full ${pulse ? "animate-pulse-dot" : ""}`} />
                <span className={`text-[8px] font-bold uppercase ${c.text}`}>{a.state}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RiskVector() {
  const score = TIMELINE_12H[TIMELINE_12H.length - 1];
  const max = Math.max(...TIMELINE_12H);
  const min = Math.min(...TIMELINE_12H);

  // build sparkline path
  const W = 280;
  const H = 48;
  const path = TIMELINE_12H.map((v, i) => {
    const x = (i / (TIMELINE_12H.length - 1)) * W;
    const y = H - ((v - min) / (max - min || 1)) * (H - 4) - 2;
    return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(" ");

  return (
    <div className="p-3 bg-background border-t border-border flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-[0.18em]">Global Risk Vector</span>
        <div className="flex items-baseline gap-1.5">
          <span className="text-base font-mono text-critical font-bold leading-none">{score.toFixed(2)}</span>
          <span className="text-[9px] font-mono text-critical/70">Δ +0.21</span>
        </div>
      </div>

      {/* sparkline */}
      <div className="relative">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-12" preserveAspectRatio="none">
          <defs>
            <linearGradient id="riskFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="var(--critical)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="var(--critical)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={`${path} L ${W} ${H} L 0 ${H} Z`} fill="url(#riskFill)" />
          <path d={path} fill="none" stroke="var(--critical)" strokeWidth="1.2" />
          <circle cx={W} cy={H - ((score - min) / (max - min || 1)) * (H - 4) - 2} r="2.5" fill="var(--critical)" />
        </svg>
        <div className="absolute inset-0 grid grid-cols-4 pointer-events-none">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="border-l border-foreground/[0.04]" />
          ))}
        </div>
      </div>
      <div className="flex justify-between text-[9px] font-mono text-foreground/30 uppercase">
        <span>T-12H</span>
        <span>T-08H</span>
        <span>T-04H</span>
        <span>NOW</span>
      </div>

      {/* sectors */}
      <div className="space-y-1.5 mt-1">
        <div className="text-[9px] font-mono uppercase text-foreground/40 tracking-widest mb-1">
          Sector Breakdown
        </div>
        {SECTORS.map((s) => {
          const c = TONE_CLASS[s.tone];
          return (
            <div key={s.key} className="flex items-center gap-2">
              <span className="text-[10px] text-foreground/70 w-24 truncate">{s.label}</span>
              <div className="flex-1 h-1.5 bg-foreground/5 rounded-sm overflow-hidden">
                <div className={`h-full ${c.bg}`} style={{ width: `${Math.round(s.score * 100)}%` }} />
              </div>
              <span className={`text-[9px] font-mono w-10 text-right ${c.text}`}>
                {s.score.toFixed(2)}
              </span>
              <span className={`text-[9px] font-mono w-10 text-right ${s.delta > 0 ? "text-critical" : "text-stable"}`}>
                {s.delta > 0 ? "+" : ""}
                {s.delta.toFixed(2)}
              </span>
            </div>
          );
        })}
      </div>

      <button className="w-full h-9 mt-1 bg-critical/10 hover:bg-critical/20 border border-critical/40 text-critical text-[10px] font-mono font-bold uppercase tracking-widest rounded-sm flex items-center justify-center gap-2">
        <span className="size-1.5 bg-critical rounded-full animate-pulse-dot" />
        Escalate Critical Cluster
      </button>
    </div>
  );
}

function RightSidebar({ width }: { width: number }) {
  return (
    <aside
      className="border-l border-border bg-surface flex flex-col shrink-0 overflow-hidden"
      style={{ width }}
    >
      <AgentGrid />
      <IntelStream />
      <RiskVector />
    </aside>
  );
}

// ─────────────────────────── splitter

function Splitter({ onDrag }: { onDrag: (dx: number) => void }) {
  const dragging = useRef(false);
  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (dragging.current) onDrag(-e.movementX);
    };
    const up = () => (dragging.current = false);
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
  }, [onDrag]);
  return (
    <div
      onMouseDown={() => (dragging.current = true)}
      className="w-1 cursor-col-resize bg-border hover:bg-intel/40 transition-colors shrink-0"
      title="Drag to resize"
    />
  );
}

// ─────────────────────────── shell

function CommandCenterRoot() {
  return (
    <ThemeModeProvider>
      <CommandCenter />
    </ThemeModeProvider>
  );
}

function CommandCenter() {
  const [layout, setLayout] = useState<LayoutPreset>("operations");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(360);
  const [copilotExpanded, setCopilotExpanded] = useState(false);
  const [layers, setLayers] = useState<MapLayers>({
    markers: true,
    flow: true,
    grid: true,
    heatmap: true,
  });

  // apply layout preset
  useEffect(() => {
    if (layout === "map-focus") {
      setSidebarOpen(false);
      setCopilotExpanded(false);
    } else if (layout === "intel-focus") {
      setSidebarOpen(true);
      setSidebarWidth(460);
      setCopilotExpanded(false);
    } else if (layout === "simulation") {
      setCopilotExpanded(true);
      setSidebarOpen(true);
      setSidebarWidth(320);
    } else {
      setSidebarOpen(true);
      setSidebarWidth(360);
      setCopilotExpanded(false);
    }
  }, [layout]);

  const handleDrag = (dx: number) => {
    setSidebarWidth((w) => Math.max(280, Math.min(640, w + dx)));
  };

  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden selection:bg-intel/30">
      <NavRail />
      <main className="flex-1 flex flex-col min-w-0">
        <TopBar
          layout={layout}
          setLayout={setLayout}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
        <MapPanel layers={layers} setLayers={setLayers} />
        <CopilotDock expanded={copilotExpanded} setExpanded={setCopilotExpanded} />
      </main>
      {sidebarOpen && (
        <>
          <Splitter onDrag={handleDrag} />
          <RightSidebar width={sidebarWidth} />
        </>
      )}
    </div>
  );
}

