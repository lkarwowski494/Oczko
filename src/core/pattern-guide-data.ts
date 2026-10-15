/**
 * Oczko Core — Wbudowane schematy i dane diagramów dziewiarskich dla modułu Przeglądarki z Linijką (DEC-09, NFR-DOST-009)
 * Zgodne ze standardem CYC (Craft Yarn Council) i zasadą czytelności dla osób z ograniczeniami widzenia.
 */

export interface ChartRow {
  rowNumber: number;
  side: 'RS' | 'WS';
  instruction: string;
  stitches: string[];
  isHighlighted?: boolean;
}

export interface PatternGuideChart {
  id: string;
  title: string;
  craftType: 'knitting' | 'crochet';
  totalRows: number;
  stitchWidth: number;
  rows: ChartRow[];
}

export const BUILT_IN_PATTERNS: PatternGuideChart[] = [
  {
    id: 'cable-c6f',
    title: 'Warkocz C6F (8 rzędów)',
    craftType: 'knitting',
    totalRows: 8,
    stitchWidth: 10,
    rows: [
      {
        rowNumber: 8,
        side: 'WS',
        instruction: '2p, 6l, 2p (Oczko lewe nad lewym)',
        stitches: ['|', '|', '-', '-', '-', '-', '-', '-', '|', '|'],
      },
      {
        rowNumber: 7,
        side: 'RS',
        instruction: '2l, 6p, 2l (Oczka prawe nad warkoczem)',
        stitches: ['-', '-', '|', '|', '|', '|', '|', '|', '-', '-'],
      },
      {
        rowNumber: 6,
        side: 'WS',
        instruction: '2p, 6l, 2p (Strona lewa)',
        stitches: ['|', '|', '-', '-', '-', '-', '-', '-', '|', '|'],
      },
      {
        rowNumber: 5,
        side: 'RS',
        instruction: '2l, C6F (3 na drut pom. z przodu, 3p, 3p z pom.), 2l',
        stitches: ['-', '-', '⚡', '⚡', '⚡', '⚡', '⚡', '⚡', '-', '-'],
      },
      {
        rowNumber: 4,
        side: 'WS',
        instruction: '2p, 6l, 2p (Strona lewa)',
        stitches: ['|', '|', '-', '-', '-', '-', '-', '-', '|', '|'],
      },
      {
        rowNumber: 3,
        side: 'RS',
        instruction: '2l, 6p, 2l (Strona prawa)',
        stitches: ['-', '-', '|', '|', '|', '|', '|', '|', '-', '-'],
      },
      {
        rowNumber: 2,
        side: 'WS',
        instruction: '2p, 6l, 2p (Strona lewa)',
        stitches: ['|', '|', '-', '-', '-', '-', '-', '-', '|', '|'],
      },
      {
        rowNumber: 1,
        side: 'RS',
        instruction: '2l, 6p, 2l (Rząd bazowy warkocza)',
        stitches: ['-', '-', '|', '|', '|', '|', '|', '|', '-', '-'],
      },
    ],
  },
  {
    id: 'lace-eyelet',
    title: 'Ażur Romby z dziurkami (6 rzędów)',
    craftType: 'knitting',
    totalRows: 6,
    stitchWidth: 8,
    rows: [
      {
        rowNumber: 6,
        side: 'WS',
        instruction: 'Wszystkie oczka lewe (strona lewa)',
        stitches: ['-', '-', '-', '-', '-', '-', '-', '-'],
      },
      {
        rowNumber: 5,
        side: 'RS',
        instruction: '1p, ssk, yo, 2p, yo, k2tog, 1p',
        stitches: ['|', '\\', 'o', '|', '|', 'o', '/', '|'],
      },
      {
        rowNumber: 4,
        side: 'WS',
        instruction: 'Wszystkie oczka lewe (strona lewa)',
        stitches: ['-', '-', '-', '-', '-', '-', '-', '-'],
      },
      {
        rowNumber: 3,
        side: 'RS',
        instruction: '2p, yo, ssk, k2tog, yo, 2p',
        stitches: ['|', '|', 'o', '\\', '/', 'o', '|', '|'],
      },
      {
        rowNumber: 2,
        side: 'WS',
        instruction: 'Wszystkie oczka lewe (strona lewa)',
        stitches: ['-', '-', '-', '-', '-', '-', '-', '-'],
      },
      {
        rowNumber: 1,
        side: 'RS',
        instruction: 'Wszystkie oczka prawe (baza ażuru)',
        stitches: ['|', '|', '|', '|', '|', '|', '|', '|'],
      },
    ],
  },
];
