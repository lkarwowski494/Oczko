// Kontrola ADR (definicja ukończenia roli 05): data, status, ≥2 opcje, konsekwencje, potwierdzenie; ADR o przechowywaniu z wariantem bez bazy.
import { readdirSync, readFileSync } from 'node:fs';
const dir = process.argv[2]; let bledy = 0;
for (const f of readdirSync(dir).filter((f) => /^\d{4}-.*\.md$/.test(f)).sort()) {
  const t = readFileSync(`${dir}/${f}`, 'utf8'); const b = [];
  if (!/^Data: \d{4}-\d{2}-\d{2}/m.test(t)) b.push('data');
  if (!/Status: (\*\*)?(proponowana|przyjęta|odrzucona|zastąpiona)/.test(t)) b.push('status');
  const opcje = (t.split('## Opcje: zalety i wady')[1] || '').match(/^### /gm) || [];
  if (opcje.length < 2) b.push(`opcje ${opcje.length}`);
  if (!/^### Konsekwencje/m.test(t)) b.push('konsekwencje');
  if (!/^### Potwierdzenie/m.test(t)) b.push('potwierdzenie');
  if (/przechowywanie/.test(f) && !/JSON|klucz-wartość/.test(t)) b.push('brak wariantu bez relacyjnej bazy');
  console.log(`${f}: ${b.length ? 'BŁĄD ' + b.join(', ') : 'OK'} (opcje: ${opcje.length})`); bledy += b.length;
}
console.log(`błędy: ${bledy}`); process.exit(bledy ? 1 : 0);
