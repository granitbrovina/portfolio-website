import type { Content, ThemeId } from "@/lib/schema";
import Corporate from "./Corporate";
import Granite from "./Granite";
import Original from "./Original";
import Results from "./Results";
import Schematic from "./Schematic";
import Workplace from "./Workplace";
import { prepare } from "./shared";

/** Renders the saved content with one of the site themes. */
export default function ThemeView({ content, theme }: { content: Content; theme?: ThemeId }) {
  const p = prepare(content);
  switch (theme ?? content.theme) {
    case "schematic": return <Schematic content={content} p={p} />;
    case "results": return <Results content={content} p={p} />;
    case "granite": return <Granite content={content} p={p} />;
    case "workplace": return <Workplace content={content} p={p} />;
    case "corporate": return <Corporate content={content} p={p} />;
    default: return <Original content={content} p={p} />;
  }
}
