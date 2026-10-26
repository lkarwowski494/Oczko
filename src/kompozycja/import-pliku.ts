// Otwarcie pliku `.oczko` z Plików albo z poczty (ADR-0004 „Typ pliku `.oczko`”): system przekazuje adres pliku jako ścieżkę wejściową
// expo-router (`+native-intent`, redirectSystemPath). Plik `.oczko` → Ustawienia z importem tego pliku (te same kroki co „Import”:
// liczności przed decyzją, scal albo zastąp); inne adresy bez zmian.
export function sciezkaImportu(path: string): string | null {
  if (!/^file:\/\//i.test(path) || !/\.oczko$/i.test(path)) return null;
  try {
    return `/ustawienia?import=${encodeURIComponent(decodeURIComponent(path.replace(/^file:\/\//i, '')))}`;
  } catch {
    return null; // zły zapis adresu: bez przekierowania (wyjątek w redirectSystemPath zamyka aplikację)
  }
}
