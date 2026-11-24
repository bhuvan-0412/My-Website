import { ImageResponse } from "next/og";

// The card LinkedIn, WhatsApp and X show when someone shares the site.
export const alt = "Bhuvan Thota: Find the problem. Build the solution. Ship it.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 64,
          background: "#0d1321",
          color: "#f2f4f7",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 28, fontWeight: 700 }}>
          <span>
            Bhuvan Thota<span style={{ color: "#ff6b2c" }}>.</span>
          </span>
          <span style={{ color: "#a9b3c7" }}>AI · Product · Software</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 92, fontWeight: 900, lineHeight: 0.95, letterSpacing: -2, textTransform: "uppercase" }}>
          <span>
            Find <span style={{ color: "#a9b3c7", marginLeft: 22 }}>the problem.</span>
          </span>
          <span>Build the solution.</span>
          <span style={{ color: "#ff6b2c" }}>Ship it.</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 28 }}>
          <span>BITS Pilani, Goa</span>
          <span style={{ color: "#ff6b2c" }}>Open to internships</span>
        </div>
      </div>
    ),
    size
  );
}
