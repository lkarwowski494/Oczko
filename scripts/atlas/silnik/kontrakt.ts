// Kontrakt danych katalogu atlasu, format 1 (ADR-0023; pola: docs/atlas/kontrakt-krokow.md). Źródło prawdy schematu:
// SCHEMAT (JSON Schema 2020-12) → docs/atlas/katalog.schema.json (`scripts/atlas/waliduj.mjs --schema --write|--check`).
// Walidator bez zależności: podzbiór słów kluczowych użytych w SCHEMAT + reguły semantyczne; rysunek każdego kroku sprawdza funkcja
// z opcji (`sprawdzKrok`, generator i testy: `sprawdzRysunek` z sprawdz.ts) — dzięki temu ten moduł nie zależy od zapisu SVG i trafi do domeny.
// Wynik: lista { kod, sciezka, szczegol }; pusta = karta poprawna.
import type { Karta, Krok } from './typy.ts';

export const FORMAT_KARTY = 1;
export interface BladKontraktu { kod: string; sciezka: string; szczegol: string }

type S = Record<string, unknown>;
const miejsce = { type: 'array', minItems: 0, maxItems: 16, items: { type: 'object', additionalProperties: false, required: ['rzad', 'kolumna'], properties: { rzad: { type: 'integer', minimum: 0, maximum: 7 }, kolumna: { type: 'integer', minimum: 0, maximum: 11 } } } };
const strona = { enum: ['prawe', 'lewe'] };
const kotwica = { type: 'string', pattern: '^(glowa|nozka_lewa|nozka_prawa):[0-7]:(1[01]|[0-9])$|^drut_(prawy|lewy)$' };
const twierdzenieId = { type: 'string', pattern: '^[A-Z]{2,4}(-[A-Z0-9]+)+$' }; // rejestr 06: ATL-K-001, TRM-EN-006

