"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-sans font-semibold rounded-xl transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:opacity-50 disabled:pointer-events-none select-none active:scale-[0.97]",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-to-br from-primary to-[#4f86c9] text-white shadow-[0_10px_22px_-10px_var(--color-primary)] hover:shadow-[0_16px_30px_-10px_var(--color-primary)] hover:-translate-y-0.5",
        secondary:
          "bg-gradient-to-br from-secondary to-[#6fa075] text-white shadow-[0_10px_22px_-10px_var(--color-secondary)] hover:shadow-[0_16px_30px_-10px_var(--color-secondary)] hover:-translate-y-0.5",
        outline:
          "border border-primary/45 text-primary bg-surface/40 hover:bg-primary/10 hover:border-primary",
        ghost: "text-muted hover:text-fg hover:bg-surface-2",
        danger: "bg-gradient-to-br from-danger to-[#c96a6a] text-white hover:-translate-y-0.5",
        glass: "glass text-fg hover:border-primary/45 hover:text-primary hover:-translate-y-0.5",
      },
      size: {
        sm: "h-9 px-3.5 text-sm",
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
