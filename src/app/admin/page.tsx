import type { Metadata } from "next";
import { adminPath, auth, isAdminEmail } from "@/auth";
import { getContent, hasDatabase } from "@/lib/db";
import AuthButton from "./AuthButton";
import Editor from "./Editor";
import "./admin.css";

// Reached only through the hidden query URL (see src/middleware.ts).
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

export default async function AdminPage() {
  const session = await auth();
  const email = session?.user?.email ?? null;
  const home = adminPath() ?? "/";

  if (!email || !isAdminEmail(email)) {
    return (
      <main className="adm-gate">
        <div className="adm-gate-card">
          <p className="adm-eyebrow">Site admin</p>
          <h1>Sign in to edit your site</h1>
          <p>Only the site owner&apos;s Google account can sign in here.</p>
          {email && <p className="adm-error">{email} doesn&apos;t have access. Sign out and use the owner account.</p>}
          <AuthButton mode={email ? "signout" : "signin"} callbackUrl={home} />
          <a className="adm-link" href="/">Back to the site</a>
        </div>
      </main>
    );
  }

  const { content, updatedAt, source } = await getContent();
  return (
    <Editor
      initial={content}
      initialUpdatedAt={updatedAt}
      source={source}
      email={email}
      homeUrl={home}
      databaseConfigured={hasDatabase()}
      importEnabled={Boolean(process.env.ANTHROPIC_API_KEY)}
    />
  );
}
