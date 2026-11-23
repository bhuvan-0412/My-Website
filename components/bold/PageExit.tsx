"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

const ease = [0.76, 0, 0.24, 1] as const;

/**
 * The exit half of the page transition: clicking an internal link first slides a
 * tangerine curtain up over the page, then navigates. The new page's template
 * (app/template.tsx) wipes the curtain away again.
 */
export default function PageExit() {
  const router = useRouter();
  const path = usePathname();
  const [covering, setCovering] = useState(false);

  // The new page has arrived: drop the exit curtain (the template's curtain takes over).
  useEffect(() => setCovering(false), [path]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Capture phase: runs before Next's <Link> handler, which would navigate immediately.
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement | null)?.closest("a");
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.pathname === location.pathname) return;
      e.preventDefault();
      e.stopPropagation();
      setCovering(true);
      window.setTimeout(() => router.push(url.pathname + url.search + url.hash), 620);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [router]);

  return (
    <AnimatePresence>
      {covering && (
        <motion.div
          className="curtain curtain--exit"
          aria-hidden
          initial={{ clipPath: "inset(100% 0 0 0)" }}
          animate={{ clipPath: "inset(0% 0 0 0)" }}
          exit={{ opacity: 0, transition: { duration: 0.01, delay: 0.2 } }}
          transition={{ duration: 0.6, ease }}
        >
          <motion.span
            className="curtain__mark"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease, delay: 0.2 }}
          >
            Bhuvan Thota
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
