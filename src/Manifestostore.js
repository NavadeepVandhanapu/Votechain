// ─────────────────────────────────────────────────────────────
// manifestoStore.js
// Single source of truth for manifesto data.
// ALL components import from here — no scattered localStorage calls.
// ─────────────────────────────────────────────────────────────

const KEY = "votechain_manifestos"; // { "0": "...", "1": "...", ... }
const EVENT = "votechain_manifesto_updated"; // custom event name

// ── Read all manifestos ──────────────────────────────────────
export function getAllManifestos() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}");
  } catch {
    return {};
  }
}

// ── Read one manifesto by candidate index ────────────────────
export function getManifesto(index) {
  return getAllManifestos()[String(index)] || "";
}

// ── Save one manifesto by candidate index ────────────────────
// Also fires a custom event so any listening component re-renders
export function saveManifesto(index, text) {
  const all = getAllManifestos();
  all[String(index)] = text.trim();
  localStorage.setItem(KEY, JSON.stringify(all));

  // 🔥 Broadcast to ALL components on this page
  window.dispatchEvent(new CustomEvent(EVENT, { detail: { index, text: text.trim() } }));
}

// ── Delete one manifesto ─────────────────────────────────────
export function deleteManifesto(index) {
  const all = getAllManifestos();
  delete all[String(index)];
  localStorage.setItem(KEY, JSON.stringify(all));

  window.dispatchEvent(new CustomEvent(EVENT, { detail: { index, text: "" } }));
}

// ── React hook — auto re-renders when ANY manifesto changes ──
// Usage: const manifesto = useManifesto(candidateIndex);
import { useState, useEffect } from "react";

export function useManifesto(index) {
  const [text, setText] = useState(() => getManifesto(index));

  useEffect(() => {
    // Re-read whenever manifesto store updates
    const handler = () => setText(getManifesto(index));
    window.addEventListener(EVENT, handler);
    return () => window.removeEventListener(EVENT, handler);
  }, [index]);

  return text;
}

// ── React hook — returns full manifesto map, re-renders on change ──
// Usage: const manifestos = useAllManifestos();
export function useAllManifestos() {
  const [all, setAll] = useState(() => getAllManifestos());

  useEffect(() => {
    const handler = () => setAll(getAllManifestos());
    window.addEventListener(EVENT, handler);
    return () => window.removeEventListener(EVENT, handler);
  }, []);

  return all;
}