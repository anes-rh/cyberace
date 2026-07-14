import rateLimit from "express-rate-limit";

/**
 * Anti-brute-force limiter for the authentication endpoints (login/register).
 *
 * Caps attempts per IP over a rolling window. Deliberately generous enough not
 * to hinder a legitimate user who mistypes a few times, strict enough to make
 * credential-stuffing / password-spraying impractical. Applied per-route in
 * `authRoutes` (never on `/me`, which the frontend polls on every page load).
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 20, // 20 tentatives / IP / fenêtre
  standardHeaders: "draft-7", // en-têtes RateLimit standard
  legacyHeaders: false, // pas de X-RateLimit-* obsolètes
  message: { error: "Trop de tentatives. Réessaie dans quelques minutes." },
});
