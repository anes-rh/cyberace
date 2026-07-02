"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, LogOut, Zap } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button, buttonVariants } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/checkpoints/cybersecurite", label: "Cybersécurité" },
  { href: "/leaderboard", label: "Classement" },
];

export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const authedLinks = user ? [{ href: "/dashboard", label: "Dashboard" }] : [];
  const allLinks = [...LINKS, ...authedLinks];

  return (
    <header className="sticky top-0 z-50 border-b border-line/60 bg-bg/70 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">
        <Link href="/" className="group flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-primary to-secondary text-void">
            <Zap className="h-5 w-5" strokeWidth={2.5} />
          </span>
          <span className="font-display text-lg font-bold tracking-wide">
            Cyber<span className="text-primary">Ace</span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {allLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                pathname.startsWith(l.href) ? "text-primary" : "text-muted hover:text-fg"
              )}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {loading ? null : user ? (
            <>
              <Link href="/profile" className="flex items-center gap-2 rounded-full py-1 pl-1 pr-3 hover:bg-surface-2">
                <Avatar seed={user.avatarSeed} name={user.displayName} size={32} />
                <div className="text-right leading-tight">
                  <div className="text-sm font-medium text-fg">{user.displayName}</div>
                  <div className="text-[11px] text-primary tnum">{user.xp} XP · Nv.{user.level.level}</div>
                </div>
              </Link>
              <Button variant="ghost" size="icon" onClick={logout} title="Se déconnecter">
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Link href="/login" className={buttonVariants({ variant: "ghost", size: "sm" })}>
                Connexion
              </Link>
              <Link href="/register" className={buttonVariants({ variant: "primary", size: "sm" })}>
                Rejoindre
              </Link>
            </>
          )}
        </div>

        <button className="md:hidden text-fg" onClick={() => setOpen((v) => !v)} aria-label="Menu">
          {open ? <X /> : <Menu />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-line/60 bg-bg/95 px-5 py-4 md:hidden">
          <div className="flex flex-col gap-1">
            {allLinks.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-muted hover:bg-surface-2 hover:text-fg">
                {l.label}
              </Link>
            ))}
            <div className="mt-2 flex gap-2">
              {user ? (
                <>
                  <Link href="/profile" onClick={() => setOpen(false)} className={cn(buttonVariants({ variant: "glass", size: "sm" }), "flex-1")}>
                    Profil
                  </Link>
                  <Button variant="ghost" size="sm" onClick={() => { logout(); setOpen(false); }}>
                    Déconnexion
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setOpen(false)} className={cn(buttonVariants({ variant: "glass", size: "sm" }), "flex-1")}>
                    Connexion
                  </Link>
                  <Link href="/register" onClick={() => setOpen(false)} className={cn(buttonVariants({ variant: "primary", size: "sm" }), "flex-1")}>
                    Rejoindre
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
