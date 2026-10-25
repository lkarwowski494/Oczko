// Przypadki użycia projektu, części i kosza (moduly.md „Projekt”, ADR-0013, P-026, P-047 (7), P-072 (8a)).
// sygnatura: propozycja 07, zatwierdzona w fix 05 2026-10-25 (Z07-22).
import type { Wynik } from '../domena/bledy';
import { przejdzProjekt, type ZdarzenieProjektu } from '../domena/maszyny/projekt';
import type { PortBazy } from '../domena/porty';
import { stanProjektu, ustawUsuniecie, usunietoMs, zapiszStanProjektu, type TabelaKosza } from '../dane/repozytoria/projekty-zapis';
import { liczba, liczbaLubNull, tekst, wiersze } from '../dane/repozytoria/wiersze';
import { OK, blad, operacjaZapisu } from './zapis';
import type { Zaleznosci, ZaleznosciPlikow } from './zaleznosci';

export type NowyProjekt = { projektId: string; czesci: { czescId: string; nazwa: string; licznikId: string }[] };
const niepusta = (t: string): boolean => typeof t === 'string' && t.trim().length > 0;

async function dodajCzesc(tx: PortBazy, z: Zaleznosci, w: { projektId: string; nazwa: string; cel: number | null; paraZ: string | null; terazMs: number }): Promise<{ czescId: string; licznikId: string }> {
  const czescId = z.id.nowy(), licznikId = z.id.nowy();
  await tx.run(
    `INSERT INTO czesc (id, projekt_id, nazwa, kolejnosc, cel_rzedow, para_z, zmieniono_ms)
     VALUES (?, ?, ?, (SELECT coalesce(max(kolejnosc), 0) + 1 FROM czesc WHERE projekt_id = ?), ?, ?, ?)`,
    [czescId, w.projektId, w.nazwa.trim(), w.projektId, w.cel, w.paraZ, w.terazMs],
  );
  await tx.run('INSERT INTO licznik (id, czesc_id, kolejnosc, zmieniono_ms) VALUES (?, ?, 1, ?)', [licznikId, czescId, w.terazMs]);
  return { czescId, licznikId };
}

/** Projekt z częściami; każda część dostaje licznik rzędów (BR-PRJ-001). Bez części: jedna część o nazwie projektu. */
export function utworzProjekt(z: Zaleznosci, w: { nazwa: string; czesci: string[] }): Promise<Wynik<NowyProjekt>> {
  if (!niepusta(w.nazwa) || !w.czesci.every(niepusta)) return Promise.resolve(blad('bledne_dane'));
  return operacjaZapisu(z, 'utworzProjekt', async (tx, teraz) => {
    const projektId = z.id.nowy();
    await tx.run('INSERT INTO projekt (id, nazwa, utworzono_ms, zmieniono_ms, ostatnia_praca_ms) VALUES (?, ?, ?, ?, ?)', [projektId, w.nazwa.trim(), teraz, teraz, teraz]);
    const czesci: NowyProjekt['czesci'] = [];
    for (const nazwa of w.czesci.length ? w.czesci : [w.nazwa]) czesci.push({ nazwa: nazwa.trim(), ...(await dodajCzesc(tx, z, { projektId, nazwa, cel: null, paraZ: null, terazMs: teraz })) });
    return { ok: true, wartosc: { projektId, czesci } };
  });
}
/** Nadanie albo zmiana nazwy: zmiana jednej kolumny (UPDATE), nigdy REPLACE — części, liczniki i historia zostają (ADR-0002). */
export function nazwijProjekt(z: Zaleznosci, w: { projektId: string; nazwa: string }): Promise<Wynik<void>> {
  if (!niepusta(w.nazwa)) return Promise.resolve(blad('bledne_dane'));
  return operacjaZapisu(z, 'nazwijProjekt', async (tx, teraz) => {
    const r = await tx.run('UPDATE projekt SET nazwa = ?, zmieniono_ms = ? WHERE id = ?', [w.nazwa.trim(), teraz, w.projektId]);
    return r.zmiany === 1 ? OK : blad('bledne_dane');
  });
}
export function zapiszNotatke(z: Zaleznosci, w: { projektId: string; tekst: string }): Promise<Wynik<void>> {
  return operacjaZapisu(z, 'zapiszNotatke', async (tx, teraz) => {
    const r = await tx.run('UPDATE projekt SET notatka = ?, zmieniono_ms = ? WHERE id = ?', [w.tekst, teraz, w.projektId]);
    return r.zmiany === 1 ? OK : blad('bledne_dane');
  });
}

