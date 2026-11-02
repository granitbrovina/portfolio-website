"use client";

import { useEffect, useState } from "react";

/**
 * Posts straight to Auth.js's endpoints with a CSRF token, the same way the
 * built-in Auth.js sign-in page does. No client session provider needed.
 */
export default function AuthButton({
  mode,
  callbackUrl,
  className = "adm-btn primary",
}: {
  mode: "signin" | "signout";
  callbackUrl: string;
  className?: string;
}) {
  const [csrf, setCsrf] = useState("");

  useEffect(() => {
    fetch("/api/auth/csrf")
      .then((r) => r.json())
      .then((d: { csrfToken?: string }) => setCsrf(d.csrfToken ?? ""))
      .catch(() => setCsrf(""));
  }, []);

  const action = mode === "signin" ? "/api/auth/signin/google" : "/api/auth/signout";
  return (
    <form method="post" action={action}>
      <input type="hidden" name="csrfToken" value={csrf} />
      <input type="hidden" name="callbackUrl" value={callbackUrl} />
      <button className={className} type="submit" disabled={!csrf}>
        {mode === "signin" ? "Sign in with Google" : "Sign out"}
      </button>
    </form>
  );
}
