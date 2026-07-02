"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

type Tab = "caesar" | "base64" | "hex" | "xor" | "url";

const TABS: { key: Tab; label: string }[] = [
  { key: "caesar", label: "César / ROT" },
  { key: "base64", label: "Base64" },
  { key: "hex", label: "Hex" },
  { key: "xor", label: "XOR" },
  { key: "url", label: "URL" },
];

function caesar(text: string, shift: number): string {
  return text.replace(/[a-z]/gi, (c) => {
    const base = c <= "Z" ? 65 : 97;
    return String.fromCharCode(((c.charCodeAt(0) - base + ((shift % 26) + 26)) % 26) + base);
  });
}
function hexToStr(hex: string): string {
  const clean = hex.replace(/[^0-9a-fA-F]/g, "");
  let out = "";
  for (let i = 0; i + 1 < clean.length; i += 2) out += String.fromCharCode(parseInt(clean.slice(i, i + 2), 16));
  return out;
}
function strToHex(s: string): string {
  return Array.from(s).map((c) => c.charCodeAt(0).toString(16).padStart(2, "0")).join(" ");
}
function xorHex(hex: string, keyRaw: string): string {
  const key = keyRaw.trim().toLowerCase().startsWith("0x") ? parseInt(keyRaw, 16) : parseInt(keyRaw, 10);
  if (Number.isNaN(key)) return "clé invalide";
  const clean = hex.replace(/[^0-9a-fA-F]/g, "");
  let out = "";
  for (let i = 0; i + 1 < clean.length; i += 2) out += String.fromCharCode(parseInt(clean.slice(i, i + 2), 16) ^ (key & 0xff));
  return out;
}
function safe(fn: () => string): string {
  try { return fn(); } catch { return "entrée invalide"; }
}

export function CipherLab() {
  const [tab, setTab] = useState<Tab>("caesar");
  const [input, setInput] = useState("");
  const [shift, setShift] = useState(13);
  const [key, setKey] = useState("0x13");

  const output = useMemo(() => {
    if (!input) return "";
    switch (tab) {
      case "caesar": return caesar(input, shift);
      case "base64": return safe(() => (input.trim().match(/^[A-Za-z0-9+/=\s]+$/) ? atob(input.trim()) : btoa(input)));
      case "hex": return input.match(/^[0-9a-fA-F\s]+$/) ? hexToStr(input) : strToHex(input);
      case "xor": return xorHex(input, key);
      case "url": return safe(() => (input.includes("%") ? decodeURIComponent(input) : encodeURIComponent(input)));
    }
  }, [tab, input, shift, key]);

  return (
    <div className="rounded-xl border border-line bg-void/50 p-4">
      <div className="mb-3 flex flex-wrap gap-1.5">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "rounded-md px-3 py-1.5 font-display text-xs transition-colors",
              tab === t.key ? "bg-primary text-void" : "bg-surface-2 text-muted hover:text-fg"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "caesar" && (
        <div className="mb-3 flex items-center gap-3">
          <label className="text-xs text-muted">Décalage: <span className="tnum text-primary">{shift}</span></label>
          <input type="range" min={0} max={25} value={shift} onChange={(e) => setShift(Number(e.target.value))} className="flex-1 accent-[var(--color-primary)]" />
        </div>
      )}
      {tab === "xor" && (
        <div className="mb-3 flex items-center gap-2">
          <label className="text-xs text-muted">Clé (octet):</label>
          <input value={key} onChange={(e) => setKey(e.target.value)} className="w-24 rounded-md border border-line bg-surface px-2 py-1 font-mono text-sm text-fg" placeholder="0x13" />
        </div>
      )}

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={2}
        placeholder="Entrée…"
        className="w-full resize-y rounded-lg border border-line bg-surface px-3 py-2 font-mono text-sm text-fg placeholder:text-faint focus:border-primary/60 focus:outline-none"
      />
      <div className="mt-2 min-h-[2.5rem] break-all rounded-lg border border-primary/25 bg-primary/5 px-3 py-2 font-mono text-sm text-primary">
        {output || <span className="text-faint">Résultat…</span>}
      </div>
    </div>
  );
}
