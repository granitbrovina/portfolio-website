"use client";

import { useState } from "react";
import { dateRange, type Basics, type Content } from "@/lib/schema";

type ListKey = "experience" | "projects" | "skills" | "education" | "certifications" | "languages";
type Mode = "keep" | "replace" | "append";

const LIST_SECTIONS: { key: ListKey; label: string }[] = [
  { key: "experience", label: "Experience" },
  { key: "projects", label: "Projects" },
  { key: "skills", label: "Skills" },
  { key: "education", label: "Education" },
  { key: "certifications", label: "Certifications" },
  { key: "languages", label: "Languages" },
];

const BASIC_FIELDS: { key: keyof Basics; label: string }[] = [
  { key: "name", label: "Name" },
  { key: "headline", label: "Role line" },
  { key: "summary", label: "Summary" },
  { key: "location", label: "Location" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone (resumes only)" },
  { key: "linkedin", label: "LinkedIn" },
  { key: "github", label: "GitHub" },
  { key: "website", label: "Website" },
];

function describe(key: ListKey, item: unknown): string {
  const i = item as Record<string, unknown>;
  switch (key) {
    case "experience":
      return [i.role, i.company, dateRange(String(i.start ?? ""), String(i.end ?? ""))].filter(Boolean).join(" · ") +
        (Array.isArray(i.bullets) ? ` (${i.bullets.length} bullets)` : "");
    case "projects":
      return String(i.name ?? "");
    case "skills":
      return `${i.group}: ${i.items}`;
    case "education":
      return [i.program, i.institution, dateRange(String(i.start ?? ""), String(i.end ?? ""))].filter(Boolean).join(" · ");
    case "certifications":
      return [i.name, i.issuer, i.date].filter(Boolean).join(" · ");
    case "languages":
      return [i.name, i.level].filter(Boolean).join(" · ");
  }
}

export default function ImportPanel({
  content,
  enabled,
  onApply,
}: {
  content: Content;
  enabled: boolean;
  onApply: (next: Content) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [proposal, setProposal] = useState<Content | null>(null);
  const [fields, setFields] = useState<Partial<Record<keyof Basics, boolean>>>({});
  const [modes, setModes] = useState<Record<ListKey, Mode>>({
    experience: "keep", projects: "keep", skills: "keep", education: "keep", certifications: "keep", languages: "keep",
  });

  async function upload() {
    if (!file) return;
    setBusy(true);
    setError("");
    setProposal(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/admin/import", { method: "POST", body: form });
      const data = (await res.json()) as { proposal?: Content; error?: string };
      if (!res.ok || !data.proposal) throw new Error(data.error || `Import failed (${res.status}).`);
      const p = data.proposal;
      setProposal(p);
      // Pre-tick basics that are new or different; default list sections to
      // "replace" only where the site has nothing yet.
      const f: Partial<Record<keyof Basics, boolean>> = {};
      for (const { key } of BASIC_FIELDS) {
        if (p.basics[key] && p.basics[key] !== content.basics[key]) f[key] = !content.basics[key];
      }
      setFields(f);
      const m = { ...modes };
      for (const { key } of LIST_SECTIONS) {
        m[key] = p[key].length === 0 ? "keep" : content[key].length === 0 ? "replace" : "keep";
      }
      setModes(m);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed.");
    } finally {
      setBusy(false);
    }
  }

  function apply() {
    if (!proposal) return;
    const next = structuredClone(content);
    for (const { key } of BASIC_FIELDS) {
      if (fields[key]) next.basics[key] = proposal.basics[key];
    }
    for (const { key } of LIST_SECTIONS) {
      const mode = modes[key];
      const lists = next as unknown as Record<ListKey, unknown[]>;
      const incoming = structuredClone(proposal[key]) as unknown[];
      if (mode === "replace") lists[key] = incoming;
      if (mode === "append") lists[key] = [...lists[key], ...incoming];
    }
    onApply(next);
    setProposal(null);
    setFile(null);
  }

  if (!enabled) {
    return (
      <section className="adm-panel">
        <h2>Import a resume PDF</h2>
        <div className="adm-banner">
          Importing is turned off because no ANTHROPIC_API_KEY is set. Add it in your hosting provider&apos;s environment
          variables and redeploy to enable it.
        </div>
      </section>
    );
  }

  const changedBasics = proposal
    ? BASIC_FIELDS.filter(({ key }) => proposal.basics[key] && proposal.basics[key] !== content.basics[key])
    : [];

  return (
    <section className="adm-panel">
      <div className="adm-section-head">
        <div>
          <h2>Import a resume PDF</h2>
          <p className="adm-muted">
            The PDF is read on the server and its details are matched to your site&apos;s sections. You choose what to
            apply; nothing is saved until you press Save &amp; publish.
          </p>
        </div>
      </div>

      <div className="adm-row">
        <label className="adm-field inline" htmlFor="import-file">
          <span className="adm-label">Resume PDF (max 4 MB)</span>
          <input
            id="import-file"
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </label>
        <button type="button" className="adm-btn primary" disabled={!file || busy} onClick={upload}>
          {busy ? "Reading PDF…" : "Read PDF"}
        </button>
      </div>
      {busy && <p className="adm-muted">This usually takes 15–40 seconds.</p>}
      {error && <p className="adm-error">{error}</p>}

      {proposal && (
        <div className="adm-review">
          <h3>Profile fields</h3>
          {changedBasics.length === 0 && <p className="adm-muted">No differences from your current profile.</p>}
          {changedBasics.map(({ key, label }) => (
            <label key={key} className="adm-diff" htmlFor={`imp-${String(key)}`}>
              <input
                id={`imp-${String(key)}`}
                type="checkbox"
                checked={Boolean(fields[key])}
                onChange={(e) => setFields((f) => ({ ...f, [key]: e.target.checked }))}
              />
              <span className="adm-diff-body">
                <span className="adm-label">{label}</span>
                <span className="adm-old">{content.basics[key] || "(empty)"}</span>
                <span className="adm-new">{proposal.basics[key]}</span>
              </span>
            </label>
          ))}

          {LIST_SECTIONS.map(({ key, label }) => {
            const items = proposal[key] as unknown[];
            if (items.length === 0) return null;
            return (
              <div key={key} className="adm-review-section">
                <h3>{label}</h3>
                <div className="adm-review-cols">
                  <div>
                    <span className="adm-label">Now on your site ({content[key].length})</span>
                    <ul>{(content[key] as unknown[]).map((it, i) => <li key={i}>{describe(key, it)}</li>)}</ul>
                  </div>
                  <div>
                    <span className="adm-label">Found in the PDF ({items.length})</span>
                    <ul>{items.map((it, i) => <li key={i}>{describe(key, it)}</li>)}</ul>
                  </div>
                </div>
                <div className="adm-radios" role="radiogroup" aria-label={`${label} import option`}>
                  {(["keep", "replace", "append"] as Mode[]).map((m) => (
                    <label key={m} htmlFor={`imp-${key}-${m}`}>
                      <input
                        id={`imp-${key}-${m}`}
                        type="radio"
                        name={`imp-${key}`}
                        checked={modes[key] === m}
                        onChange={() => setModes((s) => ({ ...s, [key]: m }))}
                      />
                      {m === "keep" ? "Keep mine" : m === "replace" ? "Replace with PDF" : "Add PDF items to mine"}
                    </label>
                  ))}
                </div>
              </div>
            );
          })}

          <div className="adm-row">
            <button type="button" className="adm-btn primary" onClick={apply}>Apply selected</button>
            <button type="button" className="adm-btn" onClick={() => setProposal(null)}>Cancel</button>
          </div>
          <p className="adm-muted">Imported items start untagged, so they appear on every resume variant until you tag them.</p>
        </div>
      )}
    </section>
  );
}
