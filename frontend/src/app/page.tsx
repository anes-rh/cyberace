"use client";

import Link from "next/link";
import { Route, Trophy, Lightbulb, TrendingUp, HeartHandshake, MapPin, ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/Button";
import RoadmapExperience from "@/components/RoadmapExperience";
import Reveal from "@/components/Reveal";
import { useAuth } from "@/context/AuthContext";

const FEATURES = [
  { icon: Route, title: "Une route, quatre checkpoints", desc: "Algorithmique, Système d'exploitation, Base de données, puis Cybersécurité — un chemin clair et sans stress." },
  { icon: MapPin, title: "Avance à ton rythme", desc: "Chaque station s'ouvre quand tu es prêt. La caméra t'y emmène en douceur, jamais de rupture brutale." },
  { icon: Trophy, title: "Badges & progression", desc: "Termine les modules d'un checkpoint pour l'illuminer entièrement et débloquer ses badges." },
  { icon: Lightbulb, title: "Indices bienveillants", desc: "Bloqué ? Un indice t'aide — il coûte quelques points, à toi de doser." },
  { icon: TrendingUp, title: "Statistiques claires", desc: "Temps moyen, taux de réussite par domaine, historique : tu vois ta progression sereinement." },
  { icon: HeartHandshake, title: "Ambiance apaisée", desc: "Lumière douce, palette naturelle, mouvements lents : apprendre sans pression." },
];

export default function HomePage() {
  const { user } = useAuth();
  return (
    <div>
      <RoadmapExperience />

      {/* Calm info section */}
      <section className="mx-auto max-w-7xl px-5 py-24">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">Un parcours pensé pour respirer</h2>
          <p className="mt-3 text-muted">
            CyberAce organise l'apprentissage comme une promenade en ville : une route paisible, des étapes lisibles, et un final en cybersécurité riche en défis.
          </p>
        </Reveal>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={(i % 3) * 0.06}>
              <div className="group h-full rounded-3xl border border-line bg-surface/70 p-6 transition-colors hover:border-primary/40">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold text-fg">{f.title}</h3>
                <p className="mt-2 text-sm text-muted">{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-5 pb-10">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] border border-line bg-gradient-to-br from-surface to-surface-2 p-10 text-center md:p-16">
            <div className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-primary/15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 -right-16 h-56 w-56 rounded-full bg-lavender/20 blur-3xl" />
            <h2 className="relative font-display text-3xl font-semibold sm:text-4xl">Prêt à emprunter la route ?</h2>
            <p className="relative mx-auto mt-3 max-w-lg text-muted">
              Crée ton profil, choisis un checkpoint et laisse la caméra te guider le long du chemin.
            </p>
            <div className="relative mt-8 flex justify-center gap-3">
              <Link href={user ? "/checkpoints/cybersecurite" : "/register"} className={buttonVariants({ size: "lg" })}>
                {user ? "Aller au checkpoint Cybersécurité" : "Créer mon profil"} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
