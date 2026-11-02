import { Fragment } from "react";
import { parseLinks } from "@/lib/richtext";

/** Renders text with [label](url) links as real links. React escapes everything else. */
export default function RichText({ text }: { text: string }) {
  return (
    <>
      {parseLinks(text).map((s, i) =>
        s.href ? (
          <a key={i} href={s.href} target={s.href.startsWith("mailto:") ? undefined : "_blank"} rel="noopener">
            {s.text}
          </a>
        ) : (
          <Fragment key={i}>{s.text}</Fragment>
        ),
      )}
    </>
  );
}
