import { getContent } from "@/lib/db";
import ThemeView from "./themes/ThemeView";

// Rebuilt at most hourly, and immediately whenever the admin panel saves.
export const revalidate = 3600;

export default async function Home() {
  const { content } = await getContent();
  return <ThemeView content={content} />;
}
