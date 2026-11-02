import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Bricolage_Grotesque, IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import { getContent } from "@/lib/db";
import { faviconVersion } from "@/lib/schema";
import { stripLinks } from "@/lib/richtext";
import "./globals.css";

const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const body = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-body", display: "swap" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono", display: "swap" });

export async function generateMetadata(): Promise<Metadata> {
  const { content } = await getContent();
  const b = content.basics;
  const v = faviconVersion(content);
  const title = b.name || "Portfolio";
  const description = [b.headline, b.location].filter(Boolean).join(" · ") || stripLinks(b.summary);
  return {
    title,
    description,
    metadataBase: b.website ? new URL(b.website) : undefined,
    openGraph: { title, description, type: "profile", url: b.website || undefined },
    icons: {
      icon: `/api/favicon?size=64&v=${v}`,
      apple: `/api/favicon?size=180&v=${v}`,
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F2F3EF" },
    { media: "(prefers-color-scheme: dark)", color: "#111614" },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
