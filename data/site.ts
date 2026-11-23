// ─────────────────────────────────────────────────────────────
//  All of the website's content lives in this one file.
// ─────────────────────────────────────────────────────────────

export const site = {
  name: "Bhuvan Thota",
  initials: "BT",
  headline: "I build AI products and think about them like a product manager.",
  openTo: ["Product management", "AI engineering", "Software development"],
  location: "Goa · Hyderabad, India",
  email: "thotabhuvan@gmail.com",
  resumeUrl: "/resume.pdf",
  socials: [
    { label: "GitHub", handle: "bhuvan-0412", url: "https://github.com/bhuvan-0412" },
    { label: "LinkedIn", handle: "bhuvan-thota", url: "https://www.linkedin.com/in/bhuvan-thota" },
    { label: "Instagram", handle: "@its.bhuvan.builds", url: "https://www.instagram.com/its.bhuvan.builds/" },
  ],
};

export const about = {
  paragraphs: [
    "I'm a dual-degree student at BITS Pilani, K K Birla Goa Campus: Electronics & Instrumentation alongside an M.Sc. in Mathematics.",
    "I spend most of my time building AI products end to end, from multi-agent pipelines and retrieval chatbots to the web apps around them. This summer I led a team at Swecha Telangana that shipped 5 AI prototypes in 2 months.",
    "I'm just as interested in why a product should exist as in how it works. I built ProdPath, a free PM course for students, and I'm learning product management in public, one day at a time, on Instagram.",
  ],
  ratings: [
    { key: "Degree", value: "B.E. Electronics & Instrumentation + M.Sc. Mathematics" },
    { key: "Campus", value: "BITS Pilani, K K Birla Goa" },
    { key: "Graduating", value: "Jun 2029" },
    { key: "CGPA", value: "7.32 / 10" },
    { key: "Class XII", value: "97% · Narayana Junior College" },
    { key: "Teams led", value: "2 (Swecha, Battlesnake)" },
  ],
};

export const skills: { group: string; items: string[] }[] = [
  { group: "Languages", items: ["Python", "SQL", "JavaScript", "TypeScript", "C++", "HTML/CSS"] },
  { group: "AI / ML", items: ["LLM agents", "Tool use", "Structured outputs", "RAG", "Embeddings", "Semantic search", "Evals"] },
  { group: "Frameworks", items: ["Next.js", "React", "FastAPI", "Flask", "Streamlit", "scikit-learn"] },
  { group: "Data & infra", items: ["PostgreSQL", "Supabase", "SQLite", "FAISS", "Ollama", "Docker", "Vercel"] },
  { group: "Product", items: ["PRDs", "User research", "Prioritisation", "Competitive analysis", "Roadmaps"] },
];

export type Project = {
  id: string;
  title: string;
  /** Short reference designator printed on the 3D chip. */
  ref: string;
  badge?: string;
  description: string;
  /** The project's signal flow, drawn as a pipeline. */
  flow: string[];
  tech: string[];
  links: { label: string; url: string }[];
};

