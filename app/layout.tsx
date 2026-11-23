import type { Metadata, Viewport } from "next";
import { Big_Shoulders, Figtree, JetBrains_Mono } from "next/font/google";
import { site } from "@/data/site";
import SmoothScroll from "@/components/SmoothScroll";
import Header from "@/components/bold/Header";
import Footer from "@/components/bold/Footer";
import ArtifactsLayer from "@/components/bold/ArtifactsLayer";
import Backdrop from "@/components/bold/Backdrop";
import Cursor from "@/components/bold/Cursor";
import PageExit from "@/components/bold/PageExit";
import Preloader from "@/components/bold/Preloader";
import "./globals.css";

const display = Big_Shoulders({ subsets: ["latin"], variable: "--font-display", weight: ["700", "800", "900"], adjustFontFallback: false });
const body = Figtree({ subsets: ["latin"], variable: "--font-body" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: { default: `${site.name} · I build AI products, and I think like a PM`, template: `%s · ${site.name}` },
  description: `${site.headline} Open to internships in product management, Python, AI engineering and software development.`,
};

export const viewport: Viewport = {
  themeColor: "#0d1321",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>
        <SmoothScroll />
        <Header />
        <Backdrop />
        <ArtifactsLayer />
        <main id="top">{children}</main>
        <Footer />
        <Cursor />
        <PageExit />
        <Preloader />
      </body>
    </html>
  );
}
