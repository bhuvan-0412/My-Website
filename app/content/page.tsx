import type { Metadata } from "next";
import { pmSeries, reels } from "@/data/site";
import { Counter, LineReveal, Rise, Stagger } from "@/components/bold/Motion";
import ReelFrame from "@/components/ReelFrame";
import Journey from "@/components/bold/Journey";

export const metadata: Metadata = { title: "Content" };

export default function ContentPage() {
  const latestDay = Math.max(...pmSeries.map((d) => d.day));
  return (
    <>
      <section className="page-hero sec--ink" data-shape="play">
        <div className="wrap">
          <LineReveal className="display page-hero__title" delay={0.3} lines={["Learning in", <span key="p" className="t-tangerine">public.</span>]} />
          <Rise delay={0.7} y={20}>
            <p className="page-hero__lede">
              A 60-day series on Instagram where I teach myself product management, one lesson per reel, and edit every
              reel myself. 25+ posts so far, followed by 200+ people.
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

      <section className="sec sec--paper" data-shape="pin">
        <div className="wrap">
          <div className="sec__head">
            <LineReveal as="h2" className="display sec__title" lines={[<span key="j">The <span className="t-tangerine">journey.</span></span>]} onView />
            <Rise className="sec__aside">
              <p>How the channel started, and where it is now.</p>
            </Rise>
          </div>
          <Journey />
        </div>
      </section>

      <section className="sec sec--ink" data-shape="bulb">
        <div className="wrap">
          <div className="sec__head">
            <LineReveal as="h2" className="display sec__title" lines={[<span key="l">The <span className="t-tangerine">lessons.</span></span>]} onView />
            <Rise className="sec__aside">
              <p>Every day&apos;s lesson, in my own captions. Each one opens the reel.</p>
            </Rise>
          </div>
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

      <section className="sec sec--tangerine reels-sec" data-shape="scissors">
        <div className="wrap reels-layout">
          <div className="reels-intro">
            <LineReveal as="h2" className="display sec__title" lines={["Cut by", <span key="m" className="t-tangerine">me.</span>]} onView />
            <Rise className="sec__aside">
              <p>I edit every reel myself. Start with the one about me, then a few I&apos;m proud of.</p>
              <ul className="edit-skills">
                {["Hooks", "Pacing", "Cuts", "Captions", "On-screen type", "Storytelling"].map((k) => (
                  <li key={k}>{k}</li>
                ))}
              </ul>
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
