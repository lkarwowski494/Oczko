// Momenty informowania o Pro (P-089 (3)): okno „Uczciwe zasady” po pierwszym ukończonym dniu z robótką i karta po udanym imporcie; tylko wersja darmowa.
// Definicja „ukończonego dnia” czeka na rolę 02 (zgłoszenie Z07-09); do tego czasu test sprawdza zachowanie wobec wejścia `dzienUkonczony`.

/** Spójne z `oknoUczciweZasady` w limit.ts: tam `dzienUkonczony` liczy się z listy dni (P-103 (5a)), tu jest wejściem. */
export function pokazOknoUczciweZasady(w: { pro: boolean; juzPokazane: boolean; dzienUkonczony: boolean }): boolean {
  return !w.pro && !w.juzPokazane && w.dzienUkonczony;
}
export function pokazKartePoImporcie(w: { pro: boolean; importUdany: boolean }): boolean {
  return !w.pro && w.importUdany;
}
