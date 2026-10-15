/**
 * Oczko Core — Baza wiedzy i słownik terminologii dziewiarskiej (DEC-17, DEC-18, DEC-24)
 * Zgodność ze standardem Craft Yarn Council (CYC) oraz normami polskiego nazewnictwa rzemieślniczego.
 */

export type GlossaryCategory =
  | 'basic'
  | 'decrease'
  | 'increase'
  | 'cable'
  | 'short_rows'
  | 'crochet';

export interface GlossaryTerm {
  id: string;
  abbreviationPL: string;
  abbreviationEN: string;
  abbreviationDE?: string;
  abbreviationFR?: string;
  namePL: string;
  nameEN: string;
  description: string;
  category: GlossaryCategory;
  symbolGlyph?: string;
  isCrochet?: boolean;
}

export const KNITTING_GLOSSARY: GlossaryTerm[] = [
  // --- 1. BASIC (PODSTAWOWE) ---
  {
    id: 'term_k',
    abbreviationPL: 'o.p.',
    abbreviationEN: 'k',
    abbreviationDE: 're',
    abbreviationFR: 'm.end',
    namePL: 'Oczko prawe',
    nameEN: 'Knit stitch',
    description: 'Podstawowe oczko. Wprowadź prawy drut w oczko z lewej do prawej, chwyć nitkę za robotą i przeciągnij.',
    category: 'basic',
    symbolGlyph: '|',
  },
  {
    id: 'term_p',
    abbreviationPL: 'o.l.',
    abbreviationEN: 'p',
    abbreviationDE: 'li',
    abbreviationFR: 'm.env',
    namePL: 'Oczko lewe',
    nameEN: 'Purl stitch',
    description: 'Nitka przed robotą. Wprowadź prawy drut w oczko z prawej do lewej i przeciągnij pętelkę.',
    category: 'basic',
    symbolGlyph: '—',
  },
  {
    id: 'term_ktbl',
    abbreviationPL: 'o.p.przekr.',
    abbreviationEN: 'kfb / ktbl',
    abbreviationDE: 're verschr',
    abbreviationFR: 'm.end torse',
    namePL: 'Oczko prawe przekręcone (za tylną nitkę)',
    nameEN: 'Knit through back loop',
    description: 'Wbicie drutu w tylną część pętelki (back loop), co skręca oczko i zapobiega dziurkom lub tworzy wyraźny relief.',
    category: 'basic',
    symbolGlyph: '⤿',
  },
  {
    id: 'term_ptbl',
    abbreviationPL: 'o.l.przekr.',
    abbreviationEN: 'ptbl',
    abbreviationDE: 'li verschr',
    namePL: 'Oczko lewe przekręcone',
    nameEN: 'Purl through back loop',
    description: 'Przerobienie oczka lewego z wbiciem drutu w tylną nóżkę oczka od tyłu do przodu.',
    category: 'basic',
    symbolGlyph: '⤾',
  },
  {
    id: 'term_sl',
    abbreviationPL: 'przeł.',
    abbreviationEN: 'sl / slip',
    abbreviationDE: 'abh',
    abbreviationFR: 'gliss',
    namePL: 'Przełożenie oczka bez przerabiania',
    nameEN: 'Slip stitch',
    description: 'Przełożenie oczka z lewego na prawy drut bez przerabiania (domyślnie jak na lewo, z nitką z tyłu).',
    category: 'basic',
    symbolGlyph: 'V',
  },
  {
    id: 'term_wyif',
    abbreviationPL: 'nitka z przodu',
    abbreviationEN: 'wyif',
    namePL: 'Z nitką z przodu roboty',
    nameEN: 'With yarn in front',
    description: 'Prowadzenie nitki roboczej od strony dziewiarki przed przełożeniem oczka.',
    category: 'basic',
  },
  {
    id: 'term_wyib',
    abbreviationPL: 'nitka z tyłu',
    abbreviationEN: 'wyib',
    namePL: 'Z nitką z tyłu roboty',
    nameEN: 'With yarn in back',
    description: 'Prowadzenie nitki roboczej za robotą przed przełożeniem oczka.',
    category: 'basic',
  },
  {
    id: 'term_edge',
    abbreviationPL: 'o.b.',
    abbreviationEN: 'edge st',
    abbreviationDE: 'RM',
    namePL: 'Oczko brzegowe',
    nameEN: 'Edge stitch / Selvedge',
    description: 'Pierwsze i ostatnie oczko w rzędzie, tworzące gładki lub węzełkowy brzeg dzianiny.',
    category: 'basic',
  },

  // --- 2. DECREASES (REDUKCJE / ODEJMOWANIE) ---
  {
    id: 'term_k2tog',
    abbreviationPL: '2orazem p.',
    abbreviationEN: 'k2tog',
    abbreviationDE: '2 M re zus',
    abbreviationFR: '2 m.ens.end',
    namePL: 'Dwa oczka razem na prawo',
    nameEN: 'Knit 2 together',
    description: 'Redukcja 1 oczka pochylona w prawo (/): wbicie prawego drutu w dwa oczka jednocześnie jak na prawo.',
    category: 'decrease',
    symbolGlyph: '/',
  },
  {
    id: 'term_ssk',
    abbreviationPL: 'ssk / przeł-przeł-przerób',
    abbreviationEN: 'ssk',
    abbreviationDE: 'ssk',
    abbreviationFR: 'surjet simple',
    namePL: 'Przełóż, przełóż, przerób razem',
    nameEN: 'Slip, slip, knit',
    description: 'Redukcja 1 oczka pochylona w lewo (\\): przełóż 2 oczka kolejno jak na prawo, wbij lewy drut w ich przednie nóżki i przerób razem.',
    category: 'decrease',
    symbolGlyph: '\\',
  },
  {
    id: 'term_p2tog',
    abbreviationPL: '2orazem l.',
    abbreviationEN: 'p2tog',
    abbreviationDE: '2 M li zus',
    namePL: 'Dwa oczka razem na lewo',
    nameEN: 'Purl 2 together',
    description: 'Redukcja na lewej stronie roboty: wbicie w dwa oczka jednocześnie jak na lewo.',
    category: 'decrease',
    symbolGlyph: '—/',
  },
  {
    id: 'term_ssp',
    abbreviationPL: 'ssp',
    abbreviationEN: 'ssp',
    namePL: 'Ściągnij, ściągnij, przerób na lewo z przekręceniem',
    nameEN: 'Slip, slip, purl',
    description: 'Redukcja na lewej stronie z pochyleniem w lewo na prawej stronie robótki.',
    category: 'decrease',
  },
  {
    id: 'term_skpo',
    abbreviationPL: 'psso / przeciągnięcie',
    abbreviationEN: 'skpo / sl 1, k1, psso',
    namePL: 'Przełóż 1, przerób 1 na prawo, przeciągnij',
    nameEN: 'Slip 1, knit 1, pass slipped stitch over',
    description: 'Klasyczna alternatywa dla ssk, redukcja pochylona w lewo.',
    category: 'decrease',
    symbolGlyph: '∧',
  },
  {
    id: 'term_k3tog',
    abbreviationPL: '3orazem p.',
    abbreviationEN: 'k3tog',
    namePL: 'Trzy oczka razem na prawo',
    nameEN: 'Knit 3 together',
    description: 'Podwójna redukcja (ujmuje 2 oczka) pochylona w prawo.',
    category: 'decrease',
    symbolGlyph: '//',
  },
  {
    id: 'term_cdd',
    abbreviationPL: 'cdd / potrójne centrowane',
    abbreviationEN: 'cdd / s2kp',
    namePL: 'Centralna redukcja potrójna',
    nameEN: 'Centered double decrease',
    description: 'Symetryczne ujęcie 2 oczek: przełóż 2 oczka jak do k2tog, przerób 1 o.p., przeciągnij 2 przełożone oczka nad nim.',
    category: 'decrease',
    symbolGlyph: '▲',
  },

  // --- 3. INCREASES (DODAWANIE OCZEK) ---
  {
    id: 'term_yo',
    abbreviationPL: 'narz.',
    abbreviationEN: 'yo',
    abbreviationDE: 'U / Umschlag',
    abbreviationFR: 'jeté',
    namePL: 'Narzut',
    nameEN: 'Yarn over',
    description: 'Owiń nitkę wokół prawego drutu od przodu do tyłu. Tworzy nowe oczko i ozdobną ażurową dziurkę.',
    category: 'increase',
    symbolGlyph: '○',
  },
  {
    id: 'term_m1l',
    abbreviationPL: 'm1l / dod. w lewo',
    abbreviationEN: 'M1L',
    abbreviationDE: 'M1L',
    namePL: 'Dodanie oczka z poprzeczki w lewo',
    nameEN: 'Make 1 left',
    description: 'Unieś lewym drutem nitkę poprzeczną od przodu do tyłu i przerób ją za tylną nóżkę jak na prawo.',
    category: 'increase',
    symbolGlyph: '⌞',
  },
  {
    id: 'term_m1r',
    abbreviationPL: 'm1r / dod. w prawo',
    abbreviationEN: 'M1R',
    abbreviationDE: 'M1R',
    namePL: 'Dodanie oczka z poprzeczki w prawo',
    nameEN: 'Make 1 right',
    description: 'Unieś lewym drutem nitkę poprzeczną od tyłu do przodu i przerób ją za przednią nóżkę jak na prawo.',
    category: 'increase',
    symbolGlyph: '⌟',
  },
  {
    id: 'term_kfb',
    abbreviationPL: 'kfb / 2 z 1 oczka',
    abbreviationEN: 'kfb',
    namePL: 'Przerób przednią i tylną nitkę oczka',
    nameEN: 'Knit front and back',
    description: 'Przerób oczko na prawo, nie zdejmując z lewego drutu wbij się w tylną nóżkę i przerób ponownie.',
    category: 'increase',
  },
  {
    id: 'term_m1p',
    abbreviationPL: 'm1p',
    abbreviationEN: 'M1P',
    namePL: 'Dodanie oczka z poprzeczki na lewo',
    nameEN: 'Make 1 purl',
    description: 'Dodanie oczka z nitki poprzecznej z przekręceniem i przerobieniem na lewo.',
    category: 'increase',
  },
  {
    id: 'term_yo2',
    abbreviationPL: 'podw. narz.',
    abbreviationEN: 'yo2 / double yo',
    namePL: 'Podwójny narzut',
    nameEN: 'Double yarn over',
    description: 'Dwa kolejne nawinięcia nitki wokół drutu, w kolejnym rzędzie przerabiane np. na prawo i na lewo.',
    category: 'increase',
    symbolGlyph: '◎',
  },

  // --- 4. CABLES (WARKOCZE I SPLOTY) ---
  {
    id: 'term_c4f',
    abbreviationPL: 'W4P (przód)',
    abbreviationEN: 'C4F / CF4',
    namePL: 'Warkocz 4-oczkowy z drutem z przodu',
    nameEN: 'Cable 4 front',
    description: 'Przełóż 2 oczka na drut pomocniczy z przodu robótki, przerób 2 o.p. z lewego drutu, następnie 2 o.p. z pomocniczego. Skręt w lewo.',
    category: 'cable',
    symbolGlyph: '⤱',
  },
  {
    id: 'term_c4b',
    abbreviationPL: 'W4T (tył)',
    abbreviationEN: 'C4B / CB4',
    namePL: 'Warkocz 4-oczkowy z drutem z tyłu',
    nameEN: 'Cable 4 back',
    description: 'Przełóż 2 oczka na drut pomocniczy z tyłu robótki, przerób 2 o.p. z lewego drutu, następnie 2 o.p. z pomocniczego. Skręt w prawo.',
    category: 'cable',
    symbolGlyph: '⤲',
  },
  {
    id: 'term_c6f',
    abbreviationPL: 'W6P (przód)',
    abbreviationEN: 'C6F',
    namePL: 'Warkocz klasyczny 6-oczkowy w lewo',
    nameEN: 'Cable 6 front',
    description: 'Przełóż 3 oczka na drut pomocniczy z przodu, przerób 3 o.p., a potem 3 o.p. z drutu pomocniczego.',
    category: 'cable',
  },
  {
    id: 'term_c6b',
    abbreviationPL: 'W6T (tył)',
    abbreviationEN: 'C6B',
    namePL: 'Warkocz klasyczny 6-oczkowy w prawo',
    nameEN: 'Cable 6 back',
    description: 'Przełóż 3 oczka na drut pomocniczy z tyłu, przerób 3 o.p., a potem 3 o.p. z drutu pomocniczego.',
    category: 'cable',
  },
  {
    id: 'term_t3f',
    abbreviationPL: 'T3P',
    abbreviationEN: 'T3F',
    namePL: 'Skręcenie 3-oczkowe w lewo z tłem lewym',
    nameEN: 'Twist 3 front',
    description: 'Przełóż 2 o. na drut pomocniczy z przodu, 1 o.l., następnie 2 o.p. z drutu pomocniczego.',
    category: 'cable',
  },

  // --- 5. SHORT ROWS (RZĘDY SKRÓCONE) ---
  {
    id: 'term_wt',
    abbreviationPL: 'owiń i obróć',
    abbreviationEN: 'w&t',
    namePL: 'Owiń i obróć (Wrap and Turn)',
    nameEN: 'Wrap and turn',
    description: 'Przełóż oczko, przełóż nitkę na drugą stronę, odłóż oczko z powrotem, obróć robótkę. Zapobiega powstawaniu dziur przy rzędach skróconych.',
    category: 'short_rows',
  },
  {
    id: 'term_gsr',
    abbreviationPL: 'GSR / podwójne oczko',
    abbreviationEN: 'GSR / German Short Row',
    namePL: 'Niemieckie rzędy skrócone (Doppelmasche)',
    nameEN: 'German short row (Double stitch)',
    description: 'Po obróceniu robótki zdejmij oczko jak na lewo z nitką z przodu i pociągnij mocno do tyłu tworząc podwójne oczko (double stitch).',
    category: 'short_rows',
  },
  {
    id: 'term_ds',
    abbreviationPL: 'ds / oczko podwójne',
    abbreviationEN: 'ds',
    namePL: 'Podwójne oczko niemieckie',
    nameEN: 'Double stitch',
    description: 'Oczko powstałe z pociągnięcia nitki w niemieckich rzędach skróconych, w kolejnym rzędzie przerabiane przez obie pętelki jako 1 oczko.',
    category: 'short_rows',
  },
  {
    id: 'term_jsr',
    abbreviationPL: 'japońskie skrócone',
    abbreviationEN: 'Japanese short row',
    namePL: 'Japońskie rzędy skrócone ze znacznikiem',
    nameEN: 'Japanese short rows',
    description: 'Metoda rzędów skróconych wykorzystująca agrafkę/znacznik zawieszany na nitce roboczej w punkcie zwrotu.',
    category: 'short_rows',
  },

  // --- 6. CROCHET (SZYDEŁKO) ---
  {
    id: 'term_ch',
    abbreviationPL: 'o.ł.',
    abbreviationEN: 'ch',
    namePL: 'Oczko łańcuszka',
    nameEN: 'Chain stitch',
    description: 'Podstawowe oczko szydełkowe. Narzuć nitkę na szydełko i przeciągnij przez pętelkę na szydełku.',
    category: 'crochet',
    symbolGlyph: '○',
    isCrochet: true,
  },
  {
    id: 'term_slst',
    abbreviationPL: 'o.ś.',
    abbreviationEN: 'sl st',
    namePL: 'Oczko ścisłe',
    nameEN: 'Slip stitch',
    description: 'Wbij szydełko w oczko, narzuć nitkę i przeciągnij jednym ruchem przez oczko oraz pętelkę na szydełku.',
    category: 'crochet',
    symbolGlyph: '•',
    isCrochet: true,
  },
  {
    id: 'term_sc',
    abbreviationPL: 'psł.',
    abbreviationEN: 'sc (US) / dc (UK)',
    namePL: 'Półsłupek',
    nameEN: 'Single crochet (US) / Double crochet (UK)',
    description: 'Wbij szydełko w oczko, wyciągnij pętelkę (2 pętelki na szydełku), narzuć nitkę i przeciągnij przez obie.',
    category: 'crochet',
    symbolGlyph: '+',
    isCrochet: true,
  },
  {
    id: 'term_hdc',
    abbreviationPL: 'psł. nawijany',
    abbreviationEN: 'hdc (US) / htr (UK)',
    namePL: 'Półsłupek nawijany',
    nameEN: 'Half double crochet (US)',
    description: 'Narzuć nitkę, wbij szydełko, wyciągnij pętelkę (3 pętelki), narzuć i przeciągnij przez wszystkie 3 na raz.',
    category: 'crochet',
    symbolGlyph: 'T',
    isCrochet: true,
  },
  {
    id: 'term_dc',
    abbreviationPL: 'sł.',
    abbreviationEN: 'dc (US) / tr (UK)',
    namePL: 'Słupek pojedynczy',
    nameEN: 'Double crochet (US) / Treble crochet (UK)',
    description: 'Narzuć nitkę, wbij szydełko, wyciągnij pętelkę, przerób (narzut) przez 2 pierwsze pętelki, narzut przez 2 pozostałe.',
    category: 'crochet',
    symbolGlyph: '∓',
    isCrochet: true,
  },
  {
    id: 'term_tr',
    abbreviationPL: 'sł. podw.',
    abbreviationEN: 'tr (US) / dtr (UK)',
    namePL: 'Słupek podwójny',
    nameEN: 'Treble crochet (US) / Double treble (UK)',
    description: 'Dwa narzuty na szydełko przed wbiciem w oczko. Przerabianie pętelek parami trzykrotnie.',
    category: 'crochet',
    isCrochet: true,
  },
  {
    id: 'term_mr',
    abbreviationPL: 'MR / magiczne kółko',
    abbreviationEN: 'MR / Magic Ring',
    namePL: 'Magiczne kółko (Magic Ring)',
    nameEN: 'Magic ring / adjustable loop',
    description: 'Zaciskana pętelka początkowa do robótek na okrągło (np. amigurumi, czapki, podkładki), eliminująca dziurkę w środku.',
    category: 'crochet',
    isCrochet: true,
  },
  {
    id: 'term_bpsc',
    abbreviationPL: 'psł. reliefowy tylny',
    abbreviationEN: 'bpsc / BPdc',
    namePL: 'Półsłupek reliefowy przerabiany od tyłu',
    nameEN: 'Back post stitch',
    description: 'Wkłucie szydełka wokół nóżki słupka z poprzedniego rzędu od tyłu ku przodowi, dające wypukłą fakturę.',
    category: 'crochet',
    isCrochet: true,
  },
  {
    id: 'term_fpsc',
    abbreviationPL: 'psł. reliefowy przedni',
    abbreviationEN: 'fpsc / FPdc',
    namePL: 'Półsłupek reliefowy przerabiany od przodu',
    nameEN: 'Front post stitch',
    description: 'Wkłucie szydełka wokół nóżki słupka z poprzedniego rzędu od przodu ku tyłowi.',
    category: 'crochet',
    isCrochet: true,
  },
  {
    id: 'term_cluster',
    abbreviationPL: 'pęczek / muszelka',
    abbreviationEN: 'cluster / bobble',
    namePL: 'Ścieg pęczkowy / muszelka',
    nameEN: 'Cluster / Bobble stitch',
    description: 'Kilka niedokończonych słupków wbitych w jedno oczko podstawy, zamkniętych wspólnym narzutem.',
    category: 'crochet',
    isCrochet: true,
  },
  {
    id: 'term_picot',
    abbreviationPL: 'pikotka',
    abbreviationEN: 'picot',
    namePL: 'Pikotka ozdobna',
    nameEN: 'Picot stitch',
    description: 'Ozdobny ząbek brzegowy utworzony z 3 oczek łańcuszka zamkniętych oczkiem ścisłym w pierwsze oczko.',
    category: 'crochet',
    isCrochet: true,
  },
];

/**
 * Zwraca hasła należące do danej kategorii.
 */
export function getGlossaryByCategory(category: GlossaryCategory): GlossaryTerm[] {
  return KNITTING_GLOSSARY.filter((item) => item.category === category);
}

/**
 * Wyszukuje hasła po dowolnym fragmencie skrótu PL/EN/DE lub nazwy.
 */
export function searchGlossary(query: string): GlossaryTerm[] {
  const q = query.toLowerCase().trim();
  if (!q) return KNITTING_GLOSSARY;

  return KNITTING_GLOSSARY.filter((item) => {
    return (
      item.abbreviationPL.toLowerCase().includes(q) ||
      item.abbreviationEN.toLowerCase().includes(q) ||
      (item.abbreviationDE && item.abbreviationDE.toLowerCase().includes(q)) ||
      (item.abbreviationFR && item.abbreviationFR.toLowerCase().includes(q)) ||
      item.namePL.toLowerCase().includes(q) ||
      item.nameEN.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q)
    );
  });
}
