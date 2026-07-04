import { Request, Response } from "express";
import { User } from "../models/User";
import { computeLevel } from "../utils/scoring";

/** GET /api/leaderboard?limit=50 */
export async function getLeaderboard(req: Request, res: Response): Promise<void> {
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));

  const top = await User.find({}, "username displayName avatarSeed avatarUrl xp badges solved")
    .sort({ xp: -1, updatedAt: 1 })
    .limit(limit)
    .lean();

  const entries = top.map((u, i) => ({
    rank: i + 1,
    username: u.username,
    displayName: u.displayName,
    avatarSeed: u.avatarSeed,
    avatarUrl: u.avatarUrl ?? null,
    xp: u.xp,
    level: computeLevel(u.xp).level,
    title: computeLevel(u.xp).title,
    badges: u.badges?.length ?? 0,
    solvedCount: u.solved?.length ?? 0,
  }));

  let me: { rank: number; xp: number } | null = null;
  if (req.userId) {
    const current = await User.findById(req.userId, "xp").lean();
    if (current) {
      const better = await User.countDocuments({ xp: { $gt: current.xp } });
      me = { rank: better + 1, xp: current.xp };
    }
  }

  res.json({ leaderboard: entries, me });
}
