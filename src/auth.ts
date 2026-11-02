import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

/** Emails allowed into the admin panel (ADMIN_EMAIL, comma-separated). */
export function adminEmails(): string[] {
  return (process.env.ADMIN_EMAIL || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return adminEmails().includes(email.toLowerCase());
}

export const { handlers, auth } = NextAuth({
  // Reads AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET.
  providers: [Google],
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 },
  trustHost: true,
  callbacks: {
    // Refuse every Google account except the configured admin(s).
    signIn({ profile }) {
      return isAdminEmail(profile?.email) && profile?.email_verified === true;
    },
  },
});

/** Server-side gate used by every admin API route. */
export async function requireAdmin(): Promise<{ email: string } | null> {
  const session = await auth();
  const email = session?.user?.email;
  return email && isAdminEmail(email) ? { email } : null;
}

/** Relative URL of the hidden admin panel, or null if it is disabled. */
export function adminPath(): string | null {
  const key = process.env.ADMIN_QUERY_KEY || "sso";
  const value = process.env.ADMIN_QUERY_VALUE;
  if (!value) return null;
  return `/?${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
}
