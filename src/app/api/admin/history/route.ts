import { NextResponse } from "next/server";
import { requireAdmin } from "@/auth";
import { getHistoryVersion, listHistory } from "@/lib/db";

export const dynamic = "force-dynamic";

/** GET → list of saved versions. GET ?id=12 → that version's content. */
export async function GET(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const id = new URL(req.url).searchParams.get("id");
  if (id) {
    const content = await getHistoryVersion(Number(id));
    if (!content) return NextResponse.json({ error: "That version no longer exists." }, { status: 404 });
    return NextResponse.json({ content });
  }
  return NextResponse.json({ versions: await listHistory() });
}
