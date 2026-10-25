// Kontrole repo roli 07 (docs/jakosc/strategia.md §10: kontrole 05-8, 12, P-089). Każda reguła ma w tests/jakosc/kontrole-repo.test.ts
// przypadek dobry i plik-pułapkę, na którym pada. Kod 0.1.0 (src/core, src/components, src/screens, app, lib) jest poza zakresem do czasu
// usunięcia przez rolę 08 (wyjątek nazwany, DS-13); jego naruszenia raportuje `--stary` informacyjnie.
// Użycie: node scripts/jakosc/kontrole-repo.mjs [--katalog <korzeń>] [--stary]   (kod 0 = brak naruszeń, 1 = naruszenia, 2 = zły korzeń)
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { createHash } from 'node:crypto';

const arg = (n) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null; };
const korzen = arg('--katalog') ?? process.cwd();
const stary = process.argv.includes('--stary');

export const NOWY_KOD = ['src/domena', 'src/dane', 'src/przypadki-uzycia', 'src/platforma', 'src/ekrany', 'src/komponenty', 'src/konfiguracja.ts', 'modules', 'targets'];
export const STARY_KOD = ['src/core', 'src/components', 'src/screens', 'app', 'lib'];
const TEST = /(^|\/)(__tests__|tests?)\/|\.(test|spec)\.[jt]sx?$/;
const EXT = /\.(ts|tsx|js|jsx|mjs|swift|json)$/;

