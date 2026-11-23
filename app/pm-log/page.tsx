import type { Metadata } from "next";
import { pmSeries, reels } from "@/data/site";
import { Counter, LineReveal, Rise, Stagger } from "@/components/bold/Motion";
import ReelFrame from "@/components/ReelFrame";

export const metadata: Metadata = { title: "PM log" };

export default function PmLogPage() {
  const latestDay = Math.max(...pmSeries.map((d) => d.day));
  return (
    <>
      <section className="page-hero sec--ink">
        <div className="wrap">
          <LineReveal className="display page-hero__title" delay={0.3} lines={["60 days of", <span key="p" className="t-tangerine">product.</span>]} />
          <Rise delay={0.7} y={20}>
            <p className="page-hero__lede">
              I&apos;m learning product management in public on Instagram, one lesson a day, and editing every reel myself.
            </p>
          </Rise>
          <Rise delay={0.85} y={20} className="bigmeter">
            <p className="bigmeter__n display">
              <Counter to={latestDay} />
              <span>/60</span>
            </p>
            <div className="bigmeter__bar" role="img" aria-label={`Day ${latestDay} of 60`}>
              {Array.from({ length: 60 }).map((_, i) => (
                <span key={i} className={i < latestDay ? "is-on" : undefined} style={{ animationDelay: `${0.9 + i * 0.015}s` }} />
              ))}
            </div>
          </Rise>
        </div>
      </section>

      <section className="sec sec--paper sec--tight">
        <div className="wrap">
          <Stagger className="lessons" gap={0.04}>
            {pmSeries.map((d) => (
              <a key={d.day} href={d.url} target="_blank" rel="noreferrer" className="lesson">
                <span className="lesson__day display">Day {d.day}</span>
                <span className="lesson__text">{d.lesson}</span>
                <span className="lesson__go">Watch</span>
              </a>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="sec sec--ink">
        <div className="wrap">
          <div className="sec__head">
            <LineReveal as="h2" className="display sec__title" lines={[<span key="m">Cut by <span className="t-tangerine">me.</span></span>]} onView />
            <Rise className="sec__aside">
              <p>Pacing, captions, cuts and on-screen type. A few reels I&apos;m proud of.</p>
            </Rise>
          </div>
          <Stagger className="reels">
            {reels.map((r) => (
              <ReelFrame key={r.url} {...r} />
            ))}
          </Stagger>
        </div>
      </section>
    </>
  );
}
