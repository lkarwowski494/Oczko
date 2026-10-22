// Wzorzec logiki dostępu do Pro (rola 02, kontrakt płatności, 2026-10-22). Port 1:1 wzorca z modułu `storekit-expo`
// biblioteki `prompts` @97ec212 na JavaScript, żeby wektory dało się sprawdzić w Node bez kompilacji.
// Rola 08 przepisuje go na TypeScript w kodzie aplikacji; wektory w `wektory-dostepu.json` zostają kontraktem.
// Czysta funkcja: bez importów biblioteki płatności. Adapter (biblioteka z ADR roli 05) zamienia zweryfikowane
// transakcje sklepu na `Uprawnienie[]`, a pamięć podręczną zapisuje jako JSON.

/** @typedef {{ produkt: string, wygasa: number | null, odebrane: boolean }} Uprawnienie  wygasa: ms; null = bez końca */
/** @typedef {{ zrodlo: 'sklep', uprawnienia: Uprawnienie[] } | { zrodlo: 'blad' }} Odczyt  blad: brak sieci, sklep niedostępny */
/** @typedef {{ produkty: string[], wygasa: number | null } | null} Pamiec  ostatni udany odczyt sklepu */

/** Produkty, które odblokowują Pro (kontrakt płatności, model B, P-029). */
export const ODBLOKOWUJA = Object.freeze(['oczko.pro.lifetime']);

/**
 * @param {Odczyt} odczyt
 * @param {Pamiec} pamiec
 * @param {number} teraz
 * @param {readonly string[]} odblokowuja
 * @returns {{ dostep: boolean, powod: 'sklep' | 'pamiec' | 'brak', pamiec: Pamiec }}
 */
export function decyzja(odczyt, pamiec, teraz, odblokowuja) {
  if (odczyt.zrodlo === 'sklep') {
    // Sklep jest źródłem prawdy: zwrot albo odebranie zabiera dostęp, nawet gdy pamięć mówi inaczej.
    const wazne = odczyt.uprawnienia.filter((u) => !u.odebrane && odblokowuja.includes(u.produkt) && (u.wygasa === null || u.wygasa > teraz));
    const nowa = wazne.length
      ? { produkty: wazne.map((u) => u.produkt), wygasa: wazne.some((u) => u.wygasa === null) ? null : Math.max(...wazne.map((u) => u.wygasa)) }
      : null;
    return { dostep: nowa !== null, powod: nowa ? 'sklep' : 'brak', pamiec: nowa };
  }
  // Błąd odczytu to nie brak zakupu: ostatni znany stan, ale nie dłużej niż do końca opłaconego okresu.
  const ok = pamiec !== null && pamiec.produkty.length > 0 && (pamiec.wygasa === null || pamiec.wygasa > teraz);
  return { dostep: ok, powod: ok ? 'pamiec' : 'brak', pamiec };
}

/** @param {unknown} tekst @returns {Pamiec} */
export function odczytajPamiec(tekst) {
  if (typeof tekst !== 'string') return null;
  let x;
  try { x = JSON.parse(tekst); } catch { return null; }
  if (typeof x !== 'object' || x === null) return null;
  const produkty = Reflect.get(x, 'produkty');
  const wygasa = Reflect.get(x, 'wygasa');
  if (!Array.isArray(produkty) || !produkty.every((p) => typeof p === 'string')) return null;
  if (wygasa !== null && !(typeof wygasa === 'number' && Number.isFinite(wygasa))) return null;
  return { produkty, wygasa };
}
