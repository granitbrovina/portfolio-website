import { dateRange, type Content } from "@/lib/schema";
import RichText from "../RichText";
import { archivo, jetbrains } from "./fonts";
import { nbsp, type Prepared } from "./shared";
import "./schematic.css";

/** Engineering-drawing theme: grid paper, wide headings, monospace sheet labels. */
export default function Schematic({ content, p }: { content: Content; p: Prepared }) {
  const { basics, focusAreas, experience, skills, education, certifications, highlights } = content;
  const { shownProjects, resumeHref, photoUrl, photoAlt, year, languagesLine } = p;

  // Sheet numbers follow the sections actually shown, like a drawing set.
  let sheet = 0;
  const next = () => String(++sheet).padStart(2, "0");

  return (
    <div className={`th-schematic ${archivo.variable} ${jetbrains.variable}`}>
      <div className="sc-wrap">
        <nav className="sc-nav" aria-label="Main">
          <a className="sc-mark" href="#top">{basics.name}</a>
          <div className="sc-links">
            {experience.length > 0 && <a href="#work">/work</a>}
            {shownProjects.length > 0 && <a href="#projects">/projects</a>}
            {skills.length > 0 && <a href="#skills">/skills</a>}
            <a href="#contact">/contact</a>
          </div>
        </nav>

        <header id="top" className={photoUrl ? "sc-hero" : "sc-hero sc-hero-solo"}>
          <div className="sc-hero-text">
            <div className="sc-kicker">
              {basics.headline && <span>{basics.headline}</span>}
              {basics.location && <span className="sc-dim">·</span>}
              {basics.location && <span>{basics.location}</span>}
            </div>
            <h1 className="sc-h1">{basics.heroTitle || basics.headline || basics.name}</h1>
            {basics.summary && <p className="sc-lede"><RichText text={basics.summary} /></p>}
            <div className="sc-ctas">
              <a className="sc-btn sc-btn-solid" href="#contact">Get in touch</a>
              {resumeHref && <a className="sc-btn" href={resumeHref}>Résumé (PDF)</a>}
              {basics.linkedin && <a className="sc-btn sc-btn-plain" href={basics.linkedin} target="_blank" rel="noopener">LinkedIn</a>}
              {basics.github && <a className="sc-btn sc-btn-plain" href={basics.github} target="_blank" rel="noopener">GitHub</a>}
            </div>
            {basics.availability && <p className="sc-status">{basics.availability}</p>}
          </div>
          {photoUrl && (
            <figure className="sc-figure">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photoUrl} alt={photoAlt} width={640} height={800} />
              <figcaption>fig. 1 — {basics.name}</figcaption>
            </figure>
          )}
        </header>

        {highlights.length > 0 && (
          <section className="sc-sheet" aria-labelledby="sc-numbers">
            <h2 id="sc-numbers" className="sc-label">Sheet {next()} — Key numbers</h2>
            <div className="sc-numbers">
              {highlights.map((h) => (
                <div key={h.id} className="sc-number">
                  <span className="sc-value">{nbsp(h.value)}</span>
                  <span className="sc-meaning">{h.label}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {focusAreas.length > 0 && (
          <section className="sc-section" aria-labelledby="sc-focus">
            <h2 id="sc-focus" className="sc-label">Sheet {next()} — What I do</h2>
            <div className="sc-focus">
              {focusAreas.map((f) => (
                <div key={f.id} className="sc-cell">
                  <h3>{f.title}</h3>
                  <p><RichText text={f.body} /></p>
                </div>
              ))}
            </div>
          </section>
        )}

        {experience.length > 0 && (
          <section id="work" className="sc-section" aria-labelledby="sc-work">
            <h2 id="sc-work" className="sc-label">Sheet {next()} — Experience</h2>
            <div className="sc-table">
              {experience.map((r) => (
                <div key={r.id} className="sc-row">
                  <div className="sc-row-head">
                    <h3>{r.role}</h3>
                    <span><RichText text={[r.company, r.location].filter(Boolean).join(" · ")} /></span>
                  </div>
                  <div className="sc-row-body">
                    {r.summary && <p><RichText text={r.summary} /></p>}
                    {r.bullets.length > 0 && (
                      <ul>{r.bullets.map((b) => <li key={b.id}><RichText text={b.text} /></li>)}</ul>
                    )}
                  </div>
                  <div className="sc-row-date">{dateRange(r.start, r.end) || " "}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {shownProjects.length > 0 && (
          <section id="projects" className="sc-section" aria-labelledby="sc-projects">
            <h2 id="sc-projects" className="sc-label">Sheet {next()} — Projects</h2>
            <div className="sc-cards">
              {shownProjects.map((pr) => (
                <article key={pr.id} className="sc-card">
                  {pr.kind && <span className="sc-card-kind">{pr.kind}</span>}
                  <h3>{pr.url ? <a href={pr.url} target="_blank" rel="noopener">{pr.name}</a> : pr.name}</h3>
                  <p><RichText text={pr.description} /></p>
                  {pr.tags.length > 0 && <div className="sc-card-spec">{pr.tags.join(" · ")}</div>}
                </article>
              ))}
            </div>
          </section>
        )}

        {skills.length > 0 && (
          <section id="skills" className="sc-section" aria-labelledby="sc-skills">
            <h2 id="sc-skills" className="sc-label">Sheet {next()} — Skills</h2>
            <dl className="sc-skills">
              {skills.map((s) => (
                <div key={s.id}>
                  <dt>{s.group}</dt>
                  <dd>{s.items}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {certifications.length > 0 && (
          <section className="sc-section" aria-labelledby="sc-certs">
            <h2 id="sc-certs" className="sc-label">Sheet {next()} — Certifications</h2>
            <div className="sc-certs">
              {certifications.map((c) => (
                <div key={c.id} className="sc-cert">
                  <strong>{c.url ? <a href={c.url} target="_blank" rel="noopener">{c.name}</a> : c.name}</strong>
                  <span>{[c.issuer, c.date].filter(Boolean).join(" · ")}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {(education.length > 0 || languagesLine) && (
          <section className="sc-section" aria-labelledby="sc-edu">
            <h2 id="sc-edu" className="sc-label">Sheet {next()} — Education</h2>
            <div className="sc-table">
              {education.map((e) => (
                <div key={e.id} className="sc-row">
                  <div className="sc-row-head"><h3>{e.program}</h3></div>
                  <div className="sc-row-body"><p>{[e.institution, e.location, e.note].filter(Boolean).join(" · ")}</p></div>
                  <div className="sc-row-date">{dateRange(e.start, e.end)}</div>
                </div>
              ))}
            </div>
            {languagesLine && <p className="sc-langs">Languages: {languagesLine}</p>}
          </section>
        )}

        <footer id="contact" className="sc-footer">
          <div className="sc-footer-main">
            <span className="sc-label">Contact</span>
            {basics.email && <a className="sc-email" href={`mailto:${basics.email}`}>{basics.email}</a>}
            {basics.location && <span className="sc-dim">Based in {basics.location}. Email is the fastest way to reach me.</span>}
          </div>
          {basics.footerNote && <p className="sc-note"><RichText text={basics.footerNote} /></p>}
          <span className="sc-copy">© {year} {basics.name}{basics.location ? ` · ${basics.location}` : ""}</span>
        </footer>
      </div>
    </div>
  );
}
