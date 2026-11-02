import { dateRange, initials, type Content } from "@/lib/schema";
import RichText from "../RichText";
import { notoSans, outfit } from "./fonts";
import type { Prepared } from "./shared";
import "./workplace.css";

const Arrow = () => (
  <svg className="wp-arrow" width="18" height="12" viewBox="0 0 18 12" aria-hidden="true">
    <path d="M0 6h16M11 1l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.6" />
  </svg>
);

/** Workplace: inspired by getjoan.com — grey ground, white cards, geometric headings, violet accent, e-paper greyscale. */
export default function Workplace({ content, p }: { content: Content; p: Prepared }) {
  const { basics, focusAreas, experience, skills, education, certifications, highlights } = content;
  const { shownProjects, resumeHref, photoUrl, photoAlt, year, languagesLine } = p;

  return (
    <div className={`th-workplace ${outfit.variable} ${notoSans.variable}`}>
      <nav className="wp-nav" aria-label="Main">
        <div className="wp-nav-inner">
          <a className="wp-mark" href="#top">
            <span className="wp-badge" aria-hidden="true">{content.branding.monogramText || initials(basics.name)}</span>
            {basics.name}
          </a>
          <div className="wp-links">
            {experience.length > 0 && <a href="#work">Experience</a>}
            {shownProjects.length > 0 && <a href="#projects">Projects</a>}
            {skills.length > 0 && <a href="#skills">Skills</a>}
            {resumeHref && <a href={resumeHref}>Résumé</a>}
            <a className="wp-btn wp-btn-sm" href="#contact">Contact me</a>
          </div>
        </div>
      </nav>

      <div className="wp-wrap">
        <header id="top" className={photoUrl ? "wp-hero" : "wp-hero wp-hero-solo"}>
          <div className="wp-hero-text">
            {basics.availability && <span className="wp-eyebrow">{basics.availability}</span>}
            <h1 className="wp-h1">{basics.heroTitle || basics.headline || basics.name}</h1>
            {basics.summary && <p className="wp-lede"><RichText text={basics.summary} /></p>}
            <div className="wp-ctas">
              <a className="wp-btn" href="#contact">Get in touch</a>
              {resumeHref && <a className="wp-btn wp-btn-ghost" href={resumeHref}>Download résumé</a>}
            </div>
            <div className="wp-social">
              {basics.linkedin && <a href={basics.linkedin} target="_blank" rel="noopener">LinkedIn <Arrow /></a>}
              {basics.github && <a href={basics.github} target="_blank" rel="noopener">GitHub <Arrow /></a>}
            </div>
          </div>
          {photoUrl && (
            <div className="wp-photo-card">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photoUrl} alt={photoAlt} width={640} height={800} />
            </div>
          )}
        </header>

        {highlights.length > 0 && (
          <section className="wp-band" aria-labelledby="wp-numbers">
            <h2 id="wp-numbers" className="wp-band-title">Results that speak for themselves</h2>
            <div className="wp-numbers">
              {highlights.map((h) => (
                <div key={h.id} className="wp-number">
                  <span className="wp-value">{h.value}</span>
                  <span className="wp-meaning">{h.label}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {focusAreas.length > 0 && (
          <section className="wp-section" aria-labelledby="wp-focus">
            <div className="wp-section-head">
              <h2 id="wp-focus" className="wp-h2">What I do</h2>
            </div>
            <div className="wp-grid">
              {focusAreas.map((f, i) => (
                <article key={f.id} className={`wp-card${i === 0 ? " wp-card-wide" : ""}`}>
                  <span className="wp-index">{String(i + 1).padStart(2, "0")}</span>
                  <h3>{f.title}</h3>
                  <p><RichText text={f.body} /></p>
                </article>
              ))}
            </div>
          </section>
        )}

        {experience.length > 0 && (
          <section id="work" className="wp-section" aria-labelledby="wp-work">
            <div className="wp-section-head">
              <h2 id="wp-work" className="wp-h2">Experience</h2>
            </div>
            <div className="wp-stack">
              {experience.map((r) => (
                <article key={r.id} className="wp-card wp-role">
                  <div className="wp-role-side">
                    <span className="wp-date">{dateRange(r.start, r.end)}</span>
                    <span className="wp-company"><RichText text={[r.company, r.location].filter(Boolean).join(" · ")} /></span>
                  </div>
                  <div className="wp-role-main">
                    <h3>{r.role}</h3>
                    {r.summary && <p><RichText text={r.summary} /></p>}
                    {r.bullets.length > 0 && <ul>{r.bullets.map((b) => <li key={b.id}><RichText text={b.text} /></li>)}</ul>}
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {shownProjects.length > 0 && (
          <section id="projects" className="wp-section" aria-labelledby="wp-projects">
            <div className="wp-section-head">
              <h2 id="wp-projects" className="wp-h2">Projects</h2>
            </div>
            <div className="wp-grid">
              {shownProjects.map((pr) => (
                <article key={pr.id} className="wp-card">
                  {pr.kind && <span className="wp-tag">{pr.kind}</span>}
                  <h3>{pr.name}</h3>
                  <p><RichText text={pr.description} /></p>
                  {pr.tags.length > 0 && <span className="wp-tags">{pr.tags.join(" · ")}</span>}
                  {pr.url && <a className="wp-more" href={pr.url} target="_blank" rel="noopener">Explore more <Arrow /></a>}
                </article>
              ))}
            </div>
          </section>
        )}

        {skills.length > 0 && (
          <section id="skills" className="wp-section" aria-labelledby="wp-skills">
            <div className="wp-section-head">
              <h2 id="wp-skills" className="wp-h2">Skills</h2>
            </div>
            <dl className="wp-card wp-skills">
              {skills.map((s) => (
                <div key={s.id}><dt>{s.group}</dt><dd>{s.items}</dd></div>
              ))}
            </dl>
          </section>
        )}

        {(certifications.length > 0 || education.length > 0 || languagesLine) && (
          <section className="wp-section" aria-labelledby="wp-edu">
            <div className="wp-section-head">
              <h2 id="wp-edu" className="wp-h2">{certifications.length > 0 ? "Certifications & education" : "Education"}</h2>
            </div>
            <div className="wp-grid">
              {certifications.map((c) => (
                <article key={c.id} className="wp-card">
                  <span className="wp-tag">Certification</span>
                  <h3>{c.url ? <a href={c.url} target="_blank" rel="noopener">{c.name}</a> : c.name}</h3>
                  <p>{[c.issuer, c.date].filter(Boolean).join(" · ")}</p>
                </article>
              ))}
              {education.map((e) => (
                <article key={e.id} className="wp-card">
                  <span className="wp-tag wp-tag-grey">Education</span>
                  <h3>{e.program}</h3>
                  <p>{[e.institution, e.location, dateRange(e.start, e.end), e.note].filter(Boolean).join(" · ")}</p>
                </article>
              ))}
            </div>
            {languagesLine && <p className="wp-langs">Languages: {languagesLine}</p>}
          </section>
        )}
      </div>

      <footer id="contact" className="wp-footer">
        <div className="wp-footer-inner">
          <h2 className="wp-footer-title">Let&rsquo;s work together</h2>
          {basics.email && <a className="wp-email" href={`mailto:${basics.email}`}>{basics.email}</a>}
          <div className="wp-footer-links">
            {basics.linkedin && <a href={basics.linkedin} target="_blank" rel="noopener">LinkedIn</a>}
            {basics.github && <a href={basics.github} target="_blank" rel="noopener">GitHub</a>}
            {resumeHref && <a href={resumeHref}>Résumé (PDF)</a>}
          </div>
          {basics.footerNote && <p className="wp-note"><RichText text={basics.footerNote} /></p>}
          <span className="wp-copy">© {year} {basics.name}{basics.location ? ` · ${basics.location}` : ""}</span>
        </div>
      </footer>
    </div>
  );
}
