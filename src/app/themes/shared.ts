import { photoVersion, type Content, type Experience } from "@/lib/schema";

/** Everything a theme needs, worked out once from the saved content. */
export function prepare(content: Content) {
  const { basics, experience, projects, resume, languages } = content;
  const publicVariant = resume.variants.find((v) => v.id === resume.publicVariant);

  // Consecutive roles at the same company are grouped under one heading.
  const groups: { company: string; location: string; roles: Experience[] }[] = [];
  for (const role of experience) {
    const last = groups[groups.length - 1];
    if (last && last.company === role.company) last.roles.push(role);
    else groups.push({ company: role.company, location: role.location, roles: [role] });
  }

  return {
    shownProjects: projects.filter((p) => p.showOnSite),
    resumeHref: publicVariant ? `/api/resume?variant=${encodeURIComponent(publicVariant.id)}` : null,
    photoUrl: basics.photo ? `/api/photo?v=${photoVersion(content)}` : null,
    photoAlt: basics.name ? `Photo of ${basics.name}` : "Profile photo",
    year: new Date().getFullYear(),
    groups,
    languagesLine: languages.map((l) => (l.level ? `${l.name} (${l.level.toLowerCase()})` : l.name)).join(", "),
  };
}

export type Prepared = ReturnType<typeof prepare>;
