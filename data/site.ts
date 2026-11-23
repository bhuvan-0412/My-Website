// ─────────────────────────────────────────────────────────────
//  All of the website's content lives in this one file.
// ─────────────────────────────────────────────────────────────

export const site = {
  name: "Bhuvan Thota",
  initials: "BT",
  role: "AI Engineer & Product Builder",
  tagline:
    "I build AI products end to end: agent pipelines, RAG systems and the web apps people actually use. Student at BITS Pilani, Goa.",
  location: "Goa, India",
  email: "thotabhuvan@gmail.com",
  resumeUrl: "/resume.pdf",
  socials: [
    { label: "GitHub", url: "https://github.com/bhuvan-0412" },
    { label: "LinkedIn", url: "https://www.linkedin.com/in/bhuvan-thota" },
    { label: "Instagram", url: "https://www.instagram.com/its.bhuvan.builds/" },
  ],
};

export const about = {
  paragraphs: [
    "I'm Bhuvan, a dual-degree student at BITS Pilani, K K Birla Goa Campus, studying Electronics & Instrumentation alongside an M.Sc. in Mathematics.",
    "Most of my time goes into building AI products: multi-agent pipelines, retrieval-augmented chatbots, offline document intelligence and the full-stack apps around them. This summer I led a team at Swecha Telangana that shipped 5 AI prototypes in 2 months.",
    "I'm also into product management. I built ProdPath, a free 6-week PM course for students preparing for APM internships, and I share what I learn about PM and building AI products on Instagram.",
  ],
  education: [
    {
      school: "BITS Pilani, K K Birla Goa Campus",
      degree: "B.E. Electronics & Instrumentation + M.Sc. Mathematics",
      period: "Aug 2024 – Jun 2029",
      detail: "CGPA: 7.32 / 10",
    },
    {
      school: "Narayana Junior College, Hyderabad",
      degree: "Class XII",
      period: "2022 – 2024",
      detail: "Score: 97%",
    },
  ],
};

export const skills: { group: string; items: string[] }[] = [
  { group: "Languages", items: ["Python", "SQL", "JavaScript", "C++", "HTML", "CSS"] },
  {
    group: "Frameworks & Libraries",
    items: ["Next.js", "React", "FastAPI", "Flask", "Streamlit", "scikit-learn", "Sentence Transformers"],
  },
  {
    group: "AI / ML",
    items: ["LLM Agents", "Tool Use", "Structured Outputs", "RAG", "Embeddings", "Semantic Search", "Prompting", "Evals"],
  },
  {
    group: "Databases & Tools",
    items: ["PostgreSQL", "Supabase", "SQLite", "FAISS", "Ollama", "Docker", "Git", "Vercel", "REST APIs"],
  },
];

export type Project = {
  title: string;
  badge?: string;
  description: string;
  tech: string[];
  links: { label: string; url: string }[];
};

