import { NextResponse } from "next/server";
import { requireAdmin } from "@/auth";
import { getContent } from "@/lib/db";
import { renderResumePdf } from "@/lib/resume-pdf";
import { ALL_VARIANTS, ContentSchema } from "@/lib/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function pdfResponse(buf: Buffer, filename: string, inline: boolean, cacheable = false) {
  return new Response(new Uint8Array(buf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${inline ? "inline" : "attachment"}; filename="${filename}"`,
      "Cache-Control": cacheable ? "public, max-age=0, s-maxage=60" : "private, no-store",
    },
  });
}

function fileName(name: string, label: string): string {
  return `${(name || "Resume").replace(/[^\w]+/g, "_")}${label ? `_${label.replace(/[^\w]+/g, "_")}` : ""}.pdf`;
}

/**
 * GET /api/resume?variant=data
 * Public: serves only the variant chosen as the site's public download,
 * printed from the latest saved content. The signed-in admin can fetch any variant.
 */
export async function GET(req: Request) {
  const requested = new URL(req.url).searchParams.get("variant") || "";
  const { content } = await getContent();
  const pub = content.resume.publicVariant;
  // "all" asks for the unfiltered resume; it is public only when the admin chose "Everything".
  const isAll = requested === "all";
  const isPublic = Boolean(requested) && (isAll ? pub === ALL_VARIANTS : requested === pub);
  if (!isPublic && !(await requireAdmin())) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  const variant = isAll ? null : requested || null;
  const label = content.resume.variants.find((v) => v.id === variant)?.label ?? "";
  const buf = await renderResumePdf(content, variant);
  return pdfResponse(buf, fileName(content.basics.name, label), true, Boolean(isPublic));
}

/** POST { content, variant } — admin only. Prints unsaved editor content for preview/download. */
export async function POST(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const body = (await req.json().catch(() => null)) as { content?: unknown; variant?: unknown } | null;
  const parsed = ContentSchema.safeParse(body?.content);
  if (!parsed.success) return NextResponse.json({ error: "The editor content is invalid." }, { status: 422 });
  const variant = typeof body?.variant === "string" && body.variant ? body.variant : null;
  const label = parsed.data.resume.variants.find((v) => v.id === variant)?.label ?? "";
  const buf = await renderResumePdf(parsed.data, variant);
  return pdfResponse(buf, fileName(parsed.data.basics.name, label), false);
}
