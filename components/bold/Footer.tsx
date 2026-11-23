import Link from "next/link";
import { site, stats } from "@/data/site";
import { LineReveal, Ticker } from "./Motion";
import { PAGES } from "./pages";

export default function Footer() {
  return (
    <footer className="foot">
      <div className="wrap foot__cta">
        <LineReveal as="h2" className="foot__title display" lines={["Let's build", <span key="g" className="t-tangerine">it.</span>]} onView />
        <div className="foot__side">
          <p>Product, Python, AI or software internships. Email is the fastest way to reach me.</p>
          <a className="foot__mail" href={`mailto:${site.email}`}>
            {site.email}
          </a>
          <div className="foot__btns">
            <a className="pill pill--tangerine" href={`mailto:${site.email}`}>
              Hire me
            </a>
            <a className="pill pill--ghost-light" href={site.resumeUrl} target="_blank" rel="noreferrer">
              Resume (PDF)
            </a>
          </div>
        </div>
      </div>
      <Ticker items={stats} tone="mint" tilt={0} />
      <div className="wrap foot__bar">
        <nav aria-label="Footer">
          {PAGES.map((p) => (
            <Link key={p.href} href={p.href}>
              {p.label}
            </Link>
          ))}
        </nav>
        <nav aria-label="Elsewhere">
          {site.socials.map((s) => (
            <a key={s.label} href={s.url} target="_blank" rel="noreferrer">
              {s.label}
            </a>
          ))}
        </nav>
        <p>
          © {new Date().getFullYear()} {site.name}
        </p>
      </div>
    </footer>
  );
}
