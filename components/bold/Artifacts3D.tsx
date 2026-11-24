"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, RoundedBox } from "@react-three/drei";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { strokeSamples } from "./symbols";
import { scene } from "./formation";

/*
 * The background: each section's icon drawn by thousands of small particles,
 * with a handful of 3D product artifacts orbiting it.
 *
 *  - Scroll speed loosens the icon: a slow scroll makes it wobble, a fast flick
 *    throws everything across the screen. It regroups when you stop.
 *  - Drag the icon (or an artifact) and throw it; it springs back.
 *  - Click empty background to burst the icon from that point.
 *  - The whole icon turns in 3D with the cursor.
 */

/* Palette: ink + tangerine, with off-white and a soft tint */
const INK = "#0d1321";
const TAN = "#ff6b2c";
const TAN_SOFT = "#ffb38f";
const PAPER = "#f2f4f7";
const GREY = "#c9cfd9";

type Tone = "ink" | "paper" | "tangerine";
type Kind = "sticky" | "cursor" | "phone" | "toggle" | "code";

/** The plane the icon is drawn on; the camera looks at it from z = 22. */
const PLANE_Z = -5.5;
const CAM_Z = 22;

/** Elements a press should leave alone (they have their own clicks or text). */
const INTERACTIVE = "a, button, input, textarea, select, label, summary, [role=button], .chip, .faq, .role, .lesson, .reel, .work__item";
const TEXTY = "p, h1, h2, h3, h4, li, dd, dt, span, blockquote, figcaption";

function rng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}
const smooth = (x: number) => x * x * (3 - 2 * x);

