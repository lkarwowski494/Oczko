#!/usr/bin/env node
// Hook Claude Code (PreToolUse, Bash) — DEC-35. Przed `git push` uruchamia szybkie bramki
// (typecheck, i18n, macierz testów) i blokuje push, gdy któraś padnie (kod wyjścia 2 = blokada).
// Dlaczego hook, a nie linia w CLAUDE.md: agenci w długich sesjach pomijają kroki z instrukcji.
// Pełne `npm run verify` (z testami) zostaje w CI.
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

let input = {};
try {
  input = JSON.parse(readFileSync(0, 'utf8') || '{}');
} catch {
  process.exit(0); // nieczytelne wejście: nie blokujemy pracy, CI i tak sprawdzi
}
const cmd = String(input?.tool_input?.command ?? '');
if (!/(^|[;&|(\s])git\s+(-\S+\s+)*push\b/.test(cmd)) process.exit(0);

const KROKI = [
  ['typecheck', 'npm', ['run', '-s', 'typecheck']],
  ['i18n', 'npm', ['run', '-s', 'check:i18n']],
  ['macierz testów', 'node', ['scripts/test-matrix.mjs', '--check']],
];
const cwd = input.cwd || process.cwd();
for (const [nazwa, bin, args] of KROKI) {
  const r = spawnSync(bin, args, { cwd, encoding: 'utf8' });
  if (r.status !== 0) {
    const log = `${r.stdout ?? ''}${r.stderr ?? ''}`.trim().split('\n').slice(-30).join('\n');
    process.stderr.write(`Push zablokowany przez hook przed pushem: padł krok „${nazwa}”.\n${log}\nNapraw i spróbuj ponownie.\n`);
    process.exit(2);
  }
}
process.exit(0);
