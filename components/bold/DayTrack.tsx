"use client";

import { AnimatePresence, motion, useInView } from "framer-motion";
import { useMemo, useRef, useState } from "react";
import { pmSeries } from "@/data/site";

const TOTAL = 60;
const fmt = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, "")}K` : String(n));

/**
 * The 60-day series as one compact track: a tile per day. Posted days glow
 * tangerine (brighter = more watched) and open the reel; the days still to come
 * wait as outlines. Hovering or focusing a tile shows that day's lesson below.
 */
export default function DayTrack() {
  const days = useMemo(() => [...pmSeries].sort((a, b) => a.day - b.day), []);
  const byDay = useMemo(() => new Map(days.map((d) => [d.day, d])), [days]);
  const latest = days[days.length - 1];
  const [min, max] = useMemo(() => {
    const v = days.map((d) => d.views);
    return [Math.min(...v), Math.max(...v)];
  }, [days]);
  const [active, setActive] = useState(latest.day);
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { once: true, amount: 0.3 });
  const cur = byDay.get(active) ?? latest;
  const top = days.reduce((a, b) => (b.views > a.views ? b : a));

  return (
    <div ref={ref} className="track">
      <ol className="track__grid" aria-label={`60 days of PM: ${latest.day} posted`} onMouseLeave={() => setActive(latest.day)}>
        {Array.from({ length: TOTAL }, (_, i) => {
          const n = i + 1;
          const d = byDay.get(n);
          const delay = seen ? i * 0.012 : 0;
          if (!d) {
            return (
              <motion.li
                key={n}
                className="track__tile is-future"
                initial={{ opacity: 0, scale: 0.6 }}
                animate={seen ? { opacity: 1, scale: 1 } : undefined}
                transition={{ delay, duration: 0.4 }}
                aria-label={`Day ${n}, coming up`}
              >
                <span>{n}</span>
              </motion.li>
            );
          }
          const heat = (d.views - min) / Math.max(1, max - min);
          return (
            <motion.li
              key={n}
              initial={{ opacity: 0, scale: 0.6, y: 10 }}
              animate={seen ? { opacity: 1, scale: 1, y: 0 } : undefined}
              transition={{ delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <a
                className={`track__tile is-on${n === active ? " is-active" : ""}${n === latest.day ? " is-today" : ""}`}
                style={{ ["--heat" as string]: heat.toFixed(2) }}
                href={d.url}
                target="_blank"
                rel="noreferrer"
                aria-label={`Day ${n}: ${d.lesson} (${d.views} views). Opens the reel on Instagram.`}
                onMouseEnter={() => setActive(n)}
                onFocus={() => setActive(n)}
              >
                <span>{n}</span>
              </a>
            </motion.li>
          );
        })}
      </ol>

      <div className="track__foot">
        <div className="track__detail" aria-live="polite">
          <AnimatePresence mode="wait">
            <motion.a
              key={cur.day}
              className="track__card"
              href={cur.url}
              target="_blank"
              rel="noreferrer"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <span className="track__day display">Day {cur.day}</span>
              <span className="track__lesson">{cur.lesson}</span>
              <span className="track__meta">
                {fmt(cur.views)} views
                {cur.day === top.day ? " · most watched" : cur.day === latest.day ? " · latest" : ""}
                <span className="track__go">Watch the reel →</span>
              </span>
            </motion.a>
          </AnimatePresence>
        </div>
        <div className="track__legend" aria-hidden>
          <span>Fewer views</span>
          {[0, 0.33, 0.66, 1].map((h) => (
            <i key={h} style={{ ["--heat" as string]: h }} />
          ))}
          <span>More</span>
          <i className="is-future-key" />
          <span>Still to come</span>
        </div>
      </div>
    </div>
  );
}
