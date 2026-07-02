import { cn } from "@/lib/utils";

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-block h-5 w-5 animate-spin rounded-full border-2 border-primary/30 border-t-primary",
        className
      )}
      aria-label="Chargement"
    />
  );
}

export function FullScreenLoader({ label = "Chargement…" }: { label?: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <Spinner className="h-8 w-8" />
      <p className="font-mono text-sm text-muted">{label}</p>
    </div>
  );
}
