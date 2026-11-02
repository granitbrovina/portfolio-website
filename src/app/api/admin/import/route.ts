import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { put } from "@vercel/blob";
import { requireAdmin } from "@/auth";
import { ContentSchema } from "@/lib/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_BYTES = 4 * 1024 * 1024;

const SHAPE = `{
  "basics": { "name": "", "headline": "", "summary": "", "location": "", "email": "", "phone": "", "linkedin": "", "github": "", "website": "" },
  "experience": [ { "role": "", "company": "", "location": "", "start": "", "end": "", "summary": "", "bullets": [ { "text": "" } ] } ],
  "projects": [ { "name": "", "kind": "", "description": "", "tags": [""], "url": "" } ],
  "skills": [ { "group": "", "items": "comma-separated skills" } ],
  "education": [ { "institution": "", "program": "", "location": "", "start": "", "end": "", "note": "" } ],
  "certifications": [ { "name": "", "issuer": "", "date": "", "url": "" } ],
  "languages": [ { "name": "", "level": "" } ]
}`;

const PROMPT = `Extract the information in this resume into JSON with exactly this shape:

${SHAPE}

Rules:
- Copy facts as written. Do not invent, embellish, infer or upgrade anything.
- Education: put the degree in "program" only if the resume states it. Keep dates exactly as written.
- "end" is "" for a current role. Dates stay in the resume's own format (e.g. "2021" or "Mar 2021").
- "headline" is the resume's title line under the name, if any. "summary" is its profile/summary paragraph, if any.
- Bullets: one entry per bullet, text only, no leading bullet characters.
- Skills: keep the resume's own groups; if ungrouped, use a single group named "Skills".
- Omit sections that are not present by returning an empty array (or "" for fields).
- Respond with the JSON object only, no commentary and no code fences.`;

export async function POST(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "Importing is disabled: ANTHROPIC_API_KEY is not set." }, { status: 503 });
  }

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Choose a PDF file first." }, { status: 400 });
  if (file.type && file.type !== "application/pdf") {
    return NextResponse.json({ error: "That file isn't a PDF." }, { status: 415 });
  }
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "The PDF is larger than 4 MB." }, { status: 413 });

  const bytes = Buffer.from(await file.arrayBuffer());
  if (bytes.subarray(0, 5).toString("latin1") !== "%PDF-") {
    return NextResponse.json({ error: "That file isn't a valid PDF." }, { status: 415 });
  }

  // Keep a copy of the uploaded original when Blob storage is connected.
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      await put(`resume-imports/${Date.now()}.pdf`, bytes, {
        access: "public",
        addRandomSuffix: true,
        contentType: "application/pdf",
      });
    } catch (err) {
      console.error("Could not store the uploaded PDF in Blob storage.", err);
    }
  }

  let text = "";
  try {
    const client = new Anthropic();
    const message = await client.messages.create({
      model: process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5",
      max_tokens: 8000,
      messages: [
        {
          role: "user",
          content: [
            { type: "document", source: { type: "base64", media_type: "application/pdf", data: bytes.toString("base64") } },
            { type: "text", text: PROMPT },
          ],
        },
      ],
    });
    text = message.content
      .map((block) => (block.type === "text" ? block.text : ""))
      .join("")
      .trim();
  } catch (err) {
    console.error("Anthropic request failed.", err);
    const msg = err instanceof Error ? err.message : "";
    return NextResponse.json({ error: `The PDF could not be read right now. ${msg}`.trim() }, { status: 502 });
  }

  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end <= start) {
    return NextResponse.json({ error: "Couldn't find resume details in that PDF." }, { status: 422 });
  }

  let raw: unknown;
  try {
    raw = JSON.parse(text.slice(start, end + 1));
  } catch {
    return NextResponse.json({ error: "The PDF was read, but the result couldn't be parsed. Try again." }, { status: 422 });
  }

  // Normalise into the site schema (fills ids and defaults). Imported items start untagged.
  const parsed = ContentSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "The PDF was read, but some details didn't fit the site's fields." }, { status: 422 });
  }
  return NextResponse.json({ proposal: parsed.data });
}
