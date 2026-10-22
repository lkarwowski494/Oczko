// Prototyp czystej funkcji domeny (ADR-0005, 0008, 0009): scalanie zdarzeń licznika z wielu źródeł.
// Zdarzenie: { id, licznik, rodzaj: plus|minus|wpisanie|zerowanie|cofniecie|rozstrzygniecie, wartosc?, rodzice: [id] }
// rodzice = ostatnie zdarzenia, które źródło znało (jak commit w git). Rozwidlenie = praca równoległa.
export function scal(zdarzenia) {
  const mapa = new Map();
  for (const z of zdarzenia) if (!mapa.has(z.id)) mapa.set(z.id, z); // idempotencja: duplikaty dostarczeń
  const wszystkie = [...mapa.values()];
  const brakujacy = wszystkie.flatMap((z) => z.rodzice.filter((r) => !mapa.has(r)));
  if (brakujacy.length) return { stan: 'czeka', brakujacy: [...new Set(brakujacy)] }; // odwrócona kolejność dostarczeń
  const dzieci = new Map(wszystkie.map((z) => [z.id, []]));
  for (const z of wszystkie) for (const r of z.rodzice) dzieci.get(r).push(z.id);
  const glowy = wszystkie.filter((z) => dzieci.get(z.id).length === 0).map((z) => z.id).sort();
  const wartoscW = (id, pamiec = new Map()) => { // wartość po zdarzeniu id, liczona wzdłuż jego przodków
    if (pamiec.has(id)) return pamiec.get(id);
    const z = mapa.get(id); let w;
    if (z.rodzaj === 'wpisanie' || z.rodzaj === 'cofniecie' || z.rodzaj === 'rozstrzygniecie') w = z.wartosc;
    else if (z.rodzaj === 'zerowanie') w = 0;
    else { const baza = z.rodzice.length ? wartoscW(z.rodzice[0], pamiec) : 0; w = Math.max(0, baza + (z.rodzaj === 'plus' ? 1 : -1)); }
    pamiec.set(id, w); return w;
  };
  if (glowy.length <= 1) return { stan: 'zgodny', wartosc: glowy.length ? wartoscW(glowy[0]) : 0, glowy };
  return { stan: 'konflikt', glowy, kandydaci: glowy.map((g) => ({ glowa: g, wartosc: wartoscW(g) })) }; // NFR-DAN-003: pokaż, nie zgaduj
}
