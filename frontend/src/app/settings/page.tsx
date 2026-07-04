"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Settings as SettingsIcon, Camera, UserRound, KeyRound, Check, Trash2 } from "lucide-react";
import { RequireAuth } from "@/components/RequireAuth";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Input, Field } from "@/components/ui/Input";
import { useAuth } from "@/context/AuthContext";
import { api, ApiError } from "@/lib/api";

export default function SettingsPage() {
  return (
    <RequireAuth>
      <SettingsInner />
    </RequireAuth>
  );
}

/** Days remaining before a weekly-limited field can change again (or null). */
function nextChangeDate(iso?: string | null): Date | null {
  if (!iso) return null;
  const next = new Date(new Date(iso).getTime() + 7 * 86_400_000);
  return next.getTime() > Date.now() ? next : null;
}

/** Downscale an uploaded image to a square data URL (keeps payload small). */
function fileToDataUrl(file: File, max = 256): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Lecture du fichier impossible."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Image illisible."));
      img.onload = () => {
        const side = Math.min(img.width, img.height);
        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = max;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, max, max);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

function SettingsInner() {
  const { user, refresh } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);

  // Avatar
  const [preview, setPreview] = useState<string | null>(user!.avatarUrl ?? null);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [avatarMsg, setAvatarMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // Pseudo (username)
  const [username, setUsername] = useState(user!.username);
  const [pseudoBusy, setPseudoBusy] = useState(false);
  const [pseudoMsg, setPseudoMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const pseudoLockedUntil = nextChangeDate(user!.usernameChangedAt);

  // Password
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [pwBusy, setPwBusy] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const pwLockedUntil = nextChangeDate(user!.passwordChangedAt);

  const onPickFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setAvatarMsg(null);
    try {
      const dataUrl = await fileToDataUrl(file);
      setPreview(dataUrl);
      setAvatarBusy(true);
      await api.updateProfile({ avatarUrl: dataUrl });
      await refresh();
      setAvatarMsg({ ok: true, text: "Photo de profil mise à jour ✨" });
    } catch (err) {
      setAvatarMsg({ ok: false, text: err instanceof ApiError ? err.message : "Envoi impossible." });
      setPreview(user!.avatarUrl ?? null);
    } finally {
      setAvatarBusy(false);
    }
  };

  const removePhoto = async () => {
    setAvatarBusy(true);
    setAvatarMsg(null);
    try {
      await api.updateProfile({ avatarUrl: null });
      await refresh();
      setPreview(null);
      setAvatarMsg({ ok: true, text: "Photo retirée — retour à l'avatar par défaut." });
    } catch (err) {
      setAvatarMsg({ ok: false, text: err instanceof ApiError ? err.message : "Suppression impossible." });
    } finally {
      setAvatarBusy(false);
    }
  };

  const savePseudo = async (e: React.FormEvent) => {
    e.preventDefault();
    setPseudoMsg(null);
    if (username.trim() === user!.username) {
      setPseudoMsg({ ok: false, text: "C'est déjà ton pseudo actuel." });
      return;
    }
    setPseudoBusy(true);
    try {
      await api.updateProfile({ username: username.trim() });
      await refresh();
      setPseudoMsg({ ok: true, text: "Pseudo mis à jour ! Prochain changement possible dans 7 jours." });
    } catch (err) {
      setPseudoMsg({ ok: false, text: err instanceof ApiError ? err.message : "Modification impossible." });
    } finally {
      setPseudoBusy(false);
    }
  };

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMsg(null);
    if (pw.next !== pw.confirm) {
      setPwMsg({ ok: false, text: "Les deux nouveaux mots de passe ne correspondent pas." });
      return;
    }
    setPwBusy(true);
    try {
      await api.updatePassword({ currentPassword: pw.current, newPassword: pw.next });
      await refresh();
      setPw({ current: "", next: "", confirm: "" });
      setPwMsg({ ok: true, text: "Mot de passe changé ! Prochain changement possible dans 7 jours." });
    } catch (err) {
      setPwMsg({ ok: false, text: err instanceof ApiError ? err.message : "Modification impossible." });
    } finally {
      setPwBusy(false);
    }
  };

  const Msg = ({ m }: { m: { ok: boolean; text: string } | null }) =>
    m ? (
      <p className={`rounded-lg px-3 py-2 text-sm ${m.ok ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`}>
        {m.text}
      </p>
    ) : null;

  const fmt = (d: Date) => d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
          <SettingsIcon className="h-6 w-6" />
        </span>
        <div>
          <h1 className="font-display text-2xl font-bold text-fg">Paramètres</h1>
          <p className="text-sm text-muted">Gère ta photo, ton pseudo et ton mot de passe.</p>
        </div>
      </motion.div>

      <div className="space-y-6">
        {/* Photo de profil */}
        <section className="glass rounded-2xl p-6">
          <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-fg">
            <Camera className="h-5 w-5 text-primary" /> Photo de profil
          </h2>
          <div className="flex flex-wrap items-center gap-5">
            <Avatar seed={user!.avatarSeed} name={user!.displayName} url={preview} size={80} className="ring-2 ring-primary/30" />
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <Button size="sm" variant="glass" disabled={avatarBusy} onClick={() => fileRef.current?.click()}>
                  <Camera className="h-4 w-4" /> {avatarBusy ? "Envoi…" : "Changer la photo"}
                </Button>
                {preview && (
                  <Button size="sm" variant="ghost" disabled={avatarBusy} onClick={removePhoto}>
                    <Trash2 className="h-4 w-4" /> Retirer
                  </Button>
                )}
              </div>
              <p className="text-xs text-faint">PNG, JPG, WEBP ou GIF · 1 Mo max · recadrée en carré automatiquement.</p>
            </div>
            <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" onChange={onPickFile} />
          </div>
          <div className="mt-3"><Msg m={avatarMsg} /></div>
        </section>

        {/* Pseudo */}
        <section className="glass rounded-2xl p-6">
          <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-fg">
            <UserRound className="h-5 w-5 text-primary" /> Pseudo
          </h2>
          <form onSubmit={savePseudo} className="space-y-4">
            <Field label="Pseudo" htmlFor="username" hint="3-24 caractères : lettres, chiffres, . _ - · modifiable 1 fois par semaine.">
              <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} disabled={!!pseudoLockedUntil} autoComplete="off" />
            </Field>
            {pseudoLockedUntil ? (
              <p className="rounded-lg bg-warning/10 px-3 py-2 text-sm text-warning">
                Tu as déjà changé de pseudo récemment. Prochain changement possible le <strong>{fmt(pseudoLockedUntil)}</strong>.
              </p>
            ) : (
              <Msg m={pseudoMsg} />
            )}
            <Button type="submit" size="md" disabled={pseudoBusy || !!pseudoLockedUntil}>
              <Check className="h-4 w-4" /> {pseudoBusy ? "Enregistrement…" : "Enregistrer le pseudo"}
            </Button>
          </form>
        </section>

        {/* Mot de passe */}
        <section className="glass rounded-2xl p-6">
          <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-fg">
            <KeyRound className="h-5 w-5 text-primary" /> Mot de passe
          </h2>
          <form onSubmit={savePassword} className="space-y-4">
            <Field label="Mot de passe actuel" htmlFor="cpw">
              <Input id="cpw" type="password" value={pw.current} onChange={(e) => setPw((p) => ({ ...p, current: e.target.value }))} autoComplete="current-password" required disabled={!!pwLockedUntil} />
            </Field>
            <Field label="Nouveau mot de passe" htmlFor="npw" hint="Au moins 6 caractères · modifiable 1 fois par semaine.">
              <Input id="npw" type="password" value={pw.next} onChange={(e) => setPw((p) => ({ ...p, next: e.target.value }))} autoComplete="new-password" required disabled={!!pwLockedUntil} />
            </Field>
            <Field label="Confirmer le nouveau mot de passe" htmlFor="npw2">
              <Input id="npw2" type="password" value={pw.confirm} onChange={(e) => setPw((p) => ({ ...p, confirm: e.target.value }))} autoComplete="new-password" required disabled={!!pwLockedUntil} />
            </Field>
            {pwLockedUntil ? (
              <p className="rounded-lg bg-warning/10 px-3 py-2 text-sm text-warning">
                Tu as déjà changé de mot de passe récemment. Prochain changement possible le <strong>{fmt(pwLockedUntil)}</strong>.
              </p>
            ) : (
              <Msg m={pwMsg} />
            )}
            <Button type="submit" size="md" disabled={pwBusy || !!pwLockedUntil}>
              <Check className="h-4 w-4" /> {pwBusy ? "Enregistrement…" : "Changer le mot de passe"}
            </Button>
          </form>
        </section>
      </div>
    </div>
  );
}
