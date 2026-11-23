# Personal Website

Bhuvan Thota's portfolio, built with Next.js (App Router), TypeScript, Three.js (React Three Fiber) and Framer Motion.

## Designs (one per branch)

| Branch | Design |
| --- | --- |
| `pm-design` | **The launch road.** A drivable low-poly 3D world: scrolling drives a car through Discover, Define, Build, Launch and Measure, and each stop opens that part of the profile. |
| `electronics-design` | **Signal board.** A 3D circuit board where each project is a chip wired to a core. |
| `main` | Currently the same as `electronics-design`. |

## Run it locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Edit your content

All text, links and lists live in **`data/site.ts`**: name, headline, about, skills, projects, experience, achievements, the 60-days-of-PM lessons, reels, email and social links.

- **Stops on the road** (`pm-design`): titles and summary lines are in `lib/stops.ts`.
- **Resume:** `public/resume.pdf`.
- **Reels:** edit `reels` in `data/site.ts`. To play a clip on the page, put an `.mp4` in `public/reels/` and set its `video` path.

## Deploy (free)

1. Import the repository at https://vercel.com/new. It detects Next.js automatically.
2. Pick the branch to deploy as production (or merge your favourite design into `main`).
3. Every push to that branch redeploys the site; other branches get preview links.
