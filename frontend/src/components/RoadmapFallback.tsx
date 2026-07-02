"use client";

import { Icon } from "@/components/ui/Icon";
import type { CheckpointSummary } from "@/lib/types";

// Node anchor points along a hand-drawn winding path (viewBox 0..100 x 0..100).
const NODES = [
  { x: 18, y: 74 },
  { x: 40, y: 52 },
  { x: 62, y: 60 },
  { x: 82, y: 30 },
];

const PATH = "M 6 88 C 14 72 24 70 30 66 S 40 40 48 46 S 60 68 66 56 S 78 30 92 20";

export default function RoadmapFallback({
  checkpoints,
  activeIndex,
  onSelect,
}: {
  checkpoints: CheckpointSummary[];
  activeIndex: number;
  onSelect: (i: number) => void;
}) {
  return (
    <div className="relative h-full w-full overflow-hidden">
      <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
        {/* soft hills */}
        <path d="M0 82 Q 25 70 50 80 T 100 76 V100 H0 Z" fill="#d9e4d2" opacity="0.7" />
        <path d="M0 90 Q 30 82 60 90 T 100 88 V100 H0 Z" fill="#cddcc6" opacity="0.7" />
        {/* road */}
        <path d={PATH} fill="none" stroke="#e4d9c6" strokeWidth="4.5" strokeLinecap="round" />
        <path d={PATH} fill="none" stroke="#f6efe1" strokeWidth="0.6" strokeDasharray="1.4 1.6" strokeLinecap="round" />
        {NODES.map((n, i) => {
          const cp = checkpoints[i];
          if (!cp) return null;
          const active = i === activeIndex;
          const locked = cp.status === "empty";
          return (
            <g key={i} transform={`translate(${n.x} ${n.y})`} onClick={() => onSelect(i)} style={{ cursor: "pointer" }}>
              {active && <circle r="6" fill={cp.accent} opacity="0.18" />}
              <circle r="3.4" fill={locked ? "#c3ccda" : cp.accent} opacity={locked ? 0.6 : 1} />
              <text textAnchor="middle" dy="1.3" fontSize="3.4" fontWeight="700" fill="#fff">{cp.order}</text>
            </g>
          );
        })}
      </svg>

      {/* checkpoint chips */}
      <div className="pointer-events-none absolute inset-0 flex items-end justify-center pb-4">
        <div className="pointer-events-auto flex gap-2 rounded-full border border-line bg-surface/80 px-3 py-2 backdrop-blur">
          {checkpoints.slice(0, 4).map((cp, i) => (
            <button
              key={cp.slug}
              onClick={() => onSelect(i)}
              className="grid h-9 w-9 place-items-center rounded-full transition-transform hover:scale-110"
              style={{
                background: i === activeIndex ? cp.accent : "transparent",
                color: i === activeIndex ? "#fff" : cp.accent,
                border: `1px solid ${cp.accent}55`,
                opacity: cp.status === "empty" ? 0.7 : 1,
              }}
              title={cp.title}
            >
              <Icon name={cp.icon} className="h-4 w-4" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
