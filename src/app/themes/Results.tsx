import { dateRange, type Content } from "@/lib/schema";
import RichText from "../RichText";
import { schibsted } from "./fonts";
import type { Prepared } from "./shared";
import "./results.css";

/** Results-first theme: Swiss-style type, a huge name and the key numbers up front. */
export default function Results({ content, p }: { content: Content; p: Prepared }) {
  const { basics, focusAreas, experience, skills, education, certifications, highlights } = content;
  const { shownProjects, resumeHref, photoUrl, photoAlt, year, languagesLine } = p;
  const [first, ...rest] = (basics.name || "").split(" ");

  return (
    <div className={`th-results ${schibsted.variable}`}>
      <div className="rs-wrap">
        <nav className="rs-nav" aria-label="Main">
          <span className="rs-avail">{basics.availability || basics.location}</span>
          <div className="rs-links">
            {experience.length > 0 && <a href="#work">Work</a>}
            {shownProjects.length > 0 && <a href="#projects">Projects</a>}
            <a href="#contact">Contact</a>
            {resumeHref && <a className="rs-strong" href={resumeHref}>Résumé</a>}
          </div>
        </nav>

        <header id="top" className="rs-hero">
          <h1 className="rs-name">{first}{rest.length > 0 && <><br />{rest.join(" ")}</>}</h1>
          <div className={photoUrl ? "rs-hero-grid" : "rs-hero-grid rs-no-photo"}>
            <p className="rs-pitch">{basics.heroTitle || basics.headline}</p>
            {basics.summary && <p className="rs-summary"><RichText text={basics.summary} /></p>}
            {photoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="rs-photo" src={photoUrl} alt={photoAlt} width={640} height={800} />
            )}
          </div>
        </header>

        {highlights.length > 0 && (
          <section className="rs-numbers" aria-label="Key numbers">
            {highlights.map((h, i) => (
              <div key={h.id} className="rs-number">
                <span className="rs-value">{i === 0 ? <mark>{h.value}</mark> : h.value}</span>
                <span className="rs-meaning">{h.label}</span>
              </div>
            ))}
          </section>
        )}

        {focusAreas.length > 0 && (
          <section className="rs-section" aria-labelledby="rs-focus">
            <h2 id="rs-focus" className="rs-label">What I do</h2>
            <div className="rs-focus">
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
          <section id="work" className="rs-section" aria-labelledby="rs-work">
            <h2 id="rs-work" className="rs-label">Experience</h2>
            <div className="rs-roles">
              {experience.map((r) => (
                <div key={r.id} className="rs-role">
                  <div className="rs-role-head">
                    <h3>{r.role}</h3>
                    <span>{dateRange(r.start, r.end)}</span>
                  </div>
                  <div className="rs-company"><RichText text={[r.company, r.location].filter(Boolean).join(" · ")} /></div>
                  {r.summary && <p><RichText text={r.summary} /></p>}
                  {r.bullets.length > 0 && <ul>{r.bullets.map((b) => <li key={b.id}><RichText text={b.text} /></li>)}</ul>}
                </div>
              ))}
            </div>
          </section>
        )}

        {shownProjects.length > 0 && (
          <section id="projects" className="rs-section" aria-labelledby="rs-projects">
            <h2 id="rs-projects" className="rs-label">Projects</h2>
            <div className="rs-list">
              {shownProjects.map((pr) => {
                const inner = (
                  <>
                    <span className="rs-item-text">
                      <span className="rs-item-name">{pr.name}</span>
                      <span className="rs-item-desc"><RichText text={pr.description} /></span>
                      {pr.tags.length > 0 && <span className="rs-item-tags">{pr.tags.join(" · ")}</span>}
                    </span>
                    <span className="rs-item-kind">{pr.kind}{pr.url ? " ↗" : ""}</span>
                  </>
                );
                return pr.url ? (
                  <a key={pr.id} className="rs-item" href={pr.url} target="_blank" rel="noopener">{inner}</a>
                ) : (
                  <div key={pr.id} className="rs-item">{inner}</div>
                );
              })}
            </div>
          </section>
        )}

        {skills.length > 0 && (
          <section id="skills" className="rs-section" aria-labelledby="rs-skills">
            <h2 id="rs-skills" className="rs-label">Skills</h2>
            <dl className="rs-skills">
              {skills.map((s) => (
                <div key={s.id}><dt>{s.group}</dt><dd>{s.items}</dd></div>
              ))}
            </dl>
          </section>
        )}

        {certifications.length > 0 && (
          <section className="rs-section" aria-labelledby="rs-certs">
            <h2 id="rs-certs" className="rs-label">Certifications</h2>
            <div className="rs-certs">
              {certifications.map((c) => (
                <div key={c.id} className="rs-cert">
                  <strong>{c.url ? <a href={c.url} target="_blank" rel="noopener">{c.name}</a> : c.name}</strong>
                  {(c.issuer || c.date) && <span>{[c.issuer, c.date].filter(Boolean).join(" · ")}</span>}
                </div>
              ))}
            </div>
          </section>
        )}

        {(education.length > 0 || languagesLine) && (
          <section className="rs-section" aria-labelledby="rs-edu">
            <h2 id="rs-edu" className="rs-label">Education</h2>
            <div className="rs-edu">
              {education.map((e) => (
                <div key={e.id}>
                  <h3>{e.program}</h3>
                  <p>{[e.institution, e.location, dateRange(e.start, e.end), e.note].filter(Boolean).join(" · ")}</p>
                </div>
              ))}
              {languagesLine && <p className="rs-muted">Languages: {languagesLine}</p>}
            </div>
          </section>
        )}

        <footer id="contact" className="rs-footer">
          {basics.email && <a className="rs-email" href={`mailto:${basics.email}`}>{basics.email}</a>}
          <div className="rs-footer-links">
            {basics.linkedin && <a href={basics.linkedin} target="_blank" rel="noopener">LinkedIn</a>}
            {basics.github && <a href={basics.github} target="_blank" rel="noopener">GitHub</a>}
            {basics.location && <span>{basics.location}</span>}
          </div>
          {basics.footerNote && <p className="rs-note"><RichText text={basics.footerNote} /></p>}
          <span className="rs-copy">© {year} {basics.name}</span>
        </footer>
      </div>
    </div>
  );
}
