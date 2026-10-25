// Wzory: import pliku, znacznik rzędu, notatka w miejscu wzoru (ADR-0001, ADR-0011, ADR-0012).
// sygnatura: propozycja 07, zatwierdzona w fix 05 2026-10-25 (Z07-22); `kierunek` w ustawZnacznik: P-118 Q2a, P-120 Q5a.
import type { Wynik } from '../domena/bledy';
import type { PlikWejsciowy } from '../domena/porty';
import { licznikZnacznika, znacznikJson } from '../dane/repozytoria/wzory';
import { liczba, liczbaLubNull, wiersze } from '../dane/repozytoria/wiersze';
import { otworzDoCzytania } from '../dane/pliki/system';
import { OK, blad, operacjaZapisu } from './zapis';
import type { ZaleznosciPlikow } from './zaleznosci';

const NAGLOWEK_PDF = '%PDF-';
const KONIEC_PDF = '%%EOF';
const tekstAscii = (b: Uint8Array): string => String.fromCharCode(...b);
/**
 * Kontrola struktury PDF przed zapisem (BR-WZR-001/S2): nagłówek `%PDF-` i znacznik końca `%%EOF` w ostatnim KiB. Pełne otwarcie PDFKit: partia 3
 * (moduł natywny, ADR-0011) [DO USTALENIA 08: plik o poprawnym nagłówku i końcu, ale uszkodzonym środku przejdzie tę kontrolę].
 */
function pdfWygladaNaCaly(sciezka: string): boolean {
  const c = otworzDoCzytania(sciezka);
  try {
    if (c.rozmiar < NAGLOWEK_PDF.length + KONIEC_PDF.length) return false;
    const poczatek = tekstAscii(c.czytaj(0, NAGLOWEK_PDF.length));
    const odKonca = Math.max(0, c.rozmiar - 1024);
    return poczatek === NAGLOWEK_PDF && tekstAscii(c.czytaj(odKonca, c.rozmiar - odKonca)).includes(KONIEC_PDF);
  } finally {
    c.zamknij();
  }
}

/** Plik uszkodzony → `powod: 'uszkodzony'`, bez wiersza `wzor` i bez pliku w magazynie (BR-WZR-001/S2). Obraz i Word (konwersja na urządzeniu): partia 3. */
export async function importujWzor(z: ZaleznosciPlikow, w: { projektId: string; plik: PlikWejsciowy }): Promise<Wynik<{ wzorId: string }>> {
  if (w.plik.typ !== 'application/pdf') return blad('bledne_dane'); // [DO USTALENIA 08, partia 3]: obraz → PDF, Word (P-071 (5a))
  if (!pdfWygladaNaCaly(w.plik.sciezka)) return blad('uszkodzony');
  const zapis = await z.magazyn.zapisz(w.plik.sciezka, 'pdf'); // przed wierszem: sprzątanie chroni pliki młodsze niż PLIKI_OCHRONA_MIN
  if (!zapis.ok) return zapis;
  const nazwa = w.plik.nazwa.replace(/\.pdf$/i, '').trim() || w.plik.nazwa;
  return operacjaZapisu(z, 'importujWzor', async (tx, teraz) => {
    const [p] = await wiersze(tx.all('SELECT usunieto_ms FROM projekt WHERE id = ?', [w.projektId]), 'importujWzor');
    if (!p) return blad('bledne_dane');
    if (liczbaLubNull(p, 'usunieto_ms') !== null) return blad('niedozwolone_przejscie');
    await tx.run('INSERT INTO plik (sha256, rozszerzenie, bajty, utworzono_ms) VALUES (?, ?, ?, ?) ON CONFLICT (sha256) DO NOTHING', [zapis.wartosc.sha256, 'pdf', zapis.wartosc.bajty, teraz]);
    const wzorId = z.id.nowy();
    await tx.run("INSERT INTO wzor (id, projekt_id, nazwa, zrodlo, pdf_sha256, zmieniono_ms) VALUES (?, ?, ?, 'pdf', ?, ?)", [wzorId, w.projektId, nazwa, zapis.wartosc.sha256, teraz]);
    return { ok: true, wartosc: { wzorId } };
  });
}

const ulamek = (v: number): boolean => Number.isFinite(v) && v >= 0 && v <= 1;
export function ustawZnacznik(
  z: ZaleznosciPlikow,
  w: { wzorId: string; licznikId: string; strona: number; y: number; wysokoscRzedu: number; rzadBazowy: number; kierunek: 1 | -1 },
): Promise<Wynik<void>> {
  if (!Number.isInteger(w.strona) || w.strona < 0 || !ulamek(w.y) || !(ulamek(w.wysokoscRzedu) && w.wysokoscRzedu > 0) || w.y + w.wysokoscRzedu > 1
    || !Number.isInteger(w.rzadBazowy) || w.rzadBazowy < 1 || (w.kierunek !== 1 && w.kierunek !== -1)) {
    return Promise.resolve(blad('bledne_dane')); // wpis z ekranu (P-118 Q1a)
  }
  return operacjaZapisu(z, 'ustawZnacznik', async (tx, teraz) => {
    const [r] = await wiersze(tx.all(
      `SELECT l.wartosc, (w.projekt_id = c.projekt_id) AS ten_sam FROM wzor w, licznik l JOIN czesc c ON c.id = l.czesc_id WHERE w.id = ? AND l.id = ?`,
      [w.wzorId, w.licznikId]), 'ustawZnacznik');
    if (!r) return blad('bledne_dane');
    if (liczba(r, 'ten_sam') !== 1) return blad('niedozwolone_przejscie'); // znacznik idzie z licznikiem tego samego projektu
    const znacznik = znacznikJson({ licznikId: w.licznikId, strona: w.strona, y: w.y, wysokoscRzedu: w.wysokoscRzedu, rzadBazowy: w.rzadBazowy, wartoscPrzyUstawieniu: liczba(r, 'wartosc'), kierunek: w.kierunek });
    await tx.run('UPDATE wzor SET znacznik = ?, zmieniono_ms = ? WHERE id = ?', [znacznik, teraz, w.wzorId]);
    return OK;
  });
}
/** Notatka przy rzędzie wzoru; plik wzoru bez zmian (BR-WZR-008/S2). Wzór bez znacznika (bez licznika) → `niedozwolone_przejscie` [DO USTALENIA 05]. */
export function dodajNotatkeWzoru(z: ZaleznosciPlikow, w: { wzorId: string; rzad: number; tekst: string }): Promise<Wynik<void>> {
  if (!Number.isInteger(w.rzad) || w.rzad < 1 || !w.tekst.trim()) return Promise.resolve(blad('bledne_dane'));
  return operacjaZapisu(z, 'dodajNotatkeWzoru', async (tx, teraz) => {
    const licznikId = await licznikZnacznika(tx, w.wzorId);
    if (licznikId === undefined) return blad('bledne_dane');
    if (licznikId === null) return blad('niedozwolone_przejscie');
    await tx.run('INSERT INTO notatka_rzedu (id, licznik_id, rzad, tekst, zmieniono_ms) VALUES (?, ?, ?, ?, ?)', [z.id.nowy(), licznikId, w.rzad, w.tekst, teraz]);
    return OK;
  });
}
