// Archiwum `.oczko` (ADR-0004, dane.md „Kopie i eksport”): ZIP z manifest.json, oczko.db (VACUUM INTO) i pliki/<sha256>.<rozszerzenie>.
// sygnatura: propozycja 07, zatwierdzona w fix 05 2026-10-25 (Z07-22). ZIP i SHA-256 w TS (P-120 Q2a): src/dane/archiwum/.
import type { Powod, Wynik } from '../domena/bledy';
import type { ArchiwumSprawdzone, Katalogi, Licznosci, MagazynPlikow, Manifest, Migruj, PortArchiwum, PortBazy, Zegar } from '../domena/porty';
import { ROZSZERZENIE_ARCHIWUM, WERSJA_FORMATU_ARCHIWUM, WERSJA_SCHEMATU, ZAPAS_MIEJSCA_EKSPORTU } from '../konfiguracja';
import { otworzPortExpo } from './baza/adapter-expo';
import { powodBledu } from './baza/bledy-sqlite';
import { kopiaBazy } from './baza/kopia';
import { scalZKopia, zastapZKopii } from './baza/przeniesienie';
import { sha256 } from './archiwum/sha256';
import { czytajKatalog, czytajWpis, wypakuj, zapiszZip } from './archiwum/zip';
import { istniejePlik, lista as listaPlikow, polacz, usunKatalog, usunPlik, utworzKatalog } from './pliki/system';
import { sprawdzKopie } from './kopia-ratunkowa';
import { liczba, tekst, wiersze } from './repozytoria/wiersze';

const SHA = /^[0-9a-f]{64}$/;
const blad = (powod: Powod): { ok: false; powod: Powod } => ({ ok: false, powod });
const zapisNieudany = (e: unknown) => blad(powodBledu(e) === 'brak_miejsca' ? 'brak_miejsca' : 'zapis');

async function licznosci(port: PortBazy): Promise<Licznosci> {
  const w: Licznosci = {};
  for (const r of await wiersze(port.all("SELECT name FROM sqlite_schema WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name"), 'licznosci')) {
    const t = tekst(r, 'name');
    const [n] = await wiersze(port.all(`SELECT count(*) AS n FROM "${t.replace(/"/g, '""')}"`), 'licznosci');
    w[t] = n ? liczba(n, 'n') : 0;
  }
  return w;
}
async function licznosciPliku(sciezka: string): Promise<Licznosci> {
  const port = otworzPortExpo(sciezka, { tylkoOdczyt: true });
  try { return await licznosci(port); } finally { await port.zamknij(); }
}

/** manifest.json z `unknown` (plik z zewnątrz): zły kształt → null (= „bledne_dane”), bez zgadywania pól. */
function parsujManifest(b: Uint8Array): Manifest | null {
  let v: unknown;
  try { v = JSON.parse(new TextDecoder().decode(b)); } catch { return null; }
  if (typeof v !== 'object' || v === null || Array.isArray(v)) return null;
  if (!('format' in v) || v.format !== 'oczko') return null;
  if (!('wersja_formatu' in v) || typeof v.wersja_formatu !== 'number' || !('wersja_schematu' in v) || typeof v.wersja_schematu !== 'number') return null;
  if (!('aplikacja' in v) || typeof v.aplikacja !== 'string' || !('utworzono' in v) || typeof v.utworzono !== 'number') return null;
  if (!('licznosci' in v) || typeof v.licznosci !== 'object' || v.licznosci === null) return null;
  const licz: Licznosci = {};
  for (const [k, n] of Object.entries(v.licznosci)) { if (typeof n !== 'number') return null; licz[k] = n; }
  if (!('pliki' in v) || !Array.isArray(v.pliki)) return null;
  const pliki: Manifest['pliki'] = [];
  for (const p of v.pliki) {
    if (typeof p !== 'object' || p === null || !('sha256' in p) || typeof p.sha256 !== 'string' || !('bajty' in p) || typeof p.bajty !== 'number') return null;
    pliki.push({ sha256: p.sha256, bajty: p.bajty });
  }
  return { format: 'oczko', wersja_formatu: v.wersja_formatu, wersja_schematu: v.wersja_schematu, aplikacja: v.aplikacja, utworzono: v.utworzono, licznosci: licz, pliki };
}

