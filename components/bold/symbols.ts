/**
 * Symbols the background icons arrange themselves into, one per section.
 * Each symbol is a list of strokes (polylines) in a -1..1 box; the icons are
 * spread evenly along the strokes.
 */
type P = [number, number];
type Stroke = P[];

const arc = (cx: number, cy: number, r: number, a0: number, a1: number, n = 24): Stroke =>
  Array.from({ length: n + 1 }, (_, i) => {
    const a = ((a0 + ((a1 - a0) * i) / n) * Math.PI) / 180;
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r] as P;
  });

export const SYMBOLS: Record<string, Stroke[]> = {
  // An idea: a lightbulb.
  bulb: [
    arc(0, 0.28, 0.58, -50, 230, 30),
    [[-0.37, -0.17], [-0.26, -0.52]],
    [[0.37, -0.17], [0.26, -0.52]],
    [[-0.28, -0.6], [0.28, -0.6]],
    [[-0.22, -0.74], [0.22, -0.74]],
    [[-0.12, -0.88], [0.12, -0.88]],
  ],
  // "Should it exist?": a question mark.
  question: [
    [...arc(0, 0.42, 0.42, 165, -40, 22), [0.08, -0.05], [0.04, -0.4]],
    arc(0.04, -0.78, 0.09, 0, 360, 8),
  ],
  // A roadmap: a winding path with milestones.
  roadmap: [
    Array.from({ length: 30 }, (_, i) => {
      const t = i / 29;
      return [-0.95 + t * 1.9, -0.6 + t * 1.1 + Math.sin(t * Math.PI * 2.2) * 0.22] as P;
    }),
  ],
  // Growth: a rising arrow.
  arrow: [
    [[-0.9, -0.7], [-0.35, -0.15], [0.0, -0.4], [0.75, 0.55]],
    [[0.75, 0.55], [0.35, 0.52]],
    [[0.75, 0.55], [0.72, 0.15]],
  ],
  // Building: code brackets.
  brackets: [
    [[-0.38, 0.62], [-0.92, 0], [-0.38, -0.62]],
    [[0.2, 0.75], [-0.15, -0.75]],
    [[0.38, 0.62], [0.92, 0], [0.38, -0.62]],
  ],
  // Shipped: a check inside a circle.
  check: [arc(0, 0, 0.86, 0, 360, 34), [[-0.42, 0.02], [-0.1, -0.32], [0.46, 0.34]]],
  // Experience: a milestone flag.
  flag: [
    [[-0.5, -0.92], [-0.5, 0.88]],
    [[-0.5, 0.88], [0.68, 0.58], [-0.5, 0.26]],
  ],
  // Content: a play button.
  play: [arc(0, 0, 0.88, 0, 360, 30), [[-0.3, 0.45], [0.45, 0], [-0.3, -0.45], [-0.3, 0.45]]],
  // Questions: a speech bubble.
  bubble: [
    [[-0.85, 0.55], [0.85, 0.55], [0.85, -0.3], [-0.2, -0.3], [-0.55, -0.7], [-0.5, -0.3], [-0.85, -0.3], [-0.85, 0.55]],
    [[-0.4, 0.12], [-0.38, 0.12]],
    [[0, 0.12], [0.02, 0.12]],
    [[0.4, 0.12], [0.42, 0.12]],
  ],
  // A person: about me.
  user: [arc(0, 0.42, 0.36, 0, 360, 22), arc(0, -0.95, 0.85, 20, 160, 22)],
  // Hello: a paper plane.
  plane: [
    [[-0.9, 0.05], [0.9, 0.7], [0.3, -0.75], [-0.9, 0.05]],
    [[0.9, 0.7], [-0.15, -0.15], [0.3, -0.75]],
  ],
};

/** Spread n points evenly along a symbol's strokes. */
export function samplePoints(name: string, n: number): P[] {
  const strokes = SYMBOLS[name] ?? SYMBOLS.bulb;
  const segs: { a: P; b: P; len: number }[] = [];
  strokes.forEach((s) => {
    for (let i = 1; i < s.length; i++) {
      const a = s[i - 1];
      const b = s[i];
      segs.push({ a, b, len: Math.hypot(b[0] - a[0], b[1] - a[1]) || 0.02 });
    }
  });
  const total = segs.reduce((t, s) => t + s.len, 0);
  const out: P[] = [];
  for (let k = 0; k < n; k++) {
    let d = ((k + 0.5) / n) * total;
    for (const s of segs) {
      if (d <= s.len) {
        const f = d / s.len;
        out.push([s.a[0] + (s.b[0] - s.a[0]) * f, s.a[1] + (s.b[1] - s.a[1]) * f]);
        break;
      }
      d -= s.len;
    }
    if (out.length < k + 1) out.push(segs[segs.length - 1].b);
  }
  return out;
}
