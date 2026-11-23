import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import FadeIn from "@/components/FadeIn";
import Flow from "@/components/Flow";
import ReelFrame from "@/components/ReelFrame";
import { site, about, skills, projects, experience, achievements, pmSeries, reels } from "@/data/site";

const Arrow = () => (
  <svg className="arrow" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M7 17L17 7M9 7h8v8" />
  </svg>
);

export default function Home() {
  const latestDay = Math.max(...pmSeries.map((d) => d.day));

  return (
    <>
      <Nav />
      <main id="top">
        <Hero />

        {/* ── Work ─────────────────────────────── */}
        <section id="work" className="section">
          <div className="container">
            <FadeIn className="section__head">
              <h2>What&apos;s on the board</h2>
              <p className="section__lede">
                Eight things I&apos;ve built, each drawn the way its signal actually flows: from what goes in
                to what comes out.
              </p>
            </FadeIn>

            <div className="projects">
              {projects.map((p) => (
                <article key={p.id} id={`p-${p.id}`} className="project">
                  <FadeIn className="project__grid">
                    <div className="project__info">
                      <p className="project__ref">{p.ref}</p>
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

        {/* ── Datasheet ────────────────────────── */}
        <section id="datasheet" className="section section--sheet">
          <div className="container">
            <FadeIn className="sheet">
              <div className="sheet__intro">
                <h2>Datasheet</h2>
                {about.paragraphs.map((t) => (
                  <p key={t}>{t}</p>
                ))}
              </div>
              <dl className="ratings">
                {about.ratings.map((r) => (
                  <div key={r.key} className="ratings__row">
                    <dt>{r.key}</dt>
                    <dd>{r.value}</dd>
                  </div>
                ))}
              </dl>
            </FadeIn>

            <FadeIn className="pins" delay={0.1}>
              <h3>Pin assignments</h3>
              <table className="pins__table">
                <caption className="sr-only">Skills by area</caption>
                <tbody>
                  {skills.map((s, i) => (
                    <tr key={s.group}>
                      <th scope="row">
                        <span className="pins__no">{String(i + 1).padStart(2, "0")}</span>
                        {s.group}
                      </th>
                      <td>
                        <ul>
                          {s.items.map((it) => (
                            <li key={it}>{it}</li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </FadeIn>
          </div>
        </section>

        {/* ── Experience ───────────────────────── */}
        <section id="experience" className="section">
          <div className="container">
            <FadeIn className="section__head">
              <h2>Revision history</h2>
              <p className="section__lede">Where I&apos;ve worked, newest revision first.</p>
            </FadeIn>
            <ol className="revs">
              {experience.map((e) => (
                <li key={e.org} className="rev">
                  <FadeIn className="rev__grid">
                    <span className="rev__tag" aria-label={`Revision ${e.rev}`}>
                      {e.rev}
                    </span>
                    <div className="rev__meta">
                      <p>{e.period}</p>
                      <p>{e.place}</p>
                    </div>
                    <div className="rev__body">
                      <h3>
                        {e.title} <span className="rev__org">· {e.org}</span>
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
            <FadeIn className="also">
              <h3>Also on record</h3>
              <ul>
                {achievements.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            </FadeIn>
          </div>
        </section>

        {/* ── PM log ───────────────────────────── */}
        <section id="pm-log" className="section section--log">
          <div className="container">
            <FadeIn className="section__head">
              <h2>60 days of product management</h2>
              <p className="section__lede">
                I&apos;m learning PM in public on Instagram, one lesson a day. This is the log so far, in my own
                captions.
              </p>
              <div className="meter" role="img" aria-label={`Day ${latestDay} of 60`}>
                {Array.from({ length: 60 }).map((_, i) => (
                  <span key={i} className={i < latestDay ? "meter__on" : undefined} />
                ))}
                <p className="meter__label">
                  Day <strong>{latestDay}</strong> of 60
                </p>
              </div>
            </FadeIn>
          </div>
          <FadeIn>
            <ul className="days" aria-label="Daily lessons">
              {pmSeries.map((d) => (
                <li key={d.day}>
                  <a href={d.url} target="_blank" rel="noreferrer" className="day">
                    <span className="day__no">{d.day}</span>
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

        {/* ── Reels ────────────────────────────── */}
        <section id="reels" className="section section--reels">
          <div className="container">
            <FadeIn className="section__head">
              <h2>Video editing</h2>
              <p className="section__lede">
                I edit my own reels: pacing, captions, cuts and on-screen type. A few I&apos;m proud of.
              </p>
            </FadeIn>
            <FadeIn className="reels">
              {reels.map((r) => (
                <ReelFrame key={r.url} {...r} />
              ))}
            </FadeIn>
          </div>
        </section>

        {/* ── Contact ──────────────────────────── */}
        <section id="contact" className="section section--contact">
          <div className="container">
            <FadeIn>
              <h2 className="contact__title">Let&apos;s talk about your team&apos;s next internship.</h2>
              <a href={`mailto:${site.email}`} className="contact__mail">
                {site.email}
              </a>
              <ul className="connector" aria-label="Elsewhere">
                {site.socials.map((s) => (
                  <li key={s.label}>
                    <a href={s.url} target="_blank" rel="noreferrer">
                      <span className="connector__pin" aria-hidden />
                      <span className="connector__label">{s.label}</span>
                      <span className="connector__handle">{s.handle}</span>
                    </a>
                  </li>
                ))}
                <li>
                  <a href={site.resumeUrl} target="_blank" rel="noreferrer">
                    <span className="connector__pin" aria-hidden />
                    <span className="connector__label">Resume</span>
                    <span className="connector__handle">PDF, 1 page</span>
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