export function utworzArchiwum(z: { baza: PortBazy; magazyn: MagazynPlikow; zegar: Zegar; katalogi: Katalogi; migruj: Migruj; aplikacja: string }): PortArchiwum {
  async function potrzebneMiejsce(): Promise<number> {
    const [s] = await wiersze(z.baza.all('SELECT (SELECT page_count FROM pragma_page_count()) * (SELECT page_size FROM pragma_page_size()) AS bajty'), 'miejsce');
    const [p] = await wiersze(z.baza.all('SELECT coalesce(sum(bajty), 0) AS bajty FROM plik'), 'miejsce');
    return ((s ? liczba(s, 'bajty') : 0) + (p ? liczba(p, 'bajty') : 0)) * ZAPAS_MIEJSCA_EKSPORTU;
  }

  return {
    /** VACUUM INTO + pliki + manifest; przed zapisem sprawdzenie miejsca, po błędzie żaden plik nie zostaje w katalogu docelowym. */
    async zapisz(katalogDocelowy) {
      if ((await z.magazyn.wolneMiejsce()) < (await potrzebneMiejsce())) return blad('brak_miejsca'); // ADR-0004, ŚU-17
      const teraz = z.zegar.teraz();
      const baza = polacz(z.katalogi.tymczasowy, `eksport-${teraz.ms}.db`);
      let cel = polacz(katalogDocelowy, `oczko-${teraz.dzien}${ROZSZERZENIE_ARCHIWUM}`);
      for (let i = 2; istniejePlik(cel); i++) cel = polacz(katalogDocelowy, `oczko-${teraz.dzien}-${i}${ROZSZERZENIE_ARCHIWUM}`); // nigdy nie nadpisuje
      try {
        const k = await kopiaBazy(z.baza, baza);
        if (!k.ok) return k;
        const pliki = (await wiersze(z.baza.all('SELECT sha256, rozszerzenie, bajty FROM plik ORDER BY sha256'), 'eksport'))
          .map((r) => ({ sha256: tekst(r, 'sha256'), rozszerzenie: tekst(r, 'rozszerzenie'), bajty: liczba(r, 'bajty') }));
        const manifest: Manifest = {
          format: 'oczko', wersja_formatu: WERSJA_FORMATU_ARCHIWUM, wersja_schematu: WERSJA_SCHEMATU, aplikacja: z.aplikacja, utworzono: teraz.ms,
          licznosci: await licznosciPliku(baza), // liczności z migawki, która trafia do archiwum
          pliki: pliki.map((p) => ({ sha256: p.sha256, bajty: p.bajty })),
        };
        zapiszZip(cel, [
          { nazwa: 'manifest.json', dane: new TextEncoder().encode(JSON.stringify(manifest)) },
          { nazwa: 'oczko.db', plik: baza },
          ...pliki.map((p) => ({ nazwa: `pliki/${p.sha256}.${p.rozszerzenie}`, plik: z.magazyn.sciezka(p.sha256) })),
        ]);
        return { ok: true, wartosc: { sciezka: cel, manifest } };
      } catch (e) {
        usunPlik(cel);
        return zapisNieudany(e);
      } finally {
        usunPlik(baza);
      }
    },

    /** Manifest, wersje, miejsce, SHA-256 i CRC w katalogu tymczasowym; baza bez zmian. Plik obcy → `bledne_dane`, zły skrót → `uszkodzony`. */
    async sprawdz(sciezka) {
      const kat = istniejePlik(sciezka) ? czytajKatalog(sciezka) : null;
      if (!kat) return blad('bledne_dane');
      const wpisManifestu = kat.find((w) => w.nazwa === 'manifest.json');
      const surowy = wpisManifestu ? czytajWpis(sciezka, wpisManifestu) : null;
      const manifest = surowy ? parsujManifest(surowy) : null;
      if (!manifest) return blad('bledne_dane');
      if (manifest.wersja_formatu > WERSJA_FORMATU_ARCHIWUM || manifest.wersja_schematu > WERSJA_SCHEMATU) return blad('wersja_nowsza'); // bez zapisu (ŚU-10)
      const wpisBazy = kat.find((w) => w.nazwa === 'oczko.db');
      if (!wpisBazy) return blad('bledne_dane');
      const wpisyPlikow = kat.filter((w) => w.nazwa.startsWith('pliki/'));
      const rozmiarDanych = kat.reduce((s, w) => s + w.rozmiar, 0);
      if ((await z.magazyn.wolneMiejsce()) < rozmiarDanych * ZAPAS_MIEJSCA_EKSPORTU) return blad('brak_miejsca');
      const katalog = polacz(z.katalogi.tymczasowy, `import-${z.zegar.teraz().ms}`);
      try {
        utworzKatalog(polacz(katalog, 'pliki'));
        if (!wypakuj(sciezka, wpisBazy, polacz(katalog, 'oczko.db'))) return odrzuc(katalog, 'uszkodzony');
        const zManifestu = new Set(manifest.pliki.map((p) => `${p.sha256}:${p.bajty}`));
        const wArchiwum = new Set<string>();
        for (const w of wpisyPlikow) {
          const m = /^pliki\/([0-9a-f]{64})\.([A-Za-z0-9]+)$/.exec(w.nazwa);
          if (!m || !SHA.test(m[1])) return odrzuc(katalog, 'uszkodzony');
          const s = sha256();
          if (!wypakuj(sciezka, w, polacz(katalog, w.nazwa), (b) => s.dodaj(b)) || s.wynik() !== m[1]) return odrzuc(katalog, 'uszkodzony'); // R-067
          wArchiwum.add(`${m[1]}:${w.rozmiar}`);
        }
        if (zManifestu.size !== wArchiwum.size || [...zManifestu].some((p) => !wArchiwum.has(p))) return odrzuc(katalog, 'uszkodzony');
        const baza = await sprawdzKopie(polacz(katalog, 'oczko.db'));
        if (!baza.ok) return odrzuc(katalog, baza.powod);
        return { ok: true, wartosc: { manifest, katalog } };
      } catch (e) {
        return odrzuc(katalog, powodBledu(e) === 'brak_miejsca' ? 'brak_miejsca' : 'zapis');
      }
    },

    /** „Kopia przed importem” (KOPIA_PRZED_IMPORTEM_DNI); niepełny plik po błędzie usuwa kopiaBazy (P-118 W3). */
    async kopiaPrzed() {
      const sciezka = polacz(z.katalogi.kopie, `przed-importem-${z.zegar.teraz().ms}.db`);
      const k = await kopiaBazy(z.baza, sciezka);
      return k.ok ? { ok: true, wartosc: { sciezka } } : k;
    },

    /** Migracja kopii tym samym runnerem → pliki do magazynu → dane (zastąp albo scal) w kolejce portu; katalog tymczasowy usuwany na końcu. */
    async wczytaj(a: ArchiwumSprawdzone, tryb) {
      const db = polacz(a.katalog, 'oczko.db');
      try {
        const port = otworzPortExpo(db);
        try {
          const m = await z.migruj(port);
          if (!m.ok) return m;
        } finally {
          await port.zamknij();
        }
        for (const nazwa of plikiKatalogu(a)) {
          const r = await z.magazyn.zapisz(polacz(a.katalog, 'pliki', nazwa), nazwa.slice(nazwa.indexOf('.') + 1));
          if (!r.ok) return r;
        }
        if (tryb === 'zastap') await zastapZKopii(z.baza, db);
        else await scalZKopia(z.baza, db, z.zegar.teraz().ms);
        return { ok: true, wartosc: { licznosci: await licznosci(z.baza) } };
      } catch (e) {
        return zapisNieudany(e);
      } finally {
        usunKatalog(a.katalog);
      }
    },
  };

  function plikiKatalogu(a: ArchiwumSprawdzone): string[] {
    return a.manifest.pliki.map((p) => {
      const n = listaPlikow(polacz(a.katalog, 'pliki')).find((x) => x.startsWith(`${p.sha256}.`));
      if (!n) throw new Error(`archiwum: brak pliku ${p.sha256} po sprawdzeniu`); // stan niemożliwy: sprawdz porównał zbiory
      return n;
    });
  }
}
function odrzuc(katalog: string, powod: Powod): { ok: false; powod: Powod } {
  usunKatalog(katalog);
  return blad(powod);
}