export const projects: Project[] = [
  {
    id: "viralspy",
    title: "ViralSpy",
    ref: "U1",
    badge: "Swecha internship",
    description:
      "Helps creators catch topics trending on Reels, Shorts and Reddit before they peak, with a ready content brief for each one.",
    flow: ["Reels · Shorts · Reddit", "Velocity score", "Z-score spikes", "Per-niche re-rank", "LLM brief (JSON)"],
    tech: ["Next.js", "Supabase", "PostgreSQL", "4 agents"],
    links: [{ label: "Live site", url: "https://viral-spy-eight.vercel.app" }],
  },
  {
    id: "battlesnake",
    title: "Battlesnake AI",
    ref: "U2",
    badge: "2nd place · Storming Aurora hackathon",
    description:
      "An autonomous snake bot built in 12 hours by a team of 4 that I led. I analysed 27+ test matches and fixed the most common causes of death first.",
    flow: ["Game state (REST)", "Flood fill", "Voronoi territory", "Minimax search", "Move in 13 ms"],
    tech: ["Python", "74 unit tests", "87.5% win rate"],
    links: [
      { label: "Certificate", url: "https://drive.google.com/file/d/15e6r7oKfX_W7aavizHTLom2gdv2cjqVp/view?usp=sharing" },
    ],
  },
  {
    id: "prodpath",
    title: "ProdPath",
    ref: "U3",
    badge: "Live learning platform",
    description:
      "A free 6-week product management course for college students preparing for APM internships. 10+ sign-ups.",
    flow: ["6-week plan", "Daily lessons", "Resource library", "Milestones", "Progress saved"],
    tech: ["Next.js", "Tailwind CSS", "Vercel"],
    links: [{ label: "Live site", url: "https://prodpath.vercel.app" }],
  },
  {
    id: "resovault",
    title: "ResoVault",
    ref: "U4",
    description:
      "Saves links across devices and bulk-imports them straight from chat messages. A daily job brings in news, ranked for each user by what they click.",
    flow: ["Chat text", "LLM link parser", "Postgres + RLS", "Daily news cron", "Per-user ranking"],
    tech: ["Next.js", "TypeScript", "Supabase", "Google OAuth"],
    links: [{ label: "Live site", url: "https://resovault.vercel.app" }],
  },
  {
    id: "econchain",
    title: "EconChain AI",
    ref: "U5",
    description:
      "Turns invoices, trade reports and policy notices into structured data with supply-chain risk flags. Runs fully offline.",
    flow: ["PDF / scan", "PyMuPDF + OCR", "Qwen 2.5 3B (Ollama)", "Schema JSON", "Risk flags"],
    tech: ["Python", "Ollama", "Tesseract", "SQLite", "Docker"],
    links: [{ label: "GitHub", url: "https://github.com/bhuvan-0412/EconChain---offline-first-CPU-powered-AI" }],
  },
  {
    id: "tillu",
    title: "Tillu RAG",
    ref: "U6",
    description: "Answers questions about an uploaded PDF or text file using only that document.",
    flow: ["PDF / TXT", "Chunk 300w, 50 overlap", "Sentence Transformers", "FAISS search", "Groq answer"],
    tech: ["Python", "FAISS", "Groq API"],
    links: [{ label: "GitHub", url: "https://github.com/bhuvan-0412/Personal_Chatbot" }],
  },
  {
    id: "quicksewa",
    title: "QuickSewa",
    ref: "U7",
    description: "A civic complaint app: snap a photo of the problem and it becomes a categorised complaint.",
    flow: ["Photo", "Gemini Vision", "Category + details", "Complaint filed"],
    tech: ["Gemini Vision", "Next.js"],
    links: [{ label: "Live site", url: "https://quick-sewa.vercel.app" }],
  },
  {
    id: "agrosense",
    title: "AgroSense",
    ref: "U8",
    description: "Recommends the right crop and fertiliser for a field from its soil readings.",
    flow: ["Soil readings", "3 ML models", "Crop pick", "Fertiliser pick"],
    tech: ["Python", "scikit-learn"],
    links: [{ label: "Live site", url: "https://agrosense-soilmonitoring.vercel.app" }],
  },
];

export const experience: {
  rev: string;
  title: string;
  org: string;
  period: string;
  place: string;
  points: string[];
}[] = [
  {
    rev: "B",
    title: "AI Research & Open Source Intern",
    org: "Swecha Telangana",
    period: "May – Jul 2026",
    place: "Hyderabad",
    points: [
      "Team lead: planned scope and assigned work for a team that built 5 AI prototypes in 2 months.",
      "Built ViralSpy, QuickSewa, AgroSense, the Tillu RAG assistant and EconChain AI.",
      "Submitted an open-source merge request (under review).",
    ],
  },
  {
    rev: "A",
    title: "AI Systems Testing Intern",
    org: "Gnani.ai",
    period: "Jul – Aug 2025",
    place: "Remote",
    points: [
      "Evaluated an AI voice agent across 600+ live conversations, labelling each a success or failure.",
      "Grouped recurring intent-mapping and response failures by cause and reported 100+ improvements.",
    ],
  },
];

export const achievements: string[] = [
  "2nd place, Storming Aurora 12-hour hackathon, BITS Goa",
  "Dance Club, BITS Goa: 2nd place (2026) and 3rd place (2025), group dance",
  "@its.bhuvan.builds: 25+ posts on PM and AI, 200+ followers",
];

