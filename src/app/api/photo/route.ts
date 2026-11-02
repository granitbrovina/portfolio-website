import { getContent } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Serves the profile picture. ?v=<hash> URLs change with the photo, so they're cached for a year. */
export async function GET(req: Request) {
  const { content } = await getContent();
  const match = content.basics.photo.match(/^data:(image\/(?:jpeg|png|webp));base64,(.+)$/);
  if (!match) return new Response("Not found", { status: 404 });

  const versioned = new URL(req.url).searchParams.has("v");
  return new Response(new Uint8Array(Buffer.from(match[2], "base64")), {
    headers: {
      "Content-Type": match[1],
      "Cache-Control": versioned ? "public, max-age=31536000, immutable" : "public, max-age=3600, s-maxage=3600",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
