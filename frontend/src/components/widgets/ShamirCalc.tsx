"use client";

import { useMemo, useState } from "react";

interface Point { x: number; y: number; }

function mod(a: number, m: number): number {
  return ((a % m) + m) % m;
}
function modInverse(a: number, m: number): number | null {
  a = mod(a, m);
  for (let x = 1; x < m; x++) if (mod(a * x, m) === 1) return x;
  return null;
}

/** Lagrange interpolation evaluated at x = 0 over GF(prime). */
function reconstruct(points: Point[], prime: number): { secret: number | null; error?: string } {
  if (points.length < 2) return { secret: null, error: "Au moins 2 parts requises." };
  let secret = 0;
  for (let i = 0; i < points.length; i++) {
    let num = 1;
    let den = 1;
    for (let j = 0; j < points.length; j++) {
      if (i === j) continue;
      num = mod(num * mod(-points[j].x, prime), prime); // (0 - x_j)
      den = mod(den * mod(points[i].x - points[j].x, prime), prime);
    }
    const inv = modInverse(den, prime);
    if (inv === null) return { secret: null, error: "Points invalides (dénominateur non inversible)." };
    secret = mod(secret + mod(points[i].y * mod(num * inv, prime), prime), prime);
  }
  return { secret };
}

export function ShamirCalc() {
  const [prime, setPrime] = useState(97);
  const [points, setPoints] = useState<Point[]>([
    { x: 1, y: 47 },
    { x: 2, y: 52 },
  ]);

  const result = useMemo(() => reconstruct(points, prime), [points, prime]);

  const update = (i: number, field: keyof Point, v: string) => {
    setPoints((p) => p.map((pt, idx) => (idx === i ? { ...pt, [field]: Number(v) } : pt)));
  };

  return (
    <div className="rounded-xl border border-line bg-surface-2 p-4">
      <div className="mb-3 flex items-center gap-2">
        <label className="text-xs text-muted">Corps GF(p), p =</label>
        <input
          type="number"
          value={prime}
          onChange={(e) => setPrime(Number(e.target.value) || 2)}
          className="w-24 rounded-md border border-line bg-surface px-2 py-1 font-mono text-sm text-fg"
        />
      </div>

      <div className="space-y-2">
        {points.map((pt, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="font-mono text-xs text-faint">Part {i + 1}</span>
            <span className="text-xs text-muted">x=</span>
            <input type="number" value={pt.x} onChange={(e) => update(i, "x", e.target.value)} className="w-20 rounded-md border border-line bg-surface px-2 py-1 font-mono text-sm text-fg" />
            <span className="text-xs text-muted">y=</span>
            <input type="number" value={pt.y} onChange={(e) => update(i, "y", e.target.value)} className="w-20 rounded-md border border-line bg-surface px-2 py-1 font-mono text-sm text-fg" />
            {points.length > 2 && (
              <button onClick={() => setPoints((p) => p.filter((_, idx) => idx !== i))} className="text-xs text-danger hover:underline">
                retirer
              </button>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={() => setPoints((p) => [...p, { x: p.length + 1, y: 0 }])}
        className="mt-2 text-xs text-primary hover:underline"
      >
        + ajouter une part
      </button>

      <div className="mt-4 rounded-lg border border-primary/25 bg-primary/5 px-3 py-2 font-mono text-sm">
        {result.error ? (
          <span className="text-danger">{result.error}</span>
        ) : (
          <span className="text-primary">Secret f(0) = {result.secret}</span>
        )}
      </div>
    </div>
  );
}
