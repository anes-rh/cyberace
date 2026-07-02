import { cn } from "@/lib/utils";

export function Progress({
  value,
  className,
  color = "var(--color-primary)",
  height = 8,
}: {
  value: number; // 0..1
  className?: string;
  color?: string;
  height?: number;
}) {
  const clamped = Math.max(0, Math.min(1, value));
  return (
    <div
      className={cn("w-full overflow-hidden rounded-full bg-surface-2", className)}
      style={{ height }}
      role="progressbar"
      aria-valuenow={Math.round(clamped * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full rounded-full transition-[width] duration-700 ease-out"
        style={{
          width: `${clamped * 100}%`,
          background: `linear-gradient(90deg, ${color}, color-mix(in srgb, ${color} 55%, white))`,
          boxShadow: `0 0 12px -2px ${color}`,
        }}
      />
    </div>
  );
}
