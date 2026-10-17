// ============================================================================
// Apps4Craft Unified Design System — Suite Theme Tests (Oczko Edition)
// ============================================================================

import { CRAFT_APPS, sharedCraftTokens, getCraftTheme } from '../craft-suite-theme';
import { getContrastRatio } from '../theme';

describe('Apps4Craft Suite Theme Tokens (Oczko Edition)', () => {
  test('Definiuje spójną paletę dla rodziny Apps4Craft w tym Oczko', () => {
    expect(CRAFT_APPS.oczko).toBeDefined();
    expect(CRAFT_APPS.napar).toBeDefined();
    expect(CRAFT_APPS.piekarz).toBeDefined();
    expect(CRAFT_APPS.sloik).toBeDefined();
    expect(CRAFT_APPS.masaz).toBeDefined();
    expect(CRAFT_APPS.ferment).toBeDefined();

    expect(CRAFT_APPS.oczko.accent).toBe('#D46A43');
    expect(CRAFT_APPS.oczko.secondaryAccent).toBe('#4E8D72');
    expect(CRAFT_APPS.napar.accent).toBe('#C86A28');
    expect(CRAFT_APPS.piekarz.accent).toBe('#D49B42');
    expect(CRAFT_APPS.sloik.accent).toBe('#5B8A61');
    expect(CRAFT_APPS.masaz.accent).toBe('#A43E38');
    expect(CRAFT_APPS.ferment.accent).toBe('#E0A838');
  });

  test('Udostępnia wspólne tokeny ceramiczne i minimalny rozmiar celu dotykowego 44pt / 52pt', () => {
    expect(sharedCraftTokens.colors.bgBasalt).toBe('#121214');
    expect(sharedCraftTokens.touchTargetMin).toBe(44);
    expect(sharedCraftTokens.buttonHeightMin).toBe(52);
    expect(sharedCraftTokens.hitSlopStandard).toEqual({ top: 12, bottom: 12, left: 12, right: 12 });
    expect(sharedCraftTokens.borderRadius.lg).toBe(18);
    expect(sharedCraftTokens.typography.displayHero.fontSize).toBe(48);
  });

  test('Spełnia wymagania kontrastu WCAG 2.1 AA (min 4.5:1 dla tekstu podstawowego)', () => {
    const contrast = getContrastRatio(
      sharedCraftTokens.colors.textPrimary,
      sharedCraftTokens.colors.bgBasalt
    );
    expect(contrast).toBeGreaterThanOrEqual(4.5);
  });

  test('Zwraca poprawny motyw aplikacji poprzez getCraftTheme', () => {
    const oczko = getCraftTheme('oczko');
    expect(oczko.name).toBe('Oczko (Purlo)');
    expect(oczko.accent).toBe('#D46A43');

    const napar = getCraftTheme('napar');
    expect(napar.accent).toBe('#C86A28');

    const piekarz = getCraftTheme('piekarz');
    expect(piekarz.accent).toBe('#D49B42');

    const sloik = getCraftTheme('sloik');
    expect(sloik.accent).toBe('#5B8A61');

    const masaz = getCraftTheme('masaz');
    expect(masaz.accent).toBe('#A43E38');

    const ferment = getCraftTheme('ferment');
    expect(ferment.accent).toBe('#E0A838');

    // Domyślny fallback na oczko
    // @ts-expect-error testowanie nieznanego id
    const fallback = getCraftTheme('unknown_app');
    expect(fallback.id).toBe('oczko');
  });
});
