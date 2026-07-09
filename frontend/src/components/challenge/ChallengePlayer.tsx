"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lightbulb, Lock, Check, X, Flag, Timer as TimerIcon, Trophy, ChevronUp, ChevronDown, ArrowRight, Sparkles,
  Play, TerminalSquare,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { DifficultyBadge } from "@/components/ui/DifficultyBadge";
import { Markdown } from "@/components/Markdown";
import { WidgetRenderer } from "@/components/widgets/WidgetRenderer";
import { CodeEditor } from "@/components/challenge/CodeEditor";
import Celebration from "@/components/Celebration";
import { useAuth } from "@/context/AuthContext";
import { api, ApiError } from "@/lib/api";
import { formatTime, cn } from "@/lib/utils";
import type { Challenge, ExecuteResult, Hint, SubmitResult } from "@/lib/types";

export function ChallengePlayer({
  challenge,
  nextHref,
  onSolved,
}: {
  challenge: Challenge;
  nextHref?: string | null;
  onSolved?: () => void;
}) {
  const { user } = useAuth();
  const [hints, setHints] = useState<Hint[]>(challenge.hints);
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef(Date.now());
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<SubmitResult | null>(
    challenge.solved ? { correct: true, alreadySolved: true, explanation: challenge.explanation ?? "" } : null
  );
  const [wrong, setWrong] = useState(false);
  const [error, setError] = useState("");
  const [celebrateKey, setCelebrateKey] = useState(0);

  // Answer state per type.
  const [text, setText] = useState("");
  const [choice, setChoice] = useState<number | null>(null);
  const [multi, setMulti] = useState<Set<number>>(new Set());
  const [order, setOrder] = useState<number[]>(challenge.options.map((_, i) => i));
  const [code, setCode] = useState(
    challenge.starter ??
      (challenge.language === "c"
        ? "#include <stdio.h>\n\nint main(void) {\n  \n  return 0;\n}\n"
        : challenge.language === "bash"
          ? "#!/bin/bash\n\n"
          : challenge.language === "sql"
            ? "-- Écris ta requête SQL\n"
            : "Algorithme MonAlgo\nVar\n  \nDebut\n  \nFin\n")
  );
  const [feedback, setFeedback] = useState<SubmitResult["feedback"] | null>(null);
  const [running, setRunning] = useState(false);
  const [runResult, setRunResult] = useState<ExecuteResult | null>(null);
  // Error penalty: wrong attempts so far, and points still winnable now.
  const [errorCount, setErrorCount] = useState(challenge.errorCount ?? 0);
  const [pointsPossible, setPointsPossible] = useState(challenge.pointsPossible ?? challenge.points);

  const solved = result?.correct === true;

  useEffect(() => {
    if (solved) return;
    const id = setInterval(() => setElapsed(Date.now() - startRef.current), 1000);
    return () => clearInterval(id);
  }, [solved]);

  const revealHint = async (index: number) => {
    if (!user) return;
    try {
      const r = await api.unlockHint(challenge.id, index);
      setHints((hs) => hs.map((h) => (h.index === index ? { ...h, unlocked: true, text: r.text } : h)));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Erreur");
    }
  };

  const buildAnswer = (): string | number | number[] | null => {
    switch (challenge.type) {
      case "text":
      case "numeric":
        return text.trim() === "" ? null : text.trim();
      case "mcq":
        return choice;
      case "multi":
        return multi.size ? [...multi] : null;
      case "order":
        return order;
      case "code":
        return code.trim() === "" ? null : code;
    }
  };

  const submit = async () => {
    if (!user) return;
    const answer = buildAnswer();
    if (answer === null) {
      setError("Saisis une réponse.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const r = await api.submit(challenge.id, answer, Date.now() - startRef.current);
      if (r.correct) {
        setResult(r);
        if (!r.alreadySolved) setCelebrateKey((k) => k + 1); // fresh solve → celebrate
        onSolved?.();
      } else {
        setFeedback(r.feedback ?? null);
        if (typeof r.errorCount === "number") setErrorCount(r.errorCount);
        if (typeof r.pointsPossible === "number") setPointsPossible(r.pointsPossible);
        setWrong(true);
        setTimeout(() => setWrong(false), 600);
      }
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Erreur");
    } finally {
      setSubmitting(false);
    }
  };

  const move = (i: number, dir: -1 | 1) => {
    setOrder((o) => {
      const n = [...o];
      const j = i + dir;
      if (j < 0 || j >= n.length) return o;
      [n[i], n[j]] = [n[j], n[i]];
      return n;
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <Celebration fireKey={celebrateKey} />
      {/* Main column */}
      <div className="space-y-6">
        <div className="glass rounded-2xl p-6">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <DifficultyBadge difficulty={challenge.difficulty} />
            <span className="inline-flex items-center gap-1.5 text-sm text-muted">
              <Flag className="h-4 w-4 text-primary" />
              {solved || errorCount === 0 ? (
                <>{challenge.points} pts</>
              ) : (
                <>
                  <span className="font-semibold text-fg tnum">{pointsPossible} pts</span> en jeu
                  <span className="ml-1 text-faint line-through tnum">{challenge.points}</span>
                </>
              )}
            </span>
            {challenge.tags.map((t) => (
              <span key={t} className="rounded-full bg-surface-2 px-2 py-0.5 font-mono text-[11px] text-faint">
                {t}
              </span>
            ))}
          </div>
          <h1 className="font-display text-2xl font-bold text-fg">{challenge.title}</h1>
          <div className="mt-4">
            <Markdown>{challenge.prompt}</Markdown>
          </div>
        </div>

        {challenge.widget && (
          <div className="glass rounded-2xl p-6">
            <WidgetRenderer widget={challenge.widget} />
          </div>
        )}

        {/* Answer zone */}
        <motion.div
          animate={wrong ? { x: [0, -10, 10, -6, 6, 0] } : {}}
          transition={{ duration: 0.5 }}
          className={cn("glass rounded-2xl p-6", wrong && "ring-1 ring-danger/60")}
        >
          <h2 className="mb-4 font-display text-lg font-semibold text-fg">Ta réponse</h2>

          {!user ? (
            <div className="rounded-xl border border-line bg-surface/60 p-5 text-center">
              <p className="text-muted">Connecte-toi pour soumettre ta réponse et marquer des points.</p>
              <div className="mt-3 flex justify-center gap-2">
                <Link href="/login"><Button variant="glass" size="sm">Connexion</Button></Link>
                <Link href="/register"><Button size="sm">S&apos;inscrire</Button></Link>
              </div>
            </div>
          ) : solved ? (
            <SolvedPanel result={result!} nextHref={nextHref} />
          ) : (
            <div className="space-y-4">
              {/* Live stake: points winnable right now, given past errors. */}
              <div className="flex items-center justify-between rounded-xl border border-primary/25 bg-primary/5 px-4 py-2.5">
                <span className="flex items-center gap-2 text-sm text-muted">
                  <Flag className="h-4 w-4 text-primary" /> En jeu maintenant
                </span>
                <span className="text-right">
                  <span className={cn("font-display text-lg font-bold tnum", pointsPossible > 0 ? "text-primary" : "text-faint")}>
                    {pointsPossible}
                  </span>
                  <span className="text-sm text-muted"> pts</span>
                  {errorCount > 0 && (
                    <span className="ml-2 text-[11px] text-warning">
                      {errorCount} erreur{errorCount > 1 ? "s" : ""} · −20 %/erreur
                    </span>
                  )}
                </span>
              </div>
              {pointsPossible === 0 && (
                <p className="-mt-1 text-xs text-faint">
                  Plus de points à gagner sur ce défi, mais le valider le marquera comme <span className="text-fg">complété</span>.
                </p>
              )}

              {(challenge.type === "text" || challenge.type === "numeric") && (
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submit()}
                  inputMode={challenge.type === "numeric" ? "numeric" : "text"}
                  placeholder={challenge.type === "numeric" ? "Réponse numérique…" : "Saisis le flag / la réponse…"}
                  className="w-full rounded-lg border border-line bg-surface-2 px-4 py-3 font-mono text-fg placeholder:text-faint focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              )}

              {challenge.type === "mcq" && (
                <div className="space-y-2">
                  {challenge.options.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => setChoice(i)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors",
                        choice === i ? "border-primary bg-primary/10 text-fg" : "border-line bg-surface/50 text-muted hover:border-primary/40"
                      )}
                    >
                      <span className={cn("grid h-5 w-5 place-items-center rounded-full border", choice === i ? "border-primary bg-primary text-void" : "border-line")}>
                        {choice === i && <Check className="h-3 w-3" />}
                      </span>
                      <span className="text-sm">{opt}</span>
                    </button>
                  ))}
                </div>
              )}

              {challenge.type === "multi" && (
                <div className="space-y-2">
                  {challenge.options.map((opt, i) => {
                    const on = multi.has(i);
                    return (
                      <button
                        key={i}
                        onClick={() => setMulti((s) => { const n = new Set(s); n.has(i) ? n.delete(i) : n.add(i); return n; })}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors",
                          on ? "border-primary bg-primary/10 text-fg" : "border-line bg-surface/50 text-muted hover:border-primary/40"
                        )}
                      >
                        <span className={cn("grid h-5 w-5 place-items-center rounded border", on ? "border-primary bg-primary text-void" : "border-line")}>
                          {on && <Check className="h-3 w-3" />}
                        </span>
                        <span className="text-sm">{opt}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {challenge.type === "code" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-faint">
                      {challenge.language === "c"
                        ? "Écris ton programme C, compile-le, puis soumets quand la sortie te convient."
                        : challenge.language === "bash"
                          ? "Écris ta commande / ton script bash (teste-le dans ta VM Ubuntu), puis soumets."
                          : challenge.language === "sql"
                            ? "Écris ta requête SQL (teste-la dans Oracle SQL Developer / SQL*Plus), puis soumets."
                            : "Écris ton algorithme en pseudo-code CyberAce (Algorithme, Var, Debut…Fin, Lire, Ecrire, ←)."}
                    </p>
                    {challenge.language === "c" && (
                      <Button
                        variant="glass"
                        size="sm"
                        disabled={running}
                        onClick={async () => {
                          setRunning(true);
                          setError("");
                          try {
                            setRunResult(await api.executeC(code));
                          } catch (e) {
                            setError(e instanceof ApiError ? e.message : "Erreur d'exécution");
                          } finally {
                            setRunning(false);
                          }
                        }}
                      >
                        <Play className="h-3.5 w-3.5" /> {running ? "Compilation…" : "Compiler & Exécuter"}
                      </Button>
                    )}
                  </div>

                  <CodeEditor language={challenge.language ?? "pseudo"} value={code} onChange={setCode} />

                  {challenge.language === "c" && runResult && (
                    <div className="rounded-lg border border-line bg-surface-2/70 p-3 font-mono text-xs">
                      <p className="mb-1 flex items-center gap-1.5 text-faint">
                        <TerminalSquare className="h-3.5 w-3.5" /> Sortie
                      </p>
                      {runResult.compile && runResult.compile.code !== 0 ? (
                        <pre className="whitespace-pre-wrap text-danger">{runResult.compile.stderr || "Erreur de compilation"}</pre>
                      ) : (
                        <>
                          <pre className="max-h-48 overflow-auto whitespace-pre-wrap text-fg">
                            {runResult.run?.stdout || "(aucune sortie)"}
                          </pre>
                          {runResult.run?.stderr && (
                            <pre className="mt-1 whitespace-pre-wrap text-warning">{runResult.run.stderr}</pre>
                          )}
                          {challenge.expectedOutput !== null && runResult.run && (
                            runResult.run.stdout.replace(/\s+$/, "") === (challenge.expectedOutput ?? "").replace(/\s+$/, "") ? (
                              <p className="mt-2 flex items-center gap-1.5 text-success">
                                <Check className="h-3.5 w-3.5" /> Sortie conforme à l&apos;attendu — soumets !
                              </p>
                            ) : (
                              <p className="mt-2 text-warning">
                                La sortie ne correspond pas encore à l&apos;attendu.
                              </p>
                            )
                          )}
                        </>
                      )}
                    </div>
                  )}

                  {feedback && !solved && (
                    <div className="rounded-lg border border-warning/40 bg-warning/10 p-3">
                      <p className="mb-1 text-xs font-medium text-warning">
                        Points-clés validés : {feedback.matched}/{feedback.total}
                      </p>
                      {feedback.missing.length > 0 && (
                        <ul className="list-inside list-disc space-y-0.5 text-xs text-muted">
                          {feedback.missing.map((m) => (
                            <li key={m}>{m}</li>
                          ))}
                        </ul>
                      )}
                      <p className="mt-2 text-[11px] text-faint">
                        Bloqué ? Le dernier indice de la barre latérale révèle la correction complète (contre des points).
                      </p>
                    </div>
                  )}
                </div>
              )}

              {challenge.type === "order" && (
                <div className="space-y-2">
                  <p className="text-xs text-faint">Réordonne avec les flèches, du premier au dernier.</p>
                  {order.map((optIdx, pos) => (
                    <div key={optIdx} className="flex items-center gap-3 rounded-lg border border-line bg-surface/50 px-4 py-3">
                      <span className="grid h-6 w-6 place-items-center rounded-full bg-primary/15 font-mono text-xs text-primary">{pos + 1}</span>
                      <span className="flex-1 text-sm text-fg">{challenge.options[optIdx]}</span>
                      <div className="flex flex-col">
                        <button onClick={() => move(pos, -1)} className="text-muted hover:text-primary"><ChevronUp className="h-4 w-4" /></button>
                        <button onClick={() => move(pos, 1)} className="text-muted hover:text-primary"><ChevronDown className="h-4 w-4" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {error && <p className="text-sm text-danger">{error}</p>}
              <AnimatePresence>
                {wrong && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-1">
                    <p className="flex items-center gap-2 text-sm text-danger">
                      <X className="h-4 w-4" /> Mauvaise réponse.
                    </p>
                    <p className="text-xs text-muted">
                      {pointsPossible > 0
                        ? `Au prochain essai : ${pointsPossible} pts en jeu (une erreur = −20 % du montant de base).`
                        : "Plus de points à gagner, mais une bonne réponse validera quand même le défi."}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              <Button onClick={submit} disabled={submitting} className="w-full" size="lg">
                {submitting ? "Vérification…" : "Franchir la ligne"}
              </Button>
            </div>
          )}
        </motion.div>
      </div>

      {/* Sidebar */}
      <aside className="space-y-4">
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm text-muted"><TimerIcon className="h-4 w-4 text-primary" /> Chrono</span>
            <span className="font-mono text-xl font-bold text-fg tnum">{formatTime(solved ? 0 : elapsed)}</span>
          </div>
          <p className="mt-2 text-xs text-faint">
            Objectif: {formatTime(challenge.timeLimitSec * 1000)} · finir avant = bonus de vitesse.
          </p>
        </div>

        <div className="glass rounded-2xl p-5">
          <h3 className="mb-3 flex items-center gap-2 font-display font-semibold text-fg">
            <Lightbulb className="h-4 w-4 text-warning" /> Indices
          </h3>
          {hints.length === 0 ? (
            <p className="text-sm text-faint">Aucun indice pour ce défi. À toi de jouer !</p>
          ) : (
            <div className="space-y-2">
              {hints.map((h) => (
                <div key={h.index} className="rounded-lg border border-line bg-surface/50 p-3">
                  {h.unlocked ? (
                    <p className="text-sm text-muted">💡 {h.text}</p>
                  ) : (
                    <button
                      onClick={() => revealHint(h.index)}
                      disabled={!user || solved}
                      className="flex w-full items-center justify-between text-sm text-muted hover:text-fg disabled:opacity-50"
                    >
                      <span className="flex items-center gap-2"><Lock className="h-3.5 w-3.5" /> Indice {h.index + 1}</span>
                      <span className="text-warning tnum">-{h.cost} pts</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
          <p className="mt-3 text-xs text-faint">Chaque indice révélé réduit les points gagnés sur ce défi.</p>
        </div>
      </aside>
    </div>
  );
}

/** Animates a number from 0 → value once on mount (skips under reduced-motion). */
function CountUp({ value, duration = 900 }: { value: number; duration?: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setN(value);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      setN(Math.round(value * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  return <span className="tnum">{n}</span>;
}

function SolvedPanel({ result, nextHref }: { result: SubmitResult; nextHref?: string | null }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
      <div className="flex items-center gap-3 rounded-xl border border-success/40 bg-success/10 p-4">
        <motion.span
          initial={{ scale: 0, rotate: -35 }}
          animate={{ scale: [0, 1.25, 1], rotate: 0 }}
          transition={{ type: "spring", stiffness: 480, damping: 14, delay: 0.08 }}
          className="grid h-11 w-11 place-items-center rounded-full bg-success/20 text-success"
        >
          <Check className="h-6 w-6" strokeWidth={2.6} />
        </motion.span>
        <div>
          <p className="font-display text-lg font-bold text-success">Défi résolu !</p>
          {result.alreadySolved ? (
            <p className="text-sm text-muted">Déjà validé — {result.awarded ?? ""} pts acquis.</p>
          ) : (
            <p className="text-sm text-muted">+<CountUp value={result.awarded ?? 0} /> XP gagnés</p>
          )}
        </div>
      </div>

      {result.breakdown && (
        <div className="grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
          <Stat label="Base" value={`${result.breakdown.base}`} />
          <Stat
            label={result.breakdown.errorCount ? `Erreurs (${result.breakdown.errorCount})` : "Erreurs"}
            value={`-${result.breakdown.errorPenalty ?? 0}`}
            accent="text-danger"
          />
          <Stat label="Bonus vitesse" value={`+${result.breakdown.speedBonus}`} accent="text-success" />
          <Stat label="Indices" value={`-${result.breakdown.hintPenalty}`} accent="text-warning" />
        </div>
      )}

      {result.newBadge && (
        <motion.div initial={{ opacity: 0, y: 12, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: "spring", stiffness: 320, damping: 20, delay: 0.35 }} className="flex items-center gap-3 rounded-xl border border-warning/40 bg-warning/10 p-4">
          <motion.span
            initial={{ rotate: 0 }}
            animate={{ rotate: [0, -18, 14, -8, 0], scale: [1, 1.2, 1] }}
            transition={{ delay: 0.5, duration: 0.7 }}
          >
            <Trophy className="h-6 w-6 text-warning" />
          </motion.span>
          <div>
            <p className="font-display font-semibold text-warning">Badge débloqué : {result.newBadge.name}</p>
            <p className="text-sm text-muted">{result.newBadge.description}</p>
          </div>
        </motion.div>
      )}

      {result.explanation && (
        <div className="rounded-xl border border-line bg-surface/50 p-4">
          <p className="mb-1 flex items-center gap-2 text-sm font-medium text-secondary"><Sparkles className="h-4 w-4" /> Explication</p>
          <p className="text-sm text-muted">{result.explanation}</p>
        </div>
      )}

      {nextHref && (
        <Link href={nextHref}>
          <Button className="w-full" size="lg">Défi suivant <ArrowRight className="h-4 w-4" /></Button>
        </Link>
      )}
    </motion.div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-lg border border-line bg-surface/50 p-3">
      <div className={cn("font-display text-lg font-bold tnum", accent ?? "text-fg")}>{value}</div>
      <div className="text-[11px] text-faint">{label}</div>
    </div>
  );
}