/** Lessons from the "60 days of PM" Instagram series, in Bhuvan's own captions. */
export const pmSeries: { day: number; lesson: string; url: string }[] = [
  { day: 22, lesson: "Behind every cool app is a whole lot of servers, cloud magic and product strategy.", url: "https://www.instagram.com/its.bhuvan.builds/reel/Dfwn4hRsFrg/" },
  { day: 21, lesson: "Not a developer, still gotta know what's happening under the hood.", url: "https://www.instagram.com/its.bhuvan.builds/reel/Dfjqsn5zdv3/" },
  { day: 20, lesson: "A clear PRD today saves a thousand questions tomorrow.", url: "https://www.instagram.com/its.bhuvan.builds/reel/Dfd2_UQTfB6/" },
  { day: 19, lesson: "Stop pitching features. Start finding problems.", url: "https://www.instagram.com/its.bhuvan.builds/reel/DfXazHpzIlv/" },
  { day: 18, lesson: "Compliments don't validate an idea, behaviour does.", url: "https://www.instagram.com/its.bhuvan.builds/reel/DfSf-gdzWtc/" },
  { day: 17, lesson: "Explain who a product is for, what problem it solves and why it beats the alternatives.", url: "https://www.instagram.com/its.bhuvan.builds/reel/DfPhxJeTEwK/" },
  { day: 16, lesson: "Less chaos, more clarity: visualise tasks, prioritise better, keep the team in sync.", url: "https://www.instagram.com/its.bhuvan.builds/reel/DfCgwiSsSEn/" },
  { day: 15, lesson: "Plan it all or figure it out as you go? Both have a strategy.", url: "https://www.instagram.com/its.bhuvan.builds/reel/De9HQYQsegJ/" },
  { day: 14, lesson: "The right priorities turn effort into impact.", url: "https://www.instagram.com/its.bhuvan.builds/reel/De3-cbRzZIP/" },
  { day: 13, lesson: "Understanding the how, what and where of business growth.", url: "https://www.instagram.com/its.bhuvan.builds/reel/Dey3JVTspRK/" },
  { day: 12, lesson: "Know your competition, read the room, make smarter business moves.", url: "https://www.instagram.com/its.bhuvan.builds/reel/DewU5jesFEJ/" },
  { day: 11, lesson: "Analyse. Strategise. Grow.", url: "https://www.instagram.com/its.bhuvan.builds/reel/DetERK7Mo9m/" },
];

/**
 * Reels for the video-editing section. Replace these with the ones you pick.
 * Optional `video`: put an .mp4 in /public/reels/ and set e.g. "/reels/day-22.mp4"
 * to play it right on the page (muted, on hover / when in view).
 */
export const reels: { title: string; note: string; url: string; video?: string }[] = [
  { title: "Day 22", note: "Servers, cloud and product strategy", url: "https://www.instagram.com/its.bhuvan.builds/reel/Dfwn4hRsFrg/" },
  { title: "Day 20", note: "Why a clear PRD matters", url: "https://www.instagram.com/its.bhuvan.builds/reel/Dfd2_UQTfB6/" },
  { title: "Day 17", note: "Positioning a product", url: "https://www.instagram.com/its.bhuvan.builds/reel/DfPhxJeTEwK/" },
];

/* ── Extra data for the bold design ─────────────────────── */

export type Kind = "AI" | "Product" | "Web" | "Hackathon";

/** How each project is filed on the Work page, and its screenshot (if the project is live). */
export const projectMeta: Record<string, { kinds: Kind[]; image?: string; status: string }> = {
  viralspy: { kinds: ["AI", "Web"], image: "/work/viralspy.png", status: "Live" },
  battlesnake: { kinds: ["AI", "Hackathon"], status: "2nd place" },
  prodpath: { kinds: ["Product", "Web"], image: "/work/prodpath.png", status: "Live" },
  resovault: { kinds: ["Web", "AI"], image: "/work/resovault.png", status: "Live" },
  econchain: { kinds: ["AI"], status: "Open source" },
  tillu: { kinds: ["AI"], status: "Open source" },
  quicksewa: { kinds: ["AI", "Web"], image: "/work/quicksewa.png", status: "Live" },
  agrosense: { kinds: ["AI", "Web"], image: "/work/agrosense.png", status: "Live" },
};

/** Numbers for the ticker. Every one traces back to the resume. */
export const stats: string[] = [
  "5 AI prototypes in 2 months",
  "600+ voice-agent conversations evaluated",
  "100+ improvements reported",
  "2nd place, 12-hour hackathon",
  "87.5% bot win rate",
  "Day 22 of 60 learning PM in public",
  "8 products built",
  "200+ followers on @its.bhuvan.builds",
];

/** The four kinds of work, for the home page. */
export const areas: { title: string; text: string; tags: string[] }[] = [
  {
    title: "AI systems",
    text: "Multi-agent pipelines, retrieval chatbots and offline document intelligence that return structured, checkable output.",
    tags: ["LLM agents", "RAG", "FAISS", "Ollama"],
  },
  {
    title: "Product thinking",
    text: "Framing the problem before the feature: PRDs, user research, prioritisation, and a free PM course for students.",
    tags: ["PRDs", "ProdPath", "60-day PM log"],
  },
  {
    title: "Web apps",
    text: "Full-stack Next.js and Supabase apps with auth, row-level security and scheduled jobs, shipped to Vercel.",
    tags: ["Next.js", "Supabase", "Postgres"],
  },
  {
    title: "Content",
    text: "I make and edit short reels that explain product ideas in under a minute.",
    tags: ["Reels", "Editing", "Storytelling"],
  },
];

