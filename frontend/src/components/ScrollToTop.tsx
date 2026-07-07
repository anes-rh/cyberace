"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Forces the window back to the top on every route change.
 *
 * Next.js `<Link>` keeps the current scroll position when the destination's
 * first element is judged "visible in the viewport". Our data-driven pages
 * render a short loader first, so that check often passes and the user lands
 * mid-page. Resetting on pathname change guarantees pages start at the top.
 */
export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);

  return null;
}
