// Znacznik bieżącego rzędu we wzorze idzie z licznikiem (BR-WZR-003, F-26; wzor.znacznik w schemat.sql).
// sygnatura: propozycja 07, zatwierdzona w fix 05 2026-10-25 (Z07-22); kierunek i krawędź strony: fix-2 W7 (08, partia 2).
// `rzadBazowy`: rząd wzoru wskazany przy ustawieniu, gdy licznik miał `wartoscPrzyUstawieniu` (ADR-0011, uzupełnienie fix-2, P-118 Q2a).

/** `y`, `wysokoscRzedu`: ułamek wysokości strony 0–1 od góry (ADR-0011, Z07-17); `kierunek`: 1 = następny rząd niżej, −1 = wyżej (P-118 Q2a). */
export type ZnacznikWzoru = { strona: number; y: number; wysokoscRzedu: number; rzadBazowy: number; wartoscPrzyUstawieniu: number; kierunek: 1 | -1 };
const EPS = 1e-9; // liczby zmiennoprzecinkowe (wyrocznia ADR-0011)
/**
 * Rząd i położenie znacznika przy bieżącej wartości licznika: o jeden rząd schematu i jedną wysokość rzędu na zmianę licznika, w kierunku znacznika.
 * Poza stroną (albo przed rzędem 1) znacznik staje na krawędzi z `pozaStrona: true`, a rząd liczy się dalej — ekran prosi o ustawienie na następnej
 * stronie (ADR-0011, uzupełnienie W7); strona się nie zmienia.
 */
export function polozenieZnacznika(z: ZnacznikWzoru, wartoscLicznika: number): { strona: number; rzad: number; y: number; pozaStrona: boolean } {
  const krok = wartoscLicznika - z.wartoscPrzyUstawieniu;
  const rzad = z.rzadBazowy + krok;
  const y = z.y + z.kierunek * krok * z.wysokoscRzedu;
  if (y >= -EPS && y + z.wysokoscRzedu <= 1 + EPS && rzad >= 1) return { strona: z.strona, rzad, y, pozaStrona: false };
  return { strona: z.strona, rzad, y: Math.min(Math.max(y, 0), 1 - z.wysokoscRzedu), pozaStrona: true };
}
