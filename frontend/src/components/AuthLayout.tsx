"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

const DOTS = [
  { c: "#6FA8DC", label: "Algorithmique" },
  { c: "#E8A87C", label: "Système d'exploitation" },
  { c: "#93B896", label: "Base de données" },
  { c: "#9B8CCB", label: "Cybersécurité" },
];

/** Two-column auth shell: a calm decorative panel + the form slot. */
export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto grid min-h-[calc(100dvh-4rem)] max-w-5xl items-center gap-8 px-5 py-10 lg:grid-cols-2">
      {/* Decorative panel */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative hidden overflow-hidden rounded-[2rem] border border-line bg-gradient-to-br from-primary/12 via-lavender/12 to-secondary/12 p-10 soft-shadow lg:block"
      >
        <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-primary/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 h-52 w-52 rounded-full bg-lavender/15 blur-3xl" />

        <p className="relative font-mono text-xs uppercase tracking-[0.3em] text-primary">CyberAce</p>
        <h2 className="relative mt-3 max-w-xs font-display text-3xl font-semibold leading-tight text-fg">
          Emprunte la route, un checkpoint à la fois.
        </h2>
        <p className="relative mt-3 max-w-xs text-sm text-muted">
          Un parcours serein d'algorithmique à la cybersécurité — chronomètres doux, badges à débloquer, progression claire.
        </p>

        {/* mini road with 4 stations */}
        <div className="relative mt-10">
          <svg viewBox="0 0 260 60" className="w-full max-w-sm">
            <path d="M 6 46 C 40 46 46 16 84 16 S 130 44 170 44 S 220 14 254 14" fill="none" stroke="#e4d9c6" strokeWidth="6" strokeLinecap="round" />
            <path d="M 6 46 C 40 46 46 16 84 16 S 130 44 170 44 S 220 14 254 14" fill="none" stroke="#fbf6ec" strokeWidth="0.8" strokeDasharray="2 3" strokeLinecap="round" />
            {[[6, 46], [84, 16], [170, 44], [254, 14]].map(([x, y], i) => (
              <g key={i} transform={`translate(${x} ${y})`}>
                <circle r="9" fill="#fff" stroke={DOTS[i].c} strokeWidth="1.5" />
                <circle r="5" fill={DOTS[i].c} />
                <text textAnchor="middle" dy="2" fontSize="7" fontWeight="700" fill="#fff">{i + 1}</text>
              </g>
            ))}
          </svg>
          <div className="mt-4 flex flex-wrap gap-2">
            {DOTS.map((d) => (
              <span key={d.label} className="inline-flex items-center gap-1.5 text-xs text-muted">
                <span className="h-2 w-2 rounded-full" style={{ background: d.c }} /> {d.label}
              </span>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Form slot */}
      <div className="w-full">{children}</div>
    </div>
  );
}
