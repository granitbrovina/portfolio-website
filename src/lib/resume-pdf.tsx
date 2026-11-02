import { Document, Link, Page, StyleSheet, Text, View, renderToBuffer } from "@react-pdf/renderer";
import { dateRange, inVariant, type Content } from "./schema";
import { parseLinks } from "./richtext";

/**
 * One-column, text-first layout so applicant tracking systems can read it.
 * Uses the built-in Helvetica family, so no font files are needed.
 */
const s = StyleSheet.create({
  page: { paddingTop: 40, paddingBottom: 44, paddingHorizontal: 48, fontFamily: "Helvetica", fontSize: 10, lineHeight: 1.4, color: "#1b1f1d" },
  name: { fontFamily: "Helvetica-Bold", fontSize: 20, lineHeight: 1.2, marginBottom: 4 },
  headline: { fontSize: 10.5, lineHeight: 1.35, color: "#1d5c86", marginBottom: 6 },
  contact: { fontSize: 9, color: "#4a524e", flexDirection: "row", flexWrap: "wrap" },
  contactItem: { marginRight: 10 },
  link: { color: "#4a524e", textDecoration: "none" },
  inlineLink: { color: "#1b1f1d", textDecoration: "none" },
  section: { marginTop: 14 },
  sectionTitle: { fontFamily: "Helvetica-Bold", fontSize: 9.5, letterSpacing: 1, textTransform: "uppercase", color: "#1d5c86", borderBottomWidth: 0.75, borderBottomColor: "#c9d0cb", paddingBottom: 3, marginBottom: 6 },
  summary: { fontSize: 10 },
  entry: { marginBottom: 8 },
  entryHead: { flexDirection: "row", justifyContent: "space-between" },
  entryTitle: { fontFamily: "Helvetica-Bold", fontSize: 10.5, lineHeight: 1.35 },
  entryDate: { fontSize: 9, color: "#4a524e" },
  entrySub: { fontSize: 9.5, color: "#4a524e", marginBottom: 2 },
  bulletRow: { flexDirection: "row", marginTop: 1.5 },
  bulletDot: { width: 10 },
  bulletText: { flex: 1 },
  skillRow: { flexDirection: "row", marginBottom: 2 },
  skillGroup: { fontFamily: "Helvetica-Bold", width: 120 },
  skillItems: { flex: 1 },
});

/** Text with [label](url) links rendered as clickable PDF links. */
function Rich({ text, style }: { text: string; style?: (typeof s)[keyof typeof s] }) {
  return (
    <Text style={style}>
      {parseLinks(text).map((seg, i) =>
        seg.href ? <Link key={i} src={seg.href} style={s.inlineLink}>{seg.text}</Link> : seg.text,
      )}
    </Text>
  );
}

function Bullet({ text }: { text: string }) {
  return (
    <View style={s.bulletRow}>
      <Text style={s.bulletDot}>•</Text>
      <Rich style={s.bulletText} text={text} />
    </View>
  );
}

function ResumeDocument({ content, variantId }: { content: Content; variantId: string | null }) {
  const { basics } = content;
  const variant = content.resume.variants.find((v) => v.id === variantId) ?? null;
  const headline = variant?.headline || basics.headline;
  const summary = variant?.summary || basics.summary;

  const experience = content.experience
    .filter((e) => inVariant(e.variants, variantId))
    .map((e) => ({ ...e, bullets: e.bullets.filter((b) => b.text.trim() && inVariant(b.variants, variantId)) }));
  const projects = content.projects.filter((p) => inVariant(p.variants, variantId));
  const skills = content.skills.filter((sk) => sk.items.trim() && inVariant(sk.variants, variantId));

  const contacts: { label: string; href?: string }[] = [];
  if (basics.location) contacts.push({ label: basics.location });
  if (basics.email) contacts.push({ label: basics.email, href: `mailto:${basics.email}` });
  if (basics.phone) contacts.push({ label: basics.phone });
  for (const url of [basics.website, basics.linkedin, basics.github]) {
    if (url) contacts.push({ label: url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, ""), href: url });
  }

  return (
    <Document title={`${basics.name} – Resume`} author={basics.name} subject={headline}>
      <Page size="LETTER" style={s.page}>
        <Text style={s.name}>{basics.name}</Text>
        {headline ? <Text style={s.headline}>{headline}</Text> : null}
        <View style={s.contact}>
          {contacts.map((c, i) => (
            <Text key={i} style={s.contactItem}>
              {c.href ? <Link src={c.href} style={s.link}>{c.label}</Link> : c.label}
            </Text>
          ))}
        </View>

        {summary ? (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Summary</Text>
            <Rich style={s.summary} text={summary} />
          </View>
        ) : null}

        {experience.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Experience</Text>
            {experience.map((e) => (
              <View key={e.id} style={s.entry} wrap={false}>
                <View style={s.entryHead}>
                  <Text style={s.entryTitle}>{e.role}</Text>
                  <Text style={s.entryDate}>{dateRange(e.start, e.end)}</Text>
                </View>
                <Rich style={s.entrySub} text={[e.company, e.location].filter(Boolean).join(" · ")} />
                {e.summary ? <Rich text={e.summary} /> : null}
                {e.bullets.map((b) => <Bullet key={b.id} text={b.text} />)}
              </View>
            ))}
          </View>
        )}

        {projects.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Projects</Text>
            {projects.map((p) => (
              <View key={p.id} style={s.entry} wrap={false}>
                <View style={s.entryHead}>
                  <Text style={s.entryTitle}>{p.name}</Text>
                  {p.kind ? <Text style={s.entryDate}>{p.kind}</Text> : null}
                </View>
                <Rich text={p.description} />
                {p.tags.length > 0 ? <Text style={s.entrySub}>{p.tags.join(" · ")}</Text> : null}
              </View>
            ))}
          </View>
        )}

        {skills.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Skills</Text>
            {skills.map((sk) => (
              <View key={sk.id} style={s.skillRow}>
                <Text style={s.skillGroup}>{sk.group}</Text>
                <Text style={s.skillItems}>{sk.items}</Text>
              </View>
            ))}
          </View>
        )}

        {content.education.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Education</Text>
            {content.education.map((e) => (
              <View key={e.id} style={s.entry} wrap={false}>
                <View style={s.entryHead}>
                  <Text style={s.entryTitle}>{e.program}</Text>
                  <Text style={s.entryDate}>{dateRange(e.start, e.end)}</Text>
                </View>
                <Text style={s.entrySub}>{[e.institution, e.location, e.note].filter(Boolean).join(" · ")}</Text>
              </View>
            ))}
          </View>
        )}

        {content.certifications.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Certifications</Text>
            {content.certifications.map((c) => (
              <Text key={c.id}>{[c.name, c.issuer, c.date].filter(Boolean).join(" · ")}</Text>
            ))}
          </View>
        )}

        {content.languages.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Languages</Text>
            <Text>{content.languages.map((l) => (l.level ? `${l.name} (${l.level})` : l.name)).join(", ")}</Text>
          </View>
        )}
      </Page>
    </Document>
  );
}

export async function renderResumePdf(content: Content, variantId: string | null): Promise<Buffer> {
  return renderToBuffer(<ResumeDocument content={content} variantId={variantId} />);
}
