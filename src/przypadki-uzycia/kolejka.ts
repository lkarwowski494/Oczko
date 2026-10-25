// Kolejka zapisów przypadków użycia (ADR-0002, ADR-0008 (2)): jedna na port bazy. Pozycja może przed transakcją przeczytać coś poza bazą
// (dziennik +1), a i tak żaden zapis z ekranu jej nie wyprzedzi — w samej transakcji portu czekanie poza bazą jest zakazane.
import type { PortBazy } from '../domena/porty';

const ogony = new WeakMap<PortBazy, Promise<unknown>>();

export function wKolejce<T>(baza: PortBazy, zadanie: () => Promise<T>): Promise<T> {
  const ogon = ogony.get(baza) ?? Promise.resolve();
  const wynik = ogon.then(zadanie, zadanie);
  ogony.set(baza, wynik.catch(() => undefined)); // błąd zostaje u wołającego; następna pozycja i tak rusza
  return wynik;
}
