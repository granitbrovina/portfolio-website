import { z } from "zod";

/**
 * Everything on the site lives in one JSON document that matches this schema.
 * The public page renders it, the admin panel edits it, the PDF importer
 * proposes changes to it, and the resume generator prints it.
 *
 * `variants` on an item lists the resume variants it belongs to.
 * An empty list means "include in every variant".
 */

const id = () => z.string().default(() => Math.random().toString(36).slice(2, 10));
const variants = z.array(z.string()).default([]);

export const BulletSchema = z.object({
  id: id(),
  text: z.string().default(""),
  variants,
});

export const ExperienceSchema = z.object({
  id: id(),
  role: z.string().default(""),
  company: z.string().default(""),
  location: z.string().default(""),
  start: z.string().default(""),
  end: z.string().default(""), // empty = present
  summary: z.string().default(""),
  bullets: z.array(BulletSchema).default([]),
  variants,
});

export const ProjectSchema = z.object({
  id: id(),
  name: z.string().default(""),
  kind: z.string().default(""),
  description: z.string().default(""),
  tags: z.array(z.string()).default([]),
  url: z.string().default(""),
  showOnSite: z.boolean().default(true),
  variants,
});

export const SkillGroupSchema = z.object({
  id: id(),
  group: z.string().default(""),
  items: z.string().default(""),
  variants,
});

export const EducationSchema = z.object({
  id: id(),
  institution: z.string().default(""),
  program: z.string().default(""),
  location: z.string().default(""),
  start: z.string().default(""),
  end: z.string().default(""),
  note: z.string().default(""),
});

export const CertificationSchema = z.object({
  id: id(),
  name: z.string().default(""),
  issuer: z.string().default(""),
  date: z.string().default(""),
  url: z.string().default(""),
});

export const LanguageSchema = z.object({
  id: id(),
  name: z.string().default(""),
  level: z.string().default(""),
});

export const FocusAreaSchema = z.object({
  id: id(),
  title: z.string().default(""),
  body: z.string().default(""),
});

export const VariantSchema = z.object({
  id: z.string().min(1),
  label: z.string().default(""),
  headline: z.string().default(""),
  summary: z.string().default(""),
});

export const BasicsSchema = z.object({
  name: z.string().default(""),
  headline: z.string().default(""), // short role line, e.g. "Data & Support Engineer"
  heroTitle: z.string().default(""), // large statement on the site
  summary: z.string().default(""),
  location: z.string().default(""),
  availability: z.string().default(""),
  email: z.string().default(""),
  phone: z.string().default(""), // printed on resumes only, never on the site
  linkedin: z.string().default(""),
  github: z.string().default(""),
  website: z.string().default(""),
  // Small line at the bottom of the site. Supports [text](url) links. Empty hides it.
  footerNote: z
    .string()
    .default(
      "Want a portfolio site like this one? It's open source, so you can [build your own](https://github.com/granitbrovina/portfolio-website).",
    ),
});

const HEX = /^#[0-9a-f]{3}([0-9a-f]{3})?$/i;
const ICON_DATA_URL = /^data:image\/(png|svg\+xml|x-icon|vnd\.microsoft\.icon|jpeg|webp);base64,[A-Za-z0-9+/=]+$/;
export const MAX_ICON_DATA_URL = 220_000; // ~160 KB file

export const BrandingSchema = z.object({
  faviconMode: z.enum(["monogram", "image"]).default("monogram"),
  monogramText: z.string().default("").transform((v) => v.trim().slice(0, 3)),
  monogramBg: z.string().default("#1d5c86").transform((v) => (HEX.test(v) ? v : "#1d5c86")),
  monogramFg: z.string().default("#ffffff").transform((v) => (HEX.test(v) ? v : "#ffffff")),
  // Uploaded icon stored as a data URL. Anything else is dropped.
  faviconImage: z
    .string()
    .default("")
    .transform((v) => (v.length <= MAX_ICON_DATA_URL && ICON_DATA_URL.test(v) ? v : "")),
});

export const ContentSchema = z.object({
  basics: BasicsSchema.default({}),
  branding: BrandingSchema.default({}),
  focusAreas: z.array(FocusAreaSchema).default([]),
  experience: z.array(ExperienceSchema).default([]),
  projects: z.array(ProjectSchema).default([]),
  skills: z.array(SkillGroupSchema).default([]),
  education: z.array(EducationSchema).default([]),
  certifications: z.array(CertificationSchema).default([]),
  languages: z.array(LanguageSchema).default([]),
  resume: z
    .object({
      variants: z.array(VariantSchema).default([]),
      publicVariant: z.string().default(""), // "" = no public download button
    })
    .default({}),
});

export type Content = z.infer<typeof ContentSchema>;
export type Basics = z.infer<typeof BasicsSchema>;
export type Experience = z.infer<typeof ExperienceSchema>;
export type Bullet = z.infer<typeof BulletSchema>;
export type Project = z.infer<typeof ProjectSchema>;
export type SkillGroup = z.infer<typeof SkillGroupSchema>;
export type Education = z.infer<typeof EducationSchema>;
export type Certification = z.infer<typeof CertificationSchema>;
export type Language = z.infer<typeof LanguageSchema>;
export type FocusArea = z.infer<typeof FocusAreaSchema>;
export type Variant = z.infer<typeof VariantSchema>;
export type Branding = z.infer<typeof BrandingSchema>;

export function newId(): string {
  return Math.random().toString(36).slice(2, 10);
}

/** True when an item with these variant tags belongs in the given variant. */
export function inVariant(itemVariants: string[], variant: string | null): boolean {
  if (!variant) return true;
  return itemVariants.length === 0 || itemVariants.includes(variant);
}

/** "2021" + "" → "2021 – Present" */
export function dateRange(start: string, end: string): string {
  if (!start && !end) return "";
  if (!start) return end || "Present";
  return `${start} – ${end || "Present"}`;
}

/** "Ada Lovelace" → "AL" */
export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
}

/** Short stable hash of the icon settings, used to bust browser favicon caches after a change. */
export function faviconVersion(content: Content): string {
  const src = JSON.stringify([content.branding, content.basics.name]);
  let h = 5381;
  for (let i = 0; i < src.length; i++) h = ((h << 5) + h + src.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}
