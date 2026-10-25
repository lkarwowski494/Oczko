// Wynik operacji domeny (docs/architektura/moduly.md, „bledy.ts”). Powody są kontraktem dla ekranów i testów.
export type Powod =
  | 'zablokowany'
  | 'limit'
  | 'zapis'
  | 'bledne_dane'
  | 'niedozwolone_przejscie'
  | 'brak_miejsca'
  | 'wersja_nowsza'
  | 'uszkodzony'
  | 'konflikt';
export type Wynik<T> = { ok: true; wartosc: T } | { ok: false; powod: Powod };
