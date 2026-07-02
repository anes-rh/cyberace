"use client";

import { useRef, ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * Reveals its children on scroll into view. Respects reduced-motion
 * (gsap.from is skipped and content is shown immediately).
 */
export default function Reveal({
  children,
  y = 28,
  delay = 0,
  className,
}: {
  children: ReactNode;
  y?: number;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) return;
      gsap.from(ref.current, {
        opacity: 0,
        y,
        duration: 0.7,
        delay,
        ease: "power3.out",
        scrollTrigger: { trigger: ref.current, start: "top 88%" },
      });
    },
    { scope: ref }
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
