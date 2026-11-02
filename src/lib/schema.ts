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
  showOnResume: z.boolean().default(true),
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

export const HighlightSchema = z.object({
  id: id(),
  value: z.string().default(""), // "50%+", "20→1 min"
  label: z.string().default(""), // what the number means
});

export const THEME_IDS = ["original", "schematic", "results", "granite", "workplace", "corporate"] as const;
export type ThemeId = (typeof THEME_IDS)[number];
export const THEMES: { id: ThemeId; label: string; description: string; swatches: string[] }[] = [
  { id: "original", label: "Original", description: "Calm e-paper grey with an ink-blue accent; follows the visitor's light or dark mode.", swatches: ["#F2F3EF", "#17201C", "#1D5C86"] },
  { id: "schematic", label: "Schematic", description: "Engineering-drawing look: grid paper, wide headings, monospace sheet labels.", swatches: ["#F3F5F6", "#0F1B26", "#2448A8"] },
  { id: "results", label: "Results-first", description: "Swiss-style typography with a huge name and your key numbers up front.", swatches: ["#FBFBF8", "#121212", "#FFD84D"] },
  { id: "granite", label: "Granite", description: "Dark charcoal with a warm amber accent and a large portrait.", swatches: ["#12161A", "#E6E9EC", "#E9B44C"] },
  { id: "workplace", label: "Workplace", description: "Inspired by getjoan.com: soft grey ground, white cards, geometric headings, electric-violet accent, greyscale photo.", swatches: ["#F7F7F7", "#000000", "#4205DD"] },
  { id: "corporate", label: "Corporate Blue", description: "Inspired by na.panasonic.com: royal-blue header band, dark hero card, centred sections, navy footer.", swatches: ["#1953B4", "#FFFFFF", "#0F315F"] },
];

export const VariantSchema = z.object({
  id: z.string().min(1),
  label: z.string().default(""),
  headline: z.string().default(""),
  summary: z.string().default(""),
});

const PHOTO_DATA_URL = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/;
export const MAX_PHOTO_DATA_URL = 900_000; // ~650 KB image; uploads are resized well below this

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
  // Profile picture as a data URL (resized in the browser on upload). Empty = no photo.
  photo: z
    .string()
    .default("")
    .transform((v) => (v.length <= MAX_PHOTO_DATA_URL && PHOTO_DATA_URL.test(v) ? v : "")),
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
  theme: z.enum(THEME_IDS).catch("original").default("original"),
  highlights: z.array(HighlightSchema).default([]),
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
export type Highlight = z.infer<typeof HighlightSchema>;

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
export function hashString(src: string): string {
  let h = 5381;
  for (let i = 0; i < src.length; i++) h = ((h << 5) + h + src.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

export function faviconVersion(content: Content): string {
  return hashString(JSON.stringify([content.branding, content.basics.name]));
}

/** Changes whenever the photo changes, so its URL can be cached for a long time. */
export function photoVersion(content: Content): string {
  return hashString(content.basics.photo);
}