export const projects: Project[] = [
  {
    title: "ViralSpy",
    badge: "Swecha internship",
    description:
      "Helps creators catch topics trending on Reels, Shorts and Reddit before they peak, with a content brief for each. A 4-agent pipeline does velocity scoring, Z-score spike detection, per-niche re-ranking and LLM-generated JSON briefs.",
    tech: ["Next.js", "Supabase", "PostgreSQL", "LLM Agents"],
    links: [{ label: "Live", url: "https://viral-spy-eight.vercel.app" }],
  },
  {
    title: "Battlesnake AI Agent",
    badge: "2nd place · Storming Aurora hackathon",
    description:
      "Autonomous Battlesnake bot built in 12 hours with a team of 4 that I led. Flood fill, Voronoi territory control, iterative-deepening minimax and opponent modelling. 87.5% win rate, 74 unit tests, 13 ms average latency against a 500 ms limit.",
    tech: ["Python", "Minimax", "REST API"],
    links: [
      {
        label: "Certificate",
        url: "https://drive.google.com/file/d/15e6r7oKfX_W7aavizHTLom2gdv2cjqVp/view?usp=sharing",
      },
    ],
  },
  {
    title: "ProdPath",
    badge: "Live learning platform",
    description:
      "A free 6-week product management course for college students preparing for APM internships: day-by-day lessons, a searchable resource library and a milestone timeline, with progress saved in the browser.",
    tech: ["Next.js", "Tailwind CSS", "Vercel"],
    links: [{ label: "Live", url: "https://prodpath.vercel.app" }],
  },
  {
    title: "ResoVault",
    description:
      "Saves links across devices, with bulk import from chat messages: an LLM parses chat text into links. A daily cron job ingests news ranked per user by engagement-weighted click logs.",
    tech: ["Next.js", "TypeScript", "Supabase", "Google OAuth"],
    links: [{ label: "Live", url: "https://resovault.vercel.app" }],
  },
  {
    title: "EconChain AI",
    description:
      "Turns invoices, trade reports and policy notices into structured data with supply-chain risk flags, fully offline. PyMuPDF and Tesseract OCR extract text; a quantised Qwen 2.5 3B model on Ollama returns schema-based JSON.",
    tech: ["Python", "Ollama", "OCR", "SQLite", "Docker"],
    links: [{ label: "GitHub", url: "https://github.com/bhuvan-0412/EconChain---offline-first-CPU-powered-AI" }],
  },
  {
    title: "Tillu RAG Assistant",
    description:
      "Answers questions about an uploaded PDF or TXT using only that document. Chunks the text, embeds it with Sentence Transformers, retrieves the closest chunks from a FAISS index and answers via the Groq API.",
    tech: ["Python", "FAISS", "Sentence Transformers", "Groq"],
    links: [{ label: "GitHub", url: "https://github.com/bhuvan-0412/Personal_Chatbot" }],
  },
  {
    title: "QuickSewa",
    description:
      "A photo-based civic complaint app: snap a photo of the problem and Gemini Vision turns it into a categorised complaint.",
    tech: ["Gemini Vision", "Next.js"],
    links: [{ label: "Live", url: "https://quick-sewa.vercel.app" }],
  },
  {
    title: "AgroSense",
    description: "A crop and fertiliser recommender for farmers, powered by 3 machine learning models.",
    tech: ["Python", "scikit-learn", "ML"],
    links: [{ label: "Live", url: "https://agrosense-soilmonitoring.vercel.app" }],
  },
];

export const experience: {
  title: string;
  org: string;
  period: string;
  points: string[];
}[] = [
  {
    title: "AI Research & Open Source Intern",
    org: "Swecha Telangana",
    period: "May 2026 – Jul 2026 · Hyderabad",
    points: [
      "Team lead: led a team that built 5 AI prototypes in 2 months, planning the scope and assigning work.",
      "Built ViralSpy, a 4-agent trend-detection pipeline, plus QuickSewa and AgroSense.",
      "Built a RAG chatbot (FAISS + Sentence Transformers + Groq) and EconChain AI, an offline document-intelligence tool on Ollama.",
      "Submitted an open-source merge request (under review).",
    ],
  },
  {
    title: "AI Systems Testing Intern",
    org: "Gnani.ai",
    period: "Jul 2025 – Aug 2025 · Remote",
    points: [
      "Evaluated AI voice agent output across 600+ live conversations, labelling each as a success or failure.",
      "Grouped recurring intent-mapping and response failures by cause and reported 100+ improvements to the team.",
    ],
  },
];

export const achievements: string[] = [
  "2nd Place, Storming Aurora 12-hour Hackathon, BITS Goa (Battlesnake AI Agent)",
  "Dance Club, BITS Goa: 2nd Place (2026) and 3rd Place (2025) in group dance competitions",
  "@its.bhuvan.builds on Instagram: 25+ posts on learning PM and building AI products, 200+ followers",
  "Scored 97% in Class XII",
];
