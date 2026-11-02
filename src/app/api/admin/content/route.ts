import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/auth";
import { CONTENT_TAG, getContent, saveContent } from "@/lib/db";
import { ContentSchema } from "@/lib/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const result = await getContent();
  return NextResponse.json(result);
}

export async function PUT(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  let body: { content?: unknown; note?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "The request was not valid JSON." }, { status: 400 });
  }

  const parsed = ContentSchema.safeParse(body.content);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Some fields are invalid.", issues: parsed.error.issues.slice(0, 10) },
      { status: 422 },
    );
  }

  try {
    const note = typeof body.note === "string" && body.note.trim() ? body.note.trim().slice(0, 200) : "Saved from admin";
    const updatedAt = await saveContent(parsed.data, note);
    revalidateTag(CONTENT_TAG);
    revalidatePath("/", "layout");
    return NextResponse.json({ ok: true, updatedAt });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Save failed." }, { status: 500 });
  }
}
