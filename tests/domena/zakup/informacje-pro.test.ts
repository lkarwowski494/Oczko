// P-089 (3): momenty informowania o Pro, tylko dla wersji darmowej. Ryzyka R-120 (okno), R-121 (karta — poza 1.0, niżej).
// (3a) okno „Uczciwe zasady”: jednorazowe, po pierwszym ukończonym dniu z robótką, tylko darmowa wersja.
//      Definicja „ukończonego dnia” [DO USTALENIA] (Z07-09) — test sprawdza zachowanie wobec wejścia `dzienUkonczony`.
import { pokazOknoUczciweZasady } from '../../../src/domena/informacje-pro';

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

// (3b) karta z planami Pro po imporcie: w 1.0 jej nie ma (P-113 Q2a — karta tylko po imporcie z innej aplikacji, BR-DAN-007, F-29 PÓŹNIEJ;
//      przywrócenie własnej kopii bez karty, jak Trening). Test karty na liście „poza 1.0 (F-29)” w strategii §9 (P-117 Q1a).
