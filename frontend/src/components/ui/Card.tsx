import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("glass rounded-2xl p-6 transition-colors", className)}
      {...props}
    />
  )
);
Card.displayName = "Card";

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("font-display text-lg font-semibold text-fg", className)} {...props} />;
}

export function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-muted leading-relaxed", className)} {...props} />;
}
