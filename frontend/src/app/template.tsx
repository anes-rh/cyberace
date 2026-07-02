"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

/**
 * Subtle global page transition — a soft fade/rise on every route change.
 * Keyed on pathname so it replays per navigation.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
