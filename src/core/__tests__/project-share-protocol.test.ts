import {
  encodeProjectToDeepLink,
  decodeProjectFromDeepLink,
  utf8ToBase64,
  base64ToUtf8,
  PROJECT_SHARE_PROTOCOL,
  CompactProjectPayload,
} from '../project-share-protocol';

describe('Oczko — Protokół Wymiany Projektów Offline (Zadanie O5, project-share-protocol)', () => {
  const samplePayload: CompactProjectPayload = {
    v: 1,
    n: 'Czapka Merino',
    c: 'knitting',
    p: [
      { n: 'Ściągacz', t: 30, r: 15 },
      { n: 'Korpus', t: 60, r: 0 },
    ],
    g: {
      s: 22,
      r: 28,
      n: 4.0,
    },
    desc: 'Ciepła czapka z wełny merino',
  };

  test('koduje i dekoduje projekt w formacie oczko://project?v=1&d=<base64>', () => {
    const link = encodeProjectToDeepLink(samplePayload);
    expect(link.startsWith(PROJECT_SHARE_PROTOCOL)).toBe(true);
    expect(link).toContain('?v=1&d=');

    const decoded = decodeProjectFromDeepLink(link);
    expect(decoded.v).toBe(1);
    expect(decoded.n).toBe('Czapka Merino');
    expect(decoded.c).toBe('knitting');
    expect(decoded.p.length).toBe(2);
    expect(decoded.g?.s).toBe(22);
  });

  test('dekoduje również bezpośredni ciąg Base64 bez prefiksu protokołu', () => {
    const json = JSON.stringify(samplePayload);
    const b64 = utf8ToBase64(json);

    const decoded = decodeProjectFromDeepLink(b64);
    expect(decoded.n).toBe('Czapka Merino');
    expect(decoded.p[0].n).toBe('Ściągacz');
  });

  test('poprawnie obsługuje fallback utf8ToBase64 i base64ToUtf8', () => {
    const text = 'Zażółć gęślą jaźń — test polskich znaków 123! 🧶';
    const b64 = utf8ToBase64(text);
    const restored = base64ToUtf8(b64);
    expect(restored).toBe(text);
  });

  test('odrzuca puste dane i linki z błędami', () => {
    expect(() => decodeProjectFromDeepLink('')).toThrow('Pusty link projektu');
    expect(() => decodeProjectFromDeepLink(PROJECT_SHARE_PROTOCOL)).toThrow('Brak parametrów w linku');
    expect(() => decodeProjectFromDeepLink(`${PROJECT_SHARE_PROTOCOL}?v=1`)).toThrow('Brak parametru "d"');
    expect(() => decodeProjectFromDeepLink('oczko://project?v=1&d=!!!niepoprawny-base64')).toThrow();
  });

  test('waliduje wersję schematu i strukturę payloadu', () => {
    const invalidVer = utf8ToBase64(JSON.stringify({ v: 2, n: 'X', c: 'knitting', p: [{ n: 'A' }] }));
    expect(() => decodeProjectFromDeepLink(invalidVer)).toThrow('Nieobsługiwana wersja schematu');

    const notAnObject = utf8ToBase64(JSON.stringify(null));
    expect(() => decodeProjectFromDeepLink(notAnObject)).toThrow('Payload musi być obiektem JSON');

    const noName = utf8ToBase64(JSON.stringify({ v: 1, c: 'knitting', p: [{ n: 'A' }] }));
    expect(() => decodeProjectFromDeepLink(noName)).toThrow('Projekt musi posiadać nazwę');

    const badCraft = utf8ToBase64(JSON.stringify({ v: 1, n: 'X', c: 'weaving', p: [{ n: 'A' }] }));
    expect(() => decodeProjectFromDeepLink(badCraft)).toThrow('Nieprawidłowy typ rękodzieła');

    const noParts = utf8ToBase64(JSON.stringify({ v: 1, n: 'X', c: 'crochet', p: [] }));
    expect(() => decodeProjectFromDeepLink(noParts)).toThrow('Projekt musi posiadać co najmniej jedną część');
  });

  test('fallback btoa/atob gdy Buffer nie jest zdefiniowany (środowisko przeglądarkowe / Hermes)', () => {
    const origBuffer = (global as any).Buffer;
    const origBtoa = (global as any).btoa;
    const origAtob = (global as any).atob;
    try {
      (global as any).Buffer = undefined;
      (global as any).btoa = (s: string) => origBuffer.from(s, 'binary').toString('base64');
      (global as any).atob = (s: string) => origBuffer.from(s, 'base64').toString('binary');

      const text = 'Fallback bez Buffer: włóczka 100% merino 🧶';
      const b64 = utf8ToBase64(text);
      expect(base64ToUtf8(b64)).toBe(text);

      // Test błędu dekodowania Base64
      (global as any).atob = () => {
        throw new Error('Invalid character in base64');
      };
      expect(() => base64ToUtf8('invalid-base64')).toThrow();
      expect(() => decodeProjectFromDeepLink('invalid-base64')).toThrow('Nieprawidłowe kodowanie Base64 w linku projektu');
    } finally {
      (global as any).Buffer = origBuffer;
      (global as any).btoa = origBtoa;
      (global as any).atob = origAtob;
    }
  });
});
