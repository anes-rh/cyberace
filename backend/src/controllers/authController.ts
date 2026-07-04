import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/User";
import { signToken } from "../utils/token";
import { serializeUser } from "../utils/serialize";
import { HttpError } from "../middleware/error";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_RE = /^[a-zA-Z0-9_.-]{3,24}$/;

export async function register(req: Request, res: Response): Promise<void> {
  const { username, email, password, displayName } = req.body ?? {};

  if (!username || !email || !password) {
    throw new HttpError(400, "username, email et password sont requis.");
  }
  if (!USERNAME_RE.test(String(username))) {
    throw new HttpError(400, "Pseudo invalide (3-24 caractères: lettres, chiffres, . _ -).");
  }
  if (!EMAIL_RE.test(String(email))) {
    throw new HttpError(400, "Adresse e-mail invalide.");
  }
  if (String(password).length < 6) {
    throw new HttpError(400, "Le mot de passe doit contenir au moins 6 caractères.");
  }

  const passwordHash = await bcrypt.hash(String(password), 10);
  const user = await User.create({
    username: String(username),
    email: String(email).toLowerCase(),
    passwordHash,
    displayName: displayName ? String(displayName).slice(0, 40) : String(username),
  });

  const token = signToken(user._id.toString());
  res.status(201).json({ token, user: serializeUser(user) });
}

export async function login(req: Request, res: Response): Promise<void> {
  const { emailOrUsername, password } = req.body ?? {};
  if (!emailOrUsername || !password) {
    throw new HttpError(400, "Identifiant et mot de passe requis.");
  }

  const identifier = String(emailOrUsername).trim();
  const user = await User.findOne({
    $or: [{ email: identifier.toLowerCase() }, { username: identifier }],
  }).select("+passwordHash");

  if (!user || !(await user.comparePassword(String(password)))) {
    throw new HttpError(401, "Identifiants incorrects.");
  }

  // Lightweight daily streak update.
  const now = new Date();
  const last = user.lastActive ?? now;
  const days = Math.floor((now.getTime() - last.getTime()) / 86_400_000);
  if (days === 1) user.streak += 1;
  else if (days > 1) user.streak = 1;
  else if (user.streak === 0) user.streak = 1;
  user.lastActive = now;
  await user.save();

  const token = signToken(user._id.toString());
  res.json({ token, user: serializeUser(user) });
}

export async function me(req: Request, res: Response): Promise<void> {
  const user = await User.findById(req.userId);
  if (!user) throw new HttpError(404, "Utilisateur introuvable.");
  res.json({ user: serializeUser(user) });
}

const WEEK_MS = 7 * 86_400_000;
const MAX_AVATAR_LEN = 1_500_000; // ~1.1 MB image once base64-encoded

/** Days-aware "next allowed" helper for the 1-change-per-week limits. */
function weeklyGate(last: Date | undefined): { blocked: boolean; nextAt: Date | null } {
  if (!last) return { blocked: false, nextAt: null };
  const next = new Date(last.getTime() + WEEK_MS);
  return { blocked: Date.now() < next.getTime(), nextAt: next };
}

/**
 * PATCH /api/auth/profile — update the avatar (unlimited) and/or the pseudo
 * (username, unique, limited to 1 change per week).
 */
export async function updateProfile(req: Request, res: Response): Promise<void> {
  const { username, avatarUrl } = req.body ?? {};
  const user = await User.findById(req.userId);
  if (!user) throw new HttpError(404, "Utilisateur introuvable.");

  // Avatar: accept a data:image URL (or null to reset to initials). Not rate-limited.
  if (avatarUrl !== undefined) {
    if (avatarUrl === null || avatarUrl === "") {
      user.avatarUrl = undefined;
    } else {
      const url = String(avatarUrl);
      if (!/^data:image\/(png|jpe?g|webp|gif);base64,/.test(url)) {
        throw new HttpError(400, "Image invalide (formats acceptés : PNG, JPG, WEBP, GIF).");
      }
      if (url.length > MAX_AVATAR_LEN) {
        throw new HttpError(400, "Image trop lourde (1 Mo max). Choisis une image plus légère.");
      }
      user.avatarUrl = url;
    }
  }

  // Pseudo (username): unique + format-validated + rate-limited to 1 change / week.
  if (username !== undefined) {
    const next = String(username).trim();
    if (!USERNAME_RE.test(next)) {
      throw new HttpError(400, "Pseudo invalide (3-24 caractères : lettres, chiffres, . _ -).");
    }
    if (next !== user.username) {
      const gate = weeklyGate(user.usernameChangedAt);
      if (gate.blocked) {
        throw new HttpError(
          429,
          `Tu as déjà changé de pseudo cette semaine. Prochain changement possible le ${gate.nextAt!.toLocaleDateString("fr-FR")}.`
        );
      }
      const taken = await User.exists({ username: next, _id: { $ne: user._id } });
      if (taken) throw new HttpError(409, "Ce pseudo est déjà pris.");
      user.username = next;
      user.usernameChangedAt = new Date();
    }
  }

  await user.save();
  res.json({ user: serializeUser(user) });
}

/**
 * PATCH /api/auth/password — change password: verify the current one, enforce
 * the 1-change-per-week limit.
 */
export async function updatePassword(req: Request, res: Response): Promise<void> {
  const { currentPassword, newPassword } = req.body ?? {};
  if (!currentPassword || !newPassword) {
    throw new HttpError(400, "Mot de passe actuel et nouveau mot de passe requis.");
  }
  if (String(newPassword).length < 6) {
    throw new HttpError(400, "Le nouveau mot de passe doit contenir au moins 6 caractères.");
  }

  const user = await User.findById(req.userId).select("+passwordHash");
  if (!user) throw new HttpError(404, "Utilisateur introuvable.");

  if (!(await user.comparePassword(String(currentPassword)))) {
    throw new HttpError(401, "Mot de passe actuel incorrect.");
  }

  const gate = weeklyGate(user.passwordChangedAt);
  if (gate.blocked) {
    throw new HttpError(
      429,
      `Tu as déjà changé de mot de passe cette semaine. Prochain changement possible le ${gate.nextAt!.toLocaleDateString("fr-FR")}.`
    );
  }
  if (await user.comparePassword(String(newPassword))) {
    throw new HttpError(400, "Le nouveau mot de passe doit être différent de l'ancien.");
  }

  user.passwordHash = await bcrypt.hash(String(newPassword), 10);
  user.passwordChangedAt = new Date();
  await user.save();
  res.json({ user: serializeUser(user) });
}
