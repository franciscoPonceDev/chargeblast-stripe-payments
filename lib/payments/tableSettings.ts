"use client";
import { useCallback, useEffect, useState } from "react";
import { COLUMN_OPTIONS, SETTINGS_STYLE_ID, TABLE_SETTINGS_KEY } from "./tableSettingsConfig";

export { COLUMN_OPTIONS, TABLE_SETTINGS_KEY };

export interface TableSettings {
  hidden: string[];
  wrap: boolean;
}

export const DEFAULT_TABLE_SETTINGS: TableSettings = { hidden: [], wrap: false };

const HIDEABLE = new Set(COLUMN_OPTIONS.filter((c) => !c.locked).map((c) => c.id));

function parse(raw: string | null): TableSettings {
  if (!raw) return DEFAULT_TABLE_SETTINGS;
  try {
    const v: unknown = JSON.parse(raw);
    if (typeof v !== "object" || v === null) return DEFAULT_TABLE_SETTINGS;
    const { hidden, wrap } = v as Partial<Record<keyof TableSettings, unknown>>;
    return {
      hidden: Array.isArray(hidden) ? [...new Set(hidden.filter((id): id is string => typeof id === "string" && HIDEABLE.has(id)))] : [],
      wrap: wrap === true,
    };
  } catch {
    return DEFAULT_TABLE_SETTINGS;
  }
}

// Trade-off: settings live in localStorage, not the URL; they are a per-browser preference, not shareable view state.
export function useTableSettings() {
  const [settings, setSettings] = useState<TableSettings>(DEFAULT_TABLE_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  // Trade-off: read after mount so SSR and first client render match; a saved layout appears after a brief flash.
  useEffect(() => {
    const read = () => {
      try {
        setSettings(parse(localStorage.getItem(TABLE_SETTINGS_KEY)));
      } catch {
        /* storage unavailable: keep defaults */
      }
    };
    read();
    setLoaded(true);
    // Keep other tabs in sync.
    const onStorage = (e: StorageEvent) => {
      if (e.key === TABLE_SETTINGS_KEY || e.key === null) read();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // The pre-paint <style> (see settingsScript) has done its job once React has rendered the same settings.
  useEffect(() => {
    if (loaded) document.getElementById(SETTINGS_STYLE_ID)?.remove();
  }, [loaded, settings]);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(TABLE_SETTINGS_KEY, JSON.stringify(settings));
    } catch {
      /* storage unavailable or full: settings last for this session only */
    }
  }, [loaded, settings]);

  const setColumnVisible = useCallback((id: string, visible: boolean) => {
    if (!HIDEABLE.has(id)) return;
    setSettings((s) => ({
      ...s,
      hidden: visible ? s.hidden.filter((h) => h !== id) : s.hidden.includes(id) ? s.hidden : [...s.hidden, id],
    }));
  }, []);
  const setWrap = useCallback((wrap: boolean) => setSettings((s) => ({ ...s, wrap })), []);
  const reset = useCallback(() => setSettings(DEFAULT_TABLE_SETTINGS), []);

  return { settings, setColumnVisible, setWrap, reset };
}