/** JSON Schema karty (2020-12). Zmiana pól = nowa wersja FORMAT_KARTY i wpis w kontrakt-krokow.md. */
export const SCHEMAT: S = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  $id: 'https://oczko.invalid/atlas/karta-1.schema.json',
  title: 'Karta atlasu technik (format 1)',
  type: 'object',
  additionalProperties: false,
  required: ['format', 'id', 'rzemioslo', 'rodzaj', 'klucze', 'terminy', 'twierdzenia', 'jezyki_gotowe'],
  properties: {
    format: { const: FORMAT_KARTY },
    id: { type: 'string', pattern: '^[a-z0-9_]+(\\.[a-z0-9_-]+){1,3}$' },
    rzemioslo: { enum: ['druty', 'szydelko', 'oba'] },
    rodzaj: { enum: ['oczko', 'scieg', 'ujecie', 'dodanie', 'nabieranie', 'zamykanie', 'warkocz', 'oczko_szydelkowe', 'tabela', 'schemat', 'skrot'] },
    pozycje: { type: 'array', minItems: 1, maxItems: 200, items: { type: 'string', pattern: '^[a-z0-9_]+(\\.[a-z0-9_-]+){1,3}$' } },
    klucze: { type: 'object', additionalProperties: false, required: ['nazwa', 'podpis', 'opis_alt'], properties: { nazwa: { type: 'string' }, podpis: { type: 'string' }, opis_alt: { type: 'string' } } },
    terminy: {
      type: 'object',
      required: ['en-US'],
      propertyNames: { pattern: '^[a-z]{2,3}(-[A-Z][a-z]{3})?(-([A-Z]{2}|[0-9]{3}))?$' },
      additionalProperties: { type: 'array', minItems: 1, maxItems: 4, items: { type: 'object', additionalProperties: false, required: ['skrot', 'twierdzenie'], properties: { nazwa: { type: ['string', 'null'], minLength: 1, maxLength: 80 }, skrot: { type: ['string', 'null'], minLength: 1, maxLength: 16 }, twierdzenie: twierdzenieId } } },
    },
    twierdzenia: {
      type: 'array', minItems: 1, maxItems: 16,
      items: {
        type: 'object', additionalProperties: false, required: ['id', 'wartosc'],
        properties: {
          id: twierdzenieId,
          wartosc: {
            type: 'object', additionalProperties: false, minProperties: 1,
            properties: { pochylenie: { enum: ['prawo', 'lewo', 'srodek', 'brak'] }, bilans: { type: 'integer', minimum: -4, maximum: 4 }, na_wierzchu: { enum: ['lewe', 'prawe', 'srodkowe'] }, kierunek: { enum: ['od_przodu', 'od_tylu'] } },
          },
        },
      },
    },
    jezyki_gotowe: { type: 'array', minItems: 1, items: { type: 'string' } },
    glif: { type: 'object', additionalProperties: false, required: ['id', 'origin', 'rs', 'ws'], properties: { id: { type: 'string', pattern: '^glif\\.[a-z0-9_.]+$' }, origin: { const: 'own' }, rs: { type: 'string' }, ws: { type: 'string' } } },
    rysunek: {
      type: 'object', additionalProperties: false, required: ['rodzina', 'probka', 'tlo', 'operacja'],
      properties: {
        rodzina: { enum: ['siatka-petli', 'graf-szydelkowy', 'nabieranie'] },
        probka: { type: 'object', additionalProperties: false, required: ['kolumny', 'rzedy'], properties: { kolumny: { type: 'integer', minimum: 2, maximum: 8 }, rzedy: { type: 'integer', minimum: 2, maximum: 4 } } },
        tlo: strona,
        operacja: {
          oneOf: [
            { type: 'null' },
            { type: 'object', additionalProperties: false, required: ['typ', 'strona'], properties: { typ: { const: 'oczko' }, strona, kolumna: { type: 'integer', minimum: 0, maximum: 7 } } },
            { type: 'object', additionalProperties: false, required: ['typ', 'zuzywa', 'strona', 'na_wierzchu'], properties: { typ: { const: 'scal' }, zuzywa: { type: 'integer', minimum: 2, maximum: 3 }, strona, na_wierzchu: { enum: ['lewe', 'prawe'] }, kolumna: { type: 'integer', minimum: 0, maximum: 7 } } },
            // od wersji 1 (pytania 06 nr 2): kontrakt przyjmuje, silnik jeszcze nie rysuje → `rysunek-nieobslugiwany`
            { type: 'object', additionalProperties: false, required: ['typ'], properties: { typ: { const: 'narzut' }, kolumna: { type: 'integer', minimum: 0, maximum: 7 } } },
            { type: 'object', additionalProperties: false, required: ['typ', 'scianka', 'pochylenie'], properties: { typ: { const: 'z_nitki_poziomej' }, scianka: { enum: ['przednia', 'tylna'] }, pochylenie: { enum: ['prawo', 'lewo'] }, kolumna: { type: 'integer', minimum: 0, maximum: 7 } } },
            { type: 'object', additionalProperties: false, required: ['typ', 'wzor'], properties: { typ: { const: 'scieg' }, wzor: { type: 'array', minItems: 1, maxItems: 4, items: { type: 'array', minItems: 1, maxItems: 8, items: strona } } } },
            { type: 'object', additionalProperties: false, required: ['typ', 'zuzywa', 'przekladane', 'pomocniczy'], properties: { typ: { const: 'warkocz' }, zuzywa: { type: 'integer', minimum: 2, maximum: 8 }, przekladane: { type: 'integer', minimum: 1, maximum: 4 }, pomocniczy: { enum: ['przod', 'tyl'] }, kolumna: { type: 'integer', minimum: 0, maximum: 7 } } },
            { type: 'object', additionalProperties: false, required: ['typ', 'ile'], properties: { typ: { const: 'zamknij' }, ile: { type: 'integer', minimum: 1, maximum: 6 } } },
            { type: 'object', additionalProperties: false, required: ['typ', 'narzuty'], properties: { typ: { const: 'oczko_szydelkowe' }, narzuty: { type: 'integer', minimum: 0, maximum: 3 } } },
          ],
        },
      },
    },
    kroki: {
      type: 'array', minItems: 1, maxItems: 8,
      items: {
        type: 'object', additionalProperties: false, required: ['faza', 'petle', 'wyroznij', 'kierunek', 'strzalka', 'klucz'],
        properties: {
          faza: { enum: ['tkanina', 'wklucie', 'narzut', 'przeciagniecie', 'zdjecie', 'wynik'] },
          petle: miejsce,
          wyroznij: miejsce,
          kierunek: { enum: ['od_przodu', 'od_tylu', null] },
          drut: { type: 'object', additionalProperties: false, required: ['ktory', 'grot'], properties: { ktory: { enum: ['prawy', 'lewy', 'pomocniczy', 'szydelko'] }, grot: { enum: ['w_lewo', 'w_prawo'] } } },
          nitka: { enum: ['przod', 'tyl'] },
          scianka: { enum: ['przednia', 'tylna'] },
          petle_na_narzedziu: { type: 'integer', minimum: 0, maximum: 6 },
          faza_opis: { type: 'string', minLength: 1, maxLength: 300 }, // tymczasowe: tylko rodzina `nabieranie`, do oceny (pytanie 06 nr 6)
          strzalka: { oneOf: [{ type: 'null' }, { type: 'object', additionalProperties: false, required: ['ruch', 'od', 'do'], properties: { ruch: { enum: ['drut', 'nitka'] }, od: kotwica, do: kotwica } }] },
          klucz: { type: 'string' },
        },
      },
    },
  },
};

