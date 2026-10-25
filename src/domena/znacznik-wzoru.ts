// Znacznik bieżącego rzędu we wzorze idzie z licznikiem (BR-WZR-003, F-26; wzor.znacznik w schemat.sql).
// sygnatura: propozycja 07, zatwierdzona w fix 05 2026-10-25 (Z07-22). Ciało: zaślepka roli 07 (E3).
// Znaczenie `rzadBazowy`: rząd schematu wskazany przy ustawieniu, gdy licznik miał `wartoscPrzyUstawieniu` ([DO USTALENIA] 05).

export type ZnacznikWzoru = { strona: number; y: number; wysokoscRzedu: number; rzadBazowy: number; wartoscPrzyUstawieniu: number };
/** Rząd i położenie znacznika przy bieżącej wartości licznika: o jeden rząd schematu i jedną wysokość rzędu na zmianę licznika. */
// Kierunek przesunięcia (w dół strony = rosnące y) i przejście na następną stronę: [DO USTALENIA] 05 — tu y rośnie, strona bez zmian.
export function polozenieZnacznika(z: ZnacznikWzoru, wartoscLicznika: number): { strona: number; rzad: number; y: number } {
  const krok = wartoscLicznika - z.wartoscPrzyUstawieniu;
  return { strona: z.strona, rzad: z.rzadBazowy + krok, y: z.y + krok * z.wysokoscRzedu };
}
