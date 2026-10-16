import { useState, useEffect } from 'react';
import { EN } from './i18n.en';

export const LANGS = ['pl', 'en'] as const;
export type Lang = (typeof LANGS)[number];

let currentLang: Lang = 'pl';
type LangListener = (l: Lang) => void;
const listeners = new Set<LangListener>();

export function setLang(lang: Lang): void {
  currentLang = lang;
  listeners.forEach((fn) => fn(lang));
}

export function lang(): Lang {
  return currentLang;
}

export function useLang(): Lang {
  const [l, setL] = useState<Lang>(currentLang);
  useEffect(() => {
    listeners.add(setL);
    return () => {
      listeners.delete(setL);
    };
  }, []);
  return l;
}

const own = (dict: Record<string, string>, key: string): string | undefined => {
  return Object.prototype.hasOwnProperty.call(dict, key) ? dict[key] : undefined;
};

/**
 * Tłumaczenie tekstu z opcjonalną interpolacją parametrów {klucz}.
 * Zgodne ze Złotym Standardem Apps4Brew Core (i18n z polskimi kluczami jako źródłem prawdy).
 */
export function t(pl: string, params?: Record<string, string | number>): string {
  let text = currentLang === 'pl' ? pl : own(EN, pl) ?? pl;
  if (params) {
    for (const k of Object.keys(params)) {
      text = text.split(`{${k}}`).join(String(params[k]));
    }
  }
  return text;
}
