// Ścieżki danych aplikacji (ADR-0001: Application Support, nie Documents ani Caches; ADR-0015: nowa ścieżka bazy, stary plik nietknięty).
// sygnatura: propozycja 07, zatwierdzona w fix 05 2026-10-25 (Z07-22).

export type SciezkiDanych = { baza: string; pliki: string; kopie: string; dziennik: string; stanStartu: string };
/** `katalogBiblioteki` = katalog `Library` kontenera aplikacji. Baza wersji 0.1.0 nie ma tu ścieżki (P-070, ADR-0015). */
export function sciezkiDanych(katalogBiblioteki: string): SciezkiDanych {
  const as = `${katalogBiblioteki.replace(/\/+$/, '')}/Application Support`;
  return {
    baza: `${as}/oczko.db`,
    pliki: `${as}/pliki`,
    kopie: `${as}/kopie`,
    dziennik: `${as}/dziennik-plus.jsonl`, // ADR-0008
    stanStartu: `${as}/stan-startu.json`, // ADR-0019: poza bazą, zapisywany przed jej otwarciem
  };
}
