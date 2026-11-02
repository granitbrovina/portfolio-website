/**
 * Minimal inline-link syntax for content fields: [label](https://example.com)
 * Only http(s) and mailto links are recognised; everything else stays plain text.
 */
export type Segment = { text: string; href?: string };

const LINK = /\[([^\]\n]+)\]\(((?:https?:\/\/|mailto:)[^\s)]+)\)/g;

export function parseLinks(input: string): Segment[] {
  const out: Segment[] = [];
  let last = 0;
  for (const m of input.matchAll(LINK)) {
    const i = m.index ?? 0;
    if (i > last) out.push({ text: input.slice(last, i) });
    out.push({ text: m[1], href: m[2] });
    last = i + m[0].length;
  }
  if (last < input.length) out.push({ text: input.slice(last) });
  return out;
}

/** Same text with the link syntax removed: "[Joan](https://…)" → "Joan". */
export function stripLinks(input: string): string {
  return input.replace(LINK, "$1");
}
