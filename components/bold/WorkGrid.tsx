"use client";

import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { projects, projectMeta, type Kind } from "@/data/site";
import { Tilt, Wipe } from "./Media";

const FILTERS: ("All" | Kind)[] = ["All", "AI", "Product", "Web", "Hackathon"];
const ease = [0.16, 1, 0.3, 1] as const;

export default function WorkGrid() {
  const [f, setF] = useState<"All" | Kind>("All");
  const shown = projects.filter((p) => f === "All" || projectMeta[p.id]?.kinds.includes(f));

  return (
    <LayoutGroup>
      <div className="filters" role="group" aria-label="Filter projects">
        {FILTERS.map((k) => {
          const n = k === "All" ? projects.length : projects.filter((p) => projectMeta[p.id]?.kinds.includes(k)).length;
          return (
            <button key={k} className={`chip ${f === k ? "is-on" : ""}`} onClick={() => setF(k)} aria-pressed={f === k}>
              {f === k && <motion.span layoutId="chip-bg" className="chip__bg" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
              <span className="chip__label">
                {k} <sup>{n}</sup>
              </span>
            </button>
          );
        })}
      </div>

      <motion.div layout className="work">
        <AnimatePresence mode="popLayout">
          {shown.map((p, i) => {
            const meta = projectMeta[p.id];
            return (
              <motion.article
                layout
                key={p.id}
                className="work__item"
                initial={{ opacity: 0, y: 40, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.25 } }}
                transition={{ duration: 0.7, ease, delay: i * 0.04 }}
              >
                <Tilt className="work__card">
                {meta?.image ? (
                  <Wipe className="work__img">
                    <Image src={meta.image} alt={`${p.title} home page`} width={1280} height={800} sizes="(max-width: 720px) 100vw, 50vw" />
                  </Wipe>
                ) : (
                <div className="work__img work__img--flow">
                  {(
                    <ol className="mini-flow" aria-label="How it works">
                      {p.flow.map((s) => (
                        <li key={s}>{s}</li>
                      ))}
                    </ol>
                  )}
                </div>
                )}
                <div className="work__body">
                  <div className="work__head">
                    <h2 className="display">{p.title}</h2>
                    {meta && <span className={`tag ${meta.status === "Live" ? "tag--mint" : "tag--tangerine"}`}>{meta.status}</span>}
                  </div>
                  {p.badge && <p className="work__badge">{p.badge}</p>}
                  <p className="work__desc">{p.description}</p>
                  <ul className="work__tech">
                    {p.tech.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                  <div className="work__links">
                    {p.links.map((l) => (
                      <a key={l.url} href={l.url} target="_blank" rel="noreferrer" className="pill pill--ink pill--sm">
                        {l.label}
                        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                          <path d="M7 17L17 7M9 7h8v8" />
                        </svg>
                      </a>
                    ))}
                  </div>
                </div>
                </Tilt>
              </motion.article>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </LayoutGroup>
  );
}
