"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Calculator, BarChart3, History, Settings,
  Plus, Minus, Target, Sparkles, ArrowRight,
} from "lucide-react";

interface GraphFn {
  id: string;
  color: string;
  text: string;
  fn: (x: number) => number;
  visible: boolean;
  style: "solid" | "dashed";
}

const COLORS = ["#00FF94", "#7B00FF", "#00D1FF", "#FF6B6B", "#FFD93D"];

export default function GraphsPage() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [functions, setFunctions] = useState<GraphFn[]>([
    { id: "1", color: COLORS[0], text: "f(x) = sin(x)", fn: (x) => Math.sin(x), visible: true, style: "solid" },
    { id: "2", color: COLORS[1], text: "g(x) = x^2 - 4", fn: (x) => x * x - 4, visible: true, style: "dashed" },
  ]);
  const [zoom, setZoom] = useState(40);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [newFn, setNewFn] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showFnList, setShowFnList] = useState(false);

  const drawGrid = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.strokeStyle = "#222";
    ctx.lineWidth = 1;
    const cx = w / 2 + offsetX;
    const cy = h / 2 + offsetY;
    const step = zoom;
    for (let x = cx % step; x < w; x += step) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = cy % step; y < h; y += step) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }
    ctx.strokeStyle = "#444";
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(w, cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, h); ctx.stroke();
  }, [offsetX, offsetY, zoom]);

  const drawGraphs = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    const cx = w / 2 + offsetX;
    const cy = h / 2 + offsetY;
    functions.forEach((gf) => {
      if (!gf.visible) return;
      ctx.strokeStyle = gf.color;
      ctx.lineWidth = 2;
      if (gf.style === "dashed") {
        ctx.setLineDash([6, 4]);
      } else {
        ctx.setLineDash([]);
      }
      ctx.beginPath();
      let first = true;
      for (let px = 0; px < w; px += 1) {
        const x = (px - cx) / zoom;
        const y = gf.fn(x);
        const py = cy - y * zoom;
        if (py < -1000 || py > h + 1000) { first = true; continue; }
        if (first) { ctx.moveTo(px, py); first = false; }
        else { ctx.lineTo(px, py); }
      }
      ctx.stroke();
      ctx.setLineDash([]);
    });
  }, [functions, offsetX, offsetY, zoom]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, rect.width, rect.height);
    drawGrid(ctx, rect.width, rect.height);
    drawGraphs(ctx, rect.width, rect.height);
  }, [drawGrid, drawGraphs]);

  const handleAddFn = () => {
    if (!newFn) return;
    const fnText = newFn.toLowerCase().trim();
    let fn: (x: number) => number;
    if (fnText.includes("sin")) fn = (x) => Math.sin(x);
    else if (fnText.includes("cos")) fn = (x) => Math.cos(x);
    else if (fnText.includes("tan")) fn = (x) => Math.tan(x);
    else if (fnText.includes("x^2") || fnText.includes("x*x")) fn = (x) => x * x;
    else if (fnText.includes("x^3")) fn = (x) => x * x * x;
    else if (fnText.includes("sqrt") || fnText.includes("√")) fn = (x) => Math.sqrt(Math.abs(x));
    else if (fnText.includes("abs")) fn = (x) => Math.abs(x);
    else if (fnText.includes("exp") || fnText.includes("e^")) fn = (x) => Math.exp(x);
    else if (fnText.includes("log")) fn = (x) => Math.log10(Math.abs(x) + 0.001);
    else if (fnText.includes("ln")) fn = (x) => Math.log(Math.abs(x) + 0.001);
    else if (fnText.includes("x") && fnText.includes("+")) {
      const match = fnText.match(/([\d.]+)/);
      const c = match ? parseFloat(match[1]) : 1;
      fn = (x) => x + c;
    } else {
      fn = (x) => x;
    }
    const id = Math.random().toString(36).slice(2);
    const color = COLORS[functions.length % COLORS.length];
    setFunctions((p) => [...p, { id, color, text: newFn, fn, visible: true, style: "solid" }]);
    setNewFn("");
  };

  const handleExport = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "graph.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="flex flex-col h-screen bg-[#121212] text-white overflow-hidden">
      {/* Function badges */}
      <div className="px-4 pt-4 flex flex-col gap-2">
        {functions.map((f) => (
          <div key={f.id} className="flex items-center gap-2 bg-[#1A1A1A] rounded-lg px-3 py-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: f.color }} />
            <span className="text-sm font-mono">{f.text}</span>
          </div>
        ))}
      </div>

      {/* Canvas */}
      <div className="flex-1 relative mx-4 mt-4 mb-2 rounded-xl overflow-hidden border border-[#222] bg-[#0A0A0A]">
        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-grab active:cursor-grabbing"
          onMouseDown={(e) => {
            setIsDragging(true);
            setDragStart({ x: e.clientX, y: e.clientY });
          }}
          onMouseMove={(e) => {
            if (!isDragging) return;
            const dx = e.clientX - dragStart.x;
            const dy = e.clientY - dragStart.y;
            setOffsetX((p) => p + dx);
            setOffsetY((p) => p + dy);
            setDragStart({ x: e.clientX, y: e.clientY });
          }}
          onMouseUp={() => setIsDragging(false)}
          onMouseLeave={() => setIsDragging(false)}
          onTouchStart={(e) => {
            const t = e.touches[0];
            setIsDragging(true);
            setDragStart({ x: t.clientX, y: t.clientY });
          }}
          onTouchMove={(e) => {
            if (!isDragging) return;
            const t = e.touches[0];
            const dx = t.clientX - dragStart.x;
            const dy = t.clientY - dragStart.y;
            setOffsetX((p) => p + dx);
            setOffsetY((p) => p + dy);
            setDragStart({ x: t.clientX, y: t.clientY });
          }}
          onTouchEnd={() => setIsDragging(false)}
        />
        {/* Zoom controls */}
        <div className="absolute right-3 top-3 flex flex-col gap-2">
          <button
            onClick={() => setZoom((p) => Math.min(p + 10, 200))}
            className="w-9 h-9 rounded-lg bg-[#1A1A1A] border border-[#222] flex items-center justify-center text-[#00FF94]"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom((p) => Math.max(p - 10, 10))}
            className="w-9 h-9 rounded-lg bg-[#1A1A1A] border border-[#222] flex items-center justify-center text-[#00FF94]"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            onClick={() => { setOffsetX(0); setOffsetY(0); }}
            className="w-9 h-9 rounded-lg bg-[#1A1A1A] border border-[#222] flex items-center justify-center text-[#00FF94]"
          >
            <Target className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Add function input */}
      <div className="px-4 mb-2">
        <div className="flex items-center gap-2 bg-[#1A1A1A] rounded-xl px-3 py-2 border border-[#222]">
          <div className="w-8 h-8 rounded-lg bg-[#00FF94]/10 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-[#00FF94]" />
          </div>
          <input
            value={newFn}
            onChange={(e) => setNewFn(e.target.value)}
            placeholder="f(x) = ..."
            className="flex-1 bg-transparent text-sm outline-none placeholder-[#555]"
            onKeyDown={(e) => e.key === "Enter" && handleAddFn()}
          />
          <button
            onClick={handleAddFn}
            className="w-8 h-8 rounded-lg bg-[#00FF94] flex items-center justify-center"
          >
            <ArrowRight className="w-4 h-4 text-[#121212]" />
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 mb-3 flex gap-2">
        <button
          onClick={() => setFunctions([])}
          className="flex-1 py-2 rounded-xl bg-[#1A1A1A] border border-[#222] text-sm text-[#ccc]"
        >
          Clear All
        </button>
        <button
          onClick={handleExport}
          className="flex-1 py-2 rounded-xl bg-[#1A1A1A] border border-[#222] text-sm text-[#ccc]"
        >
          Export Image
        </button>
        <button
          className="flex-1 py-2 rounded-xl bg-[#1A1A1A] border border-[#222] text-sm text-[#ccc]"
        >
          Intersection Points
        </button>
      </div>

      {/* Bottom Nav */}
      <nav className="flex items-center justify-around px-2 py-2 bg-[#0A0A0A] border-t border-[#222]">
        <button onClick={() => router.push("/")} className="flex flex-col items-center gap-0.5 px-4 py-1 rounded-xl">
          <Calculator className="w-5 h-5 text-[#888]" />
          <span className="text-[10px] text-[#888]">Calculator</span>
        </button>
        <button onClick={() => router.push("/graphs")} className="flex flex-col items-center gap-0.5 px-4 py-1 rounded-xl bg-[#00FF94]/10">
          <BarChart3 className="w-5 h-5 text-[#00FF94]" />
          <span className="text-[10px] text-[#00FF94] font-medium">Graphs</span>
        </button>
        <button onClick={() => router.push("/history")} className="flex flex-col items-center gap-0.5 px-4 py-1 rounded-xl">
          <History className="w-5 h-5 text-[#888]" />
          <span className="text-[10px] text-[#888]">History</span>
        </button>
        <button onClick={() => router.push("/settings")} className="flex flex-col items-center gap-0.5 px-4 py-1 rounded-xl">
          <Settings className="w-5 h-5 text-[#888]" />
          <span className="text-[10px] text-[#888]">Settings</span>
        </button>
      </nav>
    </div>
  );
}
