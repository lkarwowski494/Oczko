// Wzory: import pliku, znacznik rzędu, notatka w miejscu wzoru (ADR-0001, ADR-0011, ADR-0012).
// sygnatura: propozycja 07, zatwierdzona w fix 05 2026-10-25 (Z07-22); `kierunek` w ustawZnacznik: P-118 Q2a, P-120 Q5a.
// Partia 6 (moduly.md „Kontrakt partii 6”): dodajWzor z każdego źródła, kilka wzorów w projekcie, kosz wzoru (P-229), rysunki (ADR-0012).
import type { Wynik } from '../domena/bledy';
import type { CzasWTle, KonwersjaWzoru, PlikWejsciowy, PortBazy } from '../domena/porty';
import { WZOR_MAKS_MB } from '../konfiguracja';
import { adresStrony } from '../domena/adres';
import { licznikZnacznika, znacznikJson, znacznikWzoru } from '../dane/repozytoria/wzory';
import { polozenieZnacznika } from '../domena/znacznik-wzoru';
import { liczba, liczbaLubNull, tekst, tekstLubNull, wiersze } from '../dane/repozytoria/wiersze';
import { odczytajUstawienie, zapiszUstawienie } from '../dane/repozytoria/ustawienia';
import { otworzDoCzytania, rozmiar, usunPlik } from '../dane/pliki/system';
import { OK, blad, operacjaZapisu, wTransakcji } from './zapis';
import { wKolejce } from './kolejka';
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
    if (await wzorDoZapisu(tx, w.wzorId) === 'niedozwolone_przejscie') return blad('niedozwolone_przejscie'); // wzór w koszu (fix-7)
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
/** Notatka przy rzędzie wzoru; plik wzoru bez zmian (BR-WZR-008/S2). Wzór bez znacznika (bez licznika) → `niedozwolone_przejscie` (ADR-0011 uzupełnienie 2026-10-26, P-124 Q6a). */
export function dodajNotatkeWzoru(z: ZaleznosciPlikow, w: { wzorId: string; rzad: number; tekst: string }): Promise<Wynik<void>> {
  if (!Number.isInteger(w.rzad) || w.rzad < 1 || !w.tekst.trim()) return Promise.resolve(blad('bledne_dane'));
  return operacjaZapisu(z, 'dodajNotatkeWzoru', async (tx, teraz) => {
    if (await wzorDoZapisu(tx, w.wzorId) === 'niedozwolone_przejscie') return blad('niedozwolone_przejscie'); // wzór w koszu (fix-7)
    const licznikId = await licznikZnacznika(tx, w.wzorId);
    if (licznikId === undefined) return blad('bledne_dane');
    if (licznikId === null) return blad('niedozwolone_przejscie');
    await tx.run('INSERT INTO notatka_rzedu (id, licznik_id, rzad, tekst, zmieniono_ms) VALUES (?, ?, ?, ?, ?)', [z.id.nowy(), licznikId, w.rzad, w.tekst, teraz]);
    return OK;
  });
}

/** Adapter platformy wzoru: port KonwersjaWzoru + pełne otwarcie PDF (PDFKit, moduł `oczko-wzor`; zastępuje kontrolę nagłówka na urządzeniu). */
export type KonwersjaPlatformy = KonwersjaWzoru & { sprawdzPdf(sciezka: string): Promise<Wynik<{ strony: number }>> };
export type ZaleznosciWzoru = ZaleznosciPlikow & { konwersja: KonwersjaPlatformy; czasWTle: CzasWTle };
export type ZrodloDodania =
  | { rodzaj: 'pdf'; plik: PlikWejsciowy }
  | { rodzaj: 'word'; plik: PlikWejsciowy }
  | { rodzaj: 'obrazy'; sciezki: readonly string[] }
  | { rodzaj: 'adres'; adres: string };
