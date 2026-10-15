import { translateStitchToken, parseRowInstruction } from '../pattern-parser';

describe('Oczko Core — Parser wzorów i skrótów (Moduł nauki)', () => {
  test('Tłumaczy znane skróty dziewiarskie na polski i angielski', () => {
    const k2tog = translateStitchToken('k2tog');
    expect(k2tog).not.toBeNull();
    expect(k2tog?.polishName).toBe('Przerób 2 oczka razem na prawo');
    expect(k2tog?.category).toBe('decrease');

    const yo = translateStitchToken('yo');
    expect(yo?.polishName).toBe('Narzędzia/Narzut' || 'Narzut'); // weryfikacja
    expect(yo?.category).toBe('increase');

    const unknown = translateStitchToken('unknown_stitch');
    expect(unknown).toBeNull();
  });

  test('Parsuje linię instrukcji wzoru z wieloma skrótami', () => {
    const result = parseRowInstruction('k2tog, yo, k');
    expect(result.isRecognized).toBe(true);
    expect(result.tokens).toHaveLength(3);
    expect(result.tokens[0].translation?.code).toBe('k2tog');
    expect(result.tokens[1].translation?.code).toBe('yo');
    expect(result.tokens[2].translation?.code).toBe('k');
  });
});
