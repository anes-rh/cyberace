import { Router, Request, Response } from "express";
import { authRequired } from "../middleware/auth";
import { HttpError } from "../middleware/error";

const router = Router();

/**
 * POST /api/execute — compile & run a C snippet in the Piston public sandbox
 * (https://github.com/engineer-man/piston). The code runs in an isolated
 * container on emkc.org, never on our server. Auth required to limit abuse;
 * a light per-user cooldown keeps us inside Piston's public rate limit.
 */
const lastRun = new Map<string, number>();
const COOLDOWN_MS = 1500;
const MAX_CODE_LEN = 20_000;

router.post("/", authRequired, async (req: Request, res: Response) => {
  const { code, stdin } = req.body ?? {};
  if (typeof code !== "string" || code.trim().length === 0) {
    throw new HttpError(400, "Aucun code fourni.");
  }
  if (code.length > MAX_CODE_LEN) {
    throw new HttpError(400, "Code trop long (20 Ko max).");
  }
  const userId = String(req.userId);
  const last = lastRun.get(userId) ?? 0;
  const now = Date.now();
  if (now - last < COOLDOWN_MS) {
    throw new HttpError(429, "Doucement ! Attends une seconde entre deux exécutions.");
  }
  lastRun.set(userId, now);

  let resp: globalThis.Response;
  try {
    resp = await fetch("https://emkc.org/api/v2/piston/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language: "c",
        version: "10.2.0",
        files: [{ name: "main.c", content: code }],
        stdin: typeof stdin === "string" ? stdin.slice(0, 4000) : "",
        compile_timeout: 10_000,
        run_timeout: 5_000,
      }),
    });
  } catch {
    throw new HttpError(502, "Le service de compilation est injoignable. Réessaie dans un instant.");
  }

  if (!resp.ok) {
    throw new HttpError(502, `Service de compilation indisponible (${resp.status}).`);
  }
  const data = (await resp.json()) as {
    compile?: { stdout: string; stderr: string; code: number | null };
    run?: { stdout: string; stderr: string; code: number | null; signal: string | null };
  };

  res.json({
    compile: data.compile
      ? { stdout: data.compile.stdout, stderr: data.compile.stderr, code: data.compile.code }
      : null,
    run: data.run
      ? { stdout: data.run.stdout, stderr: data.run.stderr, code: data.run.code, signal: data.run.signal }
      : null,
  });
});

export default router;