/* ── Product artifacts (the orbiters) ─────────────────────── */
function codeTexture() {
  const cv = document.createElement("canvas");
  cv.width = 256;
  cv.height = 192;
  const g = cv.getContext("2d")!;
  g.fillStyle = "#141b2d";
  g.fillRect(0, 0, 256, 192);
  [TAN, GREY, GREY].forEach((c, i) => {
    g.fillStyle = c;
    g.beginPath();
    g.arc(20 + i * 18, 18, 6, 0, Math.PI * 2);
    g.fill();
  });
  const r = rng(5);
  for (let i = 0; i < 8; i++) {
    const indent = [0, 1, 2, 2, 1, 2, 1, 0][i] * 18;
    g.fillStyle = [TAN, PAPER, GREY, TAN_SOFT][i % 4];
    g.fillRect(18 + indent, 44 + i * 17, 40 + r() * (150 - indent), 8);
  }
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function stickyTexture(color: string) {
  const cv = document.createElement("canvas");
  cv.width = 256;
  cv.height = 256;
  const g = cv.getContext("2d")!;
  g.fillStyle = color;
  g.fillRect(0, 0, 256, 256);
  g.fillStyle = "rgba(13,19,33,0.28)";
  [0, 1, 2].forEach((i) => g.fillRect(36, 70 + i * 44, i === 2 ? 110 : 180, 14));
  g.fillStyle = "rgba(0,0,0,0.06)";
  g.fillRect(0, 0, 256, 34);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

const cursorShape = (() => {
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.lineTo(0, -1.6);
  s.lineTo(0.42, -1.2);
  s.lineTo(0.7, -1.85);
  s.lineTo(0.98, -1.72);
  s.lineTo(0.7, -1.08);
  s.lineTo(1.2, -1.08);
  s.closePath();
  return s;
})();

function Artifact({ kind, color, tex }: { kind: Kind; color: string; tex: Record<string, THREE.Texture> }) {
  switch (kind) {
    case "sticky":
      return (
        <RoundedBox args={[1.5, 1.5, 0.08]} radius={0.04} smoothness={2}>
          <meshStandardMaterial attach="material" map={tex[`sticky-${color}`]} roughness={0.55} />
        </RoundedBox>
      );
    case "cursor":
      return (
        <mesh position={[-0.6, 0.9, 0]}>
          <extrudeGeometry args={[cursorShape, { depth: 0.22, bevelEnabled: true, bevelSize: 0.05, bevelThickness: 0.05, bevelSegments: 3 }]} />
          <meshPhysicalMaterial color={color} roughness={0.25} clearcoat={1} />
        </mesh>
      );
    case "phone":
      return (
        <group>
          <RoundedBox args={[1.1, 2.1, 0.16]} radius={0.16} smoothness={4}>
            <meshPhysicalMaterial color={INK} roughness={0.3} clearcoat={1} />
          </RoundedBox>
          <mesh position={[0, 0, 0.085]}>
            <planeGeometry args={[0.92, 1.85]} />
            <meshBasicMaterial color={color} toneMapped={false} />
          </mesh>
          <mesh position={[0, 0.55, 0.09]}>
            <planeGeometry args={[0.6, 0.12]} />
            <meshBasicMaterial color={INK} transparent opacity={0.35} />
          </mesh>
        </group>
      );
    case "toggle":
      return (
        <group>
          <RoundedBox args={[1.7, 0.85, 0.36]} radius={0.17} smoothness={4}>
            <meshPhysicalMaterial color={color} roughness={0.3} clearcoat={0.8} />
          </RoundedBox>
          <mesh position={[0.42, 0, 0.12]}>
            <sphereGeometry args={[0.34, 24, 16]} />
            <meshPhysicalMaterial color="#ffffff" roughness={0.2} clearcoat={1} />
          </mesh>
        </group>
      );
    case "code":
      return (
        <RoundedBox args={[2.1, 1.55, 0.1]} radius={0.08} smoothness={3}>
          <meshStandardMaterial attach="material" map={tex.code} roughness={0.4} />
        </RoundedBox>
      );
  }
}

const ORBITERS: { kind: Kind; color: string; base: number }[] = [
  { kind: "sticky", color: TAN, base: 0.55 },
  { kind: "cursor", color: PAPER, base: 0.62 },
  { kind: "code", color: "code", base: 0.46 },
  { kind: "phone", color: TAN, base: 0.5 },
  { kind: "toggle", color: TAN, base: 0.5 },
  { kind: "sticky", color: PAPER, base: 0.5 },
  { kind: "cursor", color: TAN, base: 0.6 },
  { kind: "sticky", color: TAN_SOFT, base: 0.5 },
  { kind: "phone", color: PAPER, base: 0.46 },
  { kind: "code", color: "code", base: 0.42 },
];

/* ── Particle shader: round soft dots, coloured for the background they sit on ── */
const vert = /* glsl */ `
  attribute float aSize;
  attribute float aKind;
  uniform float uSize;
  uniform float uDpr;
  uniform vec3 uBg;      // weights: ink, paper, tangerine backgrounds
  uniform mat3 uOnInk;   // columns = colours for particle kinds 0, 1, 2
  uniform mat3 uOnPaper;
  uniform mat3 uOnTan;
  varying vec3 vColor;
  vec3 pick(mat3 m, float k) { return k < 0.5 ? m[0] : (k < 1.5 ? m[1] : m[2]); }
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * aSize * uDpr * (${(CAM_Z - PLANE_Z).toFixed(1)} / -mv.z);
    vColor = uBg.x * pick(uOnInk, aKind) + uBg.y * pick(uOnPaper, aKind) + uBg.z * pick(uOnTan, aKind);
  }
`;
const frag = /* glsl */ `
  uniform float uOpacity;
  varying vec3 vColor;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.3, d) * uOpacity;
    if (a < 0.01) discard;
    gl_FragColor = vec4(vColor, a);
  }
`;
const palette = (a: string, b: string, c: string) => {
  const [x, y, z] = [new THREE.Color(a), new THREE.Color(b), new THREE.Color(c)];
  // Matrix3.set takes rows; each colour becomes a column.
  return new THREE.Matrix3().set(x.r, y.r, z.r, x.g, y.g, z.g, x.b, y.b, z.b);
};

/* ── Input state, written by DOM listeners and read every frame ── */
type Input = {
  ndc: THREE.Vector2;
  inside: boolean;
  down: boolean;
  downAt: number;
  downXY: [number, number];
  dragged: boolean;
  target: Element | null;
  burst: boolean;
  press: boolean;
  release: boolean;
};

function Field({ mobile, still, path }: { mobile: boolean; still: boolean; path: string }) {
  const { camera, size, gl } = useThree();
  const N = mobile ? 1800 : 4200;
  const A = mobile ? 5 : ORBITERS.length;
  const group = useRef<THREE.Group>(null);
  const orbitRefs = useRef<(THREE.Group | null)[]>([]);

  const tex = useMemo(() => {
    const t: Record<string, THREE.Texture> = { code: codeTexture() };
    [TAN, PAPER, TAN_SOFT].forEach((c) => (t[`sticky-${c}`] = stickyTexture(c)));
    return t;
  }, []);

  /* Particle buffers */
  const P = useMemo(() => {
    const r = rng(7);
    const pos = new Float32Array(N * 3);
    const vel = new Float32Array(N * 3);
    const home = new Float32Array(N * 3);
    const scat = new Float32Array(N * 3);
    const k = new Float32Array(N);
    const loose = new Float32Array(N);
    const phase = new Float32Array(N);
    const sizes = new Float32Array(N);
    const kinds = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      k[i] = 18 + r() * 26;
      loose[i] = 0.55 + r() * 0.45;
      phase[i] = r() * Math.PI * 2;
      sizes[i] = 0.6 + r() * 0.8;
      const c = r();
      kinds[i] = c < 0.66 ? 0 : c < 0.86 ? 1 : 2;
      // Start spread over the screen, so the first icon assembles itself.
      pos[i * 3] = (r() - 0.5) * 30;
      pos[i * 3 + 1] = (r() - 0.5) * 18;
      pos[i * 3 + 2] = (r() - 0.5) * 6;
    }
    const geo = new THREE.BufferGeometry();
    const attr = new THREE.BufferAttribute(pos, 3);
    attr.setUsage(THREE.DynamicDrawUsage);
    geo.setAttribute("position", attr);
    geo.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute("aKind", new THREE.BufferAttribute(kinds, 1));
    const mat = new THREE.ShaderMaterial({
      vertexShader: vert,
      fragmentShader: frag,
      transparent: true,
      depthWrite: false,
      uniforms: {
        uSize: { value: mobile ? 3 : 3.2 },
        uDpr: { value: 1 },
        uOpacity: { value: 0.95 },
        uBg: { value: new THREE.Vector3(1, 0, 0) },
        uOnInk: { value: palette(TAN, TAN_SOFT, PAPER) },
        uOnPaper: { value: palette(TAN, TAN, INK) },
        uOnTan: { value: palette(INK, PAPER, INK) },
      },
    });
    const points = new THREE.Points(geo, mat);
    points.frustumCulled = false;
    return { pos, vel, home, scat, k, loose, phase, geo, mat, points, attr, grabbed: new Uint8Array(N), off: new Float32Array(N * 2), free: new Float32Array(N) };
  }, [N, mobile]);

  /* Orbiters */
  const O = useMemo(
    () =>
      Array.from({ length: A }, (_, i) => ({
        ...ORBITERS[i],
        pos: new THREE.Vector3(Math.sin(i * 2.1) * 14, Math.cos(i * 1.7) * 9, -2),
        vel: new THREE.Vector3(),
        spin: new THREE.Vector3(),
        rot: new THREE.Euler(),
        scat: new THREE.Vector3(),
        phase: i * 1.37,
        grabbed: false,
        free: 0,
      })),
    [A]
  );

  useEffect(
    () => () => {
      P.geo.dispose();
      P.mat.dispose();
    },
    [P]
  );

  /* Per-frame state */
  const st = useRef({
    shape: "",
    tone: "ink" as Tone,
    els: [] as HTMLElement[],
    frame: 0,
    visW: 1,
    visH: 1,
    scale: 1,
    mix: 0,
    lastY: 0,
    velS: 0,
    s: 0,
    pulse: 0,
    orbit: 0,
    rotX: 0,
    rotY: 0,
    path: "",
    pathAt: -10,
    pl: new THREE.Vector3(99, 99, 0),
    plPrev: new THREE.Vector3(99, 99, 0),
    pv: new THREE.Vector3(),
    plOk: false,
    grabbing: "" as "" | "particles" | "orbiter",
    grabOrbiter: -1,
    lastHint: "",
  });

  const input = useRef<Input>({
    ndc: new THREE.Vector2(9, 9),
    inside: false,
    down: false,
    downAt: 0,
    downXY: [0, 0],
    dragged: false,
    target: null,
    burst: false,
    press: false,
    release: false,
  });

  /* Raycasting helpers */
  const ray = useMemo(() => new THREE.Raycaster(), []);
  const inv = useMemo(() => new THREE.Matrix4(), []);
  const localPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), []);
  const tmp = useMemo(() => new THREE.Vector3(), []);
  const tmp2 = useMemo(() => new THREE.Vector3(), []);

  /** Pointer position on the icon's own (tilted) plane, in group-local units. */
  const pointerLocal = (out: THREE.Vector3) => {
    const g = group.current;
    if (!g) return false;
    ray.setFromCamera(input.current.ndc, camera);
    inv.copy(g.matrixWorld).invert();
    ray.ray.applyMatrix4(inv);
    return !!ray.ray.intersectPlane(localPlane, out);
  };

  /* DOM input */
  useEffect(() => {
    const I = input.current;
    const setNdc = (e: PointerEvent) => I.ndc.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
    const move = (e: PointerEvent) => {
      setNdc(e);
      I.inside = true;
      I.target = e.target as Element;
      if (I.down && Math.hypot(e.clientX - I.downXY[0], e.clientY - I.downXY[1]) > 6) I.dragged = true;
    };
    const leave = () => {
      I.inside = false;
      I.ndc.set(9, 9);
    };
    const down = (e: PointerEvent) => {
      if (e.button !== 0) return;
      const el = e.target as Element;
      if (el.closest(INTERACTIVE) || el.closest("header, footer, .menu")) return;
      setNdc(e);
      I.down = true;
      I.dragged = false;
      I.downAt = performance.now();
      I.downXY = [e.clientX, e.clientY];
      I.target = el;
      if (e.pointerType === "mouse") I.press = true;
    };
    const up = (e: PointerEvent) => {
      if (!I.down) return;
      I.down = false;
      setNdc(e);
      const quick = performance.now() - I.downAt < 450;
      const onText = !!I.target?.closest(TEXTY);
      const selecting = (window.getSelection()?.toString().length ?? 0) > 0;
      if (!I.dragged && quick && !onText && !selecting) I.burst = true;
      I.release = true;
    };
    // While the icon is held, the drag shouldn't select text.
    const select = (e: Event) => {
      if (st.current.grabbing) e.preventDefault();
    };
    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", leave);
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    document.addEventListener("selectstart", select);
    return () => {
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", leave);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      document.removeEventListener("selectstart", select);
      delete document.documentElement.dataset.bghint;
    };
  }, []);

  /* Lay out a symbol: particle homes, scatter spots and the orbit size. */
  const layout = (name: string) => {
    const S = st.current;
    const cam = camera as THREE.PerspectiveCamera;
    const dist = CAM_Z - PLANE_Z;
    S.visH = 2 * dist * Math.tan(THREE.MathUtils.degToRad(cam.fov / 2));
    S.visW = S.visH * (size.width / size.height);
    S.scale = mobile ? Math.min(S.visW * 0.36, S.visH * 0.2) : S.visH * 0.33;
    const r = rng(name.length * 97 + 13);
    const dust = Math.floor(N * 0.05);
    const pts = strokeSamples(name, N - dust, 0.036, r);
    for (let i = 0; i < N; i++) {
      if (i < N - dust) {
        P.home[i * 3] = pts[i * 2] * S.scale;
        P.home[i * 3 + 1] = pts[i * 2 + 1] * S.scale;
        P.home[i * 3 + 2] = (r() - 0.5) * 0.5;
      } else {
        // A little dust around the icon so it sparkles instead of sitting flat.
        const a = r() * Math.PI * 2;
        const d = S.scale * (0.9 + r() * 0.7);
        P.home[i * 3] = Math.cos(a) * d;
        P.home[i * 3 + 1] = Math.sin(a) * d * 0.85;
        P.home[i * 3 + 2] = (r() - 0.5) * 3;
      }
      // Scatter spots cover the whole screen (world units; converted every frame).
      P.scat[i * 3] = (r() - 0.5) * S.visW * 1.02;
      P.scat[i * 3 + 1] = (r() - 0.5) * S.visH * 0.98;
      P.scat[i * 3 + 2] = PLANE_Z + (r() - 0.5) * 7;
    }
    O.forEach((o, i) => o.scat.set(((i + 0.5) / O.length - 0.5) * S.visW * 0.9, (r() - 0.5) * S.visH * 0.8, PLANE_Z + (r() - 0.5) * 4));
  };

  const lastSize = useRef("");

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 1 / 30);
    const t = state.clock.elapsedTime;
    const S = st.current;
    const I = input.current;
    const g = group.current;
    if (!g) return;
    S.frame++;

    /* Which section is in the middle of the screen? Checked every frame, so it's never late. */
    if (path !== S.path) {
      S.path = path;
      S.pathAt = t;
      S.els = [];
      if (S.shape) S.pulse = Math.max(S.pulse, 0.55);
    }
    if (S.frame % 20 === 0 || S.els.length === 0 || !S.els[0].isConnected) {
      S.els = Array.from(document.querySelectorAll<HTMLElement>("main [data-shape]"));
    }
    const mid = window.innerHeight * 0.5;
    let pick: HTMLElement | null = null;
    for (const el of S.els) {
      const b = el.getBoundingClientRect();
      if (b.top <= mid && b.bottom >= mid) {
        pick = el;
        break;
      }
    }
    if (!pick && S.els[0] && S.els[0].getBoundingClientRect().top > mid) pick = S.els[0];
    const sizeKey = `${size.width}x${size.height}`;
    if (pick) {
      const name = pick.dataset.shape || "bulb";
      S.tone = pick.classList.contains("sec--tangerine") ? "tangerine" : pick.classList.contains("sec--paper") ? "paper" : "ink";
      if (name !== S.shape || sizeKey !== lastSize.current) {
        if (S.shape && name !== S.shape) S.pulse = Math.max(S.pulse, 0.28);
        S.shape = name;
        lastSize.current = sizeKey;
        layout(name);
      }
    } else if (!S.shape) {
      S.shape = "bulb";
      lastSize.current = sizeKey;
      layout("bulb");
    }

    /* Scroll speed → how loose the icon is. Jumps (page changes, anchor links) just pulse. */
    const y = window.scrollY;
    const dy = y - S.lastY;
    S.lastY = y;
    const jump = Math.abs(dy) > window.innerHeight * 0.9 || t - S.pathAt < 0.9;
    if (jump && Math.abs(dy) > 1 && S.frame > 2) S.pulse = Math.max(S.pulse, 0.5);
    const speed = jump ? 0 : Math.abs(dy) / Math.max(rawDt, 1 / 120);
    S.velS = THREE.MathUtils.damp(S.velS, speed, 12, dt);
    if (scene.burst > 0) {
      S.pulse = Math.max(S.pulse, 0.6);
      scene.burst = 0;
    }
    S.pulse = Math.max(0, S.pulse - dt * 1.1);
    const want = still ? 0 : Math.max(Math.min(1, Math.max(0, S.velS - 60) / 1700), S.pulse);
    S.s = THREE.MathUtils.damp(S.s, want, want > S.s ? 7 : 2.4, dt);
    const s = smooth(Math.min(1, S.s));

    /* Where the icon sits: on the right at the top of a page, centred once you scroll in. */
    const mixT = Math.min(1, Math.max(0, y / (window.innerHeight * 0.85)));
    S.mix = THREE.MathUtils.damp(S.mix, mixT, 4, dt);
    const m = smooth(S.mix);
    const cx = mobile ? 0 : S.visW * 0.26 * (1 - m);
    const cy = mobile ? S.visH * 0.2 * (1 - m) : -S.visH * 0.02;
    const grow = mobile ? 1 : 1 + 0.22 * m;
    g.position.set(cx, cy, PLANE_Z);
    g.scale.setScalar(grow);

    /* Tilt with the cursor (an idle sway otherwise). */
    const tilt = !still && I.inside && !mobile;
    const ry = tilt ? I.ndc.x * 0.3 : still ? 0 : Math.sin(t * 0.25) * 0.14;
    const rx = tilt ? -I.ndc.y * 0.18 : still ? 0 : Math.cos(t * 0.21) * 0.06;
    if (!S.grabbing) {
      S.rotY = THREE.MathUtils.damp(S.rotY, ry, 3, dt);
      S.rotX = THREE.MathUtils.damp(S.rotX, rx, 3, dt);
    }
    g.rotation.set(S.rotX, S.rotY, 0);
    g.updateMatrixWorld();

    /* Background colour → particle colours. */
    const u = P.mat.uniforms;
    const bg = u.uBg.value as THREE.Vector3;
    const w = S.tone === "ink" ? [1, 0, 0] : S.tone === "paper" ? [0, 1, 0] : [0, 0, 1];
    bg.set(THREE.MathUtils.damp(bg.x, w[0], 4, dt), THREE.MathUtils.damp(bg.y, w[1], 4, dt), THREE.MathUtils.damp(bg.z, w[2], 4, dt));
    u.uDpr.value = gl.getPixelRatio();

    /* Pointer on the icon plane, and its velocity. */
    S.plPrev.copy(S.pl);
    S.plOk = I.inside && pointerLocal(S.pl);
    if (S.plOk) {
      tmp.copy(S.pl).sub(S.plPrev).divideScalar(Math.max(rawDt, 1 / 120));
      if (tmp.lengthSq() < 90000) S.pv.lerp(tmp, 0.25);
    }

    /* Press: grab an artifact under the pointer, else the particles around it. */
    if (I.press) {
      I.press = false;
      if (pointerLocal(S.pl)) {
        S.plOk = true;
        S.plPrev.copy(S.pl);
        S.pv.set(0, 0, 0);
        let best = -1;
        let bestD = 46;
        O.forEach((o, i) => {
          tmp2.copy(o.pos).applyMatrix4(g.matrixWorld).project(camera);
          const d = Math.hypot(((tmp2.x - I.ndc.x) * size.width) / 2, ((tmp2.y - I.ndc.y) * size.height) / 2);
          if (d < bestD) {
            bestD = d;
            best = i;
          }
        });
        if (best >= 0) {
          S.grabbing = "orbiter";
          S.grabOrbiter = best;
          O[best].grabbed = true;
        } else {
          // Judge by where particles belong (hovering pushes them away from the cursor),
          // and take a generous chunk so it feels like grabbing part of the icon.
          const R2 = (S.scale * 0.34) ** 2;
          let c = 0;
          for (let i = 0; i < N; i++) {
            const dx = P.home[i * 3] - S.pl.x;
            const dyy = P.home[i * 3 + 1] - S.pl.y;
            if (dx * dx + dyy * dyy < R2) {
              P.grabbed[i] = 1;
              P.off[i * 2] = dx * 0.55;
              P.off[i * 2 + 1] = dyy * 0.55;
              c++;
            }
          }
          if (c > 20 && S.s < 0.35) S.grabbing = "particles";
          else P.grabbed.fill(0);
        }
      }
    }

    /* Release: throw what was held (a plain click on the icon still bursts it). */
    if (I.release) {
      I.release = false;
      if (S.grabbing === "orbiter") {
        const o = O[S.grabOrbiter];
        o.grabbed = false;
        o.vel.copy(S.pv).multiplyScalar(1.5);
        o.spin.set(S.pv.y, S.pv.x, S.pv.length() * 0.3).multiplyScalar(0.45);
        o.free = 1.2;
      } else if (S.grabbing === "particles") {
        for (let i = 0; i < N; i++) {
          if (!P.grabbed[i]) continue;
          const f = 1.2 + P.loose[i] * 0.8;
          P.vel[i * 3] = S.pv.x * f + (P.loose[i] - 0.78) * 4;
          P.vel[i * 3 + 1] = S.pv.y * f + (P.phase[i] / Math.PI - 1) * 2;
          P.vel[i * 3 + 2] = (P.loose[i] - 0.75) * 8;
          P.free[i] = 0.9 + P.loose[i] * 0.6;
        }
        P.grabbed.fill(0);
      }
      if (I.dragged) I.burst = false;
      S.grabbing = "";
    }

    /* Burst from the click point. */
    if (I.burst) {
      I.burst = false;
      if (!still && pointerLocal(tmp)) {
        const bx = tmp.x;
        const by = tmp.y;
        const sig2 = (S.scale * 1.1) ** 2;
        for (let i = 0; i < N; i++) {
          const dx = P.pos[i * 3] - bx;
          const dyy = P.pos[i * 3 + 1] - by;
          const d2 = dx * dx + dyy * dyy;
          const d = Math.sqrt(d2) + 0.05;
          const near = Math.exp(-d2 / sig2);
          const f = (6 + 30 * near) * (0.6 + P.loose[i] * 0.6);
          P.vel[i * 3] += (dx / d) * f;
          P.vel[i * 3 + 1] += (dyy / d) * f;
          P.vel[i * 3 + 2] += (P.loose[i] - 0.7) * 20 * near;
          P.free[i] = Math.max(P.free[i], 0.25 + near * 0.9);
        }
        O.forEach((o) => {
          const dx = o.pos.x - bx;
          const dyy = o.pos.y - by;
          const d = Math.hypot(dx, dyy) + 0.1;
          o.vel.x += (dx / d) * 16;
          o.vel.y += (dyy / d) * 16;
          o.free = 0.8;
          o.spin.set((Math.random() - 0.5) * 12, (Math.random() - 0.5) * 12, (Math.random() - 0.5) * 6);
        });
      }
    }

    /* Particles: springs toward home, loosened toward the scatter spots by scroll speed. */
    const gx = g.position.x;
    const gy = g.position.y;
    const pos = P.pos;
    const vel = P.vel;
    const hoverR2 = (S.scale * 0.18) ** 2;
    const hover = S.plOk && !S.grabbing && !mobile;
    let near = 0;
    for (let i = 0; i < N; i++) {
      const i3 = i * 3;
      if (P.grabbed[i]) {
        // Each held particle follows at its own pace, so the chunk trails like a comet.
        const f = Math.min(1, dt * (8 + 16 * P.loose[i]));
        pos[i3] += (S.pl.x + P.off[i * 2] - pos[i3]) * f;
        pos[i3 + 1] += (S.pl.y + P.off[i * 2 + 1] - pos[i3 + 1]) * f;
        pos[i3 + 2] += (0 - pos[i3 + 2]) * Math.min(1, dt * 8);
        continue;
      }
      const sl = s * P.loose[i];
      const sh = still ? 0 : 0.003 * S.scale * (1 - s);
      const hx = P.home[i3] + Math.sin(t * 1.3 + P.phase[i]) * sh;
      const hy = P.home[i3 + 1] + Math.cos(t * 1.1 + P.phase[i]) * sh;
      const tx = hx + ((P.scat[i3] - gx) / grow - hx) * sl;
      const ty = hy + ((P.scat[i3 + 1] - gy) / grow - hy) * sl;
      const tz = P.home[i3 + 2] + (P.scat[i3 + 2] - PLANE_Z - P.home[i3 + 2]) * sl;
      let k = P.k[i];
      let c = 2 * Math.sqrt(k) * 0.72;
      if (P.free[i] > 0) {
        P.free[i] -= dt;
        const soft = Math.min(1, Math.max(0, P.free[i]) / 0.5);
        k *= 1 - 0.93 * soft;
        c = 2 * Math.sqrt(k) * 0.72 + 1.1 * soft;
      }
      let ax = (tx - pos[i3]) * k - vel[i3] * c;
      let ay = (ty - pos[i3 + 1]) * k - vel[i3 + 1] * c;
      const az = (tz - pos[i3 + 2]) * k - vel[i3 + 2] * c;
      if (hover) {
        const dx = pos[i3] - S.pl.x;
        const dyy = pos[i3 + 1] - S.pl.y;
        const d2 = dx * dx + dyy * dyy;
        const hdx = P.home[i3] - S.pl.x;
        const hdy = P.home[i3 + 1] - S.pl.y;
        if (hdx * hdx + hdy * hdy < hoverR2 * 2.5) near++;
        if (d2 < hoverR2) {
          const d = Math.sqrt(d2) + 0.02;
          const f = (1 - d2 / hoverR2) * 70;
          ax += (dx / d) * f;
          ay += (dyy / d) * f;
        }
      }
      vel[i3] += ax * dt;
      vel[i3 + 1] += ay * dt;
      vel[i3 + 2] += az * dt;
      pos[i3] += vel[i3] * dt;
      pos[i3 + 1] += vel[i3 + 1] * dt;
      pos[i3 + 2] += vel[i3 + 2] * dt;
    }
    P.attr.needsUpdate = true;

    /* Tell the cursor the icon can be grabbed here. */
    const overUi = !!I.target?.closest(INTERACTIVE);
    const hint = mobile ? "" : S.grabbing ? "throw" : near > 20 && s < 0.35 && !overUi ? "drag" : "";
    if (hint !== S.lastHint) {
      S.lastHint = hint;
      if (hint) document.documentElement.dataset.bghint = hint;
      else delete document.documentElement.dataset.bghint;
    }

    /* Orbiters: a tilted ring around the icon; they fly out with the scatter and can be thrown. */
    S.orbit += dt * (still ? 0 : 0.16);
    const R = S.scale * 1.32;
    O.forEach((o, i) => {
      const og = orbitRefs.current[i];
      if (!og) return;
      if (o.grabbed && S.plOk) {
        o.pos.lerp(tmp.set(S.pl.x, S.pl.y, 0.6), Math.min(1, dt * 16));
        o.vel.set(0, 0, 0);
      } else {
        const a = S.orbit + (i / O.length) * Math.PI * 2;
        const hx = Math.cos(a) * R;
        const hy = Math.sin(a) * R * 0.42 + Math.sin(t * 0.7 + o.phase) * 0.15;
        const hz = Math.sin(a) * R * 0.55;
        const sl = s * 0.9;
        const tx = hx + ((o.scat.x - gx) / grow - hx) * sl;
        const ty = hy + ((o.scat.y - gy) / grow - hy) * sl;
        const tz = hz + (o.scat.z - PLANE_Z - hz) * sl;
        o.free = Math.max(0, o.free - dt);
        const k = 7 * (1 - 0.85 * Math.min(1, o.free / 0.5));
        const c = 2 * Math.sqrt(k) * 0.6 + 0.8 * Math.min(1, o.free / 0.5);
        o.vel.x += ((tx - o.pos.x) * k - o.vel.x * c) * dt;
        o.vel.y += ((ty - o.pos.y) * k - o.vel.y * c) * dt;
        o.vel.z += ((tz - o.pos.z) * k - o.vel.z * c) * dt;
        o.pos.addScaledVector(o.vel, dt);
      }
      // Spin decays back to a gentle idle turn.
      o.spin.multiplyScalar(Math.exp(-dt * 1.4));
      const idle = still ? 0 : 1;
      o.rot.x += (o.spin.x + Math.sin(t * 0.5 + o.phase) * 0.15 * idle) * dt;
      o.rot.y += (o.spin.y + 0.25 * idle) * dt;
      o.rot.z += o.spin.z * dt;
      og.position.copy(o.pos);
      og.rotation.copy(o.rot);
      og.scale.setScalar(o.base * (mobile ? 0.85 : 1));
    });
  });

  return (
    <group ref={group}>
      <primitive object={P.points} />
      {O.map((o, i) => (
        <group key={i} ref={(el) => { orbitRefs.current[i] = el; }}>
          <Artifact kind={o.kind} color={o.color} tex={tex} />
        </group>
      ))}
    </group>
  );
}

export default function Artifacts3D() {
  const [ready, setReady] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [still, setStill] = useState(false);
  const path = usePathname();

  useEffect(() => {
    setMobile(window.matchMedia("(max-width: 720px)").matches);
    setStill(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    setReady(true);
  }, []);

  if (!ready) return null;
  return (
    <div className="artifacts" aria-hidden>
      <Canvas
        dpr={mobile ? [1, 1.5] : [1, 2]}
        camera={{ fov: 38, position: [0, 0, CAM_Z], near: 0.1, far: 80 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <ambientLight intensity={0.55} />
        <directionalLight position={[6, 10, 8]} intensity={1.5} />
        <Environment resolution={128} frames={1}>
          <Lightformer intensity={2} position={[0, 6, 6]} scale={[14, 4, 1]} />
          <Lightformer intensity={1.2} color={TAN} position={[8, -2, 4]} rotation-y={-Math.PI / 2} scale={[10, 4, 1]} />
          <Lightformer intensity={0.8} color={PAPER} position={[-8, 0, 4]} rotation-y={Math.PI / 2} scale={[10, 4, 1]} />
        </Environment>
        <Field mobile={mobile} still={still} path={path} />
      </Canvas>
    </div>
  );
}
