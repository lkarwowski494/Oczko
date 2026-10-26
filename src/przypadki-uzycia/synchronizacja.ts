// Synchronizacja iCloud: przypadki użycia (moduly.md „Kontrakt partii 7”, maszyna „Synchronizacja iCloud”; ADR-0005, P-221 Q5a, P-220 N3).
// Wszystkie zapisy przez kolejkę ADR-0002. Port `Synchronizacja` (v2) to silnik (CKSyncEngine albo atrapa E2E); źródłem prawdy o zaległej
// wysyłce jest skrzynka `zmiana_icloud`. Bezpiecznik ZM-06 (`ICLOUD_W_1_0`) dotyczy tylko pokazania przełącznika — nie tego modułu.
import type { Wynik } from '../domena/bledy';
import type { MagazynPlikow, PartiaIcloud, PotwierdzenieIcloud, StanSynchronizacji, StatusKonta, Synchronizacja, ZdarzenieKonta } from '../domena/porty';
import { tabelaIcloud } from '../domena/icloud/kontrakt';
import { PARTIA_SYNCHRONIZACJI } from '../konfiguracja';
import { zapiszBladW } from '../dane/repozytoria/bledy';
import { potwierdzWyslane, stanBazy, wlaczWBazie, wylaczWBazie, zaleglosci, zastosujPartie, type WynikPartii } from '../dane/repozytoria/icloud';
import { wKolejce } from './kolejka';
import type { Zaleznosci } from './zaleznosci';

export type ZaleznosciSynchronizacji = Zaleznosci & { synchronizacja: Synchronizacja; magazyn: MagazynPlikow };
/** Przyczyna stanu `blad` (linia problemu w Data and sync); silnik odrzuca `wyslij` błędem z polem `kod`. */
export type PrzyczynaBledu = 'brak_miejsca' | 'siec' | 'inny';
export type WidokSynchronizacji = { stan: StanSynchronizacji; przyczyna: PrzyczynaBledu | null; status: StatusKonta | null };
export type Sterownik = {
  start(): Promise<void>;
  wlacz(): Promise<WidokSynchronizacji>;
  wylacz(): Promise<void>;
  polacz(): Promise<WidokSynchronizacji>;
  nieSynchronizuj(): Promise<void>;
  wyslijZaleglosci(): Promise<void>;
  usunZIcloud(): Promise<Wynik<void>>;
  odbierzPartie(p: PartiaIcloud): Promise<WynikPartii>;
  widok(): WidokSynchronizacji;
  obserwuj(fn: (w: WidokSynchronizacji) => void): () => void;
  zakoncz(): void;
};

const przyczynaZ = (e: unknown): PrzyczynaBledu => {
  const kod = typeof e === 'object' && e !== null && 'kod' in e ? (e as { kod: unknown }).kod : null;
  return kod === 'brak_miejsca' ? 'brak_miejsca' : kod === 'siec' ? 'siec' : 'inny';
};

/**
 * Sterownik synchronizacji na czas życia procesu (kompozycja tworzy jeden). `start` podpina obsługę silnika zawsze (partia albo potwierdzenie
 * może przyjść po wyłączeniu — wtedy potwierdzenie czyści już pustą skrzynkę), a uruchamia silnik tylko przy `wlaczona = 1`.
 */
