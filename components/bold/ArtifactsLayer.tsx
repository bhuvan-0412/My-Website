"use client";

import dynamic from "next/dynamic";

// The 3D layer is client-only and loads after the page, so text paints first.
const Artifacts3D = dynamic(() => import("./Artifacts3D"), { ssr: false });

export default function ArtifactsLayer() {
  return <Artifacts3D />;
}
