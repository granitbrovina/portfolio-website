import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getContent } from "@/lib/db";
import { THEMES, THEME_IDS, type ThemeId } from "@/lib/schema";
import ThemeView from "../../themes/ThemeView";

// Always shows the latest saved content in the requested theme, without changing the live site.
export const dynamic = "force-dynamic";
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function Preview({ params }: { params: Promise<{ theme: string }> }) {
  const { theme } = await params;
  if (!(THEME_IDS as readonly string[]).includes(theme)) notFound();
  const { content } = await getContent();
  const current = THEMES.find((t) => t.id === theme)!;

  return (
    <>
      <div className="preview-bar" role="status">
        <span><strong>Preview:</strong> {current.label}{content.theme === theme ? " (this is the live theme)" : " (not live)"}</span>
        <span className="preview-links">
          {THEMES.map((t) => (
            <a key={t.id} href={`/preview/${t.id}`} aria-current={t.id === theme ? "page" : undefined}>{t.label}</a>
          ))}
        </span>
      </div>
      <ThemeView content={content} theme={theme as ThemeId} />
    </>
  );
}
