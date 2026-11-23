import type { Metadata } from "next";
import { site } from "@/data/site";
import { LineReveal, Rise, Stagger } from "@/components/bold/Motion";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <section className="page-hero page-hero--tall sec--ink" data-shape="plane">
      <div className="wrap">
        <LineReveal className="display page-hero__title" delay={0.3} lines={[<span key="h">Say <span className="t-tangerine">hello.</span></span>]} />
        <Rise delay={0.7} y={20}>
          <p className="page-hero__lede">
            I&apos;m looking for internships in product management, AI engineering and software development.
            Email gets the fastest reply.
          </p>
        </Rise>
        <Rise delay={0.85} y={20}>
          <a className="contact-mail display" href={`mailto:${site.email}`}>
            {site.email}
          </a>
        </Rise>
        <Stagger className="contact-links">
          {site.socials.map((s) => (
            <a key={s.label} href={s.url} target="_blank" rel="noreferrer" className="contact-link">
              <span className="display">{s.label}</span>
              <span>{s.handle}</span>
            </a>
          ))}
          <a href={site.resumeUrl} target="_blank" rel="noreferrer" className="contact-link">
            <span className="display">Resume</span>
            <span>PDF, 1 page</span>
          </a>
        </Stagger>
      </div>
    </section>
  );
}
