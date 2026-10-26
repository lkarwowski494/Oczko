// Kompozycja licznika z iCloud (partia 7): silnik uruchamiany po danych startu (migracje, dziennik, kosz) i poza kolejką uruchomDane
// (sterownik sam wchodzi do kolejki — wywołanie w środku zablokowałoby kolejkę); linia konfliktu na liczniku (P-220 I1a, scenariusz 49)
// i wybór wersji z arkusza (dane.konflikt_wybor: wartość, urządzenie, godzina).
import { migruj } from '../../src/dane/migracje/migruj';
import type { LiveActivity, Zegarek } from '../../src/domena/porty';
import { utworzI18n } from '../../src/i18n/i18n';
import { ZASOBY } from '../../src/i18n/slowniki';
import { kompozycjaLicznika, type Jezyk } from '../../src/kompozycja/licznik';
import { atrapaIcloud } from '../../src/platforma/icloud-atrapa';
import { sterownikSynchronizacji } from '../../src/przypadki-uzycia/synchronizacja';
import { przygotuj, MIN } from './pomocnicze/srodowisko';

const liveActivity: LiveActivity = { start: async () => ({ ok: true, wartosc: undefined }), aktualizuj: async () => undefined, zakoncz: async () => undefined };
const zegarek: Zegarek = { potwierdz: () => undefined, wyslijStan: async () => undefined, odbieraj: () => () => undefined };

async function j(): Promise<Jezyk> {
  const i = await utworzI18n({ magazyn: { odczytaj: async () => null, zapisz: async () => {} }, systemowe: () => ['en-US'], zasoby: ZASOBY });
  return { t: i.t, jezyk: i.jezyk, zegar24h: () => true };
}

describe('kompozycja licznika z iCloud', () => {
  test('przygotuj: icloud.start raz, po migracjach (tabela synchronizacja istnieje), nie w kolejce uruchomDane', async () => {
    const s = await przygotuj();
    const wywolania: string[] = [];
    const icloud = { start: async () => { wywolania.push(JSON.stringify(await s.baza.all('SELECT wlaczona FROM synchronizacja'))); } };
    const k = kompozycjaLicznika({ ...s.z, migruj: (b) => migruj(b), liveActivity, zegarek }, await j(), { wibracje: () => true, icloud });
    expect((await k.przygotuj()).ok).toBe(true);
    await k.przygotuj();
    expect(wywolania).toEqual(['[{"wlaczona":0}]']);
  });

  test('49: konflikt z atrapy przy starcie → stan licznika z linią (1 tutaj, 6 z „iPad (test)”); wybór wersji → 6, linia znika', async () => {
    const s = await przygotuj();
    const plik = { czytaj: () => null, zapisz: () => undefined };
    const t = await j();
    const k1 = kompozycjaLicznika({ ...s.z, migruj: (b) => migruj(b), liveActivity, zegarek }, t);
    await k1.przygotuj();
    await k1.uslugi.dodajRzad();
    const st1 = sterownikSynchronizacji({ ...s.z, synchronizacja: atrapaIcloud({ tryb: 'wlaczony', baza: s.baza, zegar: s.zegar, plik }), magazyn: s.magazyn });
    await st1.start();
    await st1.wlacz();
    s.zegar.przesun(10 * MIN);
    const st2 = sterownikSynchronizacji({ ...s.z, synchronizacja: atrapaIcloud({ tryb: 'konflikt', baza: s.baza, zegar: s.zegar, plik }), magazyn: s.magazyn });
    const k2 = kompozycjaLicznika({ ...s.z, migruj: (b) => migruj(b), liveActivity, zegarek }, t, { wibracje: () => true, icloud: st2 });
    await k2.przygotuj();
    const start = await k2.uslugi.start();
    expect(start.licznik.skonczone).toBe(1);
    expect(start.licznik.konflikt).toEqual({ lokalna: 1, zdalna: 6, urzadzenie: 'iPad (test)' });
    const wybory = await k2.konflikt.kandydaci();
    expect(wybory.map((w) => w.tekst)).toEqual(['6 rows · iPad (test) · 12:09', expect.stringMatching(/^1 rows? · .+ · 12:00$/)]);
    expect(wybory[0].etykieta).toBe('Keep 6 rows from iPad (test), 12:09');
    expect((await k2.konflikt.wybierz(wybory[0].glowa)).ok).toBe(true);
    const po = await k2.dzialania.odswiez!();
    expect([po.skonczone, po.konflikt]).toEqual([6, null]);
  });
});
