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
