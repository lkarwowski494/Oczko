// Moduł motywu (zasada 15, design-spec „Pliki”): wartości wyłącznie z docs/design/tokeny.json roli 04 — bez liczb wpisanych w ekranach.
// Kolory motywu jasnego i ciemnego z `useColorScheme`; krój tytułowy Libre Franklin (P-064), treść krojem systemowym (Dynamic Type).
import { useColorScheme, type TextStyle } from 'react-native';
import tokeny from '../../docs/design/tokeny.json';

export type Kolory = typeof tokeny.kolor.jasny;
export const odstep = tokeny.odstep;
export const promien = tokeny.promien;
export const cel = tokeny.cel;
/** Kolory na stałym czarnym tle (zegarek, Dynamic Island, podgląd zdjęcia; design-spec „systemCzarny”). */
export const systemCzarny = tokeny.kolor.systemCzarny;
/** Kolory motywu jasnego niezależnie od ustawienia telefonu (obraz karty ukończenia trafia poza aplikację, design-spec P10a). */
export const kolorJasny = tokeny.kolor.jasny;
/**
 * Krój tytułowy (P-064). Pliku `docs/design/fonty/LibreFranklin.ttf` (design-spec.md:13) jeszcze nie ma w repo — zgłoszenie do 04 (08 partia 4, 3A);
 * do tego czasu krój systemowy w tej samej wadze (nazwa niezarejestrowanego kroju dałaby błąd RCTFont). Po dostarczeniu pliku: nazwa 'LibreFranklin'.
 */
export const KROJ_TYTULOWY: string | undefined = undefined;
const ty = tokeny.typografia;
const tytulowy = (t: { rozmiar: number; interlinia: number }): TextStyle => ({ fontFamily: KROJ_TYTULOWY, fontWeight: '700', fontSize: t.rozmiar, lineHeight: Math.round(t.rozmiar * t.interlinia) });
const systemowy = (t: { rozmiar: number; interlinia: number }): TextStyle => ({ fontSize: t.rozmiar, lineHeight: Math.round(t.rozmiar * t.interlinia) });
export const typografia = {
  liczba: { ...tytulowy(ty.liczba), fontVariant: ['tabular-nums'] } satisfies TextStyle,
  tytul: tytulowy(ty.tytul),
  instrukcja: tytulowy(ty.instrukcja),
  przycisk: tytulowy(ty.przycisk),
  tresc: systemowy(ty.tresc),
  podpis: systemowy(ty.podpis),
  drobny: systemowy(ty.drobny),
};
/** Największa skala kluczowej liczby licznika (bez ucięcia przy dużym tekście, tokeny „liczba.maxSkala”). */
export const MAX_SKALA_LICZBY = ty.liczba.maxSkala;

export function useKolory(): Kolory {
  return useColorScheme() === 'dark' ? tokeny.kolor.ciemny : tokeny.kolor.jasny;
}
