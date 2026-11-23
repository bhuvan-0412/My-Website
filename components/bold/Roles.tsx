"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { roles } from "@/data/site";

const ease = [0.76, 0, 0.24, 1] as const;

/** Experience as dropdowns: one line each, opening into everything from the resume. */
export default function Roles() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="roles">
      {roles.map((r, i) => {
        const on = open === i;
        return (
          <article key={r.org} className={`role ${on ? "is-open" : ""}`}>
            <h3>
              <button className="role__head" aria-expanded={on} onClick={() => setOpen(on ? null : i)}>
                <span className="role__org display">{r.org}</span>
                <span className="role__meta">
                  <span className="role__title">{r.title}</span>
                  <span className="role__when">
                    {r.period} · {r.place}
                  </span>
                </span>
                <span className="role__summary">{r.summary}</span>
                <span className="role__icon" aria-hidden />
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {on && (
                <motion.div
                  className="role__body"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.55, ease }}
                >
                  <div className="role__grid">
                    <ul className="role__points">
                      {r.points.map((p) => (
                        <li key={p}>{p}</li>
                      ))}
                    </ul>
                    <div className="role__side">
                      {r.built && (
                        <>
                          <p className="role__label">{r.org.startsWith("@") ? "Find it" : "Built there"}</p>
                          <div className="role__links">
                            {r.built.map((b) => (
                              <a key={b.url} href={b.url} target="_blank" rel="noreferrer" className="pill pill--ghost-light pill--sm">
                                {b.name}
                              </a>
                            ))}
                          </div>
                        </>
                      )}
                      <p className="role__label">Tools and skills</p>
                      <ul className="role__tools">
                        {r.tools.map((t) => (
                          <li key={t}>{t}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </article>
        );
      })}
    </div>
  );
}
