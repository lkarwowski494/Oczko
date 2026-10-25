// Momenty informowania o Pro (P-089 (3)): okno „Uczciwe zasady” po pierwszym ukończonym dniu z robótką i karta po udanym imporcie; tylko wersja darmowa.
// Definicja „ukończonego dnia” czeka na rolę 02 (zgłoszenie Z07-09); do tego czasu test sprawdza zachowanie wobec wejścia `dzienUkonczony`.
import { niezaimplementowane } from './zaslepka';

export function pokazOknoUczciweZasady(_w: { pro: boolean; juzPokazane: boolean; dzienUkonczony: boolean }): boolean {
  return niezaimplementowane('P-089 pokazOknoUczciweZasady');
}
export function pokazKartePoImporcie(_w: { pro: boolean; importUdany: boolean }): boolean {
  return niezaimplementowane('P-089 pokazKartePoImporcie');
}
