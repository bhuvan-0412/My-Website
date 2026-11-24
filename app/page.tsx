import Link from "next/link";
import Image from "next/image";
import { site, areas, faqs, projects, projectMeta, stats, pmSeries } from "@/data/site";
import { Chroma, CircleSection, Counter, LineReveal, Rise, RoadmapZone, ScrollBadge, ScrollWords, Stagger, Ticker } from "@/components/bold/Motion";
import Faq from "@/components/bold/Faq";
import Roles from "@/components/bold/Roles";
import Journey from "@/components/bold/Journey";
import { Wipe } from "@/components/bold/Media";

const Arrow = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

const STEPS = [
  { name: "Discover", text: "Talk to users and read the data before deciding anything." },
  { name: "Define", text: "Write the PRD: who it's for, what problem, why now." },
  { name: "Build", text: "Ship it myself: agents, RAG, Next.js, Supabase." },
  { name: "Launch", text: "Put it in front of real people, fast." },
  { name: "Measure", text: "Check whether it moved anything, then iterate." },
];

export default function Home() {
  const featured = ["viralspy", "prodpath", "resovault", "quicksewa"].map((id) => projects.find((p) => p.id === id)!);
  const latestDay = Math.max(...pmSeries.map((d) => d.day));

  return (
    <>
      {/* ── Hero ─────────────────────────────── */}
      <section className="hero sec--ink" data-shape="bulb">
        <div className="wrap">
          <Chroma>
            <LineReveal
              className="display hero__title"
              delay={0.35}
              lines={[
                <span key="a">
                  Find <span className="t-mint">the problem.</span>
                </span>,
                "Build the solution.",
                <span key="x" className="t-tangerine">
                  Ship it.
                </span>,
              ]}
            />
          </Chroma>
          <div className="hero__foot">
            <Rise delay={0.9} y={20}>
              <p className="hero__lede">
                {site.name}. Dual-degree student at BITS Pilani, Goa, building AI products end to end and learning
                product management in public. Open to product, AI and software internships.
              </p>
            </Rise>
            <Rise delay={1.05} y={20} className="hero__btns">
              <a className="pill pill--tangerine pill--lg" href={`mailto:${site.email}`}>
                Hire me
              </a>
              <Link className="pill pill--ghost-light pill--lg" href="/work">
                See the work
              </Link>
            </Rise>
          </div>
        </div>
        <ScrollBadge href="#statement" />
      </section>

      <div className="ticker-wrap">
        <Ticker items={stats} tone="tangerine" />
      </div>

      {/* ── Statement on paper, opened by a circle ─ */}
      <CircleSection id="statement" className="sec sec--paper statement" shape="question">
        <div className="wrap">
          <Chroma>
            <ScrollWords
              className="display statement__text"
              text="I find out what people actually need, decide what’s worth building, and then ship it."
              accent={["need", "ship"]}
            />
          </Chroma>
        </div>
      </CircleSection>

      {/* ── How I work: the artifacts line up into a roadmap ─ */}
      <RoadmapZone className="sec sec--ink roadmap" shape="rocket">
        <div className="wrap">
          <div className="sec__head">
            <LineReveal as="h2" className="display sec__title" lines={["Idea to", <span key="s" className="t-tangerine">shipped.</span>]} onView />
            <Rise className="sec__aside">
              <p>Five steps I run on everything I make, from a weekend hack to a team of five.</p>
            </Rise>
          </div>
          <Stagger className="steps">
            {STEPS.map((s, i) => (
              <div key={s.name} className="step">
                <span className="step__no">0{i + 1}</span>
                <h3>{s.name}</h3>
                <p>{s.text}</p>
              </div>
            ))}
          </Stagger>
        </div>
      </RoadmapZone>

      {/* ── Numbers ──────────────────────────── */}
      <section className="sec sec--paper numbers" data-shape="bars">
        <div className="wrap">
          <div className="sec__head">
            <LineReveal as="h2" className="display sec__title" lines={["One builder,", "many hats."]} onView />
            <Rise className="sec__aside">
              <p>
                Python, TypeScript, Next.js and Supabase on the build side; PRDs, user research and prioritisation on
                the product side. The AI is never the point. The decision it helps someone make is.
              </p>
            </Rise>
          </div>
          <Stagger className="stats">
            <div className="stat stat--ink">
              <p className="stat__n">
                <Counter to={5} />
              </p>
              <p className="stat__l">AI prototypes shipped in 2 months as team lead</p>
            </div>
            <div className="stat stat--tangerine">
              <p className="stat__n">
                <Counter to={600} suffix="+" />
              </p>
              <p className="stat__l">voice-agent conversations evaluated at Gnani.ai</p>
            </div>
            <div className="stat stat--paper">
              <p className="stat__n">
                <Counter to={87.5} suffix="%" />
              </p>
              <p className="stat__l">win rate for my hackathon bot (2nd place)</p>
            </div>
            <div className="stat stat--ink">
              <p className="stat__n">
                <Counter to={latestDay} />
                <span className="stat__of">/60</span>
              </p>
              <p className="stat__l">days into learning product management in public</p>
            </div>
          </Stagger>
        </div>
      </section>

      {/* ── What I build ─────────────────────── */}
      <section className="sec sec--ink" data-shape="brackets">
        <div className="wrap">
          <div className="sec__head">
            <LineReveal as="h2" className="display sec__title" lines={[<span key="b">What I <span className="t-tangerine">build.</span></span>]} onView />
            <Rise className="sec__aside">
              <p>Four kinds of work, one habit: check that it worked before calling it done.</p>
              <Link className="pill pill--tangerine" href="/work">
                All work <Arrow />
              </Link>
            </Rise>
          </div>
          <Stagger className="areas">
            {areas.map((a, i) => (
              <article key={a.title} className="area">
                <div className="area__top">
                  <span className="area__no">0{i + 1}</span>
                  <span className="area__go" aria-hidden>
                    <Arrow />
                  </span>
                </div>
                <h3 className="display">{a.title}</h3>
                <p>{a.text}</p>
                <ul>
                  {a.tags.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </article>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ── Live work, opened by a tangerine circle ─ */}
      <CircleSection className="sec sec--tangerine live" shape="check">
        <div className="wrap">
          <div className="sec__head">
            <LineReveal as="h2" className="display sec__title" lines={[<span key="m">Live, not <span className="t-ink">mockups.</span></span>]} onView />
            <Rise className="sec__aside">
              <p>Real deployments you can open right now, and the code for the ones that run offline.</p>
              <Link className="pill pill--ink" href="/work">
                All 8 projects <Arrow />
              </Link>
            </Rise>
          </div>
          <Stagger className="shots">
            {featured.map((p) => {
              const meta = projectMeta[p.id];
              const live = p.links[0];
              return (
                <a key={p.id} className="shot" href={live.url} target="_blank" rel="noreferrer" data-cursor="Open">
                  <Wipe className="shot__img">
                    {meta.image && <Image src={meta.image} alt={`${p.title} home page`} width={1280} height={800} sizes="(max-width: 720px) 100vw, 50vw" />}
                  </Wipe>
                  <div className="shot__body">
                    <h3 className="display">{p.title}</h3>
                    <span className="tag tag--mint">{meta.status}</span>
                  </div>
                  <p>{p.description}</p>
                </a>
              );
            })}
          </Stagger>
        </div>
      </CircleSection>

      {/* ── Experience: internships + the channel, as dropdowns ─ */}
      <section className="sec sec--ink experience" data-shape="flag">
        <div className="wrap">
          <div className="sec__head">
            <LineReveal as="h2" className="display sec__title" lines={[<span key="w">Where I&apos;ve <span className="t-tangerine">worked.</span></span>]} onView />
            <Rise className="sec__aside">
              <p>Two internships, one of them leading the team, and the channel I run. Open any of them for the full story.</p>
            </Rise>
          </div>
          <Rise>
            <Roles />
          </Rise>
        </div>
      </section>

      {/* ── Content creation journey ─────────── */}
      <section className="sec sec--paper journey-sec" data-shape="play">
        <div className="wrap">
          <div className="sec__head">
            <LineReveal as="h2" className="display sec__title" lines={[<span key="j">Learning in <span className="t-tangerine">public.</span></span>]} onView />
            <Rise className="sec__aside">
              <p>Alongside building, I teach myself product management on Instagram and edit every reel myself.</p>
              <Link className="pill pill--ink" href="/content">
                See the content <Arrow />
              </Link>
            </Rise>
          </div>
          <Journey />
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────── */}
      <section className="sec sec--ink faq-sec" data-shape="bubble">
        <div className="wrap faq-wrap">
          <LineReveal as="h2" className="display sec__title" lines={["Questions,", <span key="a" className="t-tangerine">answered.</span>]} onView />
          <Faq items={faqs} />
        </div>
      </section>
    </>
  );
}
