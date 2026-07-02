import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "w-full rounded-lg border border-line bg-surface/70 px-4 py-3 text-fg placeholder:text-faint",
        "focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

export function Field({
  label,
  htmlFor,
  children,
  hint,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-sm font-medium text-muted">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-faint">{hint}</p>}
    </div>
  );
}
