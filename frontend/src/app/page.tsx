"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import {
  Flag, Timer, Trophy, Lightbulb, TrendingUp, ShieldCheck, ArrowRight, Rocket, Gauge, Layers, type LucideIcon,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/Button";
import { CourseCard } from "@/components/CourseCard";
import Reveal from "@/components/Reveal";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import type { CourseSummary } from "@/lib/types";
import { cn } from "@/lib/utils";

const HeroScene = dynamic(() => import("@/components/three/HeroScene"), { ssr: false });

const FEATURES = [
  { icon: Timer, title: "Défis chronométrés", desc: "Chaque course est une épreuve contre la montre : finis vite pour décrocher le bonus de vitesse." },
  { icon: Flag, title: "Points & scoring", desc: "Difficulté, rapidité et indices déterminent ton score. Chaque flag validé te propulse." },
  { icon: Trophy, title: "Badges & niveaux", desc: "Termine une course pour débloquer son badge et grimper de Recrue à Légende." },
  { icon: Lightbulb, title: "Indices fair-play", desc: "Bloqué ? Révèle un indice — mais il coûte des points. À toi de gérer le risque." },
  { icon: TrendingUp, title: "Statistiques perso", desc: "Temps moyen, taux de réussite par domaine, historique : mesure ta progression." },
  { icon: ShieldCheck, title: "Contenu M1-SSI", desc: "Crypto, réseau, AD, forensic, cloud, web… aligné sur un vrai programme, augmenté de défis inédits." },
];

export default function LandingPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<CourseSummary[]>([]);

  useEffect(() => {
    api.courses().then((r) => setCourses(r.courses)).catch(() => {});
  }, []);

  const totalChallenges = courses.reduce((a, c) => a + c.challengeCount, 0);
  const domains = new Set(courses.map((c) => c.domain)).size;

  return (
    <div>
      {/* HERO */}
      <section className="relative flex min-h-[92vh] items-center overflow-hidden">
        <div className="absolute inset-0">
          <HeroScene />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-bg" />

        <div className="relative mx-auto w-full max-w-7xl px-5">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-2xl"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 font-mono text-xs text-primary">
              <Gauge className="h-3.5 w-3.5" /> CTF gamifié · façon course
            </span>
            <h1 className="mt-5 font-display text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
              Prends la <span className="gradient-text">pole position</span> en cybersécurité
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted">
              CyberAce transforme le programme M1-SSI en circuits de challenges chronométrés.
              Résous, marque des points, débloque des badges et grimpe au classement.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={user ? "/courses" : "/register"} className={buttonVariants({ size: "lg" })}>
                <Rocket className="h-5 w-5" /> {user ? "Continuer la course" : "Démarrer maintenant"}
              </Link>
              <Link href="/leaderboard" className={buttonVariants({ variant: "glass", size: "lg" })}>
                Voir le classement <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* STATS STRIP */}
      <section className="relative -mt-10 px-5">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-4 rounded-2xl border border-line bg-surface/70 p-6 backdrop-blur-xl md:grid-cols-4">
          <Stat icon={Layers} value={`${courses.length || 14}`} label="Courses" />
          <Stat icon={Flag} value={`${totalChallenges || 56}`} label="Challenges" />
          <Stat icon={ShieldCheck} value={`${domains || 14}`} label="Domaines" />
          <Stat icon={Trophy} value="10" label="Niveaux" />
        </div>
      </section>

      {/* FEATURES */}
      <section className="mx-auto max-w-7xl px-5 py-24">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">La mécanique de course</h2>
          <p className="mt-3 text-muted">
            Une boucle de jeu pensée pour l'apprentissage : rapide, mesurable, addictive — et fair-play.
          </p>
        </Reveal>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={(i % 3) * 0.06}>
              <div className="group h-full rounded-2xl border border-line bg-surface/50 p-6 transition-colors hover:border-primary/40">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-void">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold text-fg">{f.title}</h3>
                <p className="mt-2 text-sm text-muted">{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* MODULES */}
      <section className="mx-auto max-w-7xl px-5 pb-24">
        <Reveal className="flex items-end justify-between">
          <div>
            <h2 className="font-display text-3xl font-bold sm:text-4xl">Les circuits</h2>
            <p className="mt-3 max-w-xl text-muted">
              Du partage de secret à la sécurité cloud : chaque circuit combine un mini-cours et des défis de difficulté croissante.
            </p>
          </div>
          <Link href="/courses" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "hidden shrink-0 md:inline-flex")}>
            Tout voir <ArrowRight className="h-4 w-4" />
          </Link>
        </Reveal>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {courses.slice(0, 6).map((c, i) => (
            <CourseCard key={c.slug} course={c} index={i} />
          ))}
        </div>
        <div className="mt-8 text-center md:hidden">
          <Link href="/courses" className={buttonVariants({ variant: "glass" })}>
            Voir les {courses.length || 14} circuits <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-5 pb-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-line bg-gradient-to-br from-surface to-void p-10 text-center md:p-16">
            <div className="pointer-events-none absolute -left-20 -top-20 h-60 w-60 rounded-full bg-primary/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -right-20 h-60 w-60 rounded-full bg-secondary/20 blur-3xl" />
            <h2 className="relative font-display text-3xl font-bold sm:text-4xl">Prêt à prendre le départ ?</h2>
            <p className="relative mx-auto mt-3 max-w-lg text-muted">
              Crée ton profil, choisis un circuit et lance ton premier chrono. Le podium n'attend que toi.
            </p>
            <div className="relative mt-8 flex justify-center gap-3">
              <Link href={user ? "/dashboard" : "/register"} className={buttonVariants({ size: "lg" })}>
                {user ? "Mon dashboard" : "Créer mon profil"} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}

function Stat({ icon: Icon, value, label }: { icon: LucideIcon; value: string; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <div className="font-display text-2xl font-bold text-fg tnum">{value}</div>
        <div className="text-xs text-faint">{label}</div>
      </div>
    </div>
  );
}
