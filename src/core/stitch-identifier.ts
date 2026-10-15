/**
 * Oczko Core — Deterministyczny klucz identyfikacji ściegu „Co widzisz?” (DEC-16, ZP-05)
 * Bezalorytmiczne, 100% deterministyczne drzewo cech morfologicznych splotu bez użycia AI.
 * Pomaga początkującym rękodzielnikom rozpoznać strukturę dzianiny na podstawie cech wizualnych,
 * odwracalności oraz zachowania brzegów.
 */

export interface StitchQuestionOption {
  id: string;
  label: string;
  description: string;
  badge?: string;
}

export interface StitchQuestion {
  id: string;
  stepNumber: number;
  totalSteps: number;
  title: string;
  subtitle: string;
  options: StitchQuestionOption[];
}

export interface StitchMatchResult {
  id: string;
  namePl: string;
  nameEn: string;
  craftType: 'knitting' | 'crochet';
  category: 'basic' | 'ribbing' | 'textured' | 'cable' | 'lace' | 'crochet';
  confidence: 'exact' | 'high';
  description: string;
  rowCountingTip: string;
  curlingAdvice?: string;
  glossaryTermQuery?: string;
  trainerExerciseId?: string;
}

export const STITCH_IDENTIFIER_QUESTIONS: StitchQuestion[] = [
  {
    id: 'surface_texture',
    stepNumber: 1,
    totalSteps: 3,
    title: 'Co widzisz na prawej stronie robótki?',
    subtitle: 'Przyjrzyj się uważnie splotowi na oświetlonej powierzchni.',
    options: [
      {
        id: 'v_columns',
        label: 'Gładkie pionowe kolumny „V”',
        description: 'Oczka układają się w równe, gładkie warkoczyki przypominające litery V.',
        badge: 'Gładki',
      },
      {
        id: 'ridges',
        label: 'Poziome wypukłe grzbiety / fale',
        description: 'Na powierzchni widać rzędy wypukłych, poziomych wałków z nitek.',
        badge: 'Fale',
      },
      {
        id: 'ribs',
        label: 'Pionowe prążki / ściągacz',
        description: 'Pionowe kolumienki oczek prawych przedzielone zapadniętymi rowkami.',
        badge: 'Prążki',
      },
      {
        id: 'grains',
        label: 'Drobne ziarna / kaszka',
        description: 'Ziarnista faktura przypominająca rozsypany ryż lub szachownicę.',
        badge: 'Ziarnisty',
      },
      {
        id: 'cables',
        label: 'Splecione pasma / warkocze',
        description: 'Grube pasma nitek krzyżujące się ze sobą i tworzące trójwymiarowe sploty.',
        badge: 'Warkocz',
      },
      {
        id: 'holes',
        label: 'Ażurowe otwory i dziurki',
        description: 'Powtarzalne geometryczne otwory utworzone z narzutów i łączenia oczek.',
        badge: 'Ażur',
      },
      {
        id: 'crochet_knots',
        label: 'Słupki z pętelkami (Szydełko)',
        description: 'Węzełkowa struktura z pionowymi słupkami i łańcuszkiem na szczycie.',
        badge: 'Szydełko',
      },
    ],
  },
  {
    id: 'reversibility',
    stepNumber: 2,
    totalSteps: 3,
    title: 'Odwróć robótkę — jak wygląda lewa strona?',
    subtitle: 'Porównaj wygląd lewej strony z prawą stroną robótki.',
    options: [
      {
        id: 'different_ridges',
        label: 'Zupełnie inaczej (fale i pętelki)',
        description: 'Z tyłu widać poziome garbki, podczas gdy przód był gładki.',
        badge: 'Jednostronny',
      },
      {
        id: 'different_v',
        label: 'Zupełnie inaczej (gładkie kolumny V)',
        description: 'Z tyłu widać gładkie pionowe V, a przód ma poziome fale.',
        badge: 'Jednostronny',
      },
      {
        id: 'identical',
        label: 'Identycznie lub prawie identycznie',
        description: 'Obie strony mają ten sam wzór (ścieg w 100% dwustronny).',
        badge: 'Dwustronny',
      },
      {
        id: 'flat_background',
        label: 'Gładkie zapadnięte tło',
        description: 'Z tyłu widać głównie tło z oczek lewych za wypukłym splotem.',
        badge: 'Tło wzoru',
      },
    ],
  },
  {
    id: 'edge_and_stretch',
    stepNumber: 3,
    totalSteps: 3,
    title: 'Jak zachowują się brzegi i elastyczność dzianiny?',
    subtitle: 'Spróbuj lekko naciągnąć robótkę w poprzek i zobacz jej brzegi.',
    options: [
      {
        id: 'curls',
        label: 'Brzegi mocno rolują się w rulon',
        description: 'Krawędzie zawijają się samoczynnie do środka lub na zewnątrz.',
        badge: 'Rolujący',
      },
      {
        id: 'elastic_accordion',
        label: 'Mocno sprężynuje jak harmonijka',
        description: 'Rozciąga się bardzo szeroko i natychmiast wraca do wąskiego kształtu.',
        badge: 'Sprężysty',
      },
      {
        id: 'lays_flat',
        label: 'Leży zupełnie płasko, nie roluje się',
        description: 'Krawędzie są stabilne i nie wykazują tendencji do zwijania.',
        badge: 'Stabilny',
      },
      {
        id: 'airy_lace',
        label: 'Lekka, przewiewna, wymaga blokowania',
        description: 'Otwory ujawniają swój właściwy kształt po rozpięciu i zablokowaniu.',
        badge: 'Ażurowy',
      },
    ],
  },
];

