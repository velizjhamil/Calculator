"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Calculator, BarChart3, History, Settings,
  Search, SlidersHorizontal, Trash2, BrainCircuit,
} from "lucide-react";
import { useHistory, CalcRecord } from "@/lib/history-context";

export default function HistoryPage() {
  const router = useRouter();
  const { records, deleteRecord, clearHistory } = useHistory();
  const [search, setSearch] = useState("");

  const handleDelete = (id: string) => {
    deleteRecord(id);
  };

  const handleDeleteAll = () => {
    clearHistory();
  };

  const filtered = records.filter(
    (r) =>
      r.expression.toLowerCase().includes(search.toLowerCase()) ||
      r.result.toLowerCase().includes(search.toLowerCase())
  );

  const groupByDate = (recs: CalcRecord[]) => {
    const groups: Record<string, CalcRecord[]> = {};
    recs.forEach((r) => {
      const d = new Date(r.created_at);
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      let key: string;
      if (d.toDateString() === today.toDateString()) key = "Today";
      else if (d.toDateString() === yesterday.toDateString()) key = "Yesterday";
      else key = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      if (!groups[key]) groups[key] = [];
      groups[key].push(r);
    });
    return groups;
  };

  const groups = groupByDate(filtered);

  return (
    <div className="flex flex-col h-screen bg-[#121212] text-white overflow-hidden">
      {/* Search */}
      <div className="px-4 pt-4 pb-2 flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2 bg-[#1A1A1A] rounded-xl px-3 py-2 border border-[#222]">
          <Search className="w-4 h-4 text-[#555]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search history..."
            className="flex-1 bg-transparent text-sm outline-none placeholder-[#555]"
          />
        </div>
        <button className="w-9 h-9 rounded-xl bg-[#1A1A1A] border border-[#222] flex items-center justify-center text-[#888]">
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Recent Calculations label */}
      <div className="px-4 py-2">
        <h2 className="text-sm font-semibold text-white">Recent Calculations</h2>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 pb-2 space-y-4">
        {filtered.length === 0 && (
          <div className="text-center text-[#555] text-sm py-8">
            {search ? "No matching results" : "No calculations yet. Go to Calculator and start computing!"}
          </div>
        )}
        {Object.entries(groups).map(([date, recs]) => (
          <div key={date}>
            <div className="text-[10px] text-[#555] font-medium uppercase tracking-wider mb-2">
              {date}
            </div>
            {recs.map((r) => (
              <div
                key={r.id}
                className="bg-[#1A1A1A] rounded-xl p-4 mb-2 border border-[#222]"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="text-[10px] text-[#555]">
                    {new Date(r.created_at).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                  <div className="flex items-center gap-2">
                    {r.ai_note && (
                      <BrainCircuit className="w-3.5 h-3.5 text-[#00FF94]" />
                    )}
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="text-[#555] hover:text-red-400 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="text-sm font-mono text-[#ccc] mb-1">{r.expression}</div>
                <div className="text-lg font-bold text-[#00FF94]">= {r.result}</div>
                {r.ai_note && (
                  <div className="mt-2 text-xs text-[#888] italic">{r.ai_note}</div>
                )}
              </div>
            ))}
          </div>
        ))}
        {records.length > 0 && (
          <button
            onClick={handleDeleteAll}
            className="w-full py-3 rounded-xl bg-[#1A1A1A] border border-[#222] text-sm text-red-400 hover:bg-red-900/20 transition"
          >
            Clear All History
          </button>
        )}
      </div>

      {/* Bottom Nav */}
      <nav className="flex items-center justify-around px-2 py-2 bg-[#0A0A0A] border-t border-[#222]">
        <button onClick={() => router.push("/")} className="flex flex-col items-center gap-0.5 px-4 py-1 rounded-xl">
          <Calculator className="w-5 h-5 text-[#888]" />
          <span className="text-[10px] text-[#888]">Calculator</span>
        </button>
        <button onClick={() => router.push("/graphs")} className="flex flex-col items-center gap-0.5 px-4 py-1 rounded-xl">
          <BarChart3 className="w-5 h-5 text-[#888]" />
          <span className="text-[10px] text-[#888]">Graphs</span>
        </button>
        <button onClick={() => router.push("/history")} className="flex flex-col items-center gap-0.5 px-4 py-1 rounded-xl bg-[#00FF94]/10">
          <History className="w-5 h-5 text-[#00FF94]" />
          <span className="text-[10px] text-[#00FF94] font-medium">History</span>
        </button>
        <button onClick={() => router.push("/settings")} className="flex flex-col items-center gap-0.5 px-4 py-1 rounded-xl">
          <Settings className="w-5 h-5 text-[#888]" />
          <span className="text-[10px] text-[#888]">Settings</span>
        </button>
      </nav>
    </div>
  );
}
