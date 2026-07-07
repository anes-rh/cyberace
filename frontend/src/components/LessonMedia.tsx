"use client";

import { useEffect, useState } from "react";
import { PlayCircle, Download, ExternalLink, FileDown, CheckCircle2, MonitorDown } from "lucide-react";
import type { CourseVideo, CourseResource } from "@/lib/types";
import { cn } from "@/lib/utils";

const OS_LABEL: Record<string, string> = { win: "Windows", linux: "Linux (Ubuntu/Debian)", mac: "macOS" };

function detectOs(): "win" | "linux" | "mac" {
  if (typeof navigator === "undefined") return "win";
  const p = `${navigator.userAgent} ${navigator.platform}`.toLowerCase();
  if (p.includes("mac")) return "mac";
  if (p.includes("linux") || p.includes("x11")) return "linux";
  return "win";
}

/** Responsive embedded YouTube player. */
function VideoEmbed({ v }: { v: CourseVideo }) {
  return (
    <figure className="overflow-hidden rounded-xl border border-line bg-surface/60">
      <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
        <iframe
          className="absolute inset-0 h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${v.youtubeId}`}
          title={v.title}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
      <figcaption className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
        <span className="flex items-center gap-2 font-medium text-fg">
          <PlayCircle className="h-4 w-4 text-danger" /> {v.title}
        </span>
        {v.moreUrl && (
          <a href={v.moreUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-primary hover:underline">
            Pour aller plus loin <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </figcaption>
    </figure>
  );
}

/** Packet Tracer installer picker: OS tabs, defaults to the visitor's OS. */
function InstallerPicker({ installers }: { installers: CourseResource[] }) {
  const [os, setOs] = useState<"win" | "linux" | "mac">("win");
  useEffect(() => setOs(detectOs()), []);
  const available = installers.map((i) => i.os).filter(Boolean) as ("win" | "linux" | "mac")[];
  const current = installers.find((i) => i.os === os) ?? installers[0];

  return (
    <div className="rounded-xl border border-line bg-surface/60 p-4">
      <p className="mb-3 flex items-center gap-2 text-sm font-medium text-fg">
        <MonitorDown className="h-4 w-4 text-primary" /> Télécharger Packet Tracer pour ton système
      </p>
      <div className="mb-3 flex flex-wrap gap-2">
        {(["win", "linux", "mac"] as const).filter((o) => available.includes(o)).map((o) => (
          <button
            key={o}
            onClick={() => setOs(o)}
            className={cn(
              "rounded-lg border px-3 py-1.5 text-sm transition-colors",
              os === o ? "border-primary bg-primary/10 font-medium text-fg" : "border-line text-muted hover:border-primary/40"
            )}
          >
            {OS_LABEL[o]}
          </button>
        ))}
      </div>
      {current && (
        <a
          href={current.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          <Download className="h-4 w-4" /> {current.label}
        </a>
      )}
      {current?.note && <p className="mt-2 text-xs text-faint">{current.note}</p>}
    </div>
  );
}

function ResourceCard({ r }: { r: CourseResource }) {
  const solution = r.kind === "pkt-solution";
  return (
    <a
      href={r.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "flex items-center gap-3 rounded-xl border p-3 transition-colors",
        solution ? "border-success/40 bg-success/5 hover:border-success" : "border-line bg-surface/60 hover:border-primary/40"
      )}
    >
      <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-lg", solution ? "bg-success/15 text-success" : "bg-primary/10 text-primary")}>
        {r.kind === "link" ? <ExternalLink className="h-4 w-4" /> : solution ? <CheckCircle2 className="h-4 w-4" /> : <FileDown className="h-4 w-4" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-fg">{r.label}</span>
        {r.note && <span className="block truncate text-xs text-faint">{r.note}</span>}
      </span>
      <Download className="h-4 w-4 shrink-0 text-faint" />
    </a>
  );
}

/** Videos + downloadable resources block, shown under a lesson. */
export function LessonMedia({ videos, resources }: { videos?: CourseVideo[]; resources?: CourseResource[] }) {
  const vids = videos ?? [];
  const res = resources ?? [];
  const installers = res.filter((r) => r.kind === "installer");
  const files = res.filter((r) => r.kind !== "installer");
  if (vids.length === 0 && res.length === 0) return null;

  return (
    <div className="mt-8 space-y-6 border-t border-line pt-8">
      {installers.length > 0 && <InstallerPicker installers={installers} />}

      {vids.length > 0 && (
        <div id="lesson-videos" className="scroll-mt-24">
          <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-semibold text-fg">
            <PlayCircle className="h-5 w-5 text-danger" /> Vidéos explicatives {vids.length > 1 ? `(${vids.length})` : ""}
          </h3>
          <div className="grid gap-4">
            {vids.map((v) => (
              <VideoEmbed key={v.youtubeId} v={v} />
            ))}
          </div>
        </div>
      )}

      {files.length > 0 && (
        <div>
          <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-semibold text-fg">
            <FileDown className="h-5 w-5 text-primary" /> Fichiers &amp; ressources
          </h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {files.map((r, i) => (
              <ResourceCard key={`${r.url}-${i}`} r={r} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
