/**
 * Symbols the background artifacts arrange themselves into, one per section.
 * Each symbol is a list of strokes (polylines) in a -1..1 box. The artifacts are
 * spread evenly along the strokes, and the strokes are also drawn as a thin line,
 * so every symbol reads like a simple icon at a glance.
 */
export type P = [number, number];
export type Stroke = P[];

const arc = (cx: number, cy: number, r: number, a0: number, a1: number, n = 24): Stroke =>
  Array.from({ length: n + 1 }, (_, i) => {
    const a = ((a0 + ((a1 - a0) * i) / n) * Math.PI) / 180;
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r] as P;
  });
const circle = (cx: number, cy: number, r: number, n = 28) => arc(cx, cy, r, 90, 450, n);
const rect = (x0: number, y0: number, x1: number, y1: number): Stroke => [[x0, y0], [x1, y0], [x1, y1], [x0, y1], [x0, y0]];

export const SYMBOLS: Record<string, Stroke[]> = {
  // An idea: a lightbulb with a few rays.
  bulb: [
    [[-0.24, -0.42], ...arc(0, 0.28, 0.55, 222, -42, 34), [0.24, -0.42]],
    [[-0.3, -0.56], [0.3, -0.56]],
    [[-0.24, -0.7], [0.24, -0.7]],
    [[-0.12, -0.84], [0.12, -0.84]],
    [[0, 0.98], [0, 1.16]],
    [[-0.72, 0.8], [-0.84, 0.92]],
    [[0.72, 0.8], [0.84, 0.92]],
  ],
  // "Should it exist?": a question mark.
  question: [
    [...arc(0, 0.44, 0.42, 160, -55, 26), [0.06, -0.12], [0.06, -0.38]],
    circle(0.06, -0.76, 0.1, 10),
  ],
  // Idea to shipped: a rocket.
  rocket: [
    [[0, 1], [0.3, 0.58], [0.3, -0.42], [-0.3, -0.42], [-0.3, 0.58], [0, 1]],
    circle(0, 0.24, 0.14, 12),
    [[0.3, -0.06], [0.58, -0.52], [0.3, -0.42]],
    [[-0.3, -0.06], [-0.58, -0.52], [-0.3, -0.42]],
    [[-0.16, -0.56], [0, -0.96], [0.16, -0.56]],
  ],
  // The numbers: a rising bar chart.
  bars: [
    [[-0.95, -0.8], [0.95, -0.8]],
    rect(-0.78, -0.8, -0.44, -0.36),
    rect(-0.3, -0.8, 0.04, -0.02),
    rect(0.18, -0.8, 0.52, 0.36),
    [[-0.62, -0.12], [-0.14, 0.24], [0.34, 0.62], [0.78, 0.94]],
    [[0.78, 0.94], [0.5, 0.92]],
    [[0.78, 0.94], [0.74, 0.66]],
  ],
  // Building: code brackets </>.
  brackets: [
    [[-0.38, 0.62], [-0.92, 0], [-0.38, -0.62]],
    [[0.2, 0.75], [-0.15, -0.75]],
    [[0.38, 0.62], [0.92, 0], [0.38, -0.62]],
  ],
  // Shipped: a check inside a circle.
  check: [circle(0, 0, 0.86, 36), [[-0.42, 0.02], [-0.1, -0.32], [0.46, 0.34]]],
  // Experience: a milestone flag.
  flag: [
    [[-0.5, -0.92], [-0.5, 0.88]],
    [[-0.5, 0.88], [0.68, 0.58], [-0.5, 0.26]],
    [[-0.8, -0.92], [-0.2, -0.92]],
  ],
  // Content: a play button.
  play: [circle(0, 0, 0.88, 32), [[-0.28, 0.44], [0.46, 0], [-0.28, -0.44], [-0.28, 0.44]]],
  // Editing: a pair of scissors.
  scissors: [
    circle(-0.42, -0.62, 0.26, 16),
    circle(0.42, -0.62, 0.26, 16),
    [[-0.26, -0.42], [0.42, 0.98]],
    [[0.26, -0.42], [-0.42, 0.98]],
  ],
  // The journey: a map pin.
  pin: [
    [[0, -0.92], ...arc(0, 0.3, 0.52, 212, -32, 30), [0, -0.92]],
    circle(0, 0.3, 0.18, 12),
  ],
  // Questions: a speech bubble.
  bubble: [
    [[-0.85, 0.6], [0.85, 0.6], [0.85, -0.3], [-0.2, -0.3], [-0.55, -0.72], [-0.5, -0.3], [-0.85, -0.3], [-0.85, 0.6]],
    circle(-0.4, 0.15, 0.06, 6),
    circle(0, 0.15, 0.06, 6),
    circle(0.4, 0.15, 0.06, 6),
  ],
  // A person: about me.
  user: [circle(0, 0.44, 0.36, 24), [...arc(0, -0.95, 0.85, 160, 20, 22), [-0.8, -0.66]]],
  // Hello: an envelope.
  mail: [rect(-0.92, -0.6, 0.92, 0.6), [[-0.92, 0.6], [0, -0.08], [0.92, 0.6]]],
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

/**
 * Particle positions for a symbol: n points spread evenly (stratified) along the strokes,
 * each pushed a little to either side so the strokes read as a bold, solid line.
 * Returns [x0, y0, x1, y1, ...] in the -1..1 box, in stroke order, so particle k on one
 * symbol flows to the same fraction of the next symbol when it morphs.
 */
export function strokeSamples(name: string, n: number, thick: number, rand: () => number): Float32Array {
  const strokes = SYMBOLS[name] ?? SYMBOLS.bulb;
  const segs: { a: P; b: P; len: number }[] = [];
  strokes.forEach((s) => {
    for (let i = 1; i < s.length; i++) {
      const a = s[i - 1];
      const b = s[i];
      segs.push({ a, b, len: Math.hypot(b[0] - a[0], b[1] - a[1]) || 0.0001 });
    }
  });
  const total = segs.reduce((t, s) => t + s.len, 0);
  const out = new Float32Array(n * 2);
  let si = 0;
  let acc = 0;
  for (let k = 0; k < n; k++) {
    const d = ((k + rand()) / n) * total;
    while (si < segs.length - 1 && d > acc + segs[si].len) acc += segs[si++].len;
    const sg = segs[si];
    const f = Math.min(1, Math.max(0, (d - acc) / sg.len));
    const dx = (sg.b[0] - sg.a[0]) / sg.len;
    const dy = (sg.b[1] - sg.a[1]) / sg.len;
    const off = (rand() - 0.5) * 2 * thick;
    out[k * 2] = sg.a[0] + (sg.b[0] - sg.a[0]) * f - dy * off;
    out[k * 2 + 1] = sg.a[1] + (sg.b[1] - sg.a[1]) * f + dx * off;
  }
  return out;
}
