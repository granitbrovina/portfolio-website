import { dateRange, type Content } from "@/lib/schema";
import RichText from "../RichText";
import { figtree } from "./fonts";
import type { Prepared } from "./shared";
import "./corporate.css";

/** Corporate Blue: inspired by na.panasonic.com — royal-blue band, dark rounded hero card, centred sections, navy footer. */
export default function Corporate({ content, p }: { content: Content; p: Prepared }) {
  const { basics, focusAreas, experience, skills, education, certifications, highlights } = content;
  const { shownProjects, resumeHref, photoUrl, photoAlt, year, languagesLine } = p;

  return (
    <div className={`th-corporate ${figtree.variable}`}>
      <div className="cp-band">
        <nav className="cp-nav" aria-label="Main">
          <a className="cp-wordmark" href="#top">{basics.name}</a>
          <div className="cp-links">
            {focusAreas.length > 0 && <a href="#about">About</a>}
            {experience.length > 0 && <a href="#work">Experience</a>}
            {shownProjects.length > 0 && <a href="#projects">Projects</a>}
            {skills.length > 0 && <a href="#skills">Skills</a>}
            <a href="#contact">Contact</a>
          </div>
        </nav>

        <header id="top" className="cp-hero">
          <div className="cp-hero-text">
            {basics.headline && <span className="cp-eyebrow">{basics.headline}</span>}
            <h1 className="cp-h1">{basics.heroTitle || basics.headline || basics.name}</h1>
            {basics.summary && <p className="cp-lede"><RichText text={basics.summary} /></p>}
            <div className="cp-ctas">
              <a className="cp-btn" href="#contact">Get in touch</a>
              {resumeHref && <a className="cp-btn cp-btn-line" href={resumeHref}>Download résumé</a>}
            </div>
          </div>
          {photoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="cp-hero-photo" src={photoUrl} alt={photoAlt} width={640} height={800} />
          )}
        </header>
      </div>

      <main className="cp-main">
        {highlights.length > 0 && (
          <section className="cp-section" aria-labelledby="cp-numbers">
            <h2 id="cp-numbers" className="cp-h2">Impact at a glance</h2>
            <div className="cp-numbers">
              {highlights.map((h) => (
                <div key={h.id} className="cp-number">
                  <span className="cp-value">{h.value}</span>
                  <span className="cp-meaning">{h.label}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {focusAreas.length > 0 && (
          <section id="about" className="cp-section" aria-labelledby="cp-focus">
            <h2 id="cp-focus" className="cp-h2">What I do</h2>
            <div className="cp-focus">
              {focusAreas.map((f, i) => (
                <div key={f.id} className="cp-focus-item">
                  <span className="cp-disc" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                  <h3>{f.title}</h3>
                  <p><RichText text={f.body} /></p>
                </div>
              ))}
            </div>
          </section>
        )}

        {experience.length > 0 && (
          <section id="work" className="cp-grey" aria-labelledby="cp-work">
            <div className="cp-inner">
              <h2 id="cp-work" className="cp-h2">Experience</h2>
              <div className="cp-roles">
                {experience.map((r) => (
                  <article key={r.id} className="cp-role">
                    <div className="cp-role-head">
                      <div>
                        <h3>{r.role}</h3>
                        <span className="cp-company"><RichText text={[r.company, r.location].filter(Boolean).join(" · ")} /></span>
                      </div>
                      <span className="cp-date">{dateRange(r.start, r.end)}</span>
                    </div>
                    {r.summary && <p><RichText text={r.summary} /></p>}
                    {r.bullets.length > 0 && <ul>{r.bullets.map((b) => <li key={b.id}><RichText text={b.text} /></li>)}</ul>}
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        {shownProjects.length > 0 && (
          <section id="projects" className="cp-section" aria-labelledby="cp-projects">
            <h2 id="cp-projects" className="cp-h2">Projects</h2>
            <div className="cp-cards">
              {shownProjects.map((pr) => (
                <article key={pr.id} className="cp-card">
                  {pr.kind && <span className="cp-kind">{pr.kind}</span>}
                  <h3>{pr.name}</h3>
                  <p><RichText text={pr.description} /></p>
                  {pr.tags.length > 0 && <span className="cp-tags">{pr.tags.join(" · ")}</span>}
                  {pr.url && <a className="cp-link" href={pr.url} target="_blank" rel="noopener">Learn more ›</a>}
                </article>
              ))}
            </div>
          </section>
        )}

        {skills.length > 0 && (
          <section id="skills" className="cp-grey" aria-labelledby="cp-skills">
            <div className="cp-inner">
              <h2 id="cp-skills" className="cp-h2">Skills</h2>
              <dl className="cp-skills">
                {skills.map((s) => (
                  <div key={s.id}><dt>{s.group}</dt><dd>{s.items}</dd></div>
                ))}
              </dl>
            </div>
          </section>
        )}

        {(certifications.length > 0 || education.length > 0 || languagesLine) && (
          <section className="cp-section" aria-labelledby="cp-edu">
            <h2 id="cp-edu" className="cp-h2">{certifications.length > 0 ? "Certifications & education" : "Education"}</h2>
            <div className="cp-cards">
              {certifications.map((c) => (
                <article key={c.id} className="cp-card cp-card-flat">
                  <span className="cp-kind">Certification</span>
                  <h3>{c.url ? <a href={c.url} target="_blank" rel="noopener">{c.name}</a> : c.name}</h3>
                  <p>{[c.issuer, c.date].filter(Boolean).join(" · ")}</p>
                </article>
              ))}
              {education.map((e) => (
                <article key={e.id} className="cp-card cp-card-flat">
                  <span className="cp-kind">Education</span>
                  <h3>{e.program}</h3>
                  <p>{[e.institution, e.location, dateRange(e.start, e.end), e.note].filter(Boolean).join(" · ")}</p>
                </article>
              ))}
            </div>
            {languagesLine && <p className="cp-langs">Languages: {languagesLine}</p>}
          </section>
        )}
      </main>

      <footer id="contact" className="cp-footer">
        <div className="cp-inner cp-footer-inner">
          <div className="cp-footer-main">
            <h2 className="cp-footer-title">Contact</h2>
            {basics.email && <a className="cp-email" href={`mailto:${basics.email}`}>{basics.email}</a>}
            {basics.location && <span>{basics.location}</span>}
          </div>
          <div className="cp-footer-links">
            {basics.linkedin && <a href={basics.linkedin} target="_blank" rel="noopener">LinkedIn</a>}
            {basics.github && <a href={basics.github} target="_blank" rel="noopener">GitHub</a>}
            {resumeHref && <a href={resumeHref}>Résumé (PDF)</a>}
          </div>
        </div>
        <div className="cp-inner cp-footer-base">
          {basics.footerNote && <p className="cp-note"><RichText text={basics.footerNote} /></p>}
          <span>© {year} {basics.name}</span>
        </div>
      </footer>
    </div>
  );
}
