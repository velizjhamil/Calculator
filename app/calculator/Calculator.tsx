"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Copy, Share2,
  Calculator, BarChart3, History, Settings,
} from "lucide-react";
import { useHistory } from "@/lib/history-context";

function formatNumber(n: number, precision = 6): string {
  if (!isFinite(n)) return n > 0 ? "Infinity" : "-Infinity";
  if (isNaN(n)) return "Error";
  const s = n.toString();
  if (s.includes("e")) {
    return n.toPrecision(precision);
  }
  const rounded = parseFloat(n.toFixed(precision));
  return rounded.toString();
}

function evaluateExpression(expr: string): number {
  const clean = expr
    .replace(/\u00D7/g, "*")
    .replace(/\u00F7/g, "/")
    .replace(/\u2212/g, "-")
    .replace(/\s+/g, "");
  if (!clean) return 0;

  const tokens: string[] = [];
  let i = 0;
  while (i < clean.length) {
    const c = clean[i];
    if ("+-*/^()".includes(c)) {
      tokens.push(c);
      i++;
      continue;
    }
    if (/\d/.test(c) || c === ".") {
      let j = i;
      let hasDot = false;
      while (j < clean.length && (/\d/.test(clean[j]) || clean[j] === ".")) {
        if (clean[j] === ".") {
          if (hasDot) break;
          hasDot = true;
        }
        j++;
      }
      tokens.push(clean.slice(i, j));
      i = j;
      continue;
    }
    if (/[a-zA-Z]/.test(c)) {
      let j = i;
      while (j < clean.length && /[a-zA-Z]/.test(clean[j])) j++;
      tokens.push(clean.slice(i, j));
      i = j;
      continue;
    }
    i++;
  }

  let t = 0;
  const peek = () => tokens[t];
  const consume = (expected?: string) => {
    const tok = tokens[t];
    if (expected && tok !== expected) {
      throw new Error("Syntax Error");
    }
    t++;
    return tok;
  };

  const parseExpr = (): number => {
    let val = parseTerm();
    while (t < tokens.length) {
      const tok = peek();
      if (tok === "+" || tok === "-") {
        consume();
        const nextVal = parseTerm();
        if (tok === "+") val += nextVal;
        else val -= nextVal;
      } else {
        break;
      }
    }
    return val;
  };

  const parseTerm = (): number => {
    let val = parseFactor();
    while (t < tokens.length) {
      const tok = peek();
      if (tok === "*" || tok === "/") {
        consume();
        const nextVal = parseFactor();
        if (tok === "*") {
          val *= nextVal;
        } else {
          if (nextVal === 0) {
            return val >= 0 ? Infinity : -Infinity;
          }
          val /= nextVal;
        }
      } else {
        break;
      }
    }
    return val;
  };

  const parseFactor = (): number => {
    let val = parsePower();
    if (t < tokens.length && peek() === "^") {
      consume();
      const exponent = parseFactor();
      val = Math.pow(val, exponent);
    }
    return val;
  };

  const parsePower = (): number => {
    const tok = peek();
    if (tok === "+") {
      consume();
      return parsePower();
    }
    if (tok === "-") {
      consume();
      return -parsePower();
    }
    return parsePrimary();
  };

  const parsePrimary = (): number => {
    const tok = peek();
    if (!tok) {
      throw new Error("Unexpected end of expression");
    }
    if (!isNaN(Number(tok))) {
      consume();
      return parseFloat(tok);
    }
    if (tok === "pi") {
      consume();
      return Math.PI;
    }
    if (tok === "e") {
      consume();
      return Math.E;
    }

    const isFunc = (fn: string) =>
      ["sin", "cos", "tan", "asin", "acos", "atan", "log", "ln", "sqrt", "abs", "exp"].includes(fn);

    if (isFunc(tok)) {
      consume();
      consume("(");
      const val = parseExpr();
      consume(")");
      switch (tok) {
        case "sin": return Math.sin(val * Math.PI / 180);
        case "cos": return Math.cos(val * Math.PI / 180);
        case "tan": return Math.tan(val * Math.PI / 180);
        case "asin": return Math.asin(val) * 180 / Math.PI;
        case "acos": return Math.acos(val) * 180 / Math.PI;
        case "atan": return Math.atan(val) * 180 / Math.PI;
        case "log": return Math.log10(val);
        case "ln": return Math.log(val);
        case "sqrt": return Math.sqrt(val);
        case "abs": return Math.abs(val);
        case "exp": return Math.exp(val);
      }
    }

    if (tok === "(") {
      consume();
      const val = parseExpr();
      if (peek() === ")") {
        consume();
      }
      return val;
    }

    throw new Error(`Unknown token: ${tok}`);
  };

  const result = parseExpr();
  if (t < tokens.length) {
    throw new Error("Extra tokens at end of expression");
  }

  if (typeof result === "number" && isFinite(result)) {
    return parseFloat(result.toPrecision(12));
  }
  return result;
}

