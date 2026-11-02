"use client";

import { useState } from "react";

export default function CopyEmail({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const el = document.getElementById("contact-email");
      if (el) {
        const range = document.createRange();
        range.selectNodeContents(el);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
    }
  }

  return (
    <div className="contact-line">
      <a className="email" id="contact-email" href={`mailto:${email}`}>{email}</a>
      <button className="btn" type="button" onClick={copy}>Copy</button>
      {copied && <span className="copied" role="status">Copied</span>}
    </div>
  );
}