export const STITCH_CATALOG: Record<string, StitchMatchResult> = {
  stockinette: {
    id: 'stockinette',
    namePl: 'Dżersej / Ścieg gładki prawy',
    nameEn: 'Stockinette stitch',
    craftType: 'knitting',
    category: 'basic',
    confidence: 'exact',
    description:
      'Najpopularniejszy ścieg dziewiarski. Prawa strona składa się wyłącznie z gładkich pionowych kolumn w kształcie litery „V”, natomiast lewa strona to poziome pętelki (oczka lewe).',
    rowCountingTip:
      'Licz oczka w pojedynczej pionowej kolumnie „V” od dołu do góry. Każde „V” to dokładnie 1 przerobiony rząd.',
    curlingAdvice:
      'Dżersej naturalnie zawija się na brzegach ze względu na różnicę naprężenia między prawą a lewą stroną. Dodaj 3-4 oczka ściegu francuskiego na brzegach lub wykończ robótkę ściągaczem.',
    glossaryTermQuery: 'prawe',
  },
  reverse_stockinette: {
    id: 'reverse_stockinette',
    namePl: 'Dżersej odwrócony / Ścieg gładki lewy',
    nameEn: 'Reverse Stockinette stitch',
    craftType: 'knitting',
    category: 'basic',
    confidence: 'exact',
    description:
      'Odwrócenie dżerseju: prawa strona robótki ma wypukłą, poziomą fakturę oczek lewych, a lewa strona jest gładka. Często stanowi tło pod warkocze i reliefy.',
    rowCountingTip:
      'Licz poziome garbki w pionowej linii na prawej stronie. Każdy garbek odpowiada jednemu rzędowi.',
    curlingAdvice:
      'Podobnie jak klasyczny dżersej ma tendencję do rolowania się, ale w przeciwną stronę. Wymaga plis lub blokowania.',
    glossaryTermQuery: 'lewe',
  },
  garter: {
    id: 'garter',
    namePl: 'Ścieg francuski (Fale)',
    nameEn: 'Garter stitch',
    craftType: 'knitting',
    category: 'basic',
    confidence: 'exact',
    description:
      'Ścieg w 100% dwustronny, powstający z przerabiania oczek prawych w każdym rzędzie (na płasko). Tworzy elastyczną, mięsistą dzianinę z poziomymi prążkami.',
    rowCountingTip:
      'Jeden wypukły poziomy wałek (grzbiet) tworzą 2 przerobione rzędy. Jeśli widzisz 10 wałków, przerobiłaś 20 rzędów.',
    curlingAdvice:
      'Ścieg francuski leży idealnie płasko i nigdy się nie zwija! Dlatego jest idealnym wyborem na brzegi szali, kocyków i plis swetrów.',
    glossaryTermQuery: 'prawe',
  },
  ribbing: {
    id: 'ribbing',
    namePl: 'Ściągacz elastyczny (1x1 lub 2x2)',
    nameEn: 'Ribbing stitch',
    craftType: 'knitting',
    category: 'ribbing',
    confidence: 'exact',
    description:
      'Ścieg powstający z naprzemiennego przerabiania oczek prawych i lewych w pionowych kolumnach. Posiada ogromną sprężystość poprzeczną i ściąga się jak harmonijka.',
    rowCountingTip:
      'Licz oczka „V” na wypukłych prążkach oczek prawych, delikatnie rozciągając ściągacz.',
    curlingAdvice:
      'Ściągacz nie roluje się na brzegach. Jest standardowym wykończeniem mankietów, dołów swetrów i czapek.',
    trainerExerciseId: 'ex_ribbing_2x2',
    glossaryTermQuery: 'ściągacz',
  },
  seed_stitch: {
    id: 'seed_stitch',
    namePl: 'Ścieg ryżowy / Perłowy',
    nameEn: 'Seed / Moss stitch',
    craftType: 'knitting',
    category: 'textured',
    confidence: 'exact',
    description:
      'Elegancka, ziarnista szachownica powstająca przez przerabianie oczka lewego nad prawym i prawego nad lewym. Wzór jest całkowicie dwustronny i stabilny.',
    rowCountingTip:
      'Licz rzędy po wypukłych ziarenkach na przemian w sąsiadujących kolumnach.',
    curlingAdvice:
      'Ścieg ryżowy leży zupełnie płasko, nie zwija się i zachowuje doskonałą stabilność wymiarową.',
    trainerExerciseId: 'ex_moss_stitch',
    glossaryTermQuery: 'ryżowy',
  },
  cable_c6f: {
    id: 'cable_c6f',
    namePl: 'Warkocz dziewiarski (np. C6F)',
    nameEn: 'Cable stitch',
    craftType: 'knitting',
    category: 'cable',
    confidence: 'exact',
    description:
      'Trójwymiarowy, skręcany splot powstający przez odłożenie grupy oczek na drut pomocniczy i skrzyżowanie ich z kolejnymi oczkami. Tworzy wypukłą linę na zapadniętym tle.',
    rowCountingTip:
      'Licz rzędy od ostatniego skrzyżowania warkocza w rowku tła obok skrętu.',
    curlingAdvice:
      'Warkocze mocno ściągają dzianinę w poprzek (zmniejszają jej szerokość). Zawsze wykonaj próbkę przed wyliczeniem liczby oczek.',
    trainerExerciseId: 'ex_cable_c6f',
    glossaryTermQuery: 'warkocz',
  },
  lace_eyelet: {
    id: 'lace_eyelet',
    namePl: 'Ścieg ażurowy z dziurkami',
    nameEn: 'Lace eyelet stitch',
    craftType: 'knitting',
    category: 'lace',
    confidence: 'exact',
    description:
      'Lekka, otwarta dzianina z powtarzalnymi otworami powstającymi przez połączenie narzutów (yo) z redukcjami (k2tog, ssk).',
    rowCountingTip:
      'Licz rzędy wzdłuż pionowych linii motywów ażurowych lub używaj licznika rzędów Oczko.',
    curlingAdvice:
      'Ażur w pełni ukazuje swoje piękno dopiero po zablokowaniu (rozpięciu na mokro szpilkami dziewiarskimi).',
    trainerExerciseId: 'ex_lace_eyelet',
    glossaryTermQuery: 'narzut',
  },
  crochet_basic: {
    id: 'crochet_basic',
    namePl: 'Splot szydełkowy (Słupki / Półsłupki)',
    nameEn: 'Crochet stitch',
    craftType: 'crochet',
    category: 'crochet',
    confidence: 'exact',
    description:
      'Robótka wykonana pojedynczym szydełkiem, charakteryzująca się węzełkową strukturą, łańcuszkowym wykończeniem na szczycie rzędu oraz mniejszą sprężystością niż dzianina na drutach.',
    rowCountingTip:
      'Licz poziome pasma „warkoczyków” tworzonych przez główki słupków na szczycie każdego rzędu.',
    curlingAdvice:
      'Szydełko z reguły tworzy grubszą i bardziej zwartą strukturę niż druty. Uważaj na naprężenie nitki, by robótka nie falowała.',
    glossaryTermQuery: 'słupek',
  },
};

