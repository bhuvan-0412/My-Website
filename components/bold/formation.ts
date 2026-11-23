/**
 * Shared, mutable scene state written by the page (scroll) and read by the 3D layer every frame.
 * A plain object avoids re-rendering React on every scroll tick.
 */
export const scene = {
  /** 0 = artifacts float freely, 1 = they line up into a roadmap. */
  formation: 0,
  /** Page scroll in pixels (smoothed by Lenis on desktop). */
  scroll: 0,
  /** 0..1 burst used by page transitions to scatter the artifacts. */
  burst: 0,
};
