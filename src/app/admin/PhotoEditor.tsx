"use client";

import { useState } from "react";
import { MAX_PHOTO_DATA_URL, type Content } from "@/lib/schema";
import type { Update } from "./ui";

const MAX_EDGE = 800; // px on the longest side

/** Downscales any image to a JPEG small enough to store and serve quickly. */
async function resize(file: File): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("Couldn't read that image."));
      el.src = url;
    });
    const scale = Math.min(1, MAX_EDGE / Math.max(img.naturalWidth, img.naturalHeight));
    const w = Math.round(img.naturalWidth * scale);
    const h = Math.round(img.naturalHeight * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Your browser couldn't process that image.");
    ctx.fillStyle = "#ffffff"; // flatten transparent PNGs onto white
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);
    for (const q of [0.86, 0.78, 0.7, 0.6]) {
      const out = canvas.toDataURL("image/jpeg", q);
      if (out.length <= MAX_PHOTO_DATA_URL) return out;
    }
    throw new Error("That image is too large even after resizing.");
  } finally {
    URL.revokeObjectURL(url);
  }
}

export default function PhotoEditor({ content, update }: { content: Content; update: Update }) {
  const photo = content.basics.photo;
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onFile(file: File | undefined) {
    setError("");
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Choose an image file such as a JPEG, PNG or WebP.");
      return;
    }
    setBusy(true);
    try {
      const dataUrl = await resize(file);
      update((d) => { d.basics.photo = dataUrl; });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't use that image.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="adm-item">
      <div className="adm-photo-row">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt="Current profile photo" className="adm-photo" />
        ) : (
          <div className="adm-photo empty">No photo</div>
        )}
        <div className="adm-photo-actions">
          <label className="adm-field inline" htmlFor="photo-file">
            <span className="adm-label">{photo ? "Replace photo" : "Upload a photo"}</span>
            <input
              id="photo-file"
              type="file"
              accept="image/*"
              disabled={busy}
              onChange={(e) => { onFile(e.target.files?.[0]); e.target.value = ""; }}
            />
            <span className="adm-hint">
              Shown beside your headline, cropped to a 4:5 portrait. Any size works; it&apos;s resized automatically.
            </span>
          </label>
          {busy && <p className="adm-muted">Resizing…</p>}
          {photo && (
            <button type="button" className="adm-btn small" onClick={() => update((d) => { d.basics.photo = ""; })}>
              Remove photo
            </button>
          )}
          {error && <p className="adm-error">{error}</p>}
          <p className="adm-muted">The photo appears on the site and in link previews, never on generated resumes.</p>
        </div>
      </div>
    </div>
  );
}
