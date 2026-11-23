import { about, achievements, experience, pmSeries, projects, skills } from "@/data/site";

export type StopId = "discover" | "define" | "build" | "launch" | "measure";

export type Stop = {
  id: StopId;
  name: string;
  color: string;
  /** Darker shade of the colour, for text on light grounds. */
  ink: string;
  /** Position of the stop along the road, 0..1. */
  u: number;
  title: string;
  lines: string[];
  link: { label: string; href: string };
};

const latestDay = Math.max(...pmSeries.map((d) => d.day));

export const STOPS: Stop[] = [
  {
    id: "discover",
    name: "Discover",
    color: "#ffc23d",
    ink: "#7a5200",
    u: 0.07,
    title: "Who's driving",
    lines: [
      "Dual degree at BITS Pilani, Goa: Electronics & Instrumentation + M.Sc. Mathematics.",
      "I build AI products end to end, and I think about them like a product manager.",
      `Class XII: 97% · CGPA ${about.ratings.find((r) => r.key === "CGPA")?.value ?? ""}`,
    ],
    link: { label: "More about me", href: "#about" },
  },
  {
    id: "define",
    name: "Define",
    color: "#3d9bff",
    ink: "#0b4f99",
    u: 0.285,
    title: "How I think",
    lines: [
      `Learning product management in public: day ${latestDay} of 60.`,
      "PRDs, user research, prioritisation, competitive analysis.",
      `Toolkit: ${skills[0].items.slice(0, 4).join(", ")} and more.`,
    ],
    link: { label: "Skills and the PM log", href: "#define" },
  },
  {
    id: "build",
    name: "Build",
    color: "#ff6a45",
    ink: "#9c2c10",
    u: 0.5,
    title: "What I've built",
    lines: projects.slice(0, 4).map((p) => `${p.title}: ${p.description.split(/[.:]/)[0]}.`),
    link: { label: `All ${projects.length} projects`, href: "#build" },
  },
  {
    id: "launch",
    name: "Launch",
    color: "#8a6bff",
    ink: "#4227a8",
    u: 0.715,
    title: "Where I've shipped",
    lines: [
      ...experience.map((e) => `${e.title}, ${e.org} (${e.period})`),
      achievements[0],
    ],
    link: { label: "Experience", href: "#launch" },
  },
  {
    id: "measure",
    name: "Measure",
    color: "#22c07a",
    ink: "#0b6b40",
    u: 0.93,
    title: "Results and reach",
    lines: [
      "5 AI prototypes in 2 months as team lead.",
      "600+ voice-agent conversations evaluated, 100+ fixes reported.",
      "87.5% win rate on the hackathon bot · 200+ followers on Instagram.",
    ],
    link: { label: "Reels and contact", href: "#measure" },
  },
];

/**
 * Scroll progress (0..1 through the drive) → car position on the road (0..1).
 * The car pauses at every stop so its panel can be read.
 */
const KEYS: [number, number][] = (() => {
  const k: [number, number][] = [[0, 0]];
  const span = 1 / STOPS.length;
  STOPS.forEach((s, i) => {
    const a = i * span;
    k.push([a + span * 0.4, s.u], [a + span * 0.9, s.u]);
  });
  k.push([1, 0.985]);
  return k;
})();

export function roadPosition(p: number) {
  for (let i = 1; i < KEYS.length; i++) {
    const [s0, u0] = KEYS[i - 1];
    const [s1, u1] = KEYS[i];
    if (p <= s1) {
      const f = s1 === s0 ? 1 : (p - s0) / (s1 - s0);
      const e = f * f * (3 - 2 * f);
      return u0 + (u1 - u0) * e;
    }
  }
  return KEYS[KEYS.length - 1][1];
}

/** The stop whose pause window contains (or is nearest to) the scroll progress; -1 before the first. */
export function activeStop(p: number) {
  const span = 1 / STOPS.length;
  if (p < span * 0.3) return -1;
  return Math.min(STOPS.length - 1, Math.floor((p - span * 0.3) / span + 0.0001));
}

/** Scroll progress at the middle of a stop's pause. */
export function stopProgress(i: number) {
  const span = 1 / STOPS.length;
  return i * span + span * 0.65;
}
