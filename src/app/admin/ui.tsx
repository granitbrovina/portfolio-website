"use client";

import type { Content, Variant } from "@/lib/schema";

export type Update = (fn: (draft: Content) => void) => void;

export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

/* ------------------------------------------------------------------ */
/* Shared form pieces                                                  */
/* ------------------------------------------------------------------ */

export function Field(props: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  rows?: number;
  hint?: string;
  placeholder?: string;
}) {
  return (
    <label className="adm-field" htmlFor={props.id}>
      <span className="adm-label">{props.label}</span>
      {props.multiline ? (
        <textarea
          id={props.id}
          rows={props.rows ?? 3}
          value={props.value}
          placeholder={props.placeholder}
          onChange={(e) => props.onChange(e.target.value)}
        />
      ) : (
        <input
          id={props.id}
          type="text"
          value={props.value}
          placeholder={props.placeholder}
          onChange={(e) => props.onChange(e.target.value)}
        />
      )}
      {props.hint && <span className="adm-hint">{props.hint}</span>}
    </label>
  );
}

export function ItemTools(props: { index: number; count: number; onMove: (to: number) => void; onRemove: () => void; label: string }) {
  return (
    <div className="adm-tools">
      <button type="button" className="adm-icon" aria-label={`Move ${props.label} up`} disabled={props.index === 0} onClick={() => props.onMove(props.index - 1)}>↑</button>
      <button type="button" className="adm-icon" aria-label={`Move ${props.label} down`} disabled={props.index === props.count - 1} onClick={() => props.onMove(props.index + 1)}>↓</button>
      <button type="button" className="adm-icon danger" aria-label={`Remove ${props.label}`} onClick={props.onRemove}>Remove</button>
    </div>
  );
}

export function VariantChips(props: { variants: Variant[]; value: string[]; onChange: (v: string[]) => void }) {
  if (props.variants.length === 0) return null;
  const all = props.value.length === 0;
  return (
    <div className="adm-chips" role="group" aria-label="Resume variants">
      <span className="adm-chips-label">On resumes:</span>
      <button type="button" className={`adm-chip ${all ? "on" : ""}`} onClick={() => props.onChange([])}>All</button>
      {props.variants.map((v) => {
        const on = props.value.includes(v.id);
        return (
          <button
            key={v.id}
            type="button"
            className={`adm-chip ${on ? "on" : ""}`}
            aria-pressed={on}
            onClick={() => props.onChange(on ? props.value.filter((x) => x !== v.id) : [...props.value, v.id])}
          >
            {v.label || v.id}
          </button>
        );
      })}
    </div>
  );
}

export function move<T>(list: T[], from: number, to: number): void {
  if (to < 0 || to >= list.length) return;
  const [item] = list.splice(from, 1);
  list.splice(to, 0, item);
}

