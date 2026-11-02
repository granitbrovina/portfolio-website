"use client";

import { useState } from "react";
import { initials, MAX_ICON_DATA_URL, type Content } from "@/lib/schema";
import type { Update } from "./ui";

const ACCEPT = "image/png,image/svg+xml,image/x-icon,image/vnd.microsoft.icon,image/jpeg,image/webp,.ico";
const OK_TYPES = /^image\/(png|svg\+xml|x-icon|vnd\.microsoft\.icon|jpeg|webp)$/;

export default function IconEditor({ content, update }: { content: Content; update: Update }) {
  const b = content.branding;
  const [error, setError] = useState("");
  const text = b.monogramText || initials(content.basics.name) || "•";

  function onFile(file: File | undefined) {
    setError("");
    if (!file) return;
    const isIco = file.name.toLowerCase().endsWith(".ico");
    if (!OK_TYPES.test(file.type) && !isIco) {
      setError("Use a PNG, SVG, ICO, JPEG or WebP image.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      let url = String(reader.result);
      // Some browsers report .ico files with no image type.
      if (isIco) url = url.replace(/^data:[^;]*;/, "data:image/x-icon;");
      if (url.length > MAX_ICON_DATA_URL) {
        setError("That image is too large. Use one under 150 KB; a 512×512 PNG is plenty.");
        return;
      }
      update((d) => {
        d.branding.faviconImage = url;
        d.branding.faviconMode = "image";
      });
    };
    reader.onerror = () => setError("Couldn't read that file.");
    reader.readAsDataURL(file);
  }

  const preview = (px: number) =>
    b.faviconMode === "image" && b.faviconImage ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={b.faviconImage} width={px} height={px} alt="" className="adm-favicon-img" />
    ) : (
      <span
        className="adm-favicon-mono"
        style={{
          width: px,
          height: px,
          background: b.monogramBg,
          color: b.monogramFg,
          borderRadius: Math.round(px * 0.22),
          fontSize: Math.round(px * (text.length > 2 ? 0.36 : 0.48)),
        }}
      >
        {text}
      </span>
    );

  return (
    <div className="adm-item">
      <div className="adm-favicon-row">
        <div className="adm-favicon-previews" aria-label="Icon preview">
          {preview(64)}
          {preview(32)}
          {preview(16)}
        </div>
        <div className="adm-radios" role="radiogroup" aria-label="Icon type">
          <label htmlFor="fav-mono">
            <input
              id="fav-mono"
              type="radio"
              name="fav-mode"
              checked={b.faviconMode === "monogram"}
              onChange={() => update((d) => { d.branding.faviconMode = "monogram"; })}
            />
            Letters
          </label>
          <label htmlFor="fav-image">
            <input
              id="fav-image"
              type="radio"
              name="fav-mode"
              checked={b.faviconMode === "image"}
              disabled={!b.faviconImage}
              onChange={() => update((d) => { d.branding.faviconMode = "image"; })}
            />
            Uploaded image
          </label>
        </div>
      </div>

      {b.faviconMode === "monogram" && (
        <div className="adm-grid three">
          <label className="adm-field" htmlFor="fav-text">
            <span className="adm-label">Letters (up to 3)</span>
            <input
              id="fav-text"
              type="text"
              maxLength={3}
              placeholder={initials(content.basics.name) || "AB"}
              value={b.monogramText}
              onChange={(e) => update((d) => { d.branding.monogramText = e.target.value; })}
            />
            <span className="adm-hint">Empty uses your initials.</span>
          </label>
          <label className="adm-field" htmlFor="fav-bg">
            <span className="adm-label">Background</span>
            <input
              id="fav-bg"
              type="color"
              className="adm-color"
              value={b.monogramBg}
              onChange={(e) => update((d) => { d.branding.monogramBg = e.target.value; })}
            />
          </label>
          <label className="adm-field" htmlFor="fav-fg">
            <span className="adm-label">Letters colour</span>
            <input
              id="fav-fg"
              type="color"
              className="adm-color"
              value={b.monogramFg}
              onChange={(e) => update((d) => { d.branding.monogramFg = e.target.value; })}
            />
          </label>
        </div>
      )}

      <div className="adm-row">
        <label className="adm-field inline" htmlFor="fav-file">
          <span className="adm-label">Upload an image</span>
          <input id="fav-file" type="file" accept={ACCEPT} onChange={(e) => { onFile(e.target.files?.[0]); e.target.value = ""; }} />
          <span className="adm-hint">Square PNG or SVG works best, at least 180×180, under 150 KB.</span>
        </label>
        {b.faviconImage && (
          <button
            type="button"
            className="adm-btn small"
            onClick={() => update((d) => { d.branding.faviconImage = ""; d.branding.faviconMode = "monogram"; })}
          >
            Remove image
          </button>
        )}
      </div>
      {error && <p className="adm-error">{error}</p>}
      <p className="adm-muted">Browsers cache icons, so after saving you may need a hard refresh to see the new one in your tab.</p>
    </div>
  );
}
