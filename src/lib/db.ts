import { neon } from "@neondatabase/serverless";
import { ContentSchema, type Content } from "./schema";
import { seedContent } from "./seed";

type Sql = ReturnType<typeof neon>;

let schemaReady: Promise<void> | null = null;

/** Cache tag for every read of the site content. Saving calls revalidateTag(CONTENT_TAG). */
export const CONTENT_TAG = "site-content";

/**
 * Neon talks to Postgres over fetch(), and Next.js caches fetch responses in its Data Cache.
 * Reads of the site content are tagged so a save can invalidate them everywhere at once
 * (homepage, layout metadata, favicon, photo, resume). Everything else skips the cache.
 */
function connection(mode: "content" | "fresh" = "fresh"): Sql | null {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!url) return null;
  const fetchOptions = (mode === "content" ? { next: { tags: [CONTENT_TAG] } } : { cache: "no-store" }) as RequestInit;
  return neon(url, { fetchOptions });
}

/** Creates the two tables on first use, so a fresh deploy needs no migration step. */
async function ensureSchema(sql: Sql): Promise<void> {
  if (!schemaReady) {
    schemaReady = (async () => {
      await sql`CREATE TABLE IF NOT EXISTS site_content (
        id text PRIMARY KEY,
        data jsonb NOT NULL,
        updated_at timestamptz NOT NULL DEFAULT now()
      )`;
      await sql`CREATE TABLE IF NOT EXISTS site_content_history (
        id serial PRIMARY KEY,
        data jsonb NOT NULL,
        note text NOT NULL DEFAULT '',
        created_at timestamptz NOT NULL DEFAULT now()
      )`;
    })().catch((err) => {
      schemaReady = null;
      throw err;
    });
  }
  return schemaReady;
}

export function hasDatabase(): boolean {
  return connection() !== null;
}

/** Current site content. Falls back to the seed if the database is missing, empty or unreachable. */
export async function getContent(): Promise<{ content: Content; updatedAt: string | null; source: "db" | "seed" }> {
  const sql = connection("content");
  if (!sql) return { content: seedContent, updatedAt: null, source: "seed" };
  try {
    await ensureSchema(sql);
    const rows = (await sql`SELECT data, updated_at FROM site_content WHERE id = 'main'`) as {
      data: unknown;
      updated_at: string;
    }[];
    if (rows.length === 0) return { content: seedContent, updatedAt: null, source: "seed" };
    const parsed = ContentSchema.safeParse(rows[0].data);
    if (!parsed.success) {
      console.error("Stored content failed validation; serving seed.", parsed.error.flatten());
      return { content: seedContent, updatedAt: null, source: "seed" };
    }
    return { content: parsed.data, updatedAt: String(rows[0].updated_at), source: "db" };
  } catch (err) {
    console.error("Database read failed; serving seed.", err);
    return { content: seedContent, updatedAt: null, source: "seed" };
  }
}

/** Saves new content and keeps the previous version in history. */
export async function saveContent(content: Content, note: string): Promise<string> {
  const sql = connection();
  if (!sql) throw new Error("DATABASE_URL is not set, so changes cannot be saved.");
  await ensureSchema(sql);
  const json = JSON.stringify(content);
  await sql`INSERT INTO site_content_history (data, note) VALUES (${json}::jsonb, ${note})`;
  const rows = (await sql`
    INSERT INTO site_content (id, data, updated_at) VALUES ('main', ${json}::jsonb, now())
    ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = now()
    RETURNING updated_at
  `) as { updated_at: string }[];
  // Keep the newest 50 versions.
  await sql`DELETE FROM site_content_history WHERE id NOT IN (
    SELECT id FROM site_content_history ORDER BY id DESC LIMIT 50
  )`;
  return String(rows[0].updated_at);
}

export type HistoryEntry = { id: number; note: string; createdAt: string };

export async function listHistory(): Promise<HistoryEntry[]> {
  const sql = connection();
  if (!sql) return [];
  await ensureSchema(sql);
  const rows = (await sql`SELECT id, note, created_at FROM site_content_history ORDER BY id DESC LIMIT 50`) as {
    id: number;
    note: string;
    created_at: string;
  }[];
  return rows.map((r) => ({ id: r.id, note: r.note, createdAt: String(r.created_at) }));
}

export async function getHistoryVersion(versionId: number): Promise<Content | null> {
  const sql = connection();
  if (!sql) return null;
  await ensureSchema(sql);
  const rows = (await sql`SELECT data FROM site_content_history WHERE id = ${versionId}`) as { data: unknown }[];
  if (rows.length === 0) return null;
  const parsed = ContentSchema.safeParse(rows[0].data);
  return parsed.success ? parsed.data : null;
}