function przejscie(z: Zaleznosci, projektId: string, zd: ZdarzenieProjektu): Promise<Wynik<void>> {
  return operacjaZapisu(z, `projekt_${zd}`, async (tx, teraz) => {
    const p = await stanProjektu(tx, projektId);
    if (!p) return blad('bledne_dane');
    const nowy = przejdzProjekt(p, zd, teraz);
    if (!nowy.ok) return nowy;
    await zapiszStanProjektu(tx, projektId, nowy.wartosc, teraz);
    return OK;
  });
}
export const zakonczProjekt = (z: Zaleznosci, w: { projektId: string }): Promise<Wynik<void>> => przejscie(z, w.projektId, 'ukoncz');
export const wznowProjekt = (z: Zaleznosci, w: { projektId: string }): Promise<Wynik<void>> => przejscie(z, w.projektId, 'wznow');
export const usunProjekt = (z: Zaleznosci, w: { projektId: string }): Promise<Wynik<void>> => przejscie(z, w.projektId, 'usun');
export const przywrocProjekt = (z: Zaleznosci, w: { projektId: string }): Promise<Wynik<void>> => przejscie(z, w.projektId, 'przywroc');

export function zmienDateUkonczenia(z: Zaleznosci, w: { projektId: string; ukonczonoMs: number }): Promise<Wynik<void>> {
  if (!Number.isInteger(w.ukonczonoMs)) return Promise.resolve(blad('bledne_dane'));
  return operacjaZapisu(z, 'zmienDateUkonczenia', async (tx, teraz) => {
    const p = await stanProjektu(tx, w.projektId);
    if (!p) return blad('bledne_dane');
    if (p.stan !== 'ukonczony' || p.usunietoMs !== null) return blad('niedozwolone_przejscie');
    await zapiszStanProjektu(tx, w.projektId, { ...p, ukonczonoMs: w.ukonczonoMs }, teraz);
    return OK;
  });
}

/** Kosz części i licznika (BR-DAN-008/S3, S4): ten sam termin KOSZ_DNI co projekt; ponowne usunięcie nie przesuwa terminu. */
function kosz(z: Zaleznosci, tabela: TabelaKosza, id: string, usun: boolean): Promise<Wynik<void>> {
  return operacjaZapisu(z, `${usun ? 'usun' : 'przywroc'}_${tabela}`, async (tx, teraz) => {
    const s = await usunietoMs(tx, tabela, id);
    if (!s.jest) return blad('bledne_dane');
    if (usun === (s.usunietoMs !== null)) return blad('niedozwolone_przejscie');
    await ustawUsuniecie(tx, tabela, id, usun ? teraz : null, teraz);
    return OK;
  });
}
export const usunLicznik = (z: Zaleznosci, w: { licznikId: string }): Promise<Wynik<void>> => kosz(z, 'licznik', w.licznikId, true);
export const przywrocLicznik = (z: Zaleznosci, w: { licznikId: string }): Promise<Wynik<void>> => kosz(z, 'licznik', w.licznikId, false);
export const usunCzesc = (z: Zaleznosci, w: { czescId: string }): Promise<Wynik<void>> => kosz(z, 'czesc', w.czescId, true);
export const przywrocCzesc = (z: Zaleznosci, w: { czescId: string }): Promise<Wynik<void>> => kosz(z, 'czesc', w.czescId, false);

