import Nav from "@/components/Nav";
import Reveal from "@/components/Reveal";
import { site, about, skills, projects, experience, achievements } from "@/data/site";

function SectionTitle({ index, title }: { index: string; title: string }) {
  return (
    <Reveal>
      <h2 className="section-title">
        <span className="section-title__index">{index}.</span> {title}
      </h2>
    </Reveal>
  );
}

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 17L17 7M8 7h9v9" />
  </svg>
);

export default function Home() {
  const year = new Date().getFullYear();

  return (
    <>
      <Nav />
      <main id="top">
        {/* ── Hero ───────────────────────────────── */}
        <section className="hero">
          <div className="hero__glow" aria-hidden />
          <div className="container">
            <p className="hero__hello mono fade-up" style={{ animationDelay: "0ms" }}>
              Hi, my name is
            </p>
            <h1 className="hero__name fade-up" style={{ animationDelay: "100ms" }}>
              {site.name}
              <span className="accent">.</span>
            </h1>
            <h2 className="hero__role fade-up" style={{ animationDelay: "200ms" }}>
              {site.role}
            </h2>
            <p className="hero__tagline fade-up" style={{ animationDelay: "300ms" }}>
              {site.tagline}
            </p>
            <div className="hero__cta fade-up" style={{ animationDelay: "400ms" }}>
              <a href="#projects" className="btn btn--primary">
                View my work
              </a>
              <a href={site.resumeUrl} className="btn" target="_blank" rel="noreferrer">
                Download resume
              </a>
            </div>
          </div>
          <a href="#about" className="hero__scroll" aria-label="Scroll to About">
            <span />
          </a>
        </section>

        {/* ── About ──────────────────────────────── */}
        <section id="about" className="section">
          <div className="container">
            <SectionTitle index="01" title="About me" />
            <div className="about">
              <Reveal className="about__text">
                {about.paragraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </Reveal>
              <Reveal delay={120} className="about__edu">
                {about.education.map((e) => (
                  <div key={e.school} className="card edu-card">
                    <p className="mono muted small">{e.period}</p>
                    <h3>{e.school}</h3>
                    <p>{e.degree}</p>
                    <p className="muted small">{e.detail}</p>
                  </div>
                ))}
              </Reveal>
            </div>
          </div>
        </section>

        {/* ── Skills ─────────────────────────────── */}
        <section id="skills" className="section">
          <div className="container">
            <SectionTitle index="02" title="Skills" />
            <div className="skills">
              {skills.map((s, i) => (
                <Reveal key={s.group} delay={i * 80} className="card skill-card">
                  <h3>{s.group}</h3>
                  <ul className="tags">
                    {s.items.map((it) => (
                      <li key={it}>{it}</li>
                    ))}
                  </ul>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── Projects ───────────────────────────── */}
        <section id="projects" className="section">
          <div className="container">
            <SectionTitle index="03" title="Projects" />
            <div className="projects">
              {projects.map((p, i) => (
                <Reveal key={p.title} as="article" delay={i * 80} className="card project-card">
                  <div className="project-card__top">
                    <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" className="accent">
                      <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    </svg>
                    <div className="project-card__links">
                      {p.links.map((l) => (
                        <a key={l.url} href={l.url} target="_blank" rel="noreferrer" aria-label={`${p.title}: ${l.label}`}>
                          {l.label} <ArrowIcon />
                        </a>
                      ))}
                    </div>
                  </div>
                  <h3>{p.title}</h3>
                  {p.badge && <p className="project-card__badge mono">{p.badge}</p>}
                  <p className="muted">{p.description}</p>
                  <ul className="tags tags--plain">
                    {p.tech.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── Experience & Achievements ──────────── */}
        <section id="experience" className="section">
          <div className="container">
            <SectionTitle index="04" title="Experience & Achievements" />
            <div className="exp-grid">
              <ol className="timeline">
                {experience.map((e, i) => (
                  <Reveal key={e.title + e.org} as="li" delay={i * 100} className="timeline__item">
                    <p className="mono muted small">{e.period}</p>
                    <h3>
                      {e.title} <span className="accent">@ {e.org}</span>
                    </h3>
                    <ul className="bullets">
                      {e.points.map((pt) => (
                        <li key={pt}>{pt}</li>
                      ))}
                    </ul>
                  </Reveal>
                ))}
              </ol>
              <Reveal delay={150} className="card achievements">
                <h3>Achievements</h3>
                <ul className="bullets">
                  {achievements.map((a) => (
                    <li key={a}>{a}</li>
                  ))}
                </ul>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ── Contact ────────────────────────────── */}
        <section id="contact" className="section contact">
          <div className="container">
            <Reveal>
              <p className="mono accent">05. What&apos;s next?</p>
              <h2 className="contact__title">Get in touch</h2>
              <p className="muted contact__text">
                I&apos;m open to AI engineering and APM internships, collaborations and interesting
                projects. Whether you have a question or just want to say hi, my inbox is open.
              </p>
              <a href={`mailto:${site.email}`} className="btn btn--primary btn--lg">
                Say hello
              </a>
              <ul className="socials">
                {site.socials.map((s) => (
                  <li key={s.label}>
                    <a href={s.url} target="_blank" rel="noreferrer">
                      {s.label} <ArrowIcon />
                    </a>
                  </li>
                ))}
                <li>
                  <a href={site.resumeUrl} target="_blank" rel="noreferrer">
                    Resume <ArrowIcon />
                  </a>
                </li>
              </ul>
            </Reveal>
          </div>
        </section>
      </main>
      <footer className="footer">
        <div className="container">
          <p className="mono small muted">
            © {year} {site.name} · Built with Next.js
          </p>
        </div>
      </footer>
    </>
  );
}