// Reguły: id, opis, wzorzec (na tekście z ujednoliconymi białymi znakami), pliki (regex ścieżki względnej), wolno (regex ścieżek dozwolonych).
export const REGULY = [
  { id: 'OR-REPLACE', opis: 'INSERT OR REPLACE kasuje dzieci przy ON DELETE CASCADE; tylko UPSERT (zasada wspólna 10, dane.md)', wzorzec: /\bOR\s+REPLACE\b/i },
  { id: 'EXCLUSIVE-TX', opis: 'withExclusiveTransactionAsync otwiera drugie połączenie bez foreign_keys (ADR-0002)', wzorzec: /withExclusiveTransactionAsync/ },
  { id: 'BAZA-W-PAMIECI', opis: 'baza w pamięci poza testami gubi dane (rola 12)', wzorzec: /:memory:|createInMemoryDatabase/, wolno: /^src\/dane\/baza\/adapter-node\.ts$/ },
  { id: 'KOPIA-SAMEGO-DB', opis: 'kopia samego pliku .db przy WAL gubi dane; tylko VACUUM INTO (ADR-0020)', wzorzec: /copy\w*\s*\([^)]*\.db\b|\.db['"`]\s*,\s*[^)]*copy/i },
  { id: 'VACUUM-RATUNEK', opis: 'VACUUM/REINDEX na bazie głównej w kodzie ratunkowym (rola 12)', wzorzec: /\b(VACUUM|REINDEX)\b(?!\s+INTO)/i, pliki: /(ratunk|awaryj)/i },
  { id: 'STARY-PLIK-0-1-0', opis: 'nowa wersja nie dotyka Library/SQLite/oczko.db (P-070, ADR-0015)', wzorzec: /Library\/SQLite/ },
  { id: 'SQLITE3-SWIFT', opis: 'Swift nie importuje SQLite3 (ADR-0008)', wzorzec: /^\s*import\s+SQLite3\b/m, pliki: /\.swift$/ },
  { id: 'SZTUCZNY-SKLEP', opis: 'przełącznik sztucznego sklepu tylko w adapterze sklepu (wzór Treningu lib/products.ts); w buildzie wydania sprawdza sprawdz-ipa', wzorzec: /EXPO_PUBLIC_STORE_FAKE/, wolno: /^src\/platforma\/sklep[^/]*\.ts$/ },
  { id: 'WYMUSZONA-AWARIA', opis: 'przełącznik wymuszonej awarii tylko w konfiguracji testowej (rola 12)', wzorzec: /EXPO_PUBLIC_WYMUS_AWARIE/, wolno: /^src\/platforma\/straznik-startu[^/]*\.ts$/ },
  { id: 'CENY-W-KODZIE', opis: 'ceny tylko ze StoreKit (displayPrice), bez cen wpisanych w kod (P-089 (1))', wzorzec: /[$€£]\s?\d+[.,]\d{2}(?!\d)|(?<![\d.,])\d+[.,]\d{2}\s?(zł|€|£|USD|EUR|PLN|GBP)(?![A-Za-z])|(?<![A-Za-z])(USD|EUR|PLN|GBP)\s?\d+[.,]\d{2}(?!\d)/, wolno: /^src\/platforma\/sklep-sztuczny\.ts$/, pliki: /\.(ts|tsx|js|jsx)$/ },
];

// Reguły na plikach konfiguracji (package.json, app.json).
const SDK_AWARII = /^(@sentry\/|sentry-|@bugsnag\/|bugsnag|@datadog\/|@react-native-firebase\/crashlytics|instabug|@embrace-io\/)/;
const DZWIEK = /^(expo-av|expo-audio|react-native-sound|react-native-track-player)$/; // BR-LIC-005: haptyka bez dźwięku (moduly.md, port Haptyka)
const PRZYPIETE = ['expo-iap', '@bacons/apple-targets', '@testing-library/react-native', 'eslint', '@typescript-eslint/parser', 'yaml'];

function pliki(katalog) {
  const wynik = [];
  if (!existsSync(katalog)) return wynik;
  if (statSync(katalog).isFile()) return [katalog];
  for (const n of readdirSync(katalog)) {
    if (n === 'node_modules' || n.startsWith('.')) continue;
    const p = join(katalog, n);
    if (statSync(p).isDirectory()) wynik.push(...pliki(p));
    else if (EXT.test(n)) wynik.push(p);
  }
  return wynik;
}
const rel = (p) => relative(korzen, p).split(sep).join('/');

export function sprawdz(korzenKatalog, zakres) {
  const naruszenia = [];
  const wyjatkiPlik = join(korzenKatalog, 'scripts/jakosc/wyjatki.json');
  const wyjatki = existsSync(wyjatkiPlik) ? JSON.parse(readFileSync(wyjatkiPlik, 'utf8')).kontrole ?? [] : [];
  const zwolniony = (r, p) => wyjatki.some((w) => w.regula === r && w.plik === p);
  for (const kat of zakres) {
    for (const p of pliki(join(korzenKatalog, kat))) {
      const r = relative(korzenKatalog, p).split(sep).join('/');
      if (TEST.test(r)) continue;
      const tekst = readFileSync(p, 'utf8').replace(/[ ​⁠﻿]/g, ' ');
      for (const reg of REGULY) {
        if (reg.pliki && !reg.pliki.test(r)) continue;
        if (reg.wolno && reg.wolno.test(r)) continue;
        const m = tekst.match(reg.wzorzec);
        if (m && !zwolniony(reg.id, r)) {
          const linia = tekst.slice(0, m.index).split('\n').length;
          naruszenia.push(`${reg.id} ${r}:${linia} — ${reg.opis}`);
        }
      }
    }
  }
  const pkgPlik = join(korzenKatalog, 'package.json');
  if (existsSync(pkgPlik)) {
    const pkg = JSON.parse(readFileSync(pkgPlik, 'utf8'));
    const zal = { ...pkg.dependencies, ...pkg.devDependencies };
    for (const [n, v] of Object.entries(zal)) {
      if (n === 'expo-updates') naruszenia.push(`EXPO-UPDATES package.json — bez OTA (ADR-0021)`);
      if (SDK_AWARII.test(n)) naruszenia.push(`SDK-AWARII package.json: ${n} — sygnał bez SDK (ADR-0018)`);
      if (DZWIEK.test(n)) naruszenia.push(`DZWIEK package.json: ${n} — aplikacja nie odtwarza dźwięku (BR-LIC-005)`);
      if (PRZYPIETE.includes(n) && !/^\d+\.\d+\.\d+$/.test(v)) naruszenia.push(`PRZYPIECIE package.json: ${n}@${v} — wersja dokładna (ADR-0016)`);
    }
  }
  const appPlik = join(korzenKatalog, 'app.json');
  if (existsSync(appPlik)) {
    const app = JSON.parse(readFileSync(appPlik, 'utf8'));
    if (app.expo?.updates && app.expo.updates.enabled !== false) naruszenia.push('EXPO-UPDATES app.json: sekcja updates włączona — bez OTA (ADR-0021)');
  }
  const manifest = join(korzenKatalog, 'docs/jakosc/migracje-wydane.json');
  if (existsSync(manifest)) {
    for (const { plik, sha256 } of JSON.parse(readFileSync(manifest, 'utf8')).migracje ?? []) {
      const p = join(korzenKatalog, plik);
      if (!existsSync(p)) { naruszenia.push(`MIGRACJA-WYDANA ${plik} — plik wydanej migracji usunięty`); continue; }
      const h = createHash('sha256').update(readFileSync(p)).digest('hex');
      if (h !== sha256) naruszenia.push(`MIGRACJA-WYDANA ${plik} — zmieniona po wydaniu (SHA-256 ${h.slice(0, 12)}… ≠ ${sha256.slice(0, 12)}…); nowa zmiana = nowa migracja`);
    }
  }
  return naruszenia;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  if (!existsSync(join(korzen, 'package.json'))) { console.log(`BŁĄD ${korzen}: brak package.json — zły korzeń repo`); process.exit(2); }
  const naruszenia = sprawdz(korzen, stary ? STARY_KOD : NOWY_KOD);
  for (const n of naruszenia) console.log(n);
  console.log(`${stary ? 'kod 0.1.0 (informacja)' : 'nowy kod'}: naruszeń ${naruszenia.length}`);
  process.exit(stary ? 0 : naruszenia.length ? 1 : 0);
}
