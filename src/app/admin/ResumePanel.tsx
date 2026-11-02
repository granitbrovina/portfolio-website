"use client";

import { useEffect, useState } from "react";
import { newId, type Content } from "@/lib/schema";
import { Field, ItemTools, move, type Update } from "./ui";

export default function ResumePanel({ content, update }: { content: Content; update: Update }) {
  const variants = content.resume.variants;
  const [selected, setSelected] = useState<string>(variants[0]?.id ?? "");
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => () => { if (pdfUrl) URL.revokeObjectURL(pdfUrl); }, [pdfUrl]);

  async function generate(download: boolean) {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, variant: selected || null }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || `Could not generate the PDF (${res.status}).`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      if (download) {
        const a = document.createElement("a");
        const variantLabel = variants.find((v) => v.id === selected)?.label || "Resume";
        a.href = url;
        a.download = `${(content.basics.name || "Resume").replace(/\s+/g, "_")}_${variantLabel.replace(/[^\w]+/g, "_")}.pdf`;
        a.click();
      }
      setPdfUrl((old) => {
        if (old) URL.revokeObjectURL(old);
        return url;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not generate the PDF.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="adm-panel">
      <div className="adm-section-head">
        <div>
          <h2>Resume variants</h2>
          <p className="adm-muted">
            Each variant prints the same site content with its own headline and summary. Items tagged for a variant in the
            other tabs appear only on that variant; untagged items appear on all of them.
          </p>
        </div>
        <button
          type="button"
          className="adm-btn"
          onClick={() => update((d) => { d.resume.variants.push({ id: `variant-${newId().slice(0, 4)}`, label: "New variant", headline: "", summary: "" }); })}
        >
          Add variant
        </button>
      </div>

      <div className="adm-list">
        {variants.map((v, i) => (
          <div className="adm-item" key={`${v.id}-${i}`}>
            <ItemTools
              index={i}
              count={variants.length}
              label={v.label || "variant"}
              onMove={(to) => update((d) => move(d.resume.variants, i, to))}
              onRemove={() => update((d) => {
                const removed = d.resume.variants[i].id;
                d.resume.variants.splice(i, 1);
                if (d.resume.publicVariant === removed) d.resume.publicVariant = "";
              })}
            />
            <div className="adm-grid two">
              <Field id={`v-${i}-label`} label="Name" value={v.label} onChange={(val) => update((d) => { d.resume.variants[i].label = val; })} />
              <Field
                id={`v-${i}-id`}
                label="Short ID"
                value={v.id}
                hint="Used in tags and links. Letters, numbers and dashes."
                onChange={(val) => update((d) => {
                  const next = val.toLowerCase().replace(/[^a-z0-9-]/g, "");
                  const prev = d.resume.variants[i].id;
                  if (!next) return;
                  d.resume.variants[i].id = next;
                  // keep every tag pointing at the renamed variant
                  const retag = (list: string[]) => list.map((t) => (t === prev ? next : t));
                  d.experience.forEach((e) => { e.variants = retag(e.variants); e.bullets.forEach((b) => { b.variants = retag(b.variants); }); });
                  d.projects.forEach((p) => { p.variants = retag(p.variants); });
                  d.skills.forEach((s) => { s.variants = retag(s.variants); });
                  if (d.resume.publicVariant === prev) d.resume.publicVariant = next;
                })}
              />
            </div>
            <Field id={`v-${i}-headline`} label="Headline" value={v.headline} onChange={(val) => update((d) => { d.resume.variants[i].headline = val; })} />
            <Field id={`v-${i}-summary`} label="Summary" value={v.summary} multiline rows={3} onChange={(val) => update((d) => { d.resume.variants[i].summary = val; })} />
          </div>
        ))}
      </div>

      <div className="adm-section-head">
        <div>
          <h2>Public download</h2>
          <p className="adm-muted">Adds a &ldquo;Resume (PDF)&rdquo; button to the site that always prints your latest saved content.</p>
        </div>
      </div>
      <label className="adm-field" htmlFor="public-variant">
        <span className="adm-label">Variant offered on the site</span>
        <select
          id="public-variant"
          value={content.resume.publicVariant}
          onChange={(e) => update((d) => { d.resume.publicVariant = e.target.value; })}
        >
          <option value="">No public download</option>
          <option value="*">Everything (no filtering)</option>
          {variants.map((v) => <option key={v.id} value={v.id}>{v.label || v.id}</option>)}
        </select>
      </label>

      <div className="adm-section-head">
        <div>
          <h2>Generate</h2>
          <p className="adm-muted">Uses what&apos;s in the editor right now, including unsaved changes.</p>
        </div>
      </div>
      <div className="adm-row">
        <label className="adm-field inline" htmlFor="gen-variant">
          <span className="adm-label">Variant</span>
          <select id="gen-variant" value={selected} onChange={(e) => setSelected(e.target.value)}>
            <option value="">Everything (no filtering)</option>
            {variants.map((v) => <option key={v.id} value={v.id}>{v.label || v.id}</option>)}
          </select>
        </label>
        <button type="button" className="adm-btn" disabled={busy} onClick={() => generate(false)}>
          {busy ? "Generating…" : "Preview"}
        </button>
        <button type="button" className="adm-btn primary" disabled={busy} onClick={() => generate(true)}>
          Download PDF
        </button>
      </div>
      {error && <p className="adm-error">{error}</p>}
      {pdfUrl && <iframe className="adm-pdf" src={pdfUrl} title="Resume preview" />}
    </section>
  );
}
