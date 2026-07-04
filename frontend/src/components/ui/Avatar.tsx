import { seedGradient, initials, cn } from "@/lib/utils";

export function Avatar({
  seed,
  name,
  url,
  size = 40,
  className,
}: {
  seed: string;
  name: string;
  /** Uploaded profile picture; when present it replaces the initials avatar. */
  url?: string | null;
  size?: number;
  className?: string;
}) {
  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt={name}
        width={size}
        height={size}
        className={cn("shrink-0 rounded-full object-cover ring-1 ring-white/10", className)}
        style={{ width: size, height: size }}
      />
    );
  }
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
