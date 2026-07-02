"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Field } from "@/components/ui/Input";
import { useAuth } from "@/context/AuthContext";
import { AuthLayout } from "@/components/AuthLayout";
import { ApiError } from "@/lib/api";

export default function LoginPage() {
  const { login, user } = useAuth();
  const router = useRouter();
  const [emailOrUsername, setId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) router.replace("/dashboard");
  }, [user, router]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(emailOrUsername, password);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Connexion impossible.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full glass rounded-3xl p-8">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
            <LogIn className="h-6 w-6" />
          </div>
          <h1 className="font-display text-2xl font-bold">Reprends la piste</h1>
          <p className="mt-1 text-sm text-muted">Connecte-toi pour continuer tes courses.</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <Field label="Pseudo ou e-mail" htmlFor="id">
            <Input id="id" value={emailOrUsername} onChange={(e) => setId(e.target.value)} autoComplete="username" required />
          </Field>
          <Field label="Mot de passe" htmlFor="pwd">
            <Input id="pwd" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
          </Field>

          {error && <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? "Connexion…" : "Se connecter"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          Pas encore de profil ?{" "}
          <Link href="/register" className="text-primary hover:underline">Rejoindre la course</Link>
        </p>
      </motion.div>
    </AuthLayout>
  );
}
