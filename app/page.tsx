import Nav from "@/components/Nav";
import SmoothScroll from "@/components/SmoothScroll";
import RoadHero from "@/components/road/RoadHero";
import FadeIn from "@/components/FadeIn";
import Flow from "@/components/Flow";
import ReelFrame from "@/components/ReelFrame";
import { site, about, skills, projects, experience, achievements, pmSeries, reels } from "@/data/site";
import { STOPS } from "@/lib/stops";

const Arrow = () => (
  <svg className="arrow" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M7 17L17 7M9 7h8v8" />
  </svg>
);

/** Section heading with the stop's road-sign marker. */
function StopHead({ i, title, lede }: { i: number; title: string; lede?: string }) {
  const s = STOPS[i];
  return (
    <FadeIn className="shead">
      <h2 style={{ ["--stop" as string]: s.color, ["--stop-ink" as string]: s.ink }}>
        <span className="shead__sign">{s.name}</span>
        {title}
      </h2>
      {lede && <p className="shead__lede">{lede}</p>}
    </FadeIn>
  );
}

export default function Home() {
  const latestDay = Math.max(...pmSeries.map((d) => d.day));

  return (
    <>
      <SmoothScroll />
      <Nav />
      <main id="top">
        <RoadHero />

        {/* ── Discover ─────────────────────────── */}
        <section id="about" className="section">
          <div className="container">
            <StopHead i={0} title="Who's driving" />
            <FadeIn className="about">
              <div className="about__text">
                {about.paragraphs.map((t) => (
                  <p key={t}>{t}</p>
                ))}
              </div>
              <dl className="facts">
                {about.ratings.map((r) => (
                  <div key={r.key} className="facts__row">
                    <dt>{r.key}</dt>
                    <dd>{r.value}</dd>
                  </div>
                ))}
              </dl>
            </FadeIn>
          </div>
        </section>

        {/* ── Define ───────────────────────────── */}
        <section id="define" className="section section--tint">
          <div className="container">
            <StopHead i={1} title="How I think" lede="The toolkit I bring, and the product habit I'm building one day at a time." />
            <FadeIn className="skills">
              {skills.map((s) => (
                <div key={s.group} className="skills__row">
                  <h3>{s.group}</h3>
                  <ul>
                    {s.items.map((it) => (
                      <li key={it}>{it}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </FadeIn>

            <FadeIn className="log">
              <div className="log__head">
                <h3>60 days of product management</h3>
                <p>
                  I&apos;m learning PM in public on Instagram. Day <strong>{latestDay}</strong> of 60 so far, in my
                  own captions.
                </p>
                <div className="meter" role="img" aria-label={`Day ${latestDay} of 60`}>
                  {Array.from({ length: 60 }).map((_, i) => (
                    <span key={i} className={i < latestDay ? "is-on" : undefined} />
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>
          <FadeIn>
            <ul className="days" aria-label="Daily lessons">
              {pmSeries.map((d) => (
                <li key={d.day}>
                  <a href={d.url} target="_blank" rel="noreferrer" className="day">
                    <span className="day__no">
                      Day <strong>{d.day}</strong>
                    </span>
                    <span className="day__lesson">{d.lesson}</span>
                    <span className="day__watch">
                      Watch the reel <Arrow />
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </FadeIn>
        </section>

        {/* ── Build ────────────────────────────── */}
        <section id="build" className="section">
          <div className="container">
            <StopHead
              i={2}
              title="What I've built"
              lede="Eight products, from AI pipelines to learning platforms. Each one is drawn as the path its data takes."
            />
            <div className="projects">
              {projects.map((p) => (
                <article key={p.id} id={`p-${p.id}`} className="project">
                  <FadeIn className="project__grid">
                    <div>
                      <h3 className="project__title">{p.title}</h3>
                      {p.badge && <p className="project__badge">{p.badge}</p>}
                      <p className="project__desc">{p.description}</p>
                      <ul className="project__tech" aria-label="Built with">
                        {p.tech.map((t) => (
                          <li key={t}>{t}</li>
                        ))}
                      </ul>
                      <div className="project__links">
                        {p.links.map((l) => (
                          <a key={l.url} href={l.url} target="_blank" rel="noreferrer" className="link">
                            {l.label} <Arrow />
                          </a>
                        ))}
                      </div>
                    </div>
                    <Flow steps={p.flow} />
                  </FadeIn>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── Launch ───────────────────────────── */}
        <section id="launch" className="section section--tint">
          <div className="container">
            <StopHead i={3} title="Where I've shipped" />
            <ol className="jobs">
              {experience.map((e) => (
                <li key={e.org}>
                  <FadeIn className="job">
                    <div className="job__meta">
                      <p className="job__period">{e.period}</p>
                      <p>{e.place}</p>
                    </div>
                    <div>
                      <h3>
                        {e.title} <span className="job__org">· {e.org}</span>
                      </h3>
                      <ul>
                        {e.points.map((pt) => (
                          <li key={pt}>{pt}</li>
                        ))}
                      </ul>
                    </div>
                  </FadeIn>
                </li>
              ))}
            </ol>
            <FadeIn className="wins">
              <h3>Also on record</h3>
              <ul>
                {achievements.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            </FadeIn>
          </div>
        </section>

        {/* ── Measure ──────────────────────────── */}
        <section id="measure" className="section section--dark">
          <div className="container">
            <StopHead
              i={4}
              title="Results and reach"
              lede="I edit my own reels: pacing, captions, cuts and on-screen type. A few I'm proud of."
            />
            <FadeIn className="reels">
              {reels.map((r) => (
                <ReelFrame key={r.url} {...r} />
              ))}
            </FadeIn>
          </div>
        </section>

        <section id="contact" className="section contact">
          <div className="container">
            <FadeIn>
              <h2 className="contact__title">Next stop: your team.</h2>
              <p className="contact__lede">
                I&apos;m looking for internships in product management, Python, AI engineering and software
                development. The fastest way to reach me is email.
              </p>
              <a href={`mailto:${site.email}`} className="contact__mail">
                {site.email}
              </a>
              <ul className="contact__links">
                {site.socials.map((s) => (
                  <li key={s.label}>
                    <a href={s.url} target="_blank" rel="noreferrer" className="link">
                      {s.label} <Arrow />
                    </a>
                  </li>
                ))}
                <li>
                  <a href={site.resumeUrl} target="_blank" rel="noreferrer" className="link">
                    Resume (PDF) <Arrow />
                  </a>
                </li>
              </ul>
            </FadeIn>
          </div>
        </section>
      </main>
      <footer className="footer">
        <div className="container footer__inner">
          <p>© {new Date().getFullYear()} {site.name}</p>
          <p>Built with Next.js, Three.js and Framer Motion.</p>
        </div>
      </footer>
    </>
  );
}
