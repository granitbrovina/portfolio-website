"use client";

import { useEffect, useState } from "react";
import { ContentSchema, type Content } from "@/lib/schema";
import { formatDate } from "./ui";

type Version = { id: number; note: string; createdAt: string };

export default function HistoryPanel({
  content,
  onLoad,
}: {
  content: Content;
  onLoad: (c: Content, source: "history" | "file") => void;
}) {
  const [versions, setVersions] = useState<Version[] | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/admin/history")
      .then(async (r) => {
        const d = (await r.json()) as { versions?: Version[]; error?: string };
        if (!r.ok) throw new Error(d.error || "Could not load history.");
        setVersions(d.versions ?? []);
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Could not load history."));
  }, []);

  async function load(id: number) {
    setLoading(id);
    setError("");
    try {
      const r = await fetch(`/api/admin/history?id=${id}`);
      const d = (await r.json()) as { content?: Content; error?: string };
      if (!r.ok || !d.content) throw new Error(d.error || "Could not load that version.");
      onLoad(d.content, "history");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load that version.");
    } finally {
      setLoading(null);
    }
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify(content, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const day = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `portfolio-content-${day}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function importJson(file: File | undefined) {
    setError("");
    if (!file) return;
    try {
      const parsed = ContentSchema.safeParse(JSON.parse(await file.text()));
      if (!parsed.success) throw new Error("That file isn't a portfolio backup.");
      onLoad(parsed.data, "file");
    } catch (e) {
      setError(e instanceof Error && e.message.includes("backup") ? e.message : "That file isn't valid JSON.");
    }
  }

  return (
    <section className="adm-panel">
      <div className="adm-section-head">
        <div>
          <h2>Backup</h2>
          <p className="adm-muted">
            Download everything in the editor as a JSON file, or load a backup back in. Loading only fills the editor;
            the site changes when you save.
          </p>
        </div>
      </div>
      <div className="adm-row">
        <button type="button" className="adm-btn primary" onClick={exportJson}>Export JSON</button>
        <label className="adm-field inline" htmlFor="backup-file">
          <span className="adm-label">Load a backup</span>
          <input id="backup-file" type="file" accept="application/json,.json" onChange={(e) => { importJson(e.target.files?.[0]); e.target.value = ""; }} />
        </label>
      </div>

      <div className="adm-section-head">
        <div>
          <h2>History</h2>
          <p className="adm-muted">Every save is kept (newest 50). Loading a version puts it in the editor; nothing changes on the site until you save.</p>
        </div>
      </div>
      {error && <p className="adm-error">{error}</p>}
      {versions === null && !error && <p className="adm-muted">Loading…</p>}
      {versions?.length === 0 && <p className="adm-muted">No saved versions yet.</p>}
      {versions && versions.length > 0 && (
        <ol className="adm-history">
          {versions.map((v, i) => (
            <li key={v.id}>
              <div>
                <strong>{formatDate(v.createdAt)}</strong>
                {i === 0 && <span className="adm-pill">Live</span>}
                <div className="adm-muted">{v.note}</div>
              </div>
              <button type="button" className="adm-btn small" disabled={loading !== null} onClick={() => load(v.id)}>
                {loading === v.id ? "Loading…" : "Load into editor"}
              </button>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
