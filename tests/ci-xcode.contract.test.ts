// Kontrakt CI iOS (DEC-35): React Native 0.86 wymaga Xcode >= 16.1, Expo SDK 56+ wymaga Xcode 26.4+,
// a obraz macos-14 ma tylko Xcode 15.4. Workflow ma paść jawnie, a nie po cichu wybrać starszy Xcode.
import { execFileSync } from 'child_process';
import { mkdirSync, mkdtempSync, readFileSync, readdirSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const ROOT = join(__dirname, '..');
const SCRIPT = join(ROOT, 'scripts/ci/select-xcode.sh');

function run(apps: string[]): { code: number; out: string } {
  const dir = mkdtempSync(join(tmpdir(), 'xcode-'));
  for (const a of apps) mkdirSync(join(dir, a));
  try {
    const out = execFileSync('bash', [SCRIPT, '26'], {
      env: { ...process.env, APPS_DIR: dir, DRY_RUN: '1' },
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    return { code: 0, out };
  } catch (e: any) {
    return { code: e.status, out: `${e.stdout ?? ''}${e.stderr ?? ''}` };
  }
}

describe('scripts/ci/select-xcode.sh', () => {
  it('wybiera najnowszy Xcode 26.x', () => {
    const r = run(['Xcode_26.4.1.app', 'Xcode_26.6.app', 'Xcode_26.5.app', 'Xcode_16.4.app']);
    expect(r.code).toBe(0);
    expect(r.out).toContain('Wybrany Xcode: 26.6');
  });

  it('pada, gdy jest tylko niewersjonowany Xcode.app (np. 15.4 na macos-14), zamiast udawać 26', () => {
    const r = run(['Xcode.app', 'Xcode_15.4.app']);
    expect(r.code).toBe(1);
    expect(r.out).toContain('Brak Xcode 26.x');
  });
});

describe('workflowy iOS', () => {
  const dir = join(ROOT, '.github/workflows');
  const files = readdirSync(dir).filter((f) => /\.ya?ml$/.test(f));
  const macos = files.filter((f) => /runs-on:\s*macos/.test(readFileSync(join(dir, f), 'utf8')));

  it('istnieje co najmniej jeden workflow na macOS', () => {
    expect(macos.length).toBeGreaterThan(0);
  });

  it.each(macos)('%s: tylko macos-26 i Xcode 26 bez cichego zjazdu do starszej wersji', (f) => {
    const src = readFileSync(join(dir, f), 'utf8');
    for (const m of src.matchAll(/runs-on:\s*(macos[\w.-]*)/g)) expect(m[1]).toBe('macos-26');
    expect(src).toContain('bash scripts/ci/select-xcode.sh 26');
    expect(src).not.toMatch(/select-xcode\.sh (1[0-9]|2[0-5])\b/);
  });
});
