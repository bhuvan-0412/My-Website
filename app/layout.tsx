import type { Metadata, Viewport } from "next";
import { Anybody, Figtree, Martian_Mono } from "next/font/google";
import { site } from "@/data/site";
import "./globals.css";

const display = Anybody({ subsets: ["latin"], variable: "--font-display", axes: ["wdth"] });
const body = Figtree({ subsets: ["latin"], variable: "--font-body" });
const mono = Martian_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: `${site.name} · AI products & product management`,
  description: `${site.headline} Open to internships in product management, Python, AI engineering and software development.`,
};

export const viewport: Viewport = {
  themeColor: "#0f3d2e",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
