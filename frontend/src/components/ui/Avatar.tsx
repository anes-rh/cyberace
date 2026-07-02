import { seedGradient, initials, cn } from "@/lib/utils";

export function Avatar({
  seed,
  name,
  size = 40,
  className,
}: {
  seed: string;
  name: string;
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center rounded-full font-display font-bold text-void ring-1 ring-white/10",
        className
      )}
      style={{
        width: size,
        height: size,
        background: seedGradient(seed),
        fontSize: size * 0.4,
      }}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}