// ---------- walidator podzbioru JSON Schema ----------
const typ = (v: unknown): string => (v === null ? 'null' : Array.isArray(v) ? 'array' : Number.isInteger(v) ? 'integer' : typeof v);
const pasuje = (t: string, oczek: string) => t === oczek || (oczek === 'number' && t === 'integer');

/** Błędy struktury względem schematu (słowa: type, const, enum, pattern, min/maxLength, minimum, maximum, min/maxItems, items,
 *  properties, required, additionalProperties, minProperties, propertyNames, oneOf). */
export function walidujSchemat(v: unknown, s: S, sciezka = '$'): BladKontraktu[] {
  const b: BladKontraktu[] = [];
  const zgl = (szczegol: string) => b.push({ kod: 'schemat', sciezka, szczegol });
  if ('oneOf' in s) {
    const wyniki = (s.oneOf as S[]).map((w) => walidujSchemat(v, w, sciezka));
    const ok = wyniki.filter((w) => w.length === 0).length;
    if (ok === 1) return b;
    if (ok > 1) { zgl('pasuje do więcej niż jednego wariantu'); return b; }
    // najbliższy wariant: ten, którego `typ` (const) się zgadza, albo z najmniejszą liczbą błędów
    const zTypem = (s.oneOf as S[]).findIndex((w) => (w.properties as S | undefined)?.typ && typeof v === 'object' && v !== null && ((w.properties as S).typ as S).const === (v as S).typ);
    return zTypem >= 0 ? wyniki[zTypem] : wyniki.reduce((a, c) => (c.length < a.length ? c : a));
  }
  if ('const' in s && v !== s.const) zgl(`ma być ${JSON.stringify(s.const)}, jest ${JSON.stringify(v)}`);
  if ('enum' in s && !(s.enum as unknown[]).includes(v)) zgl(`wartość ${JSON.stringify(v)} spoza listy ${JSON.stringify(s.enum)}`);
  if ('type' in s) {
    const t = typ(v), oczek = ([] as string[]).concat(s.type as string);
    if (!oczek.some((o) => pasuje(t, o))) { zgl(`typ ${t}, oczekiwany ${oczek.join(' | ')}`); return b; }
  }
  if (typeof v === 'string') {
    if ('pattern' in s && !new RegExp(s.pattern as string, 'u').test(v)) zgl(`${JSON.stringify(v)} nie pasuje do wzorca ${s.pattern}`);
    if ('minLength' in s && [...v].length < (s.minLength as number)) zgl(`długość ${[...v].length} < ${s.minLength}`);
    if ('maxLength' in s && [...v].length > (s.maxLength as number)) zgl(`długość ${[...v].length} > ${s.maxLength}`);
  }
  if (typeof v === 'number') {
    if ('minimum' in s && v < (s.minimum as number)) zgl(`${v} < minimum ${s.minimum}`);
    if ('maximum' in s && v > (s.maximum as number)) zgl(`${v} > maksimum ${s.maximum}`);
  }
  if (Array.isArray(v)) {
    if ('minItems' in s && v.length < (s.minItems as number)) zgl(`${v.length} elementów < ${s.minItems}`);
    if ('maxItems' in s && v.length > (s.maxItems as number)) zgl(`${v.length} elementów > ${s.maxItems}`);
    if ('items' in s) v.forEach((x, i) => b.push(...walidujSchemat(x, s.items as S, `${sciezka}[${i}]`)));
  }
  if (typ(v) === 'object') {
    const o = v as S, wl = (s.properties ?? {}) as Record<string, S>;
    for (const k of (s.required ?? []) as string[]) if (!(k in o)) zgl(`brak wymaganego pola „${k}”`);
    if ('minProperties' in s && Object.keys(o).length < (s.minProperties as number)) zgl(`${Object.keys(o).length} pól < ${s.minProperties}`);
    for (const [k, x] of Object.entries(o)) {
      if ('propertyNames' in s) b.push(...walidujSchemat(k, s.propertyNames as S, `${sciezka}.${k}(nazwa)`));
      if (k in wl) b.push(...walidujSchemat(x, wl[k], `${sciezka}.${k}`));
      else if (s.additionalProperties === false) zgl(`pole spoza kontraktu „${k}”`);
      else if (typeof s.additionalProperties === 'object') b.push(...walidujSchemat(x, s.additionalProperties as S, `${sciezka}.${k}`));
    }
  }
  return b;
}

