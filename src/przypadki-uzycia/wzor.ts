// Wzory: import pliku, znacznik rzędu, notatka w miejscu wzoru (ADR-0001, ADR-0011, ADR-0012).
// sygnatura: propozycja 07, do zatwierdzenia w sesji fix 05 (Z07-22). Ciała: zaślepki roli 07 (E3).
import type { Wynik } from '../domena/bledy';
import type { PlikWejsciowy } from '../domena/porty';
import { niezaimplementowane } from '../domena/zaslepka';
import type { ZaleznosciPlikow } from './zaleznosci';

/** Plik uszkodzony → `powod: 'uszkodzony'`, bez wiersza `wzor` i bez pliku w magazynie (BR-WZR-001/S2). */
export function importujWzor(_z: ZaleznosciPlikow, _w: { projektId: string; plik: PlikWejsciowy }): Promise<Wynik<{ wzorId: string }>> {
  return niezaimplementowane('BR-WZR-001 importujWzor');
}
export function ustawZnacznik(
  _z: ZaleznosciPlikow,
  _w: { wzorId: string; licznikId: string; strona: number; y: number; wysokoscRzedu: number; rzadBazowy: number },
): Promise<Wynik<void>> {
  return niezaimplementowane('BR-WZR-003 ustawZnacznik');
}
/** Notatka przy rzędzie wzoru; plik wzoru bez zmian (BR-WZR-008/S2). */
export function dodajNotatkeWzoru(_z: ZaleznosciPlikow, _w: { wzorId: string; rzad: number; tekst: string }): Promise<Wynik<void>> {
  return niezaimplementowane('BR-WZR-008 dodajNotatkeWzoru');
}
