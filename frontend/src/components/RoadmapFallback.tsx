"use client";

import type { CheckpointSummary } from "@/lib/types";

// Node anchor points along a hand-drawn winding path (viewBox 0..100 x 0..64).
const NODES = [
  { x: 16, y: 51 },
  { x: 33, y: 42 },
  { x: 50, y: 31 },
  { x: 66, y: 38 },
  { x: 85, y: 19 },
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

        {/* skyline silhouette — two depths */}
        <g opacity="0.35">
          {[
            [4, 42, 3, 6], [24, 39, 4, 9], [30, 43, 3, 5], [44, 38, 3.5, 10],
            [52, 41, 3, 7], [61, 36, 4, 12], [96, 40, 3, 8],
          ].map(([x, y, w, h], i) => (
            <rect key={i} x={x} y={y} width={w} height={h} rx="0.6" fill={i % 2 ? "#d5dfe9" : "#dde4d6"} />
          ))}
        </g>
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

        {/* trees — round, conifer and bush variants */}
        <g opacity="0.85">
          {([[10, 56, "r"], [26, 53, "c"], [38, 57, "b"], [57, 54, "r"], [72, 56, "c"], [90, 53, "r"], [47, 52, "b"]] as const).map(([x, y, k], i) =>
            k === "c" ? (
              <polygon key={i} points={`${x},${y - 4} ${x - 1.6},${y} ${x + 1.6},${y}`} fill={i % 2 ? "#93b892" : "#86ac83"} />
            ) : k === "b" ? (
              <ellipse key={i} cx={x} cy={y - 0.6} rx="2" ry="1.1" fill="#a7c79a" />
            ) : (
              <g key={i}>
                <rect x={x - 0.25} y={y - 1.6} width="0.5" height="1.6" fill="#b89a6f" />
                <circle cx={x} cy={y - 2.6} r="1.5" fill={i % 2 ? "#9dbf8e" : "#93b892"} />
              </g>
            )
          )}
        </g>

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
