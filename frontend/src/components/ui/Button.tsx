"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-display font-medium tracking-wide rounded-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 disabled:opacity-50 disabled:pointer-events-none select-none active:scale-[0.97]",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-void hover:shadow-[0_0_24px_-4px_var(--color-primary)] hover:brightness-110",
        secondary:
          "bg-secondary text-white hover:shadow-[0_0_24px_-4px_var(--color-secondary)] hover:brightness-110",
        outline:
          "border border-primary/50 text-primary hover:bg-primary/10 hover:border-primary",
        ghost: "text-muted hover:text-fg hover:bg-surface-2",
        danger: "bg-danger text-void hover:brightness-110",
        glass: "glass text-fg hover:border-primary/50 hover:text-primary",
      },
      size: {
        sm: "h-9 px-3 text-sm",
        md: "h-11 px-5 text-sm",
        lg: "h-13 px-7 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  )
);
Button.displayName = "Button";
