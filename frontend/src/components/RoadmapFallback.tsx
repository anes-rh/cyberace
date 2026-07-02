"use client";

import type { CheckpointSummary } from "@/lib/types";

// Node anchor points along a hand-drawn winding path (viewBox 0..100 x 0..64).
const NODES = [
  { x: 20, y: 48 },
  { x: 40, y: 33 },
  { x: 60, y: 40 },
  { x: 79, y: 23 },
];
const PATH = "M 6 60 C 14 48 24 46 32 43 S 42 26 50 30 S 58 46 66 38 S 74 22 92 15";

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
      <svg viewBox="0 0 100 64" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
        <defs>
          <radialGradient id="sun" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fff4dc" />
            <stop offset="60%" stopColor="#ffe6b8" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#ffe6b8" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* sun */}
        <circle cx="20" cy="14" r="12" fill="url(#sun)" />
        <circle cx="20" cy="14" r="4.5" fill="#fff2d0" />

        {/* clouds */}
        <g opacity="0.9">
          <g transform="translate(58 10)">
            <ellipse cx="0" cy="0" rx="5" ry="2.4" fill="#fff" />
            <ellipse cx="4" cy="0.6" rx="4" ry="2" fill="#fff" />
            <ellipse cx="-4" cy="0.8" rx="3.4" ry="1.8" fill="#fff" />
          </g>
          <g transform="translate(80 18)">
            <ellipse cx="0" cy="0" rx="4" ry="2" fill="#fff" />
            <ellipse cx="3.4" cy="0.5" rx="3" ry="1.6" fill="#fff" />
          </g>
        </g>

        {/* skyline silhouette */}
        <g opacity="0.5">
          {[
            [8, 40, 4, 8], [13, 36, 5, 12], [19, 42, 3.5, 6], [70, 40, 4, 8],
            [75, 34, 5, 14], [81, 41, 3.5, 7], [86, 37, 4.5, 11], [92, 42, 3.5, 6],
          ].map(([x, y, w, h], i) => (
            <rect key={i} x={x} y={y} width={w} height={h} rx="0.6" fill={i % 2 ? "#cdd9e8" : "#d7e0d0"} />
          ))}
        </g>

        {/* hills */}
        <path d="M0 48 Q 25 40 50 48 T 100 46 V64 H0 Z" fill="#d3e0cb" opacity="0.85" />
        <path d="M0 55 Q 30 48 60 55 T 100 54 V64 H0 Z" fill="#c6d6bd" opacity="0.9" />

        {/* road */}
        <path d={PATH} fill="none" stroke="#efe6d3" strokeWidth="5" strokeLinecap="round" />
        <path d={PATH} fill="none" stroke="#e4d9c6" strokeWidth="5" strokeLinecap="round" opacity="0.5" />
        <path d={PATH} fill="none" stroke="#fbf6ec" strokeWidth="0.5" strokeDasharray="1.2 1.8" strokeLinecap="round" />

        {NODES.map((n, i) => {
          const cp = checkpoints[i];
          if (!cp) return null;
          const active = i === activeIndex;
          const locked = cp.status === "empty";
          const completed = cp.completed;
          return (
            <g key={i} transform={`translate(${n.x} ${n.y})`} onClick={() => onSelect(i)} style={{ cursor: "pointer" }}>
              {active && <circle r="7" fill={cp.accent} opacity="0.16" />}
              {active && <circle r="5.6" fill={cp.accent} opacity="0.1" />}
              <circle r="4.6" fill="#ffffff" stroke={locked ? "#c3ccda" : cp.accent} strokeWidth="0.7" opacity={locked ? 0.85 : 1} />
              <circle r="3.2" fill={locked ? "#c3ccda" : cp.accent} opacity={locked ? 0.6 : 1} />
              <text textAnchor="middle" dy="1.25" fontSize="3.4" fontWeight="700" fill="#fff">{cp.order}</text>
              {completed && <text textAnchor="middle" dy="-5.5" fontSize="3.5" fill={cp.accent}>✓</text>}
              <text
                textAnchor={i === 0 ? "start" : i === NODES.length - 1 ? "end" : "middle"}
                x={i === 0 ? -5.5 : i === NODES.length - 1 ? 5.5 : 0}
                y="8.6" fontSize="2.5" fontWeight="600" fill="#41506a" opacity="0.9"
              >
                {cp.title}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
