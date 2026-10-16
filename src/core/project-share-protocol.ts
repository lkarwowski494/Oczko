/**
 * Oczko — Wymiana Projektów i Wzorów Offline przez Deep Links i Kody QR (Zadanie O5, Złoty Standard #5)
 * Protokół: oczko://project?v=1&d=<base64>
 * 100% Offline-First, bez zewnętrznych serwerów i logowania.
 */

export const PROJECT_SHARE_PROTOCOL = 'oczko://project';

export interface CompactProjectPart {
  n: string; // nazwa części (np. "Korpus", "Rękaw")
  t?: number; // cel rzędów (target_rows)
  r?: number; // aktualny rząd (opcjonalnie)
}

export interface CompactProjectPayload {
  v: 1; // wersja schematu wymiany
  n: string; // nazwa projektu
  c: 'knitting' | 'crochet'; // typ techniki (druty / szydełko)
  p: CompactProjectPart[]; // części projektu
  g?: {
    s: number; // próbka: oczka na 10 cm
    r: number; // próbka: rzędy na 10 cm
    n?: number; // zalecany rozmiar drutów w mm
  };
  desc?: string;
  notes?: string;
}

/**
 * Bezpieczne kodowanie UTF-8 do Base64
 */
export function utf8ToBase64(str: string): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(str, 'utf-8').toString('base64');
  }
  return btoa(
    encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) =>
      String.fromCharCode(parseInt(p1, 16))
    )
  );
}

/**
 * Bezpieczne dekodowanie Base64 do UTF-8
 */
export function base64ToUtf8(b64: string): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(b64, 'base64').toString('utf-8');
  }
  const binary = atob(b64);
  return decodeURIComponent(
    binary
      .split('')
      .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );
}

/**
 * Serializuje projekt do adresu URL protokołu oczko://project?v=1&d=<base64>
 */
export function encodeProjectToDeepLink(payload: CompactProjectPayload): string {
  const json = JSON.stringify(payload);
  const b64 = utf8ToBase64(json);
  return `${PROJECT_SHARE_PROTOCOL}?v=1&d=${encodeURIComponent(b64)}`;
}

/**
 * Deserializuje i waliduje projekt z adresu URL lub ciągu Base64
 */
export function decodeProjectFromDeepLink(urlOrPayload: string): CompactProjectPayload {
  if (!urlOrPayload) {
    throw new Error('Pusty link projektu');
  }

  let base64Data = urlOrPayload.trim();

  if (base64Data.startsWith(PROJECT_SHARE_PROTOCOL)) {
    const queryIndex = base64Data.indexOf('?');
    if (queryIndex === -1) {
      throw new Error('Brak parametrów w linku oczko://project');
    }
    const queryString = base64Data.substring(queryIndex + 1);
    const params = new URLSearchParams(queryString);
    const dataParam = params.get('d');
    if (!dataParam) {
      throw new Error('Brak parametru "d" w linku projektu');
    }
    base64Data = decodeURIComponent(dataParam);
  }

  let jsonStr: string;
  try {
    jsonStr = base64ToUtf8(base64Data);
  } catch {
    throw new Error('Nieprawidłowe kodowanie Base64 w linku projektu');
  }

  let parsed: any;
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    throw new Error('Uszkodzony format danych JSON w projekcie');
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Payload musi być obiektem JSON');
  }

  if (parsed.v !== 1) {
    throw new Error(`Nieobsługiwana wersja schematu projektu (v${parsed.v})`);
  }

  if (!parsed.n || typeof parsed.n !== 'string') {
    throw new Error('Projekt musi posiadać nazwę ("n")');
  }

  if (parsed.c !== 'knitting' && parsed.c !== 'crochet') {
    throw new Error('Nieprawidłowy typ rękodzieła ("c")');
  }

  if (!Array.isArray(parsed.p) || parsed.p.length === 0) {
    throw new Error('Projekt musi posiadać co najmniej jedną część ("p")');
  }

  return parsed as CompactProjectPayload;
}
