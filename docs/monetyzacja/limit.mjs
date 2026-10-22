// limit.mjs — wzorzec reguły darmowego limitu dni z robótką (model V4, P-057; rola 02, kontrakt płatności, 2026-10-22).
// Czysta funkcja bez zależności: rola 08 przepisuje ją na TypeScript w kodzie aplikacji; wektory: wektory-limitu.json.
// Dzień z robótką = data lokalna (strefa urządzenia w chwili zdarzenia, RD-16), w której praca zaczęła się pierwszym +1.
// Strażnik woła startDnia() tylko przy +1 albo ręcznym wpisaniu numeru rzędu (D4); dopisanie wstecz i edycja historii go nie wołają.

export const LIMIT_DNI = 5; // D2: „dzierganie raz w tygodniu zawsze darmowe” (miesiąc ma najwyżej 5 tych samych dni tygodnia)
export const PRZERWA_MS = 60 * 60 * 1000; // D3: +1 po północy otwiera nowy dzień dopiero po przerwie ≥ 60 min

const DATA = /^\d{4}-\d{2}-\d{2}$/;

// dni: zapisane dni z robótką [{ data: 'RRRR-MM-DD', pro: boolean }] (pro: czy w chwili startu dnia Pro było aktywne).
// dzis: data lokalna zdarzenia; teraz i ostatniPlus: ms (ostatniPlus = poprzednie +1 w dowolnym projekcie albo null).
// Zwraca: dozwolone (czy wolno dodać rząd), zapis (dzień do dopisania albo null), zostalo (darmowe dni w miesiącu po zdarzeniu).
export function startDnia({ dni, dzis, teraz, ostatniPlus, pro, limit = LIMIT_DNI, przerwa = PRZERWA_MS }) {
  if (!Array.isArray(dni) || !DATA.test(dzis) || !Number.isFinite(teraz)) throw new Error('startDnia: złe dane wejściowe');
  const miesiac = dzis.slice(0, 7);
  // D5: do limitu liczą się tylko dni bez aktywnego Pro.
  const darmowe = (lista) => lista.filter((d) => d.data.startsWith(miesiac) && !d.pro).length;
  const wynik = (dozwolone, zapis) => {
    const po = zapis ? [...dni, zapis] : dni;
    return { dozwolone, zapis, zostalo: Math.max(0, limit - darmowe(po)) };
  };
  // Praca w toku (L-04): kolejne +1 bez przerwy nie otwiera nowego dnia, także po północy.
  if (ostatniPlus !== null && teraz - ostatniPlus >= 0 && teraz - ostatniPlus < przerwa) return wynik(true, null);
  // Dzień już policzony (L-02, L-06, L-12): rozpoczęty dzień zawsze do końca.
  if (dni.some((d) => d.data === dzis)) return wynik(true, null);
  if (pro) return wynik(true, { data: dzis, pro: true });
  if (darmowe(dni) < limit) return wynik(true, { data: dzis, pro: false });
  return wynik(false, null); // L-03: na limicie; dane, historia, eksport działają dalej (poza tą funkcją)
}
