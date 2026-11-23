import type { Metadata } from "next";
import { LineReveal, Rise } from "@/components/bold/Motion";
import WorkGrid from "@/components/bold/WorkGrid";

export const metadata: Metadata = { title: "Work" };

export default function WorkPage() {
  return (
    <>
      <section className="page-hero sec--ink" data-shape="brackets">
        <div className="wrap">
          <LineReveal className="display page-hero__title" delay={0.3} lines={["Built and", <span key="s" className="t-mint">shipped.</span>]} />
          <Rise delay={0.7} y={20}>
            <p className="page-hero__lede">
              AI pipelines, learning platforms and web apps, from internships, hackathons and my own projects. Filter by
              what they are.
            </p>
          </Rise>
        </div>
      </section>
      <section className="sec sec--paper work-sec" data-shape="check">
        <div className="wrap">
          <WorkGrid />
        </div>
      </section>
    </>
  );
}
