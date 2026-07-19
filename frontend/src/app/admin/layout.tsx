"use client";

import { ReactNode, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Users, Server, Trophy, ShieldAlert } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { FullScreenLoader } from "@/components/ui/Spinner";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard, exact: true },
  { href: "/admin/users", label: "Utilisateurs", icon: Users, exact: false },
  { href: "/admin/sessions", label: "Sessions", icon: Server, exact: false },
  { href: "/admin/leaderboard", label: "Classement", icon: Trophy, exact: false },
];

/**
 * Garde d'accès CÔTÉ CLIENT (confort UX uniquement — la vraie protection est le
 * middleware backend adminRequired). Aucune donnée admin n'est rendue tant que
 * le rôle admin n'est pas confirmé : un non-admin voit le loader puis est
 * redirigé, jamais un flash de contenu sensible.
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/login");
    else if (!isAdmin) router.replace("/dashboard");
  }, [loading, user, isAdmin, router]);

  if (loading || !user || !isAdmin) {
    return <FullScreenLoader label="Vérification des droits d'accès…" />;
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-8">
      <header className="mb-6 flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-danger to-[#c96a6a] text-white">
          <ShieldAlert className="h-5 w-5" />
        </span>
        <div>
          <h1 className="font-display text-2xl font-bold text-fg">Administration</h1>
          <p className="text-sm text-muted">Espace réservé — toutes les actions destructives sont journalisées.</p>
        </div>
      </header>

      <nav className="mb-8 flex flex-wrap gap-1 border-b border-line/60 pb-2">
        {TABS.map((t) => {
          const active = t.exact ? pathname === t.href : pathname.startsWith(t.href);
          const Icon = t.icon;
          return (
            <Link
              key={t.href}
              href={t.href}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                active ? "bg-surface-2 text-primary" : "text-muted hover:text-fg hover:bg-surface-2"
              )}
            >
              <Icon className="h-4 w-4" /> {t.label}
            </Link>
          );
        })}
      </nav>

      {children}
    </div>
  );
}
