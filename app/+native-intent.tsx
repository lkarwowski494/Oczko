// Adresy wejściowe systemu (expo-router 57, `NativeIntent.redirectSystemPath`): plik `.oczko` otwarty z Plików albo z poczty → import
// w Ustawieniach (ADR-0004). Inne adresy bez zmian. Bez wyjątków: błąd tutaj zamyka aplikację (dokumentacja typu w pakiecie).
import { sciezkaImportu } from '../src/kompozycja/import-pliku';

export function redirectSystemPath({ path }: { path: string; initial: boolean }): string {
  try {
    return sciezkaImportu(path) ?? path;
  } catch {
    return path;
  }
}
