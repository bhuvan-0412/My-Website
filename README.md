# Personal Website

A portfolio site built with Next.js (App Router) and TypeScript: dark/light theme, scroll animations, and responsive down to phone width.

## Run it locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Edit your content

All text, links and lists live in **`data/site.ts`**: name, tagline, about, education, skills, projects, experience, achievements, email and social links. Edit that file and the page updates.

- **Resume:** put your PDF at `public/resume.pdf`.
- **Colors:** change the `--accent` tokens at the top of `app/globals.css`.

## Deploy (free)

1. Push this folder to a GitHub repository.
2. Import the repository at https://vercel.com/new. It detects Next.js automatically.
3. Every push to `main` redeploys the site.
