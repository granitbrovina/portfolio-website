import { ContentSchema, type Content } from "./schema";

/**
 * Example content shown until the first save from the admin panel.
 * Replace it here, edit it in the admin panel, or import your resume PDF.
 * Once you've saved, your content lives in the database and this file is
 * only a fallback.
 */
export const seedContent: Content = ContentSchema.parse({
  basics: {
    name: "Your Name",
    headline: "Software Engineer",
    heroTitle: "A one-sentence headline about the work you do.",
    summary:
      "Two or three sentences about your experience, what you build, and the kind of role you're looking for. Edit this from the admin panel.",
    location: "City, Country",
    availability: "Open to new roles",
    email: "you@example.com",
    phone: "",
    linkedin: "",
    github: "",
    website: "",
  },
  branding: {
    faviconMode: "monogram",
    monogramText: "",
    monogramBg: "#1d5c86",
    monogramFg: "#ffffff",
    faviconImage: "",
  },
  focusAreas: [
    { title: "First focus area", body: "A short description of something you do well." },
    { title: "Second focus area", body: "Another area of expertise, in one or two sentences." },
    { title: "Third focus area", body: "Tools, platforms, or problems you know best." },
  ],
  experience: [
    {
      role: "Job Title",
      company: "Company Name",
      location: "City",
      start: "2022",
      end: "",
      summary: "",
      bullets: [
        { text: "What you built or improved, and the result it had.", variants: [] },
        { text: "A responsibility or achievement relevant to the roles you want.", variants: [] },
        { text: "A bullet that appears only on the first resume variant.", variants: ["primary"] },
      ],
      variants: [],
    },
  ],
  projects: [
    {
      name: "Example project",
      kind: "Side project",
      description: "What the project does, who uses it, and what you were responsible for.",
      tags: ["Python", "SQL"],
      url: "",
      variants: [],
    },
    {
      name: "Another project",
      kind: "Internal tool",
      description: "A second example. Untick 'Show on the site' in the admin panel to keep a project for resumes only.",
      tags: ["TypeScript"],
      url: "",
      variants: ["secondary"],
    },
  ],
  skills: [
    { group: "Languages", items: "Python, SQL, TypeScript", variants: [] },
    { group: "Tools", items: "Git, Docker, Linux", variants: [] },
  ],
  education: [
    {
      institution: "University Name",
      program: "Program or degree",
      location: "City",
      start: "2016",
      end: "2020",
      note: "",
    },
  ],
  certifications: [],
  languages: [{ name: "English", level: "Native" }],
  resume: {
    variants: [
      {
        id: "primary",
        label: "Primary",
        headline: "Your Main Target Role | Key Skill | Key Skill",
        summary: "A summary written for your main target role.",
      },
      {
        id: "secondary",
        label: "Secondary",
        headline: "Your Second Target Role | Key Skill | Key Skill",
        summary: "A summary written for a second kind of role.",
      },
    ],
    publicVariant: "",
  },
});
