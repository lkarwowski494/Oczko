// Strażnik workflowów (ADR-0014, kontrola 05-9; P-089; strategia §5). Reguły:
//  SEKRET-BEZ-SRODOWISKA: każde `secrets.X` poza GITHUB_TOKEN tylko w zadaniu z `environment: testflight`;
//  WYZWALACZ-Z-SEKRETAMI: workflow z takim zadaniem nie ma `pull_request`, `pull_request_target` ani `workflow_run`;
//  SZTUCZNY-SKLEP-W-WYDANIU: `EXPO_PUBLIC_STORE_FAKE` nie występuje w workflowie z `environment: testflight`;
//  BRAK-WORKFLOWOW: katalog bez plików .yml to błąd (pusty zbiór to nie zaliczenie).
// Wyjątki nazwane: scripts/jakosc/wyjatki.json („workflowy”). Użycie: node scripts/jakosc/sprawdz-workflowy.mjs [--katalog <korzeń>]
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';

const arg = (n) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null; };

export function sprawdzWorkflowy(korzen) {
  const kat = join(korzen, '.github/workflows');
  const naruszenia = [];
  const pliki = existsSync(kat) ? readdirSync(kat).filter((n) => /\.ya?ml$/.test(n)) : [];
  if (!pliki.length) return [`BRAK-WORKFLOWOW ${kat}`];
  const wyjPlik = join(korzen, 'scripts/jakosc/wyjatki.json');
  const wyjatki = existsSync(wyjPlik) ? JSON.parse(readFileSync(wyjPlik, 'utf8')).workflowy ?? [] : [];
  for (const n of pliki) {
    const rel = `.github/workflows/${n}`;
    const tekst = readFileSync(join(kat, n), 'utf8');
    let wf;
    try { wf = parse(tekst); } catch (e) { naruszenia.push(`YAML ${rel}: ${e.message.split('\n')[0]}`); continue; }
    const on = wf?.on ?? wf?.true ?? {}; // YAML 1.1 czyta `on` jako true
    const wyzwalacze = typeof on === 'string' ? [on] : Array.isArray(on) ? on : Object.keys(on ?? {});
    const zgl = (regula, opis) => { if (!wyjatki.some((w) => w.regula === regula && w.plik === rel)) naruszenia.push(`${regula} ${rel}: ${opis}`); };
    let zSekretami = false, wydanie = false;
    for (const [id, job] of Object.entries(wf?.jobs ?? {})) {
      const env = typeof job?.environment === 'string' ? job.environment : job?.environment?.name;
      const tekstJob = JSON.stringify(job);
      const sekrety = [...tekstJob.matchAll(/secrets\.([A-Za-z0-9_]+)/g)].map((m) => m[1]).filter((s) => s !== 'GITHUB_TOKEN');
      if (env === 'testflight') wydanie = true;
      if (sekrety.length) {
        zSekretami = true;
        if (env !== 'testflight') zgl('SEKRET-BEZ-SRODOWISKA', `zadanie ${id} używa ${[...new Set(sekrety)].join(', ')} bez environment: testflight`);
      }
    }
    if (/secrets\.(?!GITHUB_TOKEN)/.test(JSON.stringify(wf?.env ?? {}))) { zSekretami = true; zgl('SEKRET-BEZ-SRODOWISKA', 'sekret w env na poziomie workflowu'); }
    if (zSekretami) for (const w of ['pull_request', 'pull_request_target', 'workflow_run']) if (wyzwalacze.includes(w)) zgl('WYZWALACZ-Z-SEKRETAMI', `wyzwalacz ${w} w workflowie z sekretami`);
    if (wydanie && /EXPO_PUBLIC_STORE_FAKE/.test(tekst)) zgl('SZTUCZNY-SKLEP-W-WYDANIU', 'EXPO_PUBLIC_STORE_FAKE w workflowie wydania');
  }
  return naruszenia;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const naruszenia = sprawdzWorkflowy(arg('--katalog') ?? process.cwd());
  for (const n of naruszenia) console.log(n);
  console.log(`workflowy: naruszeń ${naruszenia.length}`);
  process.exit(naruszenia.length ? 1 : 0);
}
