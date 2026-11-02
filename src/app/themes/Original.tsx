import { dateRange, type Content } from "@/lib/schema";
import CopyEmail from "../CopyEmail";
import RichText from "../RichText";
import type { Prepared } from "./shared";

/** The original theme: e-paper grey, ink blue, follows light/dark mode. */
export default function Original({ content, p }: { content: Content; p: Prepared }) {
  const { basics, focusAreas, experience, skills, education, certifications, languages } = content;
  const { shownProjects, resumeHref, photoUrl, photoAlt, year, groups, languagesLine } = p;

  return (
    <div className="wrap th-original">
      <nav className="nav" aria-label="Main">
        <a className="mark" href="#top">{basics.name}</a>
        <ul>
          {experience.length > 0 && <li><a href="#work">Work</a></li>}
          {shownProjects.length > 0 && <li><a href="#projects">Projects</a></li>}
          {skills.length > 0 && <li><a href="#skills">Skills</a></li>}
          <li><a href="#contact">Contact</a></li>
        </ul>
      </nav>

      <header className={photoUrl ? "hero" : "hero no-photo"} id="top">
        <div>
          {basics.availability && <div className="status">{basics.availability}</div>}
          <h1>{basics.heroTitle || basics.headline || basics.name}</h1>
          {basics.summary && <p className="lede"><RichText text={basics.summary} /></p>}
          <div className="ctas">
            <a className="btn primary" href="#contact">Get in touch</a>
            {basics.linkedin && <a className="btn" href={basics.linkedin} target="_blank" rel="noopener">LinkedIn</a>}
            {basics.github && <a className="btn" href={basics.github} target="_blank" rel="noopener">GitHub</a>}
            {resumeHref && <a className="btn" href={resumeHref}>Resume (PDF)</a>}
          </div>
        </div>
        {photoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className="portrait"
            src={photoUrl}
            alt={photoAlt}
            width={640}
            height={800}
          />
        )}
      </header>

      {focusAreas.length > 0 && (
        <section className="section" aria-labelledby="focus-h">
          <div className="sec-head">
            <h2 id="focus-h">What I do</h2>
            <div className="focus">
              {focusAreas.map((f) => (
                <div key={f.id}>
                  <h3>{f.title}</h3>
                  <p><RichText text={f.body} /></p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {experience.length > 0 && (
        <section className="section" id="work" aria-labelledby="exp-h">
          <div className="sec-head">
            <h2 id="exp-h">Experience</h2>
            <div className="roles">
              {groups.map((g, gi) => (
                <div key={gi} className="stack">
                  {g.roles.map((r, ri) => (
                    <div key={r.id}>
                      <div className="role">
                        <h3>{r.role}</h3>
                        <span className="when">{dateRange(r.start, r.end)}</span>
                      </div>
                      {ri === 0 && <div className="org"><RichText text={[g.company, g.location].filter(Boolean).join(" · ")} /></div>}
                      {r.summary && <p><RichText text={r.summary} /></p>}
                      {r.bullets.length > 0 && (
                        <ul className="points">
                          {r.bullets.map((b) => <li key={b.id}><RichText text={b.text} /></li>)}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {shownProjects.length > 0 && (
        <section className="section" id="projects" aria-labelledby="proj-h">
          <div className="sec-head">
            <h2 id="proj-h">Projects</h2>
            <div className="projects">
              {shownProjects.map((p) => (
                <article key={p.id} className="proj">
                  {p.kind && <span className="kind">{p.kind}</span>}
                  <h3>{p.url ? <a href={p.url} target="_blank" rel="noopener">{p.name}</a> : p.name}</h3>
                  <p><RichText text={p.description} /></p>
                  {p.tags.length > 0 && (
                    <div className="tags">{p.tags.map((t) => <span key={t}>{t}</span>)}</div>
                  )}
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {skills.length > 0 && (
        <section className="section" id="skills" aria-labelledby="skills-h">
          <div className="sec-head">
            <h2 id="skills-h">Skills</h2>
            <div className="skills">
              {skills.map((s) => (
                <div key={s.id}>
                  <h3>{s.group}</h3>
                  <p>{s.items}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {(education.length > 0 || certifications.length > 0 || languages.length > 0) && (
        <section className="section" aria-labelledby="edu-h">
          <div className="sec-head">
            <h2 id="edu-h">Education</h2>
            <div className="stack">
              {education.map((e) => (
                <div key={e.id}>
                  <h3>{e.program}</h3>
                  <div className="org">
                    {[e.institution, e.location, dateRange(e.start, e.end), e.note].filter(Boolean).join(" · ")}
                  </div>
                </div>
              ))}
              {certifications.map((c) => (
                <div key={c.id}>
                  <h3>{c.url ? <a href={c.url} target="_blank" rel="noopener">{c.name}</a> : c.name}</h3>
                  <div className="org">{[c.issuer, c.date].filter(Boolean).join(" · ")}</div>
                </div>
              ))}
              {languages.length > 0 && (
                <p>Languages: {languagesLine}.</p>
              )}
            </div>
          </div>
        </section>
      )}

      <section className="section" id="contact" aria-labelledby="contact-h">
        <div className="sec-head">
          <h2 id="contact-h">Contact</h2>
          <div>
            <h3>Let&apos;s talk.</h3>
            <p>{basics.location ? `Based in ${basics.location}. ` : ""}Email is the fastest way to reach me.</p>
            {basics.email && <CopyEmail email={basics.email} />}
          </div>
        </div>
      </section>

      <footer className="footer">
        {basics.footerNote && (
          <p className="footer-note"><RichText text={basics.footerNote} /></p>
        )}
        <div className="footer-meta">
          <span>© {year} {basics.name}</span>
          <span>{basics.location}</span>
        </div>
      </footer>
    </div>
  );
}
