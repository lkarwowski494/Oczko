// Formaty z Intl według języka aplikacji i preferencji urządzenia (ADR-0017). Bez własnego sklejania separatorów.
export type UkladMiar = 'metric' | 'imperial';
export type PreferencjaMiar = 'auto' | UkladMiar;

export function formatujLiczbe(n: number, jezyk: string, opcje: { maks?: number } = {}): string {
  return new Intl.NumberFormat(jezyk, opcje.maks === undefined ? undefined : { maximumFractionDigits: opcje.maks }).format(n);
}

export function formatujGodzine(d: Date, jezyk: string, opcje: { uses24h: boolean; strefa?: string }): string {
  return new Intl.DateTimeFormat(jezyk, { hour: 'numeric', minute: '2-digit', hour12: !opcje.uses24h, timeZone: opcje.strefa }).format(d);
}

/** Data lokalna w strefie urządzenia (RD-16), w formacie języka. */
export function formatujDate(d: Date, jezyk: string, opcje: { strefa?: string } = {}): string {
  return new Intl.DateTimeFormat(jezyk, { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: opcje.strefa }).format(d);
}

/** `systemowy` to `measurementSystem` z expo-localization (null na web). Nieznana preferencja = auto. */
export function ukladMiar(preferencja: PreferencjaMiar, systemowy: 'metric' | 'us' | 'uk' | null): UkladMiar {
  if (preferencja === 'metric' || preferencja === 'imperial') return preferencja;
  return systemowy === 'us' || systemowy === 'uk' ? 'imperial' : 'metric';
}