/** Short answers to what recruiters usually ask. */
export const faqs: { q: string; a: string }[] = [
  {
    q: "What roles are you looking for?",
    a: "Internships in product management, AI engineering and software development.",
  },
  {
    q: "Are you more of a PM or an engineer?",
    a: "Both, on purpose. I build the thing myself, and I care about whether it should exist and whether people use it.",
  },
  {
    q: "Have you led a team?",
    a: "Yes. At Swecha I led the team that built 5 AI prototypes in 2 months, and I led our 4-person team to 2nd place at the Storming Aurora hackathon.",
  },
  {
    q: "Where can I see your resume?",
    a: "It's a one-page PDF, linked in the menu and the footer.",
  },
];

/* ── Experience dropdowns (everything from the resume) ─── */
export const roles: {
  org: string;
  title: string;
  period: string;
  place: string;
  summary: string;
  points: string[];
  built?: { name: string; url: string }[];
  tools: string[];
}[] = [
  {
    org: "Swecha Telangana",
    title: "AI Research & Open Source Intern · Team lead",
    period: "May – Jul 2026",
    place: "Hyderabad",
    summary: "Led the team that built 5 AI prototypes in 2 months.",
    points: [
      "Planned the scope and assigned the work for a team that shipped 5 AI prototypes in 2 months.",
      "ViralSpy: a 4-agent pipeline that spots topics trending on Reels, Shorts and Reddit before they peak, using velocity scoring, Z-score spike detection, per-niche re-ranking and LLM-generated briefs.",
      "QuickSewa: a photo-based civic complaint app using Gemini Vision. AgroSense: a crop and fertiliser recommender using 3 ML models.",
      "Tillu RAG assistant: answers questions about an uploaded PDF or text file using only that document (Sentence Transformers, FAISS, Groq).",
      "EconChain AI: turns invoices, trade reports and policy notices into structured data with supply-chain risk flags, fully offline (PyMuPDF, Tesseract OCR, Qwen 2.5 3B on Ollama, SQLite, Docker).",
      "Submitted an open-source merge request (under review).",
    ],
    built: [
      { name: "ViralSpy", url: "https://viral-spy-eight.vercel.app" },
      { name: "QuickSewa", url: "https://quick-sewa.vercel.app" },
      { name: "AgroSense", url: "https://agrosense-soilmonitoring.vercel.app" },
      { name: "Tillu RAG", url: "https://github.com/bhuvan-0412/Personal_Chatbot" },
      { name: "EconChain AI", url: "https://github.com/bhuvan-0412/EconChain---offline-first-CPU-powered-AI" },
    ],
    tools: ["Next.js", "Supabase", "PostgreSQL", "LLM agents", "FAISS", "Ollama", "Docker"],
  },
  {
    org: "Gnani.ai",
    title: "AI Systems Testing Intern",
    period: "Jul – Aug 2025",
    place: "Remote",
    summary: "Tested a production AI voice agent and reported 100+ improvements.",
    points: [
      "Evaluated AI voice-agent output across 600+ live conversations, labelling each one a success or a failure.",
      "Grouped recurring intent-mapping and response failures by cause, and reported 100+ improvements to the team.",
    ],
    tools: ["Voice AI", "Conversation evaluation", "Failure analysis"],
  },
  {
    org: "@its.bhuvan.builds",
    title: "Content creator & video editor",
    period: "2026 – now",
    place: "Instagram",
    summary: "Learning product management in public, and editing every reel myself.",
    points: [
      "Running a 60-day series on product management: one lesson per reel, now at day 22.",
      "25+ posts on learning PM and building AI products, followed by 200+ people.",
      "I edit every reel myself: the hook, the pacing, the cuts, the captions and the on-screen type.",
    ],
    built: [{ name: "Instagram", url: "https://www.instagram.com/its.bhuvan.builds/" }],
    tools: ["Video editing", "Captions", "Storytelling"],
  },
];

/** The content-creation journey, only from Instagram and the resume. */
export const journey: { title: string; text: string }[] = [
  { title: "Learn in public", text: "I started sharing what I learn about product management, instead of learning it quietly." },
  { title: "60 days of PM", text: "One lesson per reel: PRDs, user research, prioritisation, competition, growth." },
  { title: "Edit it myself", text: "Every reel is cut by me: a hook in the first seconds, tight pacing, captions and on-screen type." },
  { title: "25+ posts, 200+ followers", text: "A small audience that grows with every lesson." },
  { title: "Day 22 of 60", text: "Still going. The log updates as the series does." },
];
