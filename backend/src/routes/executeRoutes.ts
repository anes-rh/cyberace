import { Router, Request, Response } from "express";
import { authRequired } from "../middleware/auth";
import { HttpError } from "../middleware/error";

const router = Router();

/**
 * POST /api/execute — compile & run a C snippet in an external sandbox.
 *
 * Default backend: Wandbox (https://wandbox.org), public and key-free — it
 * replaces the old public Piston API, which became whitelist-only in 2026.
 * The code runs in Wandbox's container, never on our server.
 *
 * Configurable via env for self-hosting / swapping providers:
 *   CODE_EXEC_URL       (default https://wandbox.org/api/compile.json)
 *   CODE_EXEC_COMPILER  (default gcc-13.2.0)
 *
 * Grading of `code` challenges does NOT depend on this endpoint — it is
 * keypoint-based and works offline (see utils/answer.ts). This route only
 * powers the optional "Compiler & Exécuter" button, and fails gracefully.
 */
const WANDBOX_URL = process.env.CODE_EXEC_URL || "https://wandbox.org/api/compile.json";
const WANDBOX_COMPILER = process.env.CODE_EXEC_COMPILER || "gcc-13.2.0";

const lastRun = new Map<string, number>();
const COOLDOWN_MS = 1500;
const MAX_CODE_LEN = 20_000;

interface WandboxResponse {
  status?: string;
  compiler_message?: string;
  compiler_error?: string;
  program_message?: string;
  program_output?: string;
  program_error?: string;
}

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

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20_000);

  let resp: globalThis.Response;
  try {
    resp = await fetch(WANDBOX_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        code,
        compiler: WANDBOX_COMPILER,
        stdin: typeof stdin === "string" ? stdin.slice(0, 4000) : "",
        options: "warning",
        "compiler-option-raw": "-std=c11",
      }),
    });
  } catch {
    clearTimeout(timer);
    throw new HttpError(502, "Le service de compilation est injoignable. Réessaie dans un instant.");
  }
  clearTimeout(timer);

  if (!resp.ok) {
    throw new HttpError(502, `Service de compilation indisponible (${resp.status}).`);
  }

  const data = (await resp.json()) as WandboxResponse;

  // Map Wandbox's flat shape to our { compile, run } contract.
  const compileErr = data.compiler_error ?? "";
  const ran =
    data.program_output !== undefined ||
    data.program_error !== undefined ||
    data.program_message !== undefined;

  res.json({
    compile: {
      stdout: data.compiler_message ?? "",
      stderr: compileErr,
      code: compileErr && !ran ? 1 : 0,
    },
    run: ran
      ? {
          stdout: data.program_output ?? "",
          stderr: data.program_error ?? "",
          code: data.status !== undefined ? Number(data.status) : 0,
          signal: null,
        }
      : null,
  });
});

export default router;
