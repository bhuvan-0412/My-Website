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
  "@its.bhuvan.builds: 27 posts on PM and AI, 42K+ views, 220+ followers",
];

/**
 * Every day of the "60 days of PM" Instagram series so far, in Bhuvan's own captions,
 * with views (checked 24 Nov 2026). Add a line here each time a new day goes up.
 */
export const pmSeries: { day: number; lesson: string; url: string; views: number }[] = [
  { day: 1, lesson: "Turns out PM isn't just \"managing a product\".", url: "https://www.instagram.com/reel/DcSLYzxsUqD/", views: 1654 },
  { day: 2, lesson: "What if the best ideas come from simply asking \"why?\"", url: "https://www.instagram.com/reel/DcWoHgXM-GI/", views: 1573 },
  { day: 3, lesson: "The right solution starts with finding the right problem.", url: "https://www.instagram.com/reel/DcYyiH-sX8_/", views: 2294 },
  { day: 4, lesson: "Your product changes, so your strategy should too.", url: "https://www.instagram.com/reel/DceXuN-MNTO/", views: 1032 },
  { day: 5, lesson: "Build for people, not \"users\".", url: "https://www.instagram.com/reel/DcjIv7QM78F/", views: 1647 },
  { day: 6, lesson: "Structure first, aesthetics later.", url: "https://www.instagram.com/reel/DcltVvUs34L/", views: 2217 },
  { day: 7, lesson: "A million downloads doesn't mean success.", url: "https://www.instagram.com/reel/DdM8sFysozU/", views: 1874 },
  { day: 8, lesson: "More data. More noise. Less clarity.", url: "https://www.instagram.com/reel/DdQKHfSMO3f/", views: 1297 },
  { day: 9, lesson: "Great products start with small experiments.", url: "https://www.instagram.com/reel/DeoMu41s2y7/", views: 1821 },
  { day: 10, lesson: "Build what people want and actually need.", url: "https://www.instagram.com/reel/DeqcPq9M4hT/", views: 445 },
  { day: 11, lesson: "Analyse. Strategise. Grow.", url: "https://www.instagram.com/its.bhuvan.builds/reel/DetERK7Mo9m/", views: 1105 },
  { day: 12, lesson: "Know your competition, read the room, make smarter business moves.", url: "https://www.instagram.com/its.bhuvan.builds/reel/DewU5jesFEJ/", views: 833 },
  { day: 13, lesson: "Understanding the how, what and where of business growth.", url: "https://www.instagram.com/its.bhuvan.builds/reel/Dey3JVTspRK/", views: 1450 },
  { day: 14, lesson: "The right priorities turn effort into impact.", url: "https://www.instagram.com/its.bhuvan.builds/reel/De3-cbRzZIP/", views: 932 },
  { day: 15, lesson: "Plan it all or figure it out as you go? Both have a strategy.", url: "https://www.instagram.com/its.bhuvan.builds/reel/De9HQYQsegJ/", views: 943 },
  { day: 16, lesson: "Less chaos, more clarity: visualise tasks, prioritise better, keep the team in sync.", url: "https://www.instagram.com/its.bhuvan.builds/reel/DfCgwiSsSEn/", views: 1330 },
  { day: 17, lesson: "Explain who a product is for, what problem it solves and why it beats the alternatives.", url: "https://www.instagram.com/its.bhuvan.builds/reel/DfPhxJeTEwK/", views: 979 },
  { day: 18, lesson: "Compliments don't validate an idea, behaviour does.", url: "https://www.instagram.com/its.bhuvan.builds/reel/DfSf-gdzWtc/", views: 770 },
  { day: 19, lesson: "Stop pitching features. Start finding problems.", url: "https://www.instagram.com/its.bhuvan.builds/reel/DfXazHpzIlv/", views: 1542 },
  { day: 20, lesson: "A clear PRD today saves a thousand questions tomorrow.", url: "https://www.instagram.com/its.bhuvan.builds/reel/Dfd2_UQTfB6/", views: 2197 },
  { day: 21, lesson: "Not a developer, still gotta know what's happening under the hood.", url: "https://www.instagram.com/its.bhuvan.builds/reel/Dfjqsn5zdv3/", views: 2084 },
  { day: 22, lesson: "Behind every cool app is a whole lot of servers, cloud magic and product strategy.", url: "https://www.instagram.com/its.bhuvan.builds/reel/Dfwn4hRsFrg/", views: 522 },
];

/**
 * Best edits for the "Cut by me" showcase: the four most-watched reels
 * (views and likes checked on 24 Nov 2026). Each one plays on the page in Instagram's own player.
 * Optional `video`: put an .mp4 in /public/reels/ and set e.g. "/reels/about-me.mp4"
 * to play it right on the card instead (muted, when in view).
 */
export const reels: { title: string; note: string; url: string; views: number; likes: number; video?: string; badge?: string }[] = [
  { title: "About me", note: "Stop waiting for the right moment", url: "https://www.instagram.com/reel/DcASSYVMnSe/", views: 4264, likes: 193, badge: "Intro" },
  { title: "Startup journey", note: "Ep. 1: let's see where this goes", url: "https://www.instagram.com/reel/DcMmjhlsY_o/", views: 3037, likes: 126, badge: "Ep. 1" },
  { title: "Keep it boring", note: "Let life get interesting", url: "https://www.instagram.com/reel/DcoSjSIs14i/", views: 2903, likes: 136, badge: "Mindset" },
  { title: "Day 3", note: "The right solution starts with the right problem", url: "https://www.instagram.com/reel/DcYyiH-sX8_/", views: 2294, likes: 96 },
];

/** Channel totals across all reels (24 Nov 2026). */
export const reelTotals = { reels: 26, views: 42800 };

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
  "42K+ reel views on @its.bhuvan.builds",
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
    a: "Both, on purpose. I work out whether it should exist and who it's for, then build it myself and check whether people use it.",
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
      "27 posts on learning PM and building AI products: 42K+ views and 220+ followers so far.",
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
  { title: "42K+ views", text: "27 posts and 220+ followers, growing with every lesson." },
  { title: "Day 22 of 60", text: "Still going. The log updates as the series does." },
];