/** „Zrób taką samą” (F-20): części (z celem) i przypomnienia skopiowane, liczniki 0, `kopia_z` = oryginał; oryginał bez zmian. */
export function zrobPonownie(z: Zaleznosci, w: { projektId: string }): Promise<Wynik<{ projektId: string }>> {
  return operacjaZapisu(z, 'zrobPonownie', async (tx, teraz) => {
    const [p] = await wiersze(tx.all('SELECT nazwa, usunieto_ms FROM projekt WHERE id = ?', [w.projektId]), 'zrobPonownie');
    if (!p) return blad('bledne_dane');
    if (liczbaLubNull(p, 'usunieto_ms') !== null) return blad('niedozwolone_przejscie');
    const projektId = z.id.nowy();
    await tx.run('INSERT INTO projekt (id, nazwa, kopia_z, utworzono_ms, zmieniono_ms, ostatnia_praca_ms) VALUES (?, ?, ?, ?, ?, ?)', [projektId, tekst(p, 'nazwa'), w.projektId, teraz, teraz, teraz]);
    const czesci = await wiersze(tx.all('SELECT id, nazwa, kolejnosc, cel_rzedow FROM czesc WHERE projekt_id = ? AND usunieto_ms IS NULL ORDER BY kolejnosc', [w.projektId]), 'zrobPonownie');
    for (const c of czesci) {
      const czescId = z.id.nowy();
      await tx.run('INSERT INTO czesc (id, projekt_id, nazwa, kolejnosc, cel_rzedow, zmieniono_ms) VALUES (?, ?, ?, ?, ?, ?)', [czescId, projektId, tekst(c, 'nazwa'), liczba(c, 'kolejnosc'), liczbaLubNull(c, 'cel_rzedow'), teraz]);
      const liczniki = await wiersze(tx.all(
        'SELECT id, nazwa, rodzaj, sekcja, znaczenie, dlugosc_powtorzenia, kolejnosc FROM licznik WHERE czesc_id = ? AND usunieto_ms IS NULL ORDER BY kolejnosc', [tekst(c, 'id')]), 'zrobPonownie');
      for (const l of liczniki) {
        const licznikId = z.id.nowy();
        await tx.run(
          'INSERT INTO licznik (id, czesc_id, nazwa, rodzaj, sekcja, znaczenie, dlugosc_powtorzenia, kolejnosc, zmieniono_ms) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [licznikId, czescId, tekst(l, 'nazwa'), tekst(l, 'rodzaj'), liczba(l, 'sekcja'), tekst(l, 'znaczenie'), liczbaLubNull(l, 'dlugosc_powtorzenia'), liczba(l, 'kolejnosc'), teraz],
        );
        for (const r of await wiersze(tx.all('SELECT od_rzedu, co_n, razy, tekst FROM przypomnienie WHERE licznik_id = ?', [tekst(l, 'id')]), 'zrobPonownie')) {
          await tx.run('INSERT INTO przypomnienie (id, licznik_id, od_rzedu, co_n, razy, tekst, zmieniono_ms) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [z.id.nowy(), licznikId, liczba(r, 'od_rzedu'), liczba(r, 'co_n'), liczba(r, 'razy'), tekst(r, 'tekst'), teraz]);
        }
      }
    }
    return { ok: true, wartosc: { projektId } };
  });
}
/** Druga część pary (bliźniak, BR-PRJ-014): `para_z`, cel z pierwszej części (brak celu zostaje brakiem). */
export function dodajCzescPara(z: Zaleznosci, w: { czescId: string; nazwa: string }): Promise<Wynik<{ czescId: string; licznikId: string }>> {
  if (!niepusta(w.nazwa)) return Promise.resolve(blad('bledne_dane'));
  return operacjaZapisu(z, 'dodajCzescPara', async (tx, teraz) => {
    const [c] = await wiersze(tx.all('SELECT projekt_id, cel_rzedow, usunieto_ms FROM czesc WHERE id = ?', [w.czescId]), 'dodajCzescPara');
    if (!c) return blad('bledne_dane');
    if (liczbaLubNull(c, 'usunieto_ms') !== null) return blad('niedozwolone_przejscie');
    const nowa = await dodajCzesc(tx, z, { projektId: tekst(c, 'projekt_id'), nazwa: w.nazwa, cel: liczbaLubNull(c, 'cel_rzedow'), paraZ: w.czescId, terazMs: teraz });
    return { ok: true, wartosc: nowa };
  });
}

/** Kolejność usuwania przy „Usuń wszystkie dane”: dzieci przed rodzicami (RESTRICT do `plik` działa od razu, także przy odroczonych kluczach). */
const KOLEJNOSC_USUWANIA = ['zdjecie', 'rysunek', 'wzor', 'projekt_wloczka', 'obliczenie', 'sesja', 'przypomnienie', 'notatka_rzedu', 'zdarzenie', 'licznik', 'czesc', 'projekt', 'wloczka', 'narzedzie', 'plik', 'dzien_limitu', 'poczekalnia', 'ustawienie', 'blad'];
/** „Usuń wszystkie dane” (F-34, P-110 Q3a): wszystkie tabele lokalnie (także dni limitu, dane.md) i pliki z magazynu po COMMIT; synchronizacja wyłączona. */
export async function usunWszystkieDane(z: ZaleznosciPlikow): Promise<Wynik<void>> {
  const pliki: string[] = [];
  const w = await operacjaZapisu(z, 'usunWszystkieDane', async (tx) => {
    const tabele = (await wiersze(tx.all("SELECT name FROM sqlite_schema WHERE type = 'table' AND name NOT LIKE 'sqlite_%'"), 'usunWszystkieDane')).map((r) => tekst(r, 'name'));
    const nieznane = tabele.filter((t) => !KOLEJNOSC_USUWANIA.includes(t));
    if (nieznane.length) throw new Error(`usunWszystkieDane: tabele bez miejsca w kolejności: ${nieznane.join(', ')}`); // nowa tabela = decyzja, nie pominięcie
    for (const r of await wiersze(tx.all('SELECT sha256 FROM plik'), 'usunWszystkieDane')) pliki.push(tekst(r, 'sha256'));
    for (const t of KOLEJNOSC_USUWANIA) if (tabele.includes(t)) await tx.run(`DELETE FROM ${t}`);
    return OK;
  });
  if (!w.ok) return w;
  for (const h of pliki) await z.magazyn.usun(h); // po COMMIT: plik bez odwołań (ADR-0001)
  if (z.synchronizacja) await z.synchronizacja.wylacz(); // „Usuń też z iCloud” to osobna opcja (P-110 Q3a)
  return OK;
}
