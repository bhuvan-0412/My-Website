import type { Metadata } from "next";
import { about, achievements, experience, site, skills } from "@/data/site";
import { CircleSection, LineReveal, Rise, ScrollWords, Stagger } from "@/components/bold/Motion";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <>
      <section className="page-hero sec--ink">
        <div className="wrap">
          <LineReveal className="display page-hero__title" delay={0.3} lines={["Builder", <span key="p" className="t-tangerine">with a PM brain.</span>]} />
          <Rise delay={0.7} y={20}>
            <p className="page-hero__lede">{about.paragraphs[0]}</p>
          </Rise>
        </div>
      </section>

      <CircleSection className="sec sec--paper">
        <div className="wrap">
          <ScrollWords
            className="display statement__text"
            text="I care as much about why a product should exist as about how it works, so I build it myself and then go and check."
            accent={["why", "how", "check"]}
          />
          <div className="about-grid">
            <Rise className="about-copy">
              {about.paragraphs.slice(1).map((p) => (
                <p key={p}>{p}</p>
              ))}
              <a className="pill pill--ink" href={site.resumeUrl} target="_blank" rel="noreferrer">
                Download resume (PDF)
              </a>
            </Rise>
            <Rise delay={0.1}>
              <dl className="facts">
                {about.ratings.map((r) => (
                  <div key={r.key}>
                    <dt>{r.key}</dt>
                    <dd>{r.value}</dd>
                  </div>
                ))}
              </dl>
            </Rise>
          </div>
        </div>
      </CircleSection>

      <section className="sec sec--ink">
        <div className="wrap">
          <div className="sec__head">
            <LineReveal as="h2" className="display sec__title" lines={["Timeline"]} onView />
          </div>
          <Stagger className="timeline">
            {experience.map((e) => (
              <article key={e.org} className="tl">
                <p className="tl__when">{e.period}</p>
                <div>
                  <h3 className="display">
                    {e.title} <span className="t-mint">· {e.org}</span>
                  </h3>
                  <ul>
                    {e.points.map((pt) => (
                      <li key={pt}>{pt}</li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
            <article className="tl">
              <p className="tl__when">2024 – 2029</p>
              <div>
                <h3 className="display">
                  B.E. + M.Sc. <span className="t-mint">· BITS Pilani, Goa</span>
                </h3>
                <ul>
                  <li>Electronics & Instrumentation with an M.Sc. in Mathematics. CGPA 7.32 / 10.</li>
                  <li>Dance Club: 2nd place (2026) and 3rd place (2025) in group dance.</li>
                </ul>
              </div>
            </article>
          </Stagger>
        </div>
      </section>

      <section className="sec sec--paper">
        <div className="wrap">
          <div className="sec__head">
            <LineReveal as="h2" className="display sec__title" lines={["Toolkit"]} onView />
            <Rise className="sec__aside">
              <p>What I reach for, from Python and agents to PRDs.</p>
            </Rise>
          </div>
          <Stagger className="toolkit">
            {skills.map((s) => (
              <div key={s.group} className="kit">
                <h3 className="display">{s.group}</h3>
                <ul>
                  {s.items.map((it) => (
                    <li key={it}>{it}</li>
                  ))}
                </ul>
              </div>
            ))}
          </Stagger>
          <Rise className="wins">
            <h3 className="display">Also on record</h3>
            <ul>
              {achievements.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </Rise>
        </div>
      </section>
    </>
  );
}
