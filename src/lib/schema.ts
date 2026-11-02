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
});

export const ContentSchema = z.object({
  basics: BasicsSchema.default({}),
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
