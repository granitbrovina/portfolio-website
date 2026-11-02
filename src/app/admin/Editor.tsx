"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ContentSchema, newId, type Content } from "@/lib/schema";
import AuthButton from "./AuthButton";
import { Field, ItemTools, VariantChips, formatDate, move, type Update } from "./ui";
import ImportPanel from "./ImportPanel";
import ResumePanel from "./ResumePanel";
import HistoryPanel from "./HistoryPanel";
import IconEditor from "./IconEditor";

type Tab = "profile" | "experience" | "projects" | "skills" | "education" | "resume" | "import" | "history";

const TABS: { id: Tab; label: string }[] = [
  { id: "profile", label: "Profile" },
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "skills", label: "Skills" },
  { id: "education", label: "Education" },
  { id: "resume", label: "Resume" },
  { id: "import", label: "Import PDF" },
  { id: "history", label: "History & backup" },
];

export default function Editor(props: {
  initial: Content;
  initialUpdatedAt: string | null;
  source: "db" | "seed";
  email: string;
  homeUrl: string;
  databaseConfigured: boolean;
  importEnabled: boolean;
}) {
  const [content, setContent] = useState<Content>(props.initial);
  const [saved, setSaved] = useState<string>(JSON.stringify(props.initial));
  const [updatedAt, setUpdatedAt] = useState(props.initialUpdatedAt);
  const [tab, setTab] = useState<Tab>("profile");
  const [status, setStatus] = useState<{ kind: "idle" | "saving" | "ok" | "error"; text: string }>({
    kind: "idle",
    text: "",
  });
  const [note, setNote] = useState("");

  const dirty = useMemo(() => JSON.stringify(content) !== saved, [content, saved]);

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const update: Update = useCallback((fn) => {
    setContent((prev) => {
      const draft = structuredClone(prev);
      fn(draft);
      return draft;
    });
  }, []);

  const replaceContent = useCallback((next: Content) => {
    setContent(ContentSchema.parse(next));
  }, []);

  async function save() {
    setStatus({ kind: "saving", text: "Saving…" });
    try {
      const res = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, note }),
      });
      const data = (await res.json()) as { ok?: boolean; updatedAt?: string; error?: string };
      if (!res.ok || !data.ok) throw new Error(data.error || `Save failed (${res.status}).`);
      setSaved(JSON.stringify(content));
      setUpdatedAt(data.updatedAt ?? null);
      setNote("");
      setStatus({ kind: "ok", text: "Saved. The public site is updated." });
    } catch (err) {
      setStatus({ kind: "error", text: err instanceof Error ? err.message : "Save failed." });
    }
  }

  function discard() {
    setContent(JSON.parse(saved) as Content);
    setStatus({ kind: "idle", text: "" });
  }

  return (
    <div className="adm">
      <header className="adm-bar">
        <div className="adm-bar-inner">
          <div className="adm-title">
            <strong>{content.basics.name || "Portfolio"}</strong>
            <span>admin</span>
          </div>
          <div className="adm-bar-actions">
            <span className={`adm-status ${status.kind}`} role="status">
              {status.text || (dirty ? "Unsaved changes" : updatedAt ? `Saved ${formatDate(updatedAt)}` : "Not saved yet")}
            </span>
            <input
              id="save-note"
              className="adm-note"
              placeholder="Change note (optional)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              aria-label="Change note"
            />
            <button className="adm-btn" type="button" onClick={discard} disabled={!dirty}>Discard</button>
            <button
              className="adm-btn primary"
              type="button"
              onClick={save}
              disabled={!dirty || status.kind === "saving" || !props.databaseConfigured}
            >
              Save &amp; publish
            </button>
          </div>
        </div>
      </header>

      <div className="adm-layout">
        <nav className="adm-tabs" aria-label="Sections">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={t.id === tab ? "active" : ""}
              aria-current={t.id === tab ? "page" : undefined}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
          <div className="adm-tabs-foot">
            <a className="adm-link" href="/" target="_blank" rel="noopener">View site ↗</a>
            <span className="adm-muted">{props.email}</span>
            <AuthButton mode="signout" callbackUrl="/" className="adm-btn small" />
          </div>
        </nav>

        <main className="adm-main">
          {!props.databaseConfigured && (
            <div className="adm-banner error">
              No database is connected (DATABASE_URL is missing), so changes can&apos;t be saved yet.
            </div>
          )}
          {props.databaseConfigured && props.source === "seed" && !updatedAt && (
            <div className="adm-banner">
              The site is showing the built-in starting content. Your first save stores it in the database.
            </div>
          )}

          {tab === "profile" && <ProfilePanel content={content} update={update} />}
          {tab === "experience" && <ExperiencePanel content={content} update={update} />}
          {tab === "projects" && <ProjectsPanel content={content} update={update} />}
          {tab === "skills" && <SkillsPanel content={content} update={update} />}
          {tab === "education" && <EducationPanel content={content} update={update} />}
          {tab === "resume" && <ResumePanel content={content} update={update} />}
          {tab === "import" && (
            <ImportPanel content={content} enabled={props.importEnabled} onApply={(next) => { replaceContent(next); setTab("profile"); setStatus({ kind: "idle", text: "Import applied. Review the sections, then Save & publish." }); }} />
          )}
          {tab === "history" && (
            <HistoryPanel
              content={content}
              onLoad={(c, source) => {
                replaceContent(c);
                setStatus({
                  kind: "idle",
                  text: source === "file"
                    ? "Backup loaded. Save & publish to make it live."
                    : "Older version loaded. Save & publish to restore it.",
                });
              }}
            />
          )}
        </main>
      </div>
    </div>
  );
}

