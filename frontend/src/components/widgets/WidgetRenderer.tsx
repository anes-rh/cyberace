"use client";

import { CipherLab } from "./CipherLab";
import { ShamirCalc } from "./ShamirCalc";
import { LamportSim } from "./LamportSim";
import { Wrench } from "lucide-react";

const LABELS: Record<string, string> = {
  "cipher-lab": "Atelier de (dé)chiffrement",
  shamir: "Calculateur de reconstruction de Shamir",
  lamport: "Simulateur d'horloges de Lamport",
};

/** Maps a challenge's `widget` key to its interactive tool. */
export function WidgetRenderer({ widget }: { widget: string }) {
  const label = LABELS[widget];
  let tool: React.ReactNode = null;
  if (widget === "cipher-lab") tool = <CipherLab />;
  else if (widget === "shamir") tool = <ShamirCalc />;
  else if (widget === "lamport") tool = <LamportSim />;
  if (!tool) return null;

  return (
    <div>
      <div className="mb-2 flex items-center gap-2 text-sm font-medium text-secondary">
        <Wrench className="h-4 w-4" /> {label ?? "Outil"}
      </div>
      {tool}
    </div>
  );
}
