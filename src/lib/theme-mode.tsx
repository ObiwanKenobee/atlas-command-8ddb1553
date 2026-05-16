import { createContext, useContext, useState, type ReactNode } from "react";

export type ThemeMode = "operations" | "emergency" | "crisis" | "diplomatic" | "financial" | "defense";

export const THEME_MODES: { key: ThemeMode; label: string; code: string; accent: string }[] = [
  { key: "operations", label: "Operations", code: "OPS-00", accent: "#22D3EE" },
  { key: "emergency", label: "Emergency", code: "EMG-91", accent: "#F59E0B" },
  { key: "crisis", label: "Crisis", code: "CRS-1A", accent: "#EF4444" },
  { key: "diplomatic", label: "Diplomatic", code: "DIP-04", accent: "#A78BFA" },
  { key: "financial", label: "Financial", code: "FIN-22", accent: "#10B981" },
  { key: "defense", label: "Defense", code: "DEF-77", accent: "#60A5FA" },
];

// Each mode rewrites the core CSS variables for the dashboard. Components keep
// using the same semantic tokens (intel/warn/critical/etc) and shift wholesale.
export const MODE_VARS: Record<ThemeMode, Record<string, string>> = {
  operations: {
    "--background": "#050506",
    "--surface": "#0E0E10",
    "--intel": "#22D3EE",
    "--stable": "#10B981",
    "--warn": "#F59E0B",
    "--critical": "#EF4444",
    "--accent-glow": "rgba(34, 211, 238, 0.18)",
  },
  emergency: {
    "--background": "#0B0805",
    "--surface": "#16100A",
    "--intel": "#F59E0B",
    "--stable": "#65A30D",
    "--warn": "#FB923C",
    "--critical": "#EF4444",
    "--accent-glow": "rgba(245, 158, 11, 0.22)",
  },
  crisis: {
    "--background": "#0B0405",
    "--surface": "#180A0C",
    "--intel": "#FB7185",
    "--stable": "#F59E0B",
    "--warn": "#EF4444",
    "--critical": "#DC2626",
    "--accent-glow": "rgba(239, 68, 68, 0.28)",
  },
  diplomatic: {
    "--background": "#06070D",
    "--surface": "#0E1020",
    "--intel": "#A78BFA",
    "--stable": "#34D399",
    "--warn": "#FACC15",
    "--critical": "#F472B6",
    "--accent-glow": "rgba(167, 139, 250, 0.20)",
  },
  financial: {
    "--background": "#04080A",
    "--surface": "#0B1416",
    "--intel": "#10B981",
    "--stable": "#34D399",
    "--warn": "#F59E0B",
    "--critical": "#EF4444",
    "--accent-glow": "rgba(16, 185, 129, 0.22)",
  },
  defense: {
    "--background": "#040810",
    "--surface": "#0A1322",
    "--intel": "#60A5FA",
    "--stable": "#22D3EE",
    "--warn": "#F59E0B",
    "--critical": "#F43F5E",
    "--accent-glow": "rgba(96, 165, 250, 0.22)",
  },
};

type Ctx = {
  mode: ThemeMode;
  setMode: (m: ThemeMode) => void;
};

const ThemeModeContext = createContext<Ctx | null>(null);

export function ThemeModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>("operations");
  const vars = MODE_VARS[mode];
  return (
    <ThemeModeContext.Provider value={{ mode, setMode }}>
      <div style={vars as React.CSSProperties} className="contents">
        {children}
      </div>
    </ThemeModeContext.Provider>
  );
}

export function useThemeMode() {
  const ctx = useContext(ThemeModeContext);
  if (!ctx) throw new Error("ThemeModeProvider missing");
  return ctx;
}
