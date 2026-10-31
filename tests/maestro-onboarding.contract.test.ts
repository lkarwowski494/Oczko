// DEC-35: modal powitalny (OnboardingModal, testID onboarding-start-btn) zasłania zakładki przy pierwszym uruchomieniu.
// Symulacja w tests/maestro-runner.ts go nie widzi, więc ten strażnik wymaga obsługi modala w każdym scenariuszu z launchApp.
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

const dir = join(__dirname, '..', '.maestro');
const flows = readdirSync(dir).filter((f) => /\.ya?ml$/.test(f));

describe('scenariusze Maestro a modal powitalny', () => {
  it.each(flows)('%s: po launchApp zamyka modal powitalny, gdy jest widoczny', (f) => {
    const src = readFileSync(join(dir, f), 'utf8');
    if (!/^- launchApp/m.test(src)) return;
    const poStarcie = src.slice(src.search(/^- launchApp/m));
    expect(poStarcie).toMatch(/- runFlow:\s+when:\s+visible:\s+id: "onboarding-start-btn"/);
    expect(poStarcie).toMatch(/tapOn:\s+id: "onboarding-start-btn"/);
  });
});
