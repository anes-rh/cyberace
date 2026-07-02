"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Field } from "@/components/ui/Input";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";

export default function RegisterPage() {
  const { register, user } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ displayName: "", username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) router.replace("/dashboard");
  }, [user, router]);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await register({
        username: form.username,
        email: form.email,
        password: form.password,
        displayName: form.displayName || form.username,
      });
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Inscription impossible.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[85vh] max-w-md items-center px-5 py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full glass rounded-2xl p-8">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-xl bg-secondary/10 text-secondary">
            <UserPlus className="h-6 w-6" />
          </div>
          <h1 className="font-display text-2xl font-bold">Rejoins la course</h1>
          <p className="mt-1 text-sm text-muted">Crée ton profil de pilote CyberAce.</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <Field label="Nom d'affichage" htmlFor="dn">
            <Input id="dn" value={form.displayName} onChange={set("displayName")} placeholder="Ex: Anes le Rapide" />
          </Field>
          <Field label="Pseudo" htmlFor="un" hint="3-24 caractères : lettres, chiffres, . _ -">
            <Input id="un" value={form.username} onChange={set("username")} autoComplete="username" required />
          </Field>
          <Field label="E-mail" htmlFor="em">
            <Input id="em" type="email" value={form.email} onChange={set("email")} autoComplete="email" required />
          </Field>
          <Field label="Mot de passe" htmlFor="pw" hint="Au moins 6 caractères">
            <Input id="pw" type="password" value={form.password} onChange={set("password")} autoComplete="new-password" required />
          </Field>

          {error && <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}

          <Button type="submit" className="w-full" size="lg" variant="secondary" disabled={loading}>
            {loading ? "Création…" : "Créer mon profil"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          Déjà un compte ?{" "}
          <Link href="/login" className="text-primary hover:underline">Se connecter</Link>
        </p>
      </motion.div>
    </div>
  );
}
