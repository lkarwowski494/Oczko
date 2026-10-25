// Znacznik bieżącego rzędu we wzorze idzie z licznikiem (BR-WZR-003, F-26; wzor.znacznik w schemat.sql).
// sygnatura: propozycja 07, zatwierdzona w fix 05 2026-10-25 (Z07-22). Ciało: zaślepka roli 07 (E3).
// `rzadBazowy`: rząd wzoru wskazany przy ustawieniu, gdy licznik miał `wartoscPrzyUstawieniu` (ADR-0011, uzupełnienie fix-2, P-118 Q2a).

export type ZnacznikWzoru = { strona: number; y: number; wysokoscRzedu: number; rzadBazowy: number; wartoscPrzyUstawieniu: number };
/** Rząd i położenie znacznika przy bieżącej wartości licznika: o jeden rząd schematu i jedną wysokość rzędu na zmianę licznika. */
// Kontrakt 05 od fix-2 (P-118 Q2a, ADR-0011 uzupełnienie): pole `kierunek` (1 w dół, -1 w górę) i wynik `pozaStrona` (znacznik staje na krawędzi
// strony) z wyrocznią w ADR-0011; zmianę typu i zachowania robi 08 (dziś: zawsze w dół, bez krawędzi).
export function polozenieZnacznika(z: ZnacznikWzoru, wartoscLicznika: number): { strona: number; rzad: number; y: number } {
  const krok = wartoscLicznika - z.wartoscPrzyUstawieniu;
  return { strona: z.strona, rzad: z.rzadBazowy + krok, y: z.y + krok * z.wysokoscRzedu };
}
