import Link from "next/link";
import { Zap } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-line/60 bg-surface/60">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-5 py-10 text-sm text-muted md:flex-row">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-gradient-to-br from-primary to-secondary text-void">
            <Zap className="h-4 w-4" strokeWidth={2.5} />
          </span>
          <span className="font-display font-semibold text-fg">
            Cyber<span className="text-primary">Ace</span>
          </span>
        </div>
        <p className="text-center text-faint">
          CyberAce — Apprends l&apos;informatique et la cybersécurité en t&apos;amusant.
        </p>
        <div className="flex gap-4">
          <Link href="/apprentissage" className="hover:text-fg">Apprentissage</Link>
          <Link href="/leaderboard" className="hover:text-fg">Classement</Link>
        </div>
      </div>
    </footer>
  );
}
