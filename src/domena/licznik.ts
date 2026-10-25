// Licznik: powtórzenia (RD-12) i wartość wyświetlana (BR-LIC-012, BR-LIC-018).
import type { Wynik } from './bledy';
import type { ZnaczenieLicznika } from './stany';
import { niezaimplementowane } from './zaslepka';

/** RD-12: numer powtórzenia i rząd w powtórzeniu dla rzędu r przy powtórzeniu co n rzędów. */
export function powtorzenie(_r: number, _n: number): Wynik<{ powtorzenie: number; rzadW: number }> {
  return niezaimplementowane('RD-12 powtorzenie');
}
/** BR-LIC-012: liczba skończonych rzędów i rząd, który się dzierga („Now knitting row N”). */
export function wartoscWyswietlana(_wartosc: number, _znaczenie: ZnaczenieLicznika): { skonczone: number; dziergany: number } {
  return niezaimplementowane('BR-LIC-012 wartoscWyswietlana');
}
