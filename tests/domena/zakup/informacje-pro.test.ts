// P-089 (3): dwa momenty informowania o Pro, tylko dla wersji darmowej. Ryzyka R-120 (okno), R-121 (karta).
// (3a) okno „Uczciwe zasady”: jednorazowe, po pierwszym ukończonym dniu z robótką, tylko darmowa wersja.
//      Definicja „ukończonego dnia” [DO USTALENIA] (Z07-09) — test sprawdza zachowanie wobec wejścia `dzienUkonczony`.
// (3b) karta z planami Pro po udanym imporcie danych, tylko darmowa wersja (o ile import w MVP — rozstrzyga 03).
//      Czy karta ma być jednorazowa — decyzja nie mówi (R-121 wymienia „przy każdym imporcie” jako awarię) [DO USTALENIA].
import { pokazOknoUczciweZasady, pokazKartePoImporcie } from '../../../src/domena/informacje-pro';

const tak = [true, false] as const;
const okno = tak.flatMap((pro) => tak.flatMap((juzPokazane) => tak.map((dzienUkonczony) => ({ pro, juzPokazane, dzienUkonczony }))));

describe('P-089 (3a) R-120 okno „Uczciwe zasady”', () => {
  test.each(okno.map((w) => [w.pro ? 'Pro' : 'darmowa', w.juzPokazane ? 'już pokazane' : 'nie pokazane', w.dzienUkonczony ? 'dzień ukończony' : 'dzień nieukończony', w] as const))(
    'P-089 (3a) R-120 %s, %s, %s',
    (_a, _b, _c, w) => {
      // Pokazać wyłącznie: wersja darmowa ∧ jeszcze nie pokazane (raz) ∧ po ukończonym dniu.
      expect(pokazOknoUczciweZasady(w)).toBe(!w.pro && !w.juzPokazane && w.dzienUkonczony);
    },
  );
  test('P-089 (3a) R-120 tablica pełna: 8 przypadków, dokładnie jeden pokazuje okno', () => {
    expect(okno).toHaveLength(8);
    expect(okno.filter((w) => pokazOknoUczciweZasady(w))).toEqual([{ pro: false, juzPokazane: false, dzienUkonczony: true }]);
  });
});

const karta = tak.flatMap((pro) => tak.map((importUdany) => ({ pro, importUdany })));

describe('P-089 (3b) R-121 karta z planami Pro po imporcie', () => {
  test.each(karta.map((w) => [w.pro ? 'Pro' : 'darmowa', w.importUdany ? 'import udany' : 'import nieudany', w] as const))('P-089 (3b) R-121 %s, %s', (_a, _b, w) => {
    expect(pokazKartePoImporcie(w)).toBe(!w.pro && w.importUdany);
  });
  test('P-089 (3b) R-121 tablica pełna: 4 przypadki, dokładnie jeden pokazuje kartę', () => {
    expect(karta).toHaveLength(4);
    expect(karta.filter((w) => pokazKartePoImporcie(w))).toEqual([{ pro: false, importUdany: true }]);
  });
});
