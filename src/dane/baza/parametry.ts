// Parametry zapytań portu bazy (ADR-0002): tylko wartości, które SQLite przyjmuje bez zgadywania typu; reszta to błąd programisty.
export type WartoscSql = string | number | null | Uint8Array;

export function parametrySql(params: readonly unknown[] = []): WartoscSql[] {
  return params.map((p, i) => {
    if (p === null || typeof p === 'string' || p instanceof Uint8Array) return p;
    if (typeof p === 'number' && Number.isFinite(p)) return p;
    throw new Error(`port bazy: parametr ${i + 1} ma typ ${typeof p} (dozwolone: tekst, liczba skończona, null, bajty)`);
  });
}

/** Dzieli skrypt SQL na instrukcje po `;` poza napisami, identyfikatorami w cudzysłowie i komentarzami (bez wyzwalaczy: schemat v1 ich nie ma). */
export function instrukcjeSql(skrypt: string): string[] {
  const wynik: string[] = [];
  let biezaca = '';
  let i = 0;
  while (i < skrypt.length) {
    const c = skrypt[i];
    const nast = skrypt[i + 1];
    if (c === '-' && nast === '-') {
      const koniec = skrypt.indexOf('\n', i);
      i = koniec === -1 ? skrypt.length : koniec + 1;
      biezaca += '\n';
      continue;
    }
    if (c === '/' && nast === '*') {
      const koniec = skrypt.indexOf('*/', i + 2);
      if (koniec === -1) throw new Error('instrukcjeSql: niezamknięty komentarz /*');
      i = koniec + 2;
      biezaca += ' ';
      continue;
    }
    if (c === "'" || c === '"' || c === '`' || c === '[') {
      const zamyka = c === '[' ? ']' : c;
      let j = i + 1;
      for (;;) {
        if (j >= skrypt.length) throw new Error('instrukcjeSql: niezamknięty napis');
        if (skrypt[j] === zamyka) {
          if (zamyka !== ']' && skrypt[j + 1] === zamyka) { j += 2; continue; } // podwojony cudzysłów w napisie
          break;
        }
        j += 1;
      }
      biezaca += skrypt.slice(i, j + 1);
      i = j + 1;
      continue;
    }
    if (c === ';') {
      if (biezaca.trim()) wynik.push(biezaca.trim());
      biezaca = '';
      i += 1;
      continue;
    }
    biezaca += c;
    i += 1;
  }
  if (biezaca.trim()) wynik.push(biezaca.trim());
  for (const s of wynik) if (/^\s*CREATE\s+(TEMP\s+|TEMPORARY\s+)?TRIGGER\b/i.test(s)) throw new Error('instrukcjeSql: wyzwalacze nieobsługiwane');
  return wynik;
}