/** Fazy, które rysuje dana rodzina (reszta słownika: kontrakt przyjmuje, silnik jeszcze nie — błąd `faza-nieobslugiwana`). */
export const FAZY_RODZINY: Record<string, string[]> = { 'siatka-petli': ['tkanina', 'wklucie', 'wynik'], 'graf-szydelkowy': [], nabieranie: [] };
/** Operacje, które rodzina rysuje (reszta: kontrakt przyjmuje, walidator zgłasza `rysunek-nieobslugiwany`). */
export const OPERACJE_RODZINY: Record<string, string[]> = { 'siatka-petli': ['oczko', 'scal'], 'graf-szydelkowy': [], nabieranie: [] };

export interface OpcjeWalidacji { sprawdzKrok?: (karta: Karta, krok: Krok) => { kod: string; szczegol: string }[] }

/** Pełna walidacja karty: schemat → semantyka → rysunek każdego kroku (gdy podano `sprawdzKrok`). */
export function walidujKarte(k: unknown, opcje: OpcjeWalidacji): BladKontraktu[] {
  const b = walidujSchemat(k, SCHEMAT);
  if (b.length) return b; // semantyka i rysunek zakładają poprawną strukturę
  const karta = k as Karta;
  const zgl = (kod: string, sciezka: string, szczegol: string) => b.push({ kod, sciezka, szczegol });
  const PRZEKROJOWE = ['tabela', 'schemat', 'skrot'];
  const prefiks = PRZEKROJOWE.includes(karta.rodzaj) ? karta.rodzaj : karta.rzemioslo;
  if (!karta.id.startsWith(`${prefiks}.`)) zgl('id', '$.id', `id „${karta.id}” nie zaczyna się od „${prefiks}.”`);
  if ((karta.rodzaj === 'tabela') !== Array.isArray(karta.pozycje)) zgl('pozycje', '$.pozycje', 'pole pozycje (lista ID) występuje dokładnie przy rodzaju „tabela”');
  if (karta.rodzaj === 'skrot' && karta.rysunek) zgl('rysunek', '$.rysunek', 'hasło skrótu bez rysunku (P-095: bez osobnych stron skrótów; skrót pokazuje tabela)');
  for (const [pole, klucz] of Object.entries(karta.klucze)) if (klucz !== `atlas.${karta.id}.${pole}`) zgl('klucz', `$.klucze.${pole}`, `ma być „atlas.${karta.id}.${pole}”, jest „${klucz}”`);
  const ids = karta.twierdzenia.map((t) => t.id);
  for (const d of ids.filter((id, i) => ids.indexOf(id) !== i)) zgl('twierdzenie', '$.twierdzenia', `powtórzone ID ${d}`);
  karta.jezyki_gotowe.forEach((j, i) => { if (!(j in karta.terminy)) zgl('jezyk', `$.jezyki_gotowe[${i}]`, `język „${j}” bez wpisu w terminy`); });
  if (!!karta.rysunek !== !!karta.kroki) zgl('rysunek', '$', 'rysunek i kroki występują razem albo wcale');
  karta.kroki?.forEach((krok, i) => {
    const s = `$.kroki[${i}]`;
    if (krok.klucz !== `atlas.${karta.id}.krok${i + 1}`) zgl('klucz', `${s}.klucz`, `ma być „atlas.${karta.id}.krok${i + 1}”, jest „${krok.klucz}”`);
    if (krok.faza === 'wklucie' && (!krok.drut || !krok.kierunek || krok.petle.length === 0)) zgl('krok', s, 'faza „wklucie” wymaga pól drut, kierunek i co najmniej jednej pętli w petle');
    if (krok.faza !== 'wklucie' && krok.drut) zgl('krok', `${s}.drut`, `pole drut tylko w fazie „wklucie” (jest „${krok.faza}”)`);
    if (krok.faza_opis !== undefined && karta.rysunek?.rodzina !== 'nabieranie') zgl('krok', `${s}.faza_opis`, 'faza_opis (tymczasowe) tylko w rodzinie „nabieranie”');
  });
  if (b.length || !opcje.sprawdzKrok || !karta.rysunek) return b;
  const obslugiwane = FAZY_RODZINY[karta.rysunek.rodzina] ?? [];
  const op = karta.rysunek.operacja;
  if (op && !OPERACJE_RODZINY[karta.rysunek.rodzina]?.includes(op.typ)) { zgl('rysunek-nieobslugiwany', '$.rysunek.operacja', `rodzina „${karta.rysunek.rodzina}” nie rysuje jeszcze operacji „${op.typ}”`); return b; }
  karta.kroki!.forEach((krok, i) => {
    if (krok.drut && krok.drut.ktory !== 'prawy') { zgl('rysunek-nieobslugiwany', `$.kroki[${i}].drut`, `silnik rysuje jeszcze tylko prawy drut (jest „${krok.drut.ktory}”)`); return; }
    if (!obslugiwane.includes(krok.faza)) { zgl('faza-nieobslugiwana', `$.kroki[${i}].faza`, `rodzina „${karta.rysunek!.rodzina}” nie rysuje jeszcze fazy „${krok.faza}” (obsługiwane: ${obslugiwane.join(', ') || 'brak'})`); return; }
    for (const e of opcje.sprawdzKrok!(karta, krok)) zgl(`rysunek:${e.kod}`, `$.kroki[${i}]`, e.szczegol);
  });
  return b;
}