export default function CalculatorPage() {
  const router = useRouter();
  const { addRecord } = useHistory();
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [mode, setMode] = useState<"RAD" | "DEG">("DEG");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const buttons = [
    ["AC", "DEL", "%", "÷"],
    ["7", "8", "9", "×"],
    ["4", "5", "6", "-"],
    ["1", "2", "3", "+"],
    ["0", ".", "π", "="],
  ];

  const advancedButtons = [
    ["sin", "cos", "tan", "ln"],
    ["asin", "acos", "atan", "log"],
    ["sqrt", "x²", "1/x", "|x|"],
    ["exp", "e", "x^y", "n!"],
  ];

  const handleCalc = useCallback(() => {
    if (!input) return;
    try {
      const r = evaluateExpression(input);
      const formatted = formatNumber(r);
      setResult(formatted);
      addRecord(input, formatted);
    } catch {
      setResult("Error");
    }
  }, [input, addRecord]);

  const handleCalcRef = useRef(handleCalc);
  useEffect(() => {
    handleCalcRef.current = handleCalc;
  }, [handleCalc]);

  const handleButton = (btn: string) => {
    if (btn === "AC") {
      setInput("");
      setResult("");
      return;
    }
    if (btn === "DEL") {
      setInput((p) => p.slice(0, -1));
      return;
    }
    if (btn === "=") {
      handleCalc();
      return;
    }
    if (btn === "π") {
      setInput((p) => p + "pi");
      return;
    }
    if (btn === "x²") {
      setInput((p) => `(${p})^2`);
      return;
    }
    if (btn === "1/x") {
      setInput((p) => `1/(${p})`);
      return;
    }
    if (btn === "|x|") {
      setInput((p) => `abs(${p})`);
      return;
    }
    if (btn === "x^y") {
      setInput((p) => `${p}^`);
      return;
    }
    if (btn === "n!") {
      setInput((p) => `(${p})`);
      return;
    }
    const map: Record<string, string> = {
      "÷": "/", "×": "*", "−": "-", "+": "+",
    };
    const ch = map[btn] || btn;
    setInput((p) => p + ch);
  };

  const handleCopy = async () => {
    if (result) await navigator.clipboard.writeText(result);
  };

  const handleShare = async () => {
    if (result) {
      const text = `${input} = ${result}`;
      if (navigator.share) {
        await navigator.share({ text });
      } else {
        await navigator.clipboard.writeText(text);
      }
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter") { handleCalcRef.current(); return; }
      if (e.key === "Backspace") { setInput((p) => p.slice(0, -1)); return; }
      if (e.key === "Escape") { setInput(""); setResult(""); return; }
      if ("0123456789.+-*/()^%".includes(e.key)) {
        setInput((p) => p + e.key);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="flex flex-col h-screen bg-neon-dark text-white overflow-hidden">

      {/* Display Responsivo */}
      <div className="flex-1 flex flex-col justify-end px-6 pt-6 pb-6">
        <div className="text-right text-[#888] text-2xl font-mono mb-2 min-h-[32px] break-all">
          {input || "\u00A0"}
        </div>
        <div className="text-right text-neon-green text-6xl font-bold tracking-tight mb-6 neon-glow min-h-[72px] break-all">
          {result || "\u00A0"}
        </div>
        <div className="flex items-center justify-end gap-5">
          <button onClick={handleCopy} className="flex items-center gap-1.5 text-sm text-[#888] hover:text-neon-green transition py-2 px-3 rounded-lg hover:bg-neon-surface">
            <Copy className="w-4 h-4" /> Copy
          </button>
          <button onClick={handleShare} className="flex items-center gap-1.5 text-sm text-[#888] hover:text-neon-green transition py-2 px-3 rounded-lg hover:bg-neon-surface">
            <Share2 className="w-4 h-4" /> Share
          </button>
        </div>
      </div>

      {/* Keypad */}
      <div className="px-4 pb-4">
        {buttons.map((row, ri) => (
          <div key={ri} className="flex gap-2 mb-2">
            {row.map((btn) => {
              const isOp = ["÷", "×", "-", "+", "="].includes(btn);
              const isFn = ["AC", "DEL", "%"].includes(btn);
              return (
                <button
                  key={btn}
                  onClick={() => handleButton(btn)}
                  className={`flex-1 h-16 rounded-2xl text-xl font-medium transition active:scale-95
                    ${btn === "="
                      ? "bg-neon-green text-neon-dark font-bold"
                      : isOp
                        ? "bg-neon-operator text-neon-green border border-neon-purple30"
                        : isFn
                          ? "bg-neon-surface text-neon-green border border-neon-surface2"
                          : "bg-neon-surface text-white border border-neon-surface2"
                    }
                  `}
                >
                  {btn}
                </button>
              );
            })}
          </div>
        ))}

        {/* Mode toggle + Advanced */}
        <div className="flex items-center justify-between px-1 mb-2 mt-4">
          <div className="flex gap-2">
            <button
              onClick={() => setMode("RAD")}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition ${mode === "RAD" ? "bg-neon-green text-neon-dark" : "bg-neon-surface text-[#888]"}`}
            >
              RAD
            </button>
            <button
              onClick={() => setMode("DEG")}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition ${mode === "DEG" ? "bg-neon-green text-neon-dark" : "bg-neon-surface text-[#888]"}`}
            >
              DEG
            </button>
          </div>
          <button
            onClick={() => setShowAdvanced((p) => !p)}
            className="text-sm text-neon-green font-medium px-2 py-1"
          >
            Advanced {showAdvanced ? "<<" : ">>"}
          </button>
        </div>

        {showAdvanced && (
          <div className="mb-2">
            {advancedButtons.map((row, ri) => (
              <div key={ri} className="flex gap-2 mb-2">
                {row.map((btn) => (
                  <button
                    key={btn}
                    onClick={() => handleButton(btn)}
                    className="flex-1 h-14 rounded-xl text-sm font-medium bg-neon-surface text-[#ccc] border border-neon-surface2 transition active:scale-95"
                  >
                    {btn}
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Nav */}
      <nav className="flex items-center justify-around px-2 py-3 bg-neon-darker border-t border-neon-surface2">
        <button
          onClick={() => router.push("/")}
          className="flex flex-col items-center gap-1 px-5 py-2 rounded-xl bg-neon-green10"
        >
          <Calculator className="w-6 h-6 text-neon-green" />
          <span className="text-[10px] text-neon-green font-medium">Calculator</span>
        </button>
        <button
          onClick={() => router.push("/graphs")}
          className="flex flex-col items-center gap-1 px-5 py-2 rounded-xl transition hover:bg-neon-surface"
        >
          <BarChart3 className="w-6 h-6 text-[#888]" />
          <span className="text-[10px] text-[#888]">Graphs</span>
        </button>
        <button
          onClick={() => router.push("/history")}
          className="flex flex-col items-center gap-1 px-5 py-2 rounded-xl transition hover:bg-neon-surface"
        >
          <History className="w-6 h-6 text-[#888]" />
          <span className="text-[10px] text-[#888]">History</span>
        </button>
        <button
          onClick={() => router.push("/settings")}
          className="flex flex-col items-center gap-1 px-5 py-2 rounded-xl transition hover:bg-neon-surface"
        >
          <Settings className="w-6 h-6 text-[#888]" />
          <span className="text-[10px] text-[#888]">Settings</span>
        </button>
      </nav>
    </div>
  );
}