import { cn, DIFFICULTY, type DifficultyKey } from "@/lib/utils";

export function DifficultyBadge({
  difficulty,
  className,
}: {
  difficulty: DifficultyKey;
  className?: string;
}) {
  const meta = DIFFICULTY[difficulty];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-display font-medium ring-1",
        className
      )}
      style={{
        color: meta.color,
        backgroundColor: `${meta.color}1a`,
        boxShadow: `inset 0 0 0 1px ${meta.color}55`,
      }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: meta.color }} />
      {meta.label}
    </span>
  );
}
