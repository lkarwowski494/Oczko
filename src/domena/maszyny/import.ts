// Maszyna importu archiwum (moduly.md, „Import archiwum (ADR-0004)”).
import { niezaimplementowane } from '../zaslepka';

export type StanImportu = 'sprawdzanie' | 'odrzucony' | 'gotowy' | 'kopia_przed' | 'wczytywanie' | 'gotowe' | 'wycofany';
export type ZdarzenieImportu = 'sprawdzono_ok' | 'sprawdzono_zle' | 'wybrano' | 'kopia_gotowa' | 'wczytano' | 'blad';
export function przejdzImport(_s: StanImportu, _z: ZdarzenieImportu): StanImportu | 'niedozwolone' {
  return niezaimplementowane('BR-DAN-006 przejdzImport');
}
/** Czy w tym stanie baza mogła już zostać zmieniona (przed `wczytywanie` zawsze false). */
export function bazaZmieniona(_s: StanImportu): boolean {
  return niezaimplementowane('BR-DAN-006 bazaZmieniona');
}