const ZRODLO_W_BAZIE = { pdf: 'pdf', word: 'word', obrazy: 'obraz', adres: 'www' } as const;
const MAKS_BAJTOW = WZOR_MAKS_MB * 1024 * 1024;

export { adresStrony };

/**
 * Jeden import = jeden wzór (P-218 (1), Q6a). Kolejność (moduly.md „Kontrakt partii 6”): rozmiar → konwersja i `sprawdzPdf` poza kolejką
 * i transakcją (sieć, ARCH-13) pod `CzasWTle` → magazyn (PDF, dla Worda też oryginał) → jedna transakcja (`plik` UPSERT, `wzor`).
 * Projekt w koszu → `niedozwolone_przejscie`; pliki zapisane przed transakcją sprząta start (PLIKI_OCHRONA_MIN).
 */
export async function dodajWzor(z: ZaleznosciWzoru, w: { projektId: string; nazwa: string; zrodlo: ZrodloDodania }): Promise<Wynik<{ wzorId: string }>> {
  const nazwa = w.nazwa.trim();
  if (!nazwa) return blad('bledne_dane');
  const zr = w.zrodlo;
  const adres = zr.rodzaj === 'adres' ? adresStrony(zr.adres) : null;
  if (zr.rodzaj === 'adres' && !adres) return blad('bledne_dane');
  if (zr.rodzaj === 'obrazy' && zr.sciezki.length === 0) return blad('bledne_dane');
  const wejscia = zr.rodzaj === 'pdf' || zr.rodzaj === 'word' ? [zr.plik.sciezka] : zr.rodzaj === 'obrazy' ? zr.sciezki : [];
  if (wejscia.some((s) => rozmiar(s) > MAKS_BAJTOW)) return blad('za_duze');

  const pdf = await z.czasWTle.chron('import-wzoru', async (sygnal): Promise<Wynik<{ sciezka: string; tymczasowy: boolean }>> => {
    if (zr.rodzaj === 'pdf') return { ok: true, wartosc: { sciezka: zr.plik.sciezka, tymczasowy: false } };
    const k = await z.konwersja.naPdf(
      zr.rodzaj === 'word' ? { rodzaj: 'word', sciezka: zr.plik.sciezka } : zr.rodzaj === 'obrazy' ? { rodzaj: 'obrazy', sciezki: [...zr.sciezki] } : { rodzaj: 'adres', adres: adres ?? '' },
      sygnal);
    return k.ok ? { ok: true, wartosc: { sciezka: k.wartosc.sciezka, tymczasowy: true } } : k;
  });
  if (!pdf.ok) return pdf;
  try {
    const spr = await z.konwersja.sprawdzPdf(pdf.wartosc.sciezka);
    if (!spr.ok) return spr;
    const zapisPdf = await z.magazyn.zapisz(pdf.wartosc.sciezka, 'pdf');
    if (!zapisPdf.ok) return zapisPdf;
    const zapisOryg = zr.rodzaj === 'word' ? await z.magazyn.zapisz(zr.plik.sciezka, 'docx') : null;
    if (zapisOryg && !zapisOryg.ok) return zapisOryg;
    return await operacjaZapisu(z, 'dodajWzor', async (tx, teraz) => {
      const [p] = await wiersze(tx.all('SELECT usunieto_ms FROM projekt WHERE id = ?', [w.projektId]), 'dodajWzor');
      if (!p) return blad('bledne_dane');
      if (liczbaLubNull(p, 'usunieto_ms') !== null) return blad('niedozwolone_przejscie');
      const wstaw = (h: { sha256: string; bajty: number }, roz: string) =>
        tx.run('INSERT INTO plik (sha256, rozszerzenie, bajty, utworzono_ms) VALUES (?, ?, ?, ?) ON CONFLICT (sha256) DO NOTHING', [h.sha256, roz, h.bajty, teraz]);
      await wstaw(zapisPdf.wartosc, 'pdf');
      if (zapisOryg) await wstaw(zapisOryg.wartosc, 'docx');
      const wzorId = z.id.nowy();
      await tx.run('INSERT INTO wzor (id, projekt_id, nazwa, zrodlo, pdf_sha256, oryginal_sha256, adres, zmieniono_ms) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [wzorId, w.projektId, nazwa, ZRODLO_W_BAZIE[zr.rodzaj], zapisPdf.wartosc.sha256, zapisOryg?.wartosc.sha256 ?? null, adres, teraz]);
      return { ok: true, wartosc: { wzorId } };
    });
  } finally {
    if (pdf.wartosc.tymczasowy) usunPlik(pdf.wartosc.sciezka);
  }
}

export type WzorNaLiscie = { wzorId: string; nazwa: string; zrodlo: string; maZnacznik: boolean };
/** Wzory projektu poza koszem (P-220 W9b): po nazwie bez wielkości liter, potem id. */
export function listaWzorow(z: ZaleznosciPlikow, w: { projektId: string }): Promise<Wynik<WzorNaLiscie[]>> {
  return operacjaZapisu(z, 'listaWzorow', async (tx) => ({ ok: true, wartosc: await wzoryProjektu(tx, w.projektId) }));
}
async function wzoryProjektu(tx: PortBazy, projektId: string): Promise<WzorNaLiscie[]> {
  const r = await wiersze(tx.all(
    "SELECT id, nazwa, zrodlo, json_extract(znacznik, '$.licznik_id') IS NOT NULL AS ma FROM wzor WHERE projekt_id = ? AND usunieto_ms IS NULL ORDER BY nazwa COLLATE NOCASE, id",
    [projektId]), 'listaWzorow');
  return r.map((x) => ({ wzorId: tekst(x, 'id'), nazwa: tekst(x, 'nazwa'), zrodlo: tekst(x, 'zrodlo'), maZnacznik: liczba(x, 'ma') === 1 }));
}

/**
 * Ostatnio oglądany wzór jedzie w `ostatnie_miejsce` licznika (`{ ekran: 'licznik', id, wzor }`): wzór otwiera się zawsze z licznika (pasek licznika
 * pod wzorem, W1a), a osobny wpis `{ ekran: 'wzor' }` zgubiłby ostatni licznik startu (F-49, `biezacyLicznik`). Odstępstwo od zapisu kontraktu nazwane w partia-6.md.
 */
export function zapamietajWzor(z: ZaleznosciPlikow, w: { licznikId: string; wzorId: string }): Promise<Wynik<void>> {
  return operacjaZapisu(z, 'ostatnieMiejsce', async (tx, teraz) => {
    await zapiszUstawienie(tx, 'ostatnie_miejsce', { ekran: 'licznik', id: w.licznikId, wzor: w.wzorId }, teraz);
    return OK;
  });
}
export function wzorDoOtwarcia(z: ZaleznosciPlikow, w: { projektId: string }): Promise<Wynik<string | null>> {
  return operacjaZapisu(z, 'wzorDoOtwarcia', async (tx) => {
    const lista = await wzoryProjektu(tx, w.projektId);
    const m = await odczytajUstawienie(tx, 'ostatnie_miejsce');
    const ostatni = m && typeof m === 'object' && 'wzor' in m && typeof m.wzor === 'string' ? m.wzor : null;
    return { ok: true, wartosc: lista.find((x) => x.wzorId === ostatni)?.wzorId ?? lista[0]?.wzorId ?? null };
  });
}

/** Stan wzoru do zapisu: `bledne_dane` (nie ma), `niedozwolone_przejscie` (wzór albo projekt w koszu), null = można. */
async function wzorDoZapisu(tx: PortBazy, wzorId: string): Promise<'bledne_dane' | 'niedozwolone_przejscie' | null> {
  const [r] = await wiersze(tx.all('SELECT w.usunieto_ms AS w, p.usunieto_ms AS p FROM wzor w JOIN projekt p ON p.id = w.projekt_id WHERE w.id = ?', [wzorId]), 'wzor');
  if (!r) return 'bledne_dane';
  return liczbaLubNull(r, 'w') !== null || liczbaLubNull(r, 'p') !== null ? 'niedozwolone_przejscie' : null;
}

/** Do kosza (P-229, P-233 (6)): `usunieto_ms = teraz`; rysunki i znacznik zostają do przywrócenia; sprząta `sprzatnijKosz` po KOSZ_DNI. */
export function usunWzor(z: ZaleznosciPlikow, w: { wzorId: string }): Promise<Wynik<void>> {
  return operacjaZapisu(z, 'usunWzor', async (tx, teraz) => {
    const stan = await wzorDoZapisu(tx, w.wzorId);
    if (stan) return blad(stan);
    await tx.run('UPDATE wzor SET usunieto_ms = ?, zmieniono_ms = ? WHERE id = ?', [teraz, teraz, w.wzorId]);
    return OK;
  });
}
export function przywrocWzor(z: ZaleznosciPlikow, w: { wzorId: string }): Promise<Wynik<void>> {
  return operacjaZapisu(z, 'przywrocWzor', async (tx, teraz) => {
    const [r] = await wiersze(tx.all('SELECT w.usunieto_ms AS w, p.usunieto_ms AS p FROM wzor w JOIN projekt p ON p.id = w.projekt_id WHERE w.id = ?', [w.wzorId]), 'przywrocWzor');
    if (!r) return blad('bledne_dane');
    if (liczbaLubNull(r, 'w') === null || liczbaLubNull(r, 'p') !== null) return blad('niedozwolone_przejscie');
    await tx.run('UPDATE wzor SET usunieto_ms = NULL, zmieniono_ms = ? WHERE id = ?', [teraz, w.wzorId]);
    return OK;
  });
}

/**
 * Rysunek strony (ADR-0012 uzupełnienie): plik do magazynu przed kolejką, potem UPSERT (wzor_id, strona); poprzedni plik bez odwołań
 * usuwany po COMMIT. Plik tymczasowy z modułu natywnego usuwany zawsze (zapisany albo odrzucony).
 */
export async function zapiszRysunek(z: ZaleznosciPlikow, w: { wzorId: string; strona: number; plikTymczasowy: string }): Promise<Wynik<void>> {
  try {
    if (!Number.isInteger(w.strona) || w.strona < 0) return blad('bledne_dane');
    const zapis = await z.magazyn.zapisz(w.plikTymczasowy, 'pkdrawing');
    if (!zapis.ok) return zapis;
    const doUsuniecia: string[] = [];
    const wynik = await wKolejce(z.baza, () => wTransakcji(z, 'zapiszRysunek', async (tx, teraz) => {
      const stan = await wzorDoZapisu(tx, w.wzorId);
      if (stan) return blad(stan);
      const [stary] = await wiersze(tx.all('SELECT plik_sha256 FROM rysunek WHERE wzor_id = ? AND strona = ?', [w.wzorId, w.strona]), 'zapiszRysunek');
      await tx.run('INSERT INTO plik (sha256, rozszerzenie, bajty, utworzono_ms) VALUES (?, ?, ?, ?) ON CONFLICT (sha256) DO NOTHING', [zapis.wartosc.sha256, 'pkdrawing', zapis.wartosc.bajty, teraz]);
      await tx.run(`INSERT INTO rysunek (wzor_id, strona, plik_sha256, zmieniono_ms) VALUES (?, ?, ?, ?)
        ON CONFLICT (wzor_id, strona) DO UPDATE SET plik_sha256 = excluded.plik_sha256, zmieniono_ms = excluded.zmieniono_ms`, [w.wzorId, w.strona, zapis.wartosc.sha256, teraz]);
      const h = stary ? tekstLubNull(stary, 'plik_sha256') : null;
      if (h && h !== zapis.wartosc.sha256) {
        const r = await tx.run(`DELETE FROM plik WHERE sha256 = ?1 AND NOT EXISTS (SELECT 1 FROM rysunek WHERE plik_sha256 = ?1)
          AND NOT EXISTS (SELECT 1 FROM wzor WHERE pdf_sha256 = ?1 OR oryginal_sha256 = ?1) AND NOT EXISTS (SELECT 1 FROM zdjecie WHERE plik_sha256 = ?1)`, [h]);
        if (r.zmiany === 1) doUsuniecia.push(h);
      }
      return OK;
    }));
    if (wynik.ok) for (const h of doUsuniecia) await z.magazyn.usun(h); // po COMMIT (ADR-0001)
    return wynik;
  } finally {
    usunPlik(w.plikTymczasowy);
  }
}

export type KatObrotu = 0 | 90 | 180 | 270;
/** Obrót strony w widoku (P-246 S3a; P-218 (2): plik bez zmian): `wzor.obroty` = { "<strona>": kąt }, 0° usuwa wpis; znacznik i rysunki w układzie strony przed obrotem. */
export function ustawObrot(z: ZaleznosciPlikow, w: { wzorId: string; strona: number; kat: KatObrotu }): Promise<Wynik<void>> {
  if (!Number.isInteger(w.strona) || w.strona < 0 || ![0, 90, 180, 270].includes(w.kat)) return Promise.resolve(blad('bledne_dane'));
  return operacjaZapisu(z, 'ustawObrot', async (tx, teraz) => {
    const stan = await wzorDoZapisu(tx, w.wzorId);
    if (stan) return blad(stan);
    const sciezka = `$."${w.strona}"`;
    await tx.run(w.kat === 0 ? 'UPDATE wzor SET obroty = json_remove(obroty, ?), zmieniono_ms = ? WHERE id = ?' : 'UPDATE wzor SET obroty = json_set(obroty, ?, ?), zmieniono_ms = ? WHERE id = ?',
      w.kat === 0 ? [sciezka, teraz, w.wzorId] : [sciezka, w.kat, teraz, w.wzorId]);
    return OK;
  });
}
export function obrotyWzoru(z: ZaleznosciPlikow, w: { wzorId: string }): Promise<Wynik<Record<number, KatObrotu>>> {
  return operacjaZapisu(z, 'obrotyWzoru', async (tx) => {
    const [r] = await wiersze(tx.all('SELECT obroty FROM wzor WHERE id = ?', [w.wzorId]), 'obrotyWzoru');
    if (!r) return blad('bledne_dane');
    const o: Record<number, KatObrotu> = {};
    for (const [k, v] of Object.entries(JSON.parse(tekst(r, 'obroty')) as Record<string, unknown>)) {
      if (/^\d+$/.test(k) && (v === 90 || v === 180 || v === 270)) o[Number(k)] = v;
    }
    return { ok: true, wartosc: o };
  });
}

/** Link do filmu projektu (F-55, P-246 S4a; P-218 (4): poza wzorem): jeden na projekt, tylko adres http(s) i opcjonalna nazwa. */
export function ustawFilm(z: Pick<ZaleznosciPlikow, 'baza' | 'zegar'>, w: { projektId: string; adres: string; nazwa: string }): Promise<Wynik<void>> {
  const adres = adresStrony(w.adres);
  if (!adres) return Promise.resolve(blad('bledne_dane'));
  return zapiszFilm(z, w.projektId, adres, w.nazwa.trim() || null);
}
export function usunFilm(z: Pick<ZaleznosciPlikow, 'baza' | 'zegar'>, w: { projektId: string }): Promise<Wynik<void>> {
  return zapiszFilm(z, w.projektId, null, null);
}
function zapiszFilm(z: Pick<ZaleznosciPlikow, 'baza' | 'zegar'>, projektId: string, adres: string | null, nazwa: string | null): Promise<Wynik<void>> {
  return operacjaZapisu(z, 'film', async (tx, teraz) => {
    const [p] = await wiersze(tx.all('SELECT usunieto_ms FROM projekt WHERE id = ?', [projektId]), 'film');
    if (!p) return blad('bledne_dane');
    if (liczbaLubNull(p, 'usunieto_ms') !== null) return blad('niedozwolone_przejscie');
    await tx.run('UPDATE projekt SET film_adres = ?, film_nazwa = ?, zmieniono_ms = ? WHERE id = ?', [adres, nazwa, teraz, projektId]);
    return OK;
  });
}

export type WidokWzoru = {
  wzorId: string; projektId: string; nazwa: string; zrodlo: string;
  plikPdf: string | null;                         // null: Word w podglądzie zastępczym (pdf_sha256 NULL, P-071 (5a))
  oryginal: string | null;
  rysunki: { strona: number; plik: string }[];
  obroty: Record<number, KatObrotu>;
  znacznik: { licznikId: string; strona: number; rzad: number; y: number; wysokosc: number; pozaStrona: boolean; przedSchematem: boolean; kierunek: 1 | -1 } | null;
};
/** Model odczytu przeglądarki (moduly.md „Kontrakt partii 6”: widok natywny tylko rysuje wynik `polozenieZnacznika`). */
export function widokWzoru(z: ZaleznosciPlikow, w: { wzorId: string }): Promise<Wynik<WidokWzoru>> {
  return operacjaZapisu(z, 'widokWzoru', async (tx) => {
    const stan = await wzorDoZapisu(tx, w.wzorId);
    if (stan) return blad(stan);
    const [r] = await wiersze(tx.all('SELECT projekt_id, nazwa, zrodlo, pdf_sha256, oryginal_sha256, obroty FROM wzor WHERE id = ?', [w.wzorId]), 'widokWzoru');
    const rys = await wiersze(tx.all('SELECT strona, plik_sha256 FROM rysunek WHERE wzor_id = ? ORDER BY strona', [w.wzorId]), 'widokWzoru');
    const pdf = tekstLubNull(r, 'pdf_sha256'), oryg = tekstLubNull(r, 'oryginal_sha256');
    const obroty: Record<number, KatObrotu> = {};
    for (const [k, v] of Object.entries(JSON.parse(tekst(r, 'obroty')) as Record<string, unknown>)) if (/^\d+$/.test(k) && (v === 90 || v === 180 || v === 270)) obroty[Number(k)] = v;
    let znacznik: WidokWzoru['znacznik'] = null;
    const zn = await znacznikWzoru(tx, w.wzorId);
    if (zn) {
      const [l] = await wiersze(tx.all('SELECT wartosc FROM licznik WHERE id = ?', [zn.licznikId]), 'widokWzoru');
      const p = l ? polozenieZnacznika(zn, liczba(l, 'wartosc')) : null;
      if (p?.ok) znacznik = { licznikId: zn.licznikId, strona: p.wartosc.strona, rzad: p.wartosc.rzad, y: p.wartosc.y, wysokosc: zn.wysokoscRzedu, pozaStrona: p.wartosc.pozaStrona, przedSchematem: p.wartosc.przedSchematem, kierunek: zn.kierunek };
    }
    return { ok: true, wartosc: {
      wzorId: w.wzorId, projektId: tekst(r, 'projekt_id'), nazwa: tekst(r, 'nazwa'), zrodlo: tekst(r, 'zrodlo'),
      plikPdf: pdf ? z.magazyn.sciezka(pdf) : null, oryginal: oryg ? z.magazyn.sciezka(oryg) : null,
      rysunki: rys.map((x) => ({ strona: liczba(x, 'strona'), plik: z.magazyn.sciezka(tekst(x, 'plik_sha256')) })), obroty, znacznik,
    } };
  });
}