export function sterownikSynchronizacji(z: ZaleznosciSynchronizacji, poPartii: (w: WynikPartii) => void = () => undefined): Sterownik {
  let widok: WidokSynchronizacji = { stan: 'wylaczona', przyczyna: null, status: null };
  const sluchacze = new Set<(w: WidokSynchronizacji) => void>();
  const ustaw = (w: Partial<WidokSynchronizacji>) => { widok = { ...widok, ...w }; for (const f of sluchacze) f(widok); };
  const odpiecia: (() => void)[] = [];
  const teraz = () => z.zegar.teraz().ms;

  async function wyslijZaleglosci(): Promise<void> {
    const s = await stanBazy(z.baza);
    if (!s.wlaczona || widok.stan === 'konto_zmienione' || widok.stan === 'brak_konta' || s.zalegle === 0) return; // konto_zmienione: wysyłka zatrzymana
    const zmiany = await zaleglosci(z.baza, PARTIA_SYNCHRONIZACJI, (sha) => z.magazyn.sciezka(sha));
    if (!zmiany.length) return;
    try {
      await z.synchronizacja.wyslij(zmiany);
      if (widok.stan === 'blad') ustaw({ stan: 'aktywna', przyczyna: null }); // ustąpienie przyczyny
    } catch (e) {
      ustaw({ stan: 'blad', przyczyna: przyczynaZ(e) }); // zmiany zostają w skrzynce do następnej próby
    }
  }
  async function wlaczZKontem(zerujSilnik: boolean): Promise<WidokSynchronizacji> {
    const status = await z.synchronizacja.statusKonta();
    if (status !== 'dostepne') { ustaw({ stan: 'brak_konta', przyczyna: null, status }); return widok; } // N3: ograniczone i inne = brak_konta, tekst 04
    await wKolejce(z.baza, () => z.baza.transakcja((tx) => wlaczWBazie(tx, teraz(), zerujSilnik)));
    ustaw({ stan: 'aktywna', przyczyna: null, status });
    await z.synchronizacja.uruchom((await stanBazy(z.baza)).stanSilnika);
    await wyslijZaleglosci();
    return widok;
  }
  async function wylaczWszystko(): Promise<void> {
    await wKolejce(z.baza, () => z.baza.transakcja((tx) => wylaczWBazie(tx, teraz())));
    await z.synchronizacja.wylacz();
    ustaw({ stan: 'wylaczona', przyczyna: null });
  }
  async function odbierzPartie(p: PartiaIcloud): Promise<WynikPartii> {
    const pliki = new Set<string>(); // zasoby do magazynu PRZED transakcją; SHA-256 ≠ klucz → nie trafia do magazynu, wpis `blad`
    const zle: string[] = [];
    for (const r of p.rekordy) {
      if (!tabelaIcloud(r.encja)?.zasob || !r.plik) continue;
      const roz = typeof r.pola.rozszerzenie === 'string' ? r.pola.rozszerzenie : 'bin';
      const [byl] = await z.baza.all('SELECT 1 FROM plik WHERE sha256 = ?', [r.klucz]);
      const w = await z.magazyn.zapisz(r.plik, roz);
      if (!w.ok) continue;
      if (w.wartosc.sha256 === r.klucz) { pliki.add(r.klucz); continue; }
      const [inny] = await z.baza.all('SELECT 1 FROM plik WHERE sha256 = ?', [w.wartosc.sha256]);
      if (!inny && !byl) await z.magazyn.usun(w.wartosc.sha256);
      zle.push(r.klucz);
    }
    for (const [k] of (await z.baza.all<{ sha256: string }>('SELECT sha256 FROM plik')).map((r) => [r.sha256])) pliki.add(k); // już w magazynie
    const wynik = await wKolejce(z.baza, () => z.baza.transakcja(async (tx) => {
      for (const k of zle) { pliki.delete(k); await zapiszBladW(tx, { czasMs: teraz(), kod: 'icloud_zly_zasob', szczegoly: {} }); }
      return zastosujPartie(tx, p, teraz(), pliki);
    }));
    poPartii(wynik);
    return wynik;
  }
  async function poPotwierdzeniu(p: PotwierdzenieIcloud): Promise<void> {
    await wKolejce(z.baza, () => z.baza.transakcja((tx) => potwierdzWyslane(tx, p)));
    if ((await stanBazy(z.baza)).zalegle > 0) await wyslijZaleglosci(); // reszta skrzynki (partie po PARTIA_SYNCHRONIZACJI)
  }
  function zdarzenieKonta(e: ZdarzenieKonta): void {
    if (widok.stan === 'wylaczona') return;
    if (e === 'zmiana_konta') ustaw({ stan: 'konto_zmienione', przyczyna: null });
    else if (e === 'wylogowano') ustaw({ stan: 'brak_konta', przyczyna: null, status: 'brak_konta' });
    else if (widok.stan === 'brak_konta') ustaw({ stan: 'aktywna', przyczyna: null, status: 'dostepne' });
  }

  return {
    async start() {
      odpiecia.push(z.synchronizacja.odbieraj(async (p) => { await odbierzPartie(p); }));
      odpiecia.push(z.synchronizacja.wyslane(poPotwierdzeniu));
      odpiecia.push(z.synchronizacja.zdarzeniaKonta(zdarzenieKonta));
      const s = await stanBazy(z.baza);
      if (!s.wlaczona) { ustaw({ stan: 'wylaczona' }); return; }
      const status = await z.synchronizacja.statusKonta();
      if (status !== 'dostepne') { ustaw({ stan: 'brak_konta', status }); return; }
      ustaw({ stan: 'aktywna', status });
      await z.synchronizacja.uruchom(s.stanSilnika);
      await wyslijZaleglosci();
    },
    wlacz: () => wlaczZKontem(false),
    wylacz: wylaczWszystko,
    polacz: () => wlaczZKontem(true), // inne konto: pełne ponowne wysłanie, scalenie przez `scal` u odbiorcy
    nieSynchronizuj: wylaczWszystko,
    wyslijZaleglosci,
    async usunZIcloud() { return z.synchronizacja.usunStrefe(); }, // po „Usuń wszystkie dane” (skrzynka pusta, synchronizacja wyłączona — L1)
    odbierzPartie,
    widok: () => widok,
    obserwuj(fn) { sluchacze.add(fn); return () => { sluchacze.delete(fn); }; },
    zakoncz() { for (const o of odpiecia.splice(0)) o(); },
  };
}
