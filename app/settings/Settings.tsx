"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Calculator, BarChart3, History, Settings,
  Type, Volume2, VolumeX, Smartphone,
  Download, Trash2,
} from "lucide-react";

interface AppSettings {
  precision: number;
  haptic: boolean;
  sound: boolean;
  theme: "dark" | "neon";
}

export default function SettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<AppSettings>({
    precision: 4,
    haptic: true,
    sound: false,
    theme: "neon",
  });

  useEffect(() => {
    const saved = localStorage.getItem("ai-calc-settings");
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch { /* ignore */ }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("ai-calc-settings", JSON.stringify(settings));
  }, [settings]);

  const handleExport = () => {
    const data = { settings, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "calc-settings.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    if (confirm("Reset all settings to default?")) {
      setSettings({ precision: 4, haptic: true, sound: false, theme: "neon" });
    }
  };

  return (
    <div className="flex flex-col h-screen bg-neon-dark text-white overflow-hidden">
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">

        {/* Appearance */}
        <section>
          <h2 className="text-sm font-semibold text-white mb-3">Appearance</h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setSettings((p) => ({ ...p, theme: "dark" }))}
              className={`p-3 rounded-xl border transition ${settings.theme === "dark" ? "border-neon-green bg-neon-green10" : "border-neon-surface2 bg-neon-surface"}`}
            >
              <div className="w-full h-10 rounded-lg bg-neon-darker mb-2 flex items-center justify-center">
                <div className="w-3 h-6 bg-neon-green rounded" />
              </div>
              <div className="text-xs font-medium text-center">Total Black</div>
            </button>
            <button
              onClick={() => setSettings((p) => ({ ...p, theme: "neon" }))}
              className={`p-3 rounded-xl border transition ${settings.theme === "neon" ? "border-neon-green bg-neon-green10" : "border-neon-surface2 bg-neon-surface"}`}
            >
              <div className="w-full h-10 rounded-lg bg-neon-surface mb-2 flex items-center justify-center">
                <div className="w-3 h-6 bg-neon-green rounded shadow-[0_0_8px_var(--color-accent)]" />
              </div>
              <div className="text-xs font-medium text-center">Neon Night</div>
            </button>
          </div>
        </section>

        {/* General Settings */}
        <section>
          <h2 className="text-sm font-semibold text-white mb-3">General Settings</h2>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-neon-surface rounded-xl border border-neon-surface2">
              <div className="flex items-center gap-3">
                <Type className="w-4 h-4 text-neon-green" />
                <div>
                  <div className="text-sm font-medium">Precision</div>
                  <div className="text-[10px] text-[#555]">Decimal places (up to 12)</div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setSettings((p) => ({ ...p, precision: Math.max(1, p.precision - 1) }))}
                  className="w-6 h-6 rounded bg-neon-surface2 text-[#ccc] text-xs"
                >-</button>
                <span className="w-6 text-center text-sm font-mono">{settings.precision}</span>
                <button
                  onClick={() => setSettings((p) => ({ ...p, precision: Math.min(12, p.precision + 1) }))}
                  className="w-6 h-6 rounded bg-neon-surface2 text-[#ccc] text-xs"
                >+</button>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-neon-surface rounded-xl border border-neon-surface2">
              <div className="flex items-center gap-3">
                <Smartphone className="w-4 h-4 text-neon-green" />
                <div>
                  <div className="text-sm font-medium">Haptic Feedback</div>
                  <div className="text-[10px] text-[#555]">Vibrate on key press</div>
                </div>
              </div>
              <button
                onClick={() => setSettings((p) => ({ ...p, haptic: !p.haptic }))}
                className={`w-10 h-6 rounded-full transition relative ${settings.haptic ? "bg-neon-green" : "bg-[#333]"}`}
              >
                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${settings.haptic ? "translate-x-4" : "translate-x-0.5"}`} />
              </button>
            </div>
            <div className="flex items-center justify-between p-3 bg-neon-surface rounded-xl border border-neon-surface2">
              <div className="flex items-center gap-3">
                {settings.sound ? <Volume2 className="w-4 h-4 text-neon-green" /> : <VolumeX className="w-4 h-4 text-[#555]" />}
                <div>
                  <div className="text-sm font-medium">Sound Effects</div>
                  <div className="text-[10px] text-[#555]">Tactile click sounds</div>
                </div>
              </div>
              <button
                onClick={() => setSettings((p) => ({ ...p, sound: !p.sound }))}
                className={`w-10 h-6 rounded-full transition relative ${settings.sound ? "bg-neon-green" : "bg-[#333]"}`}
              >
                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${settings.sound ? "translate-x-4" : "translate-x-0.5"}`} />
              </button>
            </div>
          </div>
        </section>

        {/* Export / Reset */}
        <section>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleExport}
              className="flex items-center justify-center gap-2 p-3 bg-neon-surface rounded-xl border border-neon-surface2 text-sm text-[#ccc]"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={handleReset}
              className="flex items-center justify-center gap-2 p-3 bg-neon-surface rounded-xl border border-neon-surface2 text-sm text-red-400"
            >
              <Trash2 className="w-4 h-4" />
              Reset
            </button>
          </div>
        </section>
      </div>

      {/* Bottom Nav */}
      <nav className="flex items-center justify-around px-2 py-2 bg-neon-darker border-t border-neon-surface2">
        <button onClick={() => router.push("/")} className="flex flex-col items-center gap-0.5 px-4 py-1 rounded-xl">
          <Calculator className="w-5 h-5 text-[#888]" />
          <span className="text-[10px] text-[#888]">Calculator</span>
        </button>
        <button onClick={() => router.push("/graphs")} className="flex flex-col items-center gap-0.5 px-4 py-1 rounded-xl">
          <BarChart3 className="w-5 h-5 text-[#888]" />
          <span className="text-[10px] text-[#888]">Graphs</span>
        </button>
        <button onClick={() => router.push("/history")} className="flex flex-col items-center gap-0.5 px-4 py-1 rounded-xl">
          <History className="w-5 h-5 text-[#888]" />
          <span className="text-[10px] text-[#888]">History</span>
        </button>
        <button onClick={() => router.push("/settings")} className="flex flex-col items-center gap-0.5 px-4 py-1 rounded-xl bg-neon-green10">
          <Settings className="w-5 h-5 text-neon-green" />
          <span className="text-[10px] text-neon-green font-medium">Settings</span>
        </button>
      </nav>
    </div>
  );
}