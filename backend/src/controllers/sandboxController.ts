import { Request, Response } from "express";
import { Course } from "../models/Course";
import { SandboxSession } from "../models/SandboxSession";
import { HttpError } from "../middleware/error";
import { startSession, stopSessionForUser } from "../services/dockerSandbox";

/** POST /api/sandbox/:courseSlug/start — boot the lab for the whole course. */
export async function startSandbox(req: Request, res: Response): Promise<void> {
  const courseSlug = String(req.params.courseSlug);
  const course = await Course.findOne({ slug: courseSlug }).lean();
  if (!course) throw new HttpError(404, "Course introuvable.");
  if (!course.sandbox) throw new HttpError(400, "Ce cours n'a pas d'environnement pratique configuré.");

  const session = await startSession(req.userId as string, {
    slug: course.slug,
    sandbox: course.sandbox,
  });

  res.status(201).json({
    session: {
      terminalUrl: session.terminalUrl,
      expiresAt: session.expiresAt,
      status: session.status,
    },
  });
}

/** POST /api/sandbox/:courseSlug/stop — tear down the user's active lab. */
export async function stopSandbox(req: Request, res: Response): Promise<void> {
  await stopSessionForUser(req.userId as string);
  res.json({ ok: true });
}

/** GET /api/sandbox/:courseSlug/status — the user's active session for this course (or null). */
export async function statusSandbox(req: Request, res: Response): Promise<void> {
  const courseSlug = String(req.params.courseSlug);
  const session = await SandboxSession.findOne({
    user: req.userId,
    courseSlug,
    status: { $in: ["starting", "running"] },
  }).lean();

  if (!session) {
    res.json({ session: null });
    return;
  }

  const remainingSec = Math.max(0, Math.floor((new Date(session.expiresAt).getTime() - Date.now()) / 1000));
  res.json({
    session: {
      terminalUrl: session.terminalUrl,
      expiresAt: session.expiresAt,
      status: session.status,
      remainingSec,
    },
  });
}
