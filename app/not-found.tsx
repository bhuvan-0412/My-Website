import Link from "next/link";
import { PAGES } from "@/components/bold/pages";

export default function NotFound() {
  return (
    <section className="lost sec--ink" data-shape="question">
      <div className="wrap">
        <p className="lost__code display" aria-hidden>
          404
        </p>
        <h1 className="lost__title display">
          This page <span className="t-tangerine">doesn&apos;t exist.</span>
        </h1>
        <p className="lost__text">
          Maybe it never shipped. Here&apos;s everything that did:
        </p>
        <nav className="lost__links" aria-label="Pages">
          {PAGES.map((p, i) => (
            <Link key={p.href} href={p.href} className={`pill ${i === 0 ? "pill--tangerine" : "pill--ghost-light"}`}>
              {p.label}
            </Link>
          ))}
        </nav>
      </div>
    </section>
  );
}
