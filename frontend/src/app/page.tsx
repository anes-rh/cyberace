"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Star, Mail, Zap, Flag, Trophy, Route } from "lucide-react";

/** Inline Instagram glyph (lucide dropped its brand icon in recent versions). */
function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}
import { buttonVariants } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Avatar } from "@/components/ui/Avatar";
import Reveal from "@/components/Reveal";
import { useAuth } from "@/context/AuthContext";
import { NEWS, HOW_IT_WORKS, TESTIMONIALS, CONTACT } from "@/lib/landing";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="overflow-hidden">
      {/* ─── Hero ─────────────────────────────────────────────── */}
      <section className="relative mx-auto max-w-7xl px-5 pb-16 pt-16 sm:pt-24">
        <div className="pointer-events-none absolute -left-20 top-0 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 top-24 h-80 w-80 rounded-full bg-lavender/20 blur-3xl" />

        <div className="relative mx-auto max-w-3xl text-center">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/70 px-4 py-1.5 font-mono text-xs uppercase tracking-[0.25em] text-primary"
          >
            <Sparkles className="h-3.5 w-3.5" /> Apprends en t'amusant
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mt-5 font-display text-4xl font-bold leading-[1.1] tracking-tight text-fg sm:text-6xl"
          >
            L'informatique &amp; la cybersécurité,<br className="hidden sm:block" />{" "}
            <span className="gradient-text">comme une course</span>.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="mx-auto mt-5 max-w-2xl text-lg text-muted"
          >
            CyberAce transforme l'apprentissage en un parcours gamifié : suis une route de{" "}
            <strong className="text-fg">checkpoints</strong>, relève des{" "}
            <strong className="text-fg">défis</strong>, gagne des{" "}
            <strong className="text-fg">points</strong> et débloque des{" "}
            <strong className="text-fg">badges</strong> — à ton rythme, sans pression.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.19 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
          >
            {user ? (
              <Link href="/apprentissage" className={buttonVariants({ size: "lg" })}>
                Reprendre mon parcours <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <Link href="/register" className={buttonVariants({ size: "lg" })}>
                S&apos;inscrire <ArrowRight className="h-4 w-4" />
              </Link>
            )}
            <Link href="/apprentissage" className={buttonVariants({ variant: "glass", size: "lg" })}>
              <Route className="h-4 w-4" /> Découvrir le parcours
            </Link>
          </motion.div>

          {/* mini stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-muted"
          >
            <span className="flex items-center gap-2"><Route className="h-4 w-4 text-primary" /> 5 checkpoints</span>
            <span className="flex items-center gap-2"><Flag className="h-4 w-4 text-primary" /> 70+ défis pratiques</span>
            <span className="flex items-center gap-2"><Trophy className="h-4 w-4 text-primary" /> Badges &amp; classement</span>
          </motion.div>
        </div>
      </section>

      {/* ─── Nouveautés ───────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-5 py-16">
        <Reveal className="mb-10 flex items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-primary">Nouveautés</p>
            <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">Quoi de neuf sur CyberAce ?</h2>
          </div>
          <Link href="/apprentissage" className="hidden shrink-0 items-center gap-1 text-sm text-primary hover:underline sm:inline-flex">
            Voir la route <ArrowRight className="h-4 w-4" />
          </Link>
        </Reveal>

        <div className="grid gap-5 md:grid-cols-3">
          {NEWS.map((n, i) => (
            <Reveal key={n.title} delay={(i % 3) * 0.06}>
              <Link
                href={n.href}
                className="group flex h-full flex-col rounded-3xl border border-line bg-surface/70 p-6 transition-all hover:-translate-y-0.5 hover:border-primary/40 soft-shadow"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl"
                    style={{ background: `${n.accent}1f`, color: n.accent, boxShadow: `inset 0 0 0 1px ${n.accent}44` }}
                  >
                    <Icon name={n.icon} className="h-5 w-5" />
                  </span>
                  <span
                    className="rounded-full px-2.5 py-1 text-[11px] font-medium"
                    style={{ background: `${n.accent}1a`, color: n.accent }}
                  >
                    {n.tag}
                  </span>
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold text-fg">{n.title}</h3>
                <p className="mt-2 flex-1 text-sm text-muted">{n.description}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                  En savoir plus <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ─── Comment ça marche ────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-5 py-16">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-primary">Comment ça marche</p>
          <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">La plateforme en 4 temps</h2>
          <p className="mt-3 text-muted">Une progression claire, du premier checkpoint au badge final.</p>
        </Reveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {HOW_IT_WORKS.map((s, i) => (
            <Reveal key={s.title} delay={(i % 4) * 0.06}>
              <div className="relative h-full rounded-3xl border border-line bg-surface/70 p-6">
                <span className="absolute right-5 top-5 font-display text-4xl font-bold text-line">{i + 1}</span>
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 text-primary">
                  <Icon name={s.icon} className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold text-fg">{s.title}</h3>
                <p className="mt-2 text-sm text-muted">{s.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ─── Témoignages ──────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-5 py-16">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-primary">Témoignages</p>
          <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">Ils progressent avec CyberAce</h2>
        </Reveal>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.name} delay={(i % 3) * 0.06}>
              <figure className="flex h-full flex-col rounded-3xl border border-line bg-surface/70 p-6 soft-shadow">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star key={s} className={cn("h-4 w-4", s < t.rating ? "fill-warning text-warning" : "text-line")} />
                  ))}
                </div>
                <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-muted">“{t.text}”</blockquote>
                <figcaption className="mt-5 flex items-center gap-3 border-t border-line pt-4">
                  <Avatar seed={t.avatarSeed} name={t.name} size={40} />
                  <div>
                    <div className="text-sm font-semibold text-fg">{t.name}</div>
                    <div className="text-xs text-faint">{t.role}</div>
                  </div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ─── Contact ──────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-5 py-16">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] border border-line bg-gradient-to-br from-surface to-surface-2 p-10 md:p-14">
            <div className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-primary/15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 -right-16 h-56 w-56 rounded-full bg-lavender/20 blur-3xl" />
            <div className="relative grid items-center gap-8 md:grid-cols-2">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.25em] text-primary">Contact</p>
                <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">Une question, une idée ?</h2>
                <p className="mt-3 max-w-md text-muted">
                  Écris-nous — on est là pour t'aider à progresser et on adore les retours de la communauté.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <a
                  href={CONTACT.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-4 rounded-2xl border border-line bg-surface/70 p-4 transition-colors hover:border-primary/40"
                >
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-primary/20 to-lavender/20 text-primary">
                    <InstagramIcon className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block text-xs text-faint">Instagram</span>
                    <span className="block font-medium text-fg group-hover:text-primary">{CONTACT.instagram}</span>
                  </span>
                </a>
                <a
                  href={`mailto:${CONTACT.email}`}
                  className="group flex items-center gap-4 rounded-2xl border border-line bg-surface/70 p-4 transition-colors hover:border-primary/40"
                >
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-primary/20 to-lavender/20 text-primary">
                    <Mail className="h-5 w-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs text-faint">Email</span>
                    <span className="block truncate font-medium text-fg group-hover:text-primary">{CONTACT.email}</span>
                  </span>
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ─── Final CTA ────────────────────────────────────────── */}
      {!user && (
        <section className="mx-auto max-w-7xl px-5 pb-20">
          <Reveal className="flex flex-col items-center gap-5 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-void">
              <Zap className="h-7 w-7" strokeWidth={2.5} />
            </span>
            <h2 className="font-display text-3xl font-semibold sm:text-4xl">Prêt à prendre le départ ?</h2>
            <p className="max-w-md text-muted">Crée ton profil gratuitement et commence par le premier checkpoint.</p>
            <Link href="/register" className={buttonVariants({ size: "lg" })}>
              S&apos;inscrire <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>
        </section>
      )}
    </div>
  );
}
