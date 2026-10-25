// Znacznik bieżącego rzędu we wzorze idzie z licznikiem (BR-WZR-003, F-26; wzor.znacznik w schemat.sql).
// sygnatura: propozycja 07, do zatwierdzenia w sesji fix 05 (Z07-22). Ciało: zaślepka roli 07 (E3).
// Znaczenie `rzadBazowy`: rząd schematu wskazany przy ustawieniu, gdy licznik miał `wartoscPrzyUstawieniu` ([DO USTALENIA] 05).
import { niezaimplementowane } from './zaslepka';

export type ZnacznikWzoru = { strona: number; y: number; wysokoscRzedu: number; rzadBazowy: number; wartoscPrzyUstawieniu: number };
/** Rząd i położenie znacznika przy bieżącej wartości licznika: o jeden rząd schematu i jedną wysokość rzędu na zmianę licznika. */
export function polozenieZnacznika(_z: ZnacznikWzoru, _wartoscLicznika: number): { strona: number; rzad: number; y: number } {
  return niezaimplementowane('BR-WZR-003 polozenieZnacznika');
}
