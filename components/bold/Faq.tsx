"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function Faq({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="faq">
      {items.map((it, i) => {
        const on = open === i;
        return (
          <div key={it.q} className={`faq__item ${on ? "is-open" : ""}`}>
            <h3>
              <button aria-expanded={on} onClick={() => setOpen(on ? null : i)}>
                <span>{it.q}</span>
                <span className="faq__icon" aria-hidden />
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {on && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.45, ease: [0.76, 0, 0.24, 1] }}
                  style={{ overflow: "hidden" }}
                >
                  <p className="faq__a">{it.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
