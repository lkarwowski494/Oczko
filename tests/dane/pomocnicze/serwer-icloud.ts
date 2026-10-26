// Sztuczny serwer iCloud dla testów warstwy danych (kod testu, nie aplikacji; plan 07 partii 7 „dane z atrapą silnika”): kilka urządzeń
// z portem `Synchronizacja` v2; wysyłka zapisuje rekordy na serwerze i potwierdza jak CloudKit; dostarczenie wywołuje `odbieraj` urządzenia.
import type { PartiaIcloud, PotwierdzenieIcloud, RekordIcloud, StatusKonta, Synchronizacja, ZdarzenieKonta, ZmianaDoWyslania } from '../../../src/domena/porty';

export type UrzadzenieTestowe = Synchronizacja & {
  dostarcz(p?: Partial<PartiaIcloud>): Promise<void>;
  konto(e: ZdarzenieKonta): void;
  status: StatusKonta;
  bladWysylki: { kod: string } | null;
  przedPotwierdzeniem: (() => Promise<void>) | null;
  wyslano: ZmianaDoWyslania[][];
  usunietoStrefe: number;
};
export type SerwerTestowy = { rekordy: Map<string, RekordIcloud>; usuniete: Map<string, { encja: string; klucz: string }>; urzadzenie(): UrzadzenieTestowe; wszystko(): PartiaIcloud };

export function serwerIcloud(): SerwerTestowy {
  const rekordy = new Map<string, RekordIcloud>();
  const usuniete = new Map<string, { encja: string; klucz: string }>();
  const wszystko = (): PartiaIcloud => ({ rekordy: [...rekordy.values()], usuniete: [...usuniete.values()], stanSilnika: new Uint8Array([rekordy.size % 256]) });
  return {
    rekordy, usuniete, wszystko,
    urzadzenie() {
      let odbior: ((p: PartiaIcloud) => Promise<void>) | null = null;
      let potw: ((p: PotwierdzenieIcloud) => Promise<void>) | null = null;
      let konto: ((e: ZdarzenieKonta) => void) | null = null;
      const u: UrzadzenieTestowe = {
        status: 'dostepne', bladWysylki: null, przedPotwierdzeniem: null, wyslano: [], usunietoStrefe: 0,
        async wlacz() { return { ok: true, wartosc: undefined }; },
        async wylacz() { /* silnik zatrzymany */ },
        stan: () => 'aktywna',
        async statusKonta() { return u.status; },
        async uruchom() { /* stan silnika z bazy */ },
        async wyslij(zmiany) {
          if (u.bladWysylki) throw u.bladWysylki;
          u.wyslano.push([...zmiany]);
          for (const z of zmiany) {
            const n = `${z.encja}:${z.klucz}`;
            if (z.rekord) { rekordy.set(n, structuredClone(z.rekord)); usuniete.delete(n); } else { rekordy.delete(n); usuniete.set(n, { encja: z.encja, klucz: z.klucz }); }
          }
          if (u.przedPotwierdzeniem) await u.przedPotwierdzeniem();
          await potw?.({ wyslane: zmiany.map((z) => ({ encja: z.encja, klucz: z.klucz, nr: z.nr })), stanSilnika: new Uint8Array([7]) });
        },
        odbieraj(fn) { odbior = fn; return () => { odbior = null; }; },
        wyslane(fn) { potw = fn; return () => { potw = null; }; },
        zdarzeniaKonta(fn) { konto = fn; return () => { konto = null; }; },
        async usunStrefe() { u.usunietoStrefe += 1; rekordy.clear(); usuniete.clear(); return { ok: true, wartosc: undefined }; },
        async dostarcz(p) { const w = wszystko(); await odbior?.({ rekordy: p?.rekordy ?? w.rekordy, usuniete: p?.usuniete ?? w.usuniete, stanSilnika: p?.stanSilnika ?? w.stanSilnika }); },
        konto(e) { konto?.(e); },
      };
      return u;
    },
  };
}
