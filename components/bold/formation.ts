/**
 * Shared, mutable scene state written by the page and read by the 3D layer every frame.
 * A plain object avoids re-rendering React.
 */
export const scene = {
  /** Set to 1 on a page change; the background icon scatters a little, then regroups. */
  burst: 0,
};
