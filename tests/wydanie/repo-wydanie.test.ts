// Reguły wydania z tests/public-repo.test.ts 0.1.0 (F07-09, P-117 Q6a): wyjątek nazwany roli 10 (P-114 Q5) — `testflight.yml`, `app.json`
// i `site/` zostają do partii 3–4, potem rola 10 zastępuje je kontrolami według ADR-0014. Reguły workflowów (JAK-10) są w
// scripts/jakosc/sprawdz-workflowy.mjs, pliki sekretów w scripts/jakosc/kontrole-repo.mjs (PLIK-SEKRETU), oba z pułapkami w tests/jakosc.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(__dirname, '../..');
const wfDir = join(root, '.github', 'workflows');

describe('Wydanie 0.1.0: testflight.yml, app.json, site/ (wyjątek roli 10, P-114 Q5)', () => {
  test('testflight.yml zapisuje klucz .p8 dopiero po pod install, filtruje logi i nie wysyła .ipa do artefaktów', () => {
    const tfPath = join(wfDir, 'testflight.yml');
    if (!existsSync(tfPath)) return;
    const tf = readFileSync(tfPath, 'utf8');
    const podIdx = tf.indexOf('pod install');
    const keyIdx = tf.indexOf('ASC_KEY_P8_BASE64');
    expect(podIdx).toBeGreaterThan(0);
    expect(keyIdx).toBeGreaterThan(podIdx);
    expect(tf).toContain('umask 077');
    expect(tf).toContain('<KEY_ID>');
    expect(tf).toContain('<ISSUER_ID>');
    expect(tf).toContain('EXPO_PUBLIC_STORE_FAKE');
    expect(tf).not.toMatch(/path:.*\.(ipa|xcarchive)/);
  });

  test('app.json ma ustawione ITSAppUsesNonExemptEncryption: false oraz kompletny PrivacyManifests', () => {
    const appJson = JSON.parse(readFileSync(join(root, 'app.json'), 'utf8')).expo;
    expect(appJson.ios?.infoPlist?.ITSAppUsesNonExemptEncryption).toBe(false);
    const apiTypes = (appJson.ios?.privacyManifests?.NSPrivacyAccessedAPITypes || []).map(
      (x: { NSPrivacyAccessedAPIType: string }) => x.NSPrivacyAccessedAPIType
    );
    expect(apiTypes).toEqual(
      expect.arrayContaining([
        'NSPrivacyAccessedAPICategoryUserDefaults',
        'NSPrivacyAccessedAPICategoryFileTimestamp',
        'NSPrivacyAccessedAPICategorySystemBootTime',
        'NSPrivacyAccessedAPICategoryDiskSpace',
      ])
    );
  });

  test('strony prawne site/ (index.html, privacy.html, support.html) istnieją i mają poprawne linki', () => {
    for (const page of ['index.html', 'privacy.html', 'support.html']) {
      const p = join(root, 'site', page);
      expect(existsSync(p)).toBe(true);
      const html = readFileSync(p, 'utf8');
      expect(html).toMatch(/<!DOCTYPE html>/i);
      expect(html).not.toMatch(/\b(TODO|FIXME|PLACEHOLDER|example\.com)\b/i);
    }
  });
});