/**
 * Zwraca pytanie dla danego numeru kroku (0-indeksowane: 0, 1, 2).
 */
export function getQuestionByStep(stepIndex: number): StitchQuestion | null {
  return STITCH_IDENTIFIER_QUESTIONS[stepIndex] ?? null;
}

/**
 * Deterministycznie dopasowuje strukturę ściegu na podstawie udzielonych odpowiedzi.
 */
export function identifyStitch(answers: Record<string, string>): StitchMatchResult {
  const surface = answers['surface_texture'];
  const reverse = answers['reversibility'];
  const edge = answers['edge_and_stretch'];

  // 1. Szydełko
  if (surface === 'crochet_knots') {
    return STITCH_CATALOG['crochet_basic'];
  }

  // 2. Ażur
  if (surface === 'holes' || edge === 'airy_lace') {
    return STITCH_CATALOG['lace_eyelet'];
  }

  // 3. Warkocze
  if (surface === 'cables' || reverse === 'flat_background') {
    return STITCH_CATALOG['cable_c6f'];
  }

  // 4. Ściągacz
  if (surface === 'ribs' || edge === 'elastic_accordion') {
    return STITCH_CATALOG['ribbing'];
  }

  // 5. Ścieg ryżowy (ziarnisty)
  if (surface === 'grains' && (reverse === 'identical' || edge === 'lays_flat')) {
    return STITCH_CATALOG['seed_stitch'];
  }

  // 6. Ścieg francuski (poziome grzbiety + dwustronny + leży płasko)
  if (
    (surface === 'ridges' && (reverse === 'identical' || edge === 'lays_flat')) ||
    (reverse === 'identical' && edge === 'lays_flat')
  ) {
    return STITCH_CATALOG['garter'];
  }

  // 7. Dżersej odwrócony (fale z przodu, kolumienki V z tyłu)
  if (surface === 'ridges' && reverse === 'different_v') {
    return STITCH_CATALOG['reverse_stockinette'];
  }

  // 8. Klasyczny dżersej (kolumny V z przodu + rolujące brzegi lub inna lewa strona)
  if (surface === 'v_columns') {
    return STITCH_CATALOG['stockinette'];
  }

  // Domyślne dopasowanie zależne od powierzchni
  if (surface === 'grains') {
    return STITCH_CATALOG['seed_stitch'];
  }

  return STITCH_CATALOG['stockinette'];
}
