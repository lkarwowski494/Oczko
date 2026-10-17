import { theme } from '../theme';
import contrastCorpus from './fixtures/theme-contrast-corpus.json';

describe('Theme Contrast Oracle (RD-ENG-02, BR-TEST-011..014)', () => {
  it('corresponds directly with Python truth oracle corpus', () => {
    expect(contrastCorpus.metadata.standard).toBe('WCAG 2.1 AA');
    expect(contrastCorpus.pairs).toBeDefined();
    
    // textPrimary on bg: contrast ratio must be >= 10:1 (very high contrast)
    const primaryOnBg = contrastCorpus.pairs['textPrimary_on_bg'];
    expect(primaryOnBg.ratio).toBeGreaterThanOrEqual(10.0);
    expect(primaryOnBg.wcag_aa_normal).toBe(true);

    // textPrimary on cards
    const primaryOnCard = contrastCorpus.pairs['textPrimary_on_bgCard'];
    expect(primaryOnCard.ratio).toBeGreaterThanOrEqual(7.0);
    expect(primaryOnCard.wcag_aa_normal).toBe(true);

    // textSecondary on bg: must satisfy at least 4.5:1
    const secondaryOnBg = contrastCorpus.pairs['textSecondary_on_bg'];
    expect(secondaryOnBg.ratio).toBeGreaterThanOrEqual(4.5);
    expect(secondaryOnBg.wcag_aa_normal).toBe(true);

    // Verify theme colors in theme.ts match fixture colors
    for (const [key, pair] of Object.entries(contrastCorpus.pairs)) {
      const [fgKey, bgKey] = key.split('_on_');
      expect((theme.colors as any)[fgKey].toLowerCase()).toBe(pair.fg.toLowerCase());
      expect((theme.colors as any)[bgKey].toLowerCase()).toBe(pair.bg.toLowerCase());
    }
  });
});
