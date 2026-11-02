import { dateRange, initials, type Content } from "@/lib/schema";
import RichText from "../RichText";
import { atkinson, familjen } from "./fonts";
import type { Prepared } from "./shared";
import "./granite.css";

const yearOf = (s: string): number | null => {
  const m = s.match(/\d{4}/);
  return m ? Number(m[0]) : null;
};

/** Granite: dark charcoal, warm amber accent, large portrait, roles as parallel tracks. */
export default function Granite({ content, p }: { content: Content; p: Prepared }) {
  const { basics, focusAreas, experience, skills, education, certifications, highlights } = content;
  const { shownProjects, resumeHref, photoUrl, photoAlt, year, languagesLine } = p;

  // Timeline bars: each role's span across the years covered by all roles.
  const starts = experience.map((r) => yearOf(r.start)).filter((y): y is number => y !== null);
  const from = starts.length ? Math.min(...starts) : year;
  const span = Math.max(1, year + 1 - from);
  const bar = (start: string, end: string) => {
    const s = yearOf(start) ?? from;
    const e = end ? (yearOf(end) ?? year) + 1 : year + 1;
    return { left: `${((s - from) / span) * 100}%`, right: `${100 - ((e - from) / span) * 100}%` };
  };

  return (
    <div className={`th-granite ${familjen.variable} ${atkinson.variable}`}>
      <div className="gr-wrap">
        <nav className="gr-nav" aria-label="Main">
          <a className="gr-mark" href="#top">
            <span className="gr-badge" aria-hidden="true">{content.branding.monogramText || initials(basics.name)}</span>
            {basics.name}
          </a>
          <div className="gr-links">
            {experience.length > 0 && <a href="#work">Work</a>}
            {shownProjects.length > 0 && <a href="#projects">Projects</a>}
            <a href="#contact">Contact</a>
          </div>
        </nav>

        <header id="top" className={photoUrl ? "gr-hero" : "gr-hero gr-hero-solo"}>
          {photoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="gr-photo" src={photoUrl} alt={photoAlt} width={640} height={800} />
          )}
          <div className="gr-hero-text">
            {basics.availability && <span className="gr-status">{basics.availability}</span>}
            <h1 className="gr-h1">{basics.heroTitle || basics.headline || basics.name}</h1>
            {basics.summary && <p className="gr-lede"><RichText text={basics.summary} /></p>}
            <div className="gr-ctas">
              <a className="gr-pill gr-pill-solid" href="#contact">Get in touch</a>
              {resumeHref && <a className="gr-pill" href={resumeHref}>Résumé</a>}
              {basics.linkedin && <a className="gr-pill" href={basics.linkedin} target="_blank" rel="noopener">LinkedIn</a>}
              {basics.github && <a className="gr-pill" href={basics.github} target="_blank" rel="noopener">GitHub</a>}
            </div>
          </div>
        </header>

        {highlights.length > 0 && (
          <section className="gr-numbers" aria-label="Key numbers">
            {highlights.map((h) => (
              <div key={h.id} className="gr-number">
                <span className="gr-value">{h.value}</span>
                <span className="gr-meaning">{h.label}</span>
              </div>
            ))}
          </section>
        )}

        {focusAreas.length > 0 && (
          <section className="gr-section" aria-labelledby="gr-focus">
            <h2 id="gr-focus" className="gr-h2">What I do</h2>
            <div className="gr-focus">
              {focusAreas.map((f) => (
                <div key={f.id}>
                  <h3>{f.title}</h3>
                  <p><RichText text={f.body} /></p>
                </div>
              ))}
            </div>
          </section>
        )}

        {experience.length > 0 && (
          <section id="work" className="gr-section" aria-labelledby="gr-work">
            <h2 id="gr-work" className="gr-h2">Experience</h2>
            <div className="gr-roles">
              {experience.map((r) => {
                const b = bar(r.start, r.end);
                return (
                  <article key={r.id} className="gr-role">
                    <div className="gr-role-head">
                      <h3>{r.role}</h3>
                      <span>{dateRange(r.start, r.end)}</span>
                    </div>
                    <div className="gr-company"><RichText text={[r.company, r.location].filter(Boolean).join(" · ")} /></div>
                    <div className="gr-track" aria-hidden="true"><span style={{ left: b.left, right: b.right }} /></div>
                    {r.summary && <p><RichText text={r.summary} /></p>}
                    {r.bullets.length > 0 && <ul>{r.bullets.map((x) => <li key={x.id}><RichText text={x.text} /></li>)}</ul>}
                  </article>
                );
              })}
            </div>
            {starts.length > 0 && <div className="gr-axis" aria-hidden="true"><span>{from}</span><span>today</span></div>}
          </section>
        )}

        {shownProjects.length > 0 && (
          <section id="projects" className="gr-section" aria-labelledby="gr-projects">
            <h2 id="gr-projects" className="gr-h2">Selected projects</h2>
            <div className="gr-projects">
              {shownProjects.map((pr) => (
                <article key={pr.id} className="gr-project">
                  {pr.kind && <span className="gr-kind">{pr.kind}</span>}
                  <h3>{pr.url ? <a href={pr.url} target="_blank" rel="noopener">{pr.name}</a> : pr.name}</h3>
                  <p><RichText text={pr.description} /></p>
                  {pr.tags.length > 0 && <span className="gr-tags">{pr.tags.join(" · ")}</span>}
                </article>
              ))}
            </div>
          </section>
        )}

        {skills.length > 0 && (
          <section id="skills" className="gr-section" aria-labelledby="gr-skills">
            <h2 id="gr-skills" className="gr-h2">Skills</h2>
            <dl className="gr-skills">
              {skills.map((s) => (
                <div key={s.id}><dt>{s.group}</dt><dd>{s.items}</dd></div>
              ))}
            </dl>
          </section>
        )}

        {(certifications.length > 0 || education.length > 0 || languagesLine) && (
          <section className="gr-section gr-creds" aria-labelledby="gr-edu">
            <h2 id="gr-edu" className="gr-h2">{certifications.length > 0 ? "Certifications & education" : "Education"}</h2>
            <div className="gr-cred-grid">
              {certifications.map((c) => (
                <div key={c.id} className="gr-cred gr-cred-cert">
                  <span className="gr-kind">Certification</span>
                  <strong>{c.url ? <a href={c.url} target="_blank" rel="noopener">{c.name}</a> : c.name}</strong>
                  <span className="gr-muted">{[c.issuer, c.date].filter(Boolean).join(" · ")}</span>
                </div>
              ))}
              {education.map((e) => (
                <div key={e.id} className="gr-cred">
                  <span className="gr-kind">Education</span>
                  <strong>{e.program}</strong>
                  <span className="gr-muted">{[e.institution, e.location, dateRange(e.start, e.end), e.note].filter(Boolean).join(" · ")}</span>
                </div>
              ))}
            </div>
            {languagesLine && <p className="gr-muted gr-langs">Languages: {languagesLine}</p>}
          </section>
        )}

        <footer id="contact" className="gr-footer">
          <div className="gr-footer-row">
            {basics.email && <a className="gr-email" href={`mailto:${basics.email}`}>{basics.email}</a>}
            <span className="gr-muted">© {year} {basics.name}{basics.location ? ` · ${basics.location}` : ""}</span>
          </div>
          {basics.footerNote && <p className="gr-note"><RichText text={basics.footerNote} /></p>}
        </footer>
      </div>
    </div>
  );
}
