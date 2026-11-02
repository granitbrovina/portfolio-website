# portfolio-website

A personal portfolio you edit from the browser. Source for [granitbrovina.com](https://granitbrovina.com).

- **Public site** rendered from one JSON document stored in Postgres.
- **Hidden admin panel** at `/?<key>=<value>` (you choose both). Only your Google account can sign in.
- **Edit everything** in forms: profile, experience, projects, skills, education. Saving publishes immediately and keeps a version history.
- **Import a resume PDF.** Claude reads it and proposes updates; you pick what to apply.
- **Generate resume PDFs** from the site content, with variants (e.g. data, support, IT) that each get their own headline and a subset of bullets and projects.
- **Site icon** as generated initials or an uploaded image, and **JSON export/import** for backups.

Built with Next.js, Auth.js (Google), Neon Postgres, the Anthropic API and react-pdf. MIT licensed. Fork it and make it yours.

## Deploy your own (about 20 minutes)

You need accounts on GitHub, Vercel and Google Cloud. An Anthropic API key is optional (it powers PDF import).

1. **Fork** this repo. A fresh deploy shows placeholder content from `src/lib/seed.ts` until you save your own from the admin panel (or import your resume PDF).
2. **Create the project on Vercel:** *Add New → Project*, import your fork. The first build works without any settings.
3. **Add a database:** in the project, *Storage → Create Database → Neon* (free plan). Connect it with the env prefix `DATABASE` so Vercel sets `DATABASE_URL`. Tables are created automatically on first use.
4. **Google sign-in:** in [Google Cloud console](https://console.cloud.google.com) → *Google Auth Platform*:
   - Set up branding, audience **External**, and leave it in **Testing**. Under *Audience → Test users*, add your Gmail address.
   - *Clients → Create client → Web application*. Add redirect URIs:
     `https://YOUR-DOMAIN/api/auth/callback/google`, your `*.vercel.app` URL with the same path, and `http://localhost:3000/api/auth/callback/google`.
5. **Environment variables** (*Settings → Environment Variables*, see `.env.example`):

   | Name | Value |
   | --- | --- |
   | `AUTH_SECRET` | output of `openssl rand -base64 32` |
   | `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | from the Google OAuth client |
   | `ADMIN_EMAIL` | your Gmail address |
   | `ADMIN_QUERY_KEY` / `ADMIN_QUERY_VALUE` | e.g. `sso` and a long random string |
   | `ANTHROPIC_API_KEY` | optional, enables PDF import |

6. **Redeploy** (*Deployments → ⋯ → Redeploy*). Visit `https://YOUR-DOMAIN/?sso=YOUR-VALUE`, sign in, and press **Save & publish** once to store your content.
7. **Custom domain:** *Settings → Domains → Add*, then create the DNS records Vercel shows at your registrar. Leave existing MX/TXT records alone if you use email on the domain.

## How access works

The query parameter only hides the panel; `/admin` itself returns 404. The real protection is server-side: every admin page and API route checks that the signed-in Google account is in `ADMIN_EMAIL`, and the sign-in itself refuses any other account. Keeping the OAuth app in *Testing* adds a second gate, since Google only lets listed test users sign in.

## Local development

```bash
cp .env.example .env.local   # fill in the values
npm install
npm run dev                  # http://localhost:3000
```

Without `DATABASE_URL` the site serves the seed content and the admin panel is read-only.

## Project layout

```
src/lib/schema.ts       content schema (zod) shared by everything
src/lib/seed.ts         placeholder content for new deploys
src/lib/db.ts           Postgres storage + version history
src/lib/resume-pdf.tsx  resume PDF template
src/middleware.ts       hidden admin URL
src/auth.ts             Google sign-in + admin allowlist
src/app/page.tsx        public site
src/app/admin/          admin panel
src/app/api/            content, history, import, resume and favicon endpoints
```