function SectionHead({ title, intro, onAdd, addLabel }: { title: string; intro?: string; onAdd?: () => void; addLabel?: string }) {
  return (
    <div className="adm-section-head">
      <div>
        <h2>{title}</h2>
        {intro && <p className="adm-muted">{intro}</p>}
      </div>
      {onAdd && <button type="button" className="adm-btn" onClick={onAdd}>{addLabel ?? "Add"}</button>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Panels                                                              */
/* ------------------------------------------------------------------ */

type PanelProps = { content: Content; update: Update };

function ProfilePanel({ content, update }: PanelProps) {
  const b = content.basics;
  const set = (key: keyof typeof b) => (v: string) => update((d) => { d.basics[key] = v; });
  return (
    <section className="adm-panel">
      <SectionHead title="Profile" intro="Your name, the opening of the homepage, and contact details." />
      <div className="adm-grid two">
        <Field id="b-name" label="Name" value={b.name} onChange={set("name")} />
        <Field id="b-headline" label="Role line" value={b.headline} onChange={set("headline")} hint="Short, e.g. Data & Support Engineer. Used in page titles." />
      </div>
      <Field id="b-hero" label="Homepage headline" value={b.heroTitle} onChange={set("heroTitle")} hint="The large sentence at the top of the site." />
      <Field id="b-summary" label="Summary" value={b.summary} onChange={set("summary")} multiline rows={4} />
      <div className="adm-grid two">
        <Field id="b-avail" label="Availability line" value={b.availability} onChange={set("availability")} hint="Shown above the headline. Leave empty to hide." />
        <Field id="b-location" label="Location" value={b.location} onChange={set("location")} />
        <Field id="b-email" label="Public email" value={b.email} onChange={set("email")} />
        <Field id="b-phone" label="Phone" value={b.phone} onChange={set("phone")} hint="Printed on generated resumes only. Never shown on the site." />
        <Field id="b-linkedin" label="LinkedIn URL" value={b.linkedin} onChange={set("linkedin")} />
        <Field id="b-github" label="GitHub URL" value={b.github} onChange={set("github")} />
        <Field id="b-website" label="Website URL" value={b.website} onChange={set("website")} />
      </div>

      <SectionHead
        title="What I do"
        intro="Short focus areas shown under the headline."
        addLabel="Add focus area"
        onAdd={() => update((d) => { d.focusAreas.push({ id: newId(), title: "", body: "" }); })}
      />
      <div className="adm-list">
        {content.focusAreas.map((f, i) => (
          <div className="adm-item" key={f.id}>
            <ItemTools index={i} count={content.focusAreas.length} label="focus area" onMove={(to) => update((d) => move(d.focusAreas, i, to))} onRemove={() => update((d) => { d.focusAreas.splice(i, 1); })} />
            <Field id={`f-${f.id}-t`} label="Title" value={f.title} onChange={(v) => update((d) => { d.focusAreas[i].title = v; })} />
            <Field id={`f-${f.id}-b`} label="Text" value={f.body} onChange={(v) => update((d) => { d.focusAreas[i].body = v; })} multiline />
          </div>
        ))}
      </div>

      <SectionHead title="Site icon" intro="The small icon shown in browser tabs, bookmarks and on phone home screens." />
      <IconEditor content={content} update={update} />
    </section>
  );
}

function ExperiencePanel({ content, update }: PanelProps) {
  const variants = content.resume.variants;
  return (
    <section className="adm-panel">
      <SectionHead
        title="Experience"
        intro="Roles in the order they appear. Consecutive roles at the same company are grouped on the site. Leave End empty for a current role."
        addLabel="Add role"
        onAdd={() => update((d) => { d.experience.unshift({ id: newId(), role: "", company: "", location: "", start: "", end: "", summary: "", bullets: [], variants: [] }); })}
      />
      <div className="adm-list">
        {content.experience.map((r, i) => (
          <div className="adm-item" key={r.id}>
            <ItemTools index={i} count={content.experience.length} label={r.role || "role"} onMove={(to) => update((d) => move(d.experience, i, to))} onRemove={() => update((d) => { d.experience.splice(i, 1); })} />
            <div className="adm-grid two">
              <Field id={`e-${r.id}-role`} label="Role" value={r.role} onChange={(v) => update((d) => { d.experience[i].role = v; })} />
              <Field id={`e-${r.id}-co`} label="Company" value={r.company} onChange={(v) => update((d) => { d.experience[i].company = v; })} />
              <Field id={`e-${r.id}-start`} label="Start" value={r.start} placeholder="2021 or Mar 2021" onChange={(v) => update((d) => { d.experience[i].start = v; })} />
              <Field id={`e-${r.id}-end`} label="End" value={r.end} placeholder="Present" onChange={(v) => update((d) => { d.experience[i].end = v; })} />
              <Field id={`e-${r.id}-loc`} label="Location" value={r.location} onChange={(v) => update((d) => { d.experience[i].location = v; })} />
            </div>
            <Field id={`e-${r.id}-sum`} label="One-line summary (optional)" value={r.summary} onChange={(v) => update((d) => { d.experience[i].summary = v; })} multiline rows={2} />
            <VariantChips variants={variants} value={r.variants} onChange={(v) => update((d) => { d.experience[i].variants = v; })} />

            <div className="adm-sublist">
              <div className="adm-sub-head">
                <span className="adm-label">Bullet points</span>
                <button type="button" className="adm-btn small" onClick={() => update((d) => { d.experience[i].bullets.push({ id: newId(), text: "", variants: [] }); })}>Add bullet</button>
              </div>
              {r.bullets.map((b, bi) => (
                <div className="adm-bullet" key={b.id}>
                  <textarea
                    id={`e-${r.id}-b-${b.id}`}
                    aria-label={`Bullet ${bi + 1}`}
                    rows={2}
                    value={b.text}
                    onChange={(e) => update((d) => { d.experience[i].bullets[bi].text = e.target.value; })}
                  />
                  <div className="adm-bullet-side">
                    <VariantChips variants={variants} value={b.variants} onChange={(v) => update((d) => { d.experience[i].bullets[bi].variants = v; })} />
                    <ItemTools index={bi} count={r.bullets.length} label="bullet" onMove={(to) => update((d) => move(d.experience[i].bullets, bi, to))} onRemove={() => update((d) => { d.experience[i].bullets.splice(bi, 1); })} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ProjectsPanel({ content, update }: PanelProps) {
  const variants = content.resume.variants;
  return (
    <section className="adm-panel">
      <SectionHead
        title="Projects"
        intro="Shown as cards on the site and as a projects section on resumes."
        addLabel="Add project"
        onAdd={() => update((d) => { d.projects.unshift({ id: newId(), name: "", kind: "", description: "", tags: [], url: "", showOnSite: true, variants: [] }); })}
      />
      <div className="adm-list">
        {content.projects.map((p, i) => (
          <div className="adm-item" key={p.id}>
            <ItemTools index={i} count={content.projects.length} label={p.name || "project"} onMove={(to) => update((d) => move(d.projects, i, to))} onRemove={() => update((d) => { d.projects.splice(i, 1); })} />
            <div className="adm-grid two">
              <Field id={`p-${p.id}-name`} label="Name" value={p.name} onChange={(v) => update((d) => { d.projects[i].name = v; })} />
              <Field id={`p-${p.id}-kind`} label="Label" value={p.kind} placeholder="Internal tool" onChange={(v) => update((d) => { d.projects[i].kind = v; })} />
            </div>
            <Field id={`p-${p.id}-desc`} label="Description" value={p.description} onChange={(v) => update((d) => { d.projects[i].description = v; })} multiline />
            <div className="adm-grid two">
              <Field id={`p-${p.id}-tags`} label="Tags" value={p.tags.join(", ")} hint="Comma-separated" onChange={(v) => update((d) => { d.projects[i].tags = v.split(",").map((t) => t.trim()).filter(Boolean); })} />
              <Field id={`p-${p.id}-url`} label="Link (optional)" value={p.url} onChange={(v) => update((d) => { d.projects[i].url = v; })} />
            </div>
            <label className="adm-check" htmlFor={`p-${p.id}-show`}>
              <input id={`p-${p.id}-show`} type="checkbox" checked={p.showOnSite} onChange={(e) => update((d) => { d.projects[i].showOnSite = e.target.checked; })} />
              Show on the site
            </label>
            <VariantChips variants={variants} value={p.variants} onChange={(v) => update((d) => { d.projects[i].variants = v; })} />
          </div>
        ))}
      </div>
    </section>
  );
}

function SkillsPanel({ content, update }: PanelProps) {
  const variants = content.resume.variants;
  return (
    <section className="adm-panel">
      <SectionHead
        title="Skills"
        intro="One row per group. List the skills as you want them printed."
        addLabel="Add group"
        onAdd={() => update((d) => { d.skills.push({ id: newId(), group: "", items: "", variants: [] }); })}
      />
      <div className="adm-list">
        {content.skills.map((s, i) => (
          <div className="adm-item" key={s.id}>
            <ItemTools index={i} count={content.skills.length} label={s.group || "skill group"} onMove={(to) => update((d) => move(d.skills, i, to))} onRemove={() => update((d) => { d.skills.splice(i, 1); })} />
            <div className="adm-grid skill">
              <Field id={`s-${s.id}-g`} label="Group" value={s.group} onChange={(v) => update((d) => { d.skills[i].group = v; })} />
              <Field id={`s-${s.id}-i`} label="Skills" value={s.items} onChange={(v) => update((d) => { d.skills[i].items = v; })} />
            </div>
            <VariantChips variants={variants} value={s.variants} onChange={(v) => update((d) => { d.skills[i].variants = v; })} />
          </div>
        ))}
      </div>
    </section>
  );
}

function EducationPanel({ content, update }: PanelProps) {
  return (
    <section className="adm-panel">
      <SectionHead
        title="Education"
        intro="Describe studies exactly as they were: a degree only if it was awarded, otherwise the program and years attended."
        addLabel="Add education"
        onAdd={() => update((d) => { d.education.push({ id: newId(), institution: "", program: "", location: "", start: "", end: "", note: "" }); })}
      />
      <div className="adm-list">
        {content.education.map((e, i) => (
          <div className="adm-item" key={e.id}>
            <ItemTools index={i} count={content.education.length} label="education" onMove={(to) => update((d) => move(d.education, i, to))} onRemove={() => update((d) => { d.education.splice(i, 1); })} />
            <div className="adm-grid two">
              <Field id={`ed-${e.id}-prog`} label="Program or degree" value={e.program} onChange={(v) => update((d) => { d.education[i].program = v; })} />
              <Field id={`ed-${e.id}-inst`} label="Institution" value={e.institution} onChange={(v) => update((d) => { d.education[i].institution = v; })} />
              <Field id={`ed-${e.id}-start`} label="Start" value={e.start} onChange={(v) => update((d) => { d.education[i].start = v; })} />
              <Field id={`ed-${e.id}-end`} label="End" value={e.end} onChange={(v) => update((d) => { d.education[i].end = v; })} />
              <Field id={`ed-${e.id}-loc`} label="Location" value={e.location} onChange={(v) => update((d) => { d.education[i].location = v; })} />
              <Field id={`ed-${e.id}-note`} label="Note" value={e.note} placeholder="Three years of coursework completed" onChange={(v) => update((d) => { d.education[i].note = v; })} />
            </div>
          </div>
        ))}
      </div>

      <SectionHead
        title="Certifications"
        addLabel="Add certification"
        onAdd={() => update((d) => { d.certifications.push({ id: newId(), name: "", issuer: "", date: "", url: "" }); })}
      />
      <div className="adm-list">
        {content.certifications.length === 0 && <p className="adm-muted">None yet.</p>}
        {content.certifications.map((c, i) => (
          <div className="adm-item" key={c.id}>
            <ItemTools index={i} count={content.certifications.length} label="certification" onMove={(to) => update((d) => move(d.certifications, i, to))} onRemove={() => update((d) => { d.certifications.splice(i, 1); })} />
            <div className="adm-grid two">
              <Field id={`c-${c.id}-n`} label="Name" value={c.name} onChange={(v) => update((d) => { d.certifications[i].name = v; })} />
              <Field id={`c-${c.id}-i`} label="Issuer" value={c.issuer} onChange={(v) => update((d) => { d.certifications[i].issuer = v; })} />
              <Field id={`c-${c.id}-d`} label="Date" value={c.date} onChange={(v) => update((d) => { d.certifications[i].date = v; })} />
              <Field id={`c-${c.id}-u`} label="Verification link" value={c.url} onChange={(v) => update((d) => { d.certifications[i].url = v; })} />
            </div>
          </div>
        ))}
      </div>

      <SectionHead
        title="Languages"
        addLabel="Add language"
        onAdd={() => update((d) => { d.languages.push({ id: newId(), name: "", level: "" }); })}
      />
      <div className="adm-list">
        {content.languages.map((l, i) => (
          <div className="adm-item compact" key={l.id}>
            <div className="adm-grid two">
              <Field id={`l-${l.id}-n`} label="Language" value={l.name} onChange={(v) => update((d) => { d.languages[i].name = v; })} />
              <Field id={`l-${l.id}-l`} label="Level" value={l.level} onChange={(v) => update((d) => { d.languages[i].level = v; })} />
            </div>
            <ItemTools index={i} count={content.languages.length} label="language" onMove={(to) => update((d) => move(d.languages, i, to))} onRemove={() => update((d) => { d.languages.splice(i, 1); })} />
          </div>
        ))}
      </div>
    </section>
  );
}
