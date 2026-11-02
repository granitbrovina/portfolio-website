import { ImageResponse } from "next/og";
import { getContent } from "@/lib/db";
import { initials } from "@/lib/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Serves the site icon. Also answers /favicon.ico (see next.config.ts).
 *   ?size=180  → pixel size for generated monograms (16–512, default 64)
 *   ?v=<hash>  → cache-busting version; versioned URLs are cached for a year
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const size = Math.min(512, Math.max(16, Number(url.searchParams.get("size")) || 64));
  const cache = url.searchParams.has("v")
    ? "public, max-age=31536000, immutable"
    : "public, max-age=3600, s-maxage=3600";

  const { content } = await getContent();
  const b = content.branding;

  if (b.faviconMode === "image" && b.faviconImage) {
    const match = b.faviconImage.match(/^data:([^;]+);base64,(.+)$/);
    if (match) {
      return new Response(new Uint8Array(Buffer.from(match[2], "base64")), {
        headers: {
          "Content-Type": match[1],
          "Cache-Control": cache,
          // An uploaded SVG is served as an image only, never as a page that can run script.
          "X-Content-Type-Options": "nosniff",
          "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox",
        },
      });
    }
  }

  const text = b.monogramText || initials(content.basics.name) || "•";
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: b.monogramBg,
          color: b.monogramFg,
          borderRadius: Math.round(size * 0.22),
          fontSize: Math.round(size * (text.length > 2 ? 0.36 : 0.48)),
          fontWeight: 700,
          letterSpacing: -Math.round(size * 0.02),
        }}
      >
        {text}
      </div>
    ),
    { width: size, height: size, headers: { "Cache-Control": cache } },
  );
}
