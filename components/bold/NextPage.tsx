"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { PAGES } from "./pages";

/** The end of every page points at the next one, so visitors know there is more to see. */
export default function NextPage() {
  const path = usePathname();
  const i = Math.max(0, PAGES.findIndex((p) => (p.href === "/" ? path === "/" : path.startsWith(p.href))));
  const next = PAGES[(i + 1) % PAGES.length];
  return (
    <section className="nextpage" aria-label="Next page">
      <div className="wrap">
        <Link href={next.href} className="nextpage__link" data-cursor="Go">
          <span className="nextpage__label">
            Next page
            <span className="nextpage__dots" aria-hidden>
              {PAGES.map((p, j) => (
                <i key={p.href} className={j === i ? "is-here" : j === (i + 1) % PAGES.length ? "is-next" : ""} />
              ))}
            </span>
          </span>
          <span className="nextpage__title display">
            {next.label}
            <motion.span className="nextpage__arrow" aria-hidden initial={{ x: 0 }} whileHover={{ x: 12 }}>
              <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </motion.span>
          </span>
          <span className="nextpage__blurb">{next.blurb}</span>
        </Link>
      </div>
    </section>
  );
}
