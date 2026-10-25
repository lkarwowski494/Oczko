// Licznik: powtórzenia (RD-12) i wartość wyświetlana (BR-LIC-012, BR-LIC-018).
import type { Wynik } from './bledy';
import type { ZnaczenieLicznika } from './stany';

/** RD-12: numer powtórzenia i rząd w powtórzeniu dla rzędu r przy powtórzeniu co n rzędów. */
export function powtorzenie(r: number, n: number): Wynik<{ powtorzenie: number; rzadW: number }> {
  if (!Number.isInteger(r) || !Number.isInteger(n) || r < 0 || n < 1) return { ok: false, powod: 'bledne_dane' }; // RD-12-W5, W6
  if (r === 0) return { ok: true, wartosc: { powtorzenie: 1, rzadW: 0 } }; // „0 z n” przed pierwszym rzędem (P-097 (3.1a))
  return { ok: true, wartosc: { powtorzenie: Math.floor((r - 1) / n) + 1, rzadW: ((r - 1) % n) + 1 } };
}
/** BR-LIC-012: liczba skończonych rzędów i rząd, który się dzierga („Now knitting row N”). */
// Licznik zapisuje liczbę skończonych rzędów w obu trybach; tryb zmienia tylko to, co pokazuje duża liczba (BR-LIC-012, design-spec).
export function wartoscWyswietlana(wartosc: number, _znaczenie: ZnaczenieLicznika): { skonczone: number; dziergany: number } {
  return { skonczone: wartosc, dziergany: wartosc + 1 };
}
