/**
 * Moduł 16: Biblioteka Technik i Karty Rzemieślnicze (Craft Technique Library & Cards)
 * Standardy: DEC-13 (Rysowane kodem), DEC-19 (Prawo- i Leworęczność), DEC-20 (21 Kart w MVP),
 * BR-BIB-001..008, CYC Standards, Inwariant ZP-05 (Zero generatywnego AI, deterministyczna wiedza).
 */

export type TechniqueDiscipline = 'knitting' | 'crochet';
export type TechniqueLevel = 'beginner' | 'intermediate' | 'advanced';
export type Handedness = 'right' | 'left';

export interface TechniqueStep {
  stepNumber: number;
  instruction: string;
  hint?: string;
}

export interface TechniqueVisualSchema {
  primaryShape: 'loop' | 'cross' | 'knot' | 'bar' | 'chain' | 'spiral';
  needleAction: string;
  yarnPath: string;
  accentColor: string;
  viewBox: string;
}

export interface TechniqueCard {
  id: string;
  titlePl: string;
  titleEn: string;
  discipline: TechniqueDiscipline;
  level: TechniqueLevel;
  abbreviation: string;
  categoryLabel: string;
  summary: string;
  rightHandedSteps: TechniqueStep[];
  leftHandedSteps: TechniqueStep[];
  commonMistakes: string[];
  proTip: string;
  visualSchema: TechniqueVisualSchema;
}

export const TECHNIQUE_CARDS: TechniqueCard[] = [
  // ==========================================
  // 12 TECHNIK DRUTOWYCH (KNITTING) - DEC-20
  // ==========================================
  {
    id: 'long_tail_cast_on',
    titlePl: 'Nabieranie oczek z długim ogonem',
    titleEn: 'Long-Tail Cast-On',
    discipline: 'knitting',
    level: 'beginner',
    abbreviation: 'CO',
    categoryLabel: 'Nabieranie',
    summary: 'Najpopularniejsza, uniwersalna metoda nabierania oczek łącząca elastyczność z estetycznym, równym brzegiem.',
    rightHandedSteps: [
      { stepNumber: 1, instruction: 'Odmierz długi ogon włóczki (ok. 3x szerokość robótki) i utwórz pętlę początkową na prawym drucie.' },
      { stepNumber: 2, instruction: 'Ułóż nitki w dłoni w kształt procy: ogon na kciuku, nitkę od motka na palcu wskazującym.', hint: 'Trzymaj końce pewnie pozostałymi trzema palcami.' },
      { stepNumber: 3, instruction: 'Wbij drut od dołu pod pętlę na kciuku, a następnie chwyć od góry nitkę z palca wskazującego.' },
      { stepNumber: 4, instruction: 'Przeciągnij nitkę przez pętlę na kciuku, zsuń pętlę z kciuka i delikatnie dociągnij nowe oczko na drucie.' },
    ],
    leftHandedSteps: [
      { stepNumber: 1, instruction: 'Odmierz długi ogon włóczki (ok. 3x szerokość robótki) i utwórz pętlę początkową na lewym drucie.' },
      { stepNumber: 2, instruction: 'Ułóż nitki w lewej dłoni w kształt procy: ogon na lewym kciuku, nitkę od motka na palcu wskazującym.', hint: 'Trzymaj końce pewnie pozostałymi trzema palcami.' },
      { stepNumber: 3, instruction: 'Wbij lewy drut od dołu pod pętlę na lewym kciuku, a następnie chwyć od góry nitkę z lewego palca wskazującego.' },
      { stepNumber: 4, instruction: 'Przeciągnij nitkę przez pętlę na kciuku, zsuń pętlę z kciuka i delikatnie dociągnij nowe oczko na lewym drucie.' },
    ],
    commonMistakes: [
      'Za mocne zaciskanie oczek na drucie uniemożliwiające wbicie w pierwszym rzędzie.',
      'Zbyt krótki ogon włóczki, skutkujący przerwaniem nabierania przed osiągnięciem liczby oczek.',
    ],
    proTip: 'Nabieraj oczka na dwa złożone druty lub zachowuj odstęp grubości zapałki między oczkami, by brzeg pozostał idealnie sprężysty.',
    visualSchema: {
      primaryShape: 'loop',
      needleAction: 'Wkłucie od dołu pod kciuk i przeciągnięcie nitki wskazującej',
      yarnPath: 'Kciuk -> Drut -> Palec wskazujący -> Pętla',
      accentColor: '#10B981',
      viewBox: '0 0 100 100',
    },
  },
  {
    id: 'knit_stitch',
    titlePl: 'Oczko prawe',
    titleEn: 'Knit Stitch',
    discipline: 'knitting',
    level: 'beginner',
    abbreviation: 'k',
    categoryLabel: 'Ściegi podstawowe',
    summary: 'Fundament dziewiarstwa. Tworzy charakterystyczne, gładkie literki V na prawej stronie dzianiny.',
    rightHandedSteps: [
      { stepNumber: 1, instruction: 'Włóczka z tyłu robótki. Wbij prawy drut od przodu do tyłu w przednią nóżkę pierwszego oczka na lewym drucie.' },
      { stepNumber: 2, instruction: 'Nawiń włóczkę na prawy drut od dołu do góry w kierunku przeciwnym do ruchu wskazówek zegara.' },
      { stepNumber: 3, instruction: 'Przeciągnij nową pętlę prawym drutem przez oczko na lewym drucie ku przodowi.' },
      { stepNumber: 4, instruction: 'Zsuń przerobione stare oczko z lewego drutu.' },
    ],
    leftHandedSteps: [
      { stepNumber: 1, instruction: 'Włóczka z tyłu robótki. Wbij lewy drut od przodu do tyłu w przednią nóżkę oczka znajdującego się na prawym drucie.' },
      { stepNumber: 2, instruction: 'Nawiń włóczkę na lewy drut zgodnie z ruchem wskazówek zegara z tyłu robótki.' },
      { stepNumber: 3, instruction: 'Przeciągnij nową pętlę lewym drutem przez oczko na prawym drucie ku przodowi.' },
      { stepNumber: 4, instruction: 'Zsuń przerobione stare oczko z prawego drutu.' },
    ],
    commonMistakes: [
      'Wbijanie drutu za tylną nóżkę (przekręca oczko w ścieg przekręcony ktbl).',
      'Prowadzenie nitki z przodu robótki, co tworzy przypadkowy narzut.',
    ],
    proTip: 'Pracuj czubkami drutów, ale przesuwaj oczka na grubszy trzon drutu przed dociągnięciem, aby zachować idealne napięcie.',
    visualSchema: {
      primaryShape: 'cross',
      needleAction: 'Drut roboczy wchodzi od lewej ku prawej przez przednią nóżkę',
      yarnPath: 'Od dołu wokół prawego drutu, wyciągnięcie ku przodowi',
      accentColor: '#3B82F6',
      viewBox: '0 0 100 100',
    },
  },
  {
    id: 'purl_stitch',
    titlePl: 'Oczko lewe',
    titleEn: 'Purl Stitch',
    discipline: 'knitting',
    level: 'beginner',
    abbreviation: 'p',
    categoryLabel: 'Ściegi podstawowe',
    summary: 'Odwrotność oczka prawego. Tworzy poziomą wypukłą falkę (garbik) na powierzchni dzianiny.',
    rightHandedSteps: [
      { stepNumber: 1, instruction: 'Włóczka z przodu robótki. Wbij prawy drut od tyłu ku przodowi (od prawej do lewej) w przednią nóżkę oczka.' },
      { stepNumber: 2, instruction: 'Nawiń nitkę wokół prawego drutu przeciwnie do wskazówek zegara.' },
      { stepNumber: 3, instruction: 'Popchnij prawy drut do tyłu, przeciągając nową pętlę przez stare oczko.' },
      { stepNumber: 4, instruction: 'Zsuń stare oczko z lewego drutu.' },
    ],
    leftHandedSteps: [
      { stepNumber: 1, instruction: 'Włóczka z przodu robótki. Wbij lewy drut od tyłu ku przodowi (od lewej do prawej) w przednią nóżkę oczka.' },
      { stepNumber: 2, instruction: 'Nawiń nitkę wokół lewego drutu zgodnie z ruchem wskazówek zegara.' },
      { stepNumber: 3, instruction: 'Popchnij lewy drut do tyłu, przeciągając nową pętlę przez stare oczko.' },
      { stepNumber: 4, instruction: 'Zsuń stare oczko z prawego drutu.' },
    ],
    commonMistakes: [
      'Pozostawienie nitki z tyłu przy wbijaniu drutu.',
      'Luźniejsze przerabianie lewych oczek niż prawych (tzw. rowbing / pasy w ściegu pończoszniczym).',
    ],
    proTip: 'Podczas przerabiania lewych oczek przytrzymuj palcem nitkę blisko drutu, by zapobiec rozciąganiu oczek.',
    visualSchema: {
      primaryShape: 'bar',
      needleAction: 'Wkłucie od prawej do lewej z nitką z przodu',
      yarnPath: 'Oplot dookoła drutu od góry do dołu, wypchnięcie ku tyłowi',
      accentColor: '#F59E0B',
      viewBox: '0 0 100 100',
    },
  },
  {
    id: 'standard_bind_off',
    titlePl: 'Tradycyjne zamykanie oczek',
    titleEn: 'Traditional Bind-Off',
    discipline: 'knitting',
    level: 'beginner',
    abbreviation: 'BO',
    categoryLabel: 'Zamykanie',
    summary: 'Klasyczne wykończenie krawędzi dzianiny polegające na przeciąganiu kolejnych oczek przez siebie.',
    rightHandedSteps: [
      { stepNumber: 1, instruction: 'Przerób 2 pierwsze oczka zgodnie ze wzorem (np. na prawo).' },
      { stepNumber: 2, instruction: 'Wbij lewy drut w pierwsze (prawe) oczko na prawym drucie.' },
      { stepNumber: 3, instruction: 'Przeciągnij to pierwsze oczko nad drugim oczkiem i zsuń je całkowicie z drutu (1 oczko zamknięte).' },
      { stepNumber: 4, instruction: 'Przerób kolejne oczko i powtarzaj przeciąganie, aż na drucie zostanie 1 ostatnie oczko.' },
    ],
    leftHandedSteps: [
      { stepNumber: 1, instruction: 'Przerób 2 pierwsze oczka zgodnie ze wzorem (np. na prawo).' },
      { stepNumber: 2, instruction: 'Wbij prawy drut w pierwsze (lewe) oczko na lewym drucie.' },
      { stepNumber: 3, instruction: 'Przeciągnij to pierwsze oczko nad drugim oczkiem i zsuń je całkowicie z drutu (1 oczko zamknięte).' },
      { stepNumber: 4, instruction: 'Przerób kolejne oczko i powtarzaj przeciąganie, aż na lewym drucie zostanie 1 ostatnie oczko.' },
    ],
    commonMistakes: [
      'Zbyt ciasne zamykanie, które ściąga brzeg i pozbawia go elastyczności (zwłaszcza w dekoltach i ściągaczach).',
    ],
    proTip: 'Do zamykania oczek użyj drutu roboczego o 0.5–1.0 mm grubszego niż główny rozmiar projektu.',
    visualSchema: {
      primaryShape: 'chain',
      needleAction: 'Przeciągnięcie oczka n-1 nad oczkiem n i upuszczenie',
      yarnPath: 'Łańcuszek zamykający wzdłuż górnej krawędzi',
      accentColor: '#EF4444',
      viewBox: '0 0 100 100',
    },
  },
  {
    id: 'elastic_bind_off',
    titlePl: 'Elastyczne zamykanie oczek (Jeny)',
    titleEn: "Jeny's Surprisingly Stretchy Bind-Off",
    discipline: 'knitting',
    level: 'intermediate',
    abbreviation: 'JSSBO',
    categoryLabel: 'Zamykanie',
    summary: 'Niezwykle elastyczne zamykanie ze specjalnym narzutem, idealne do mankietów skarpet od palców i wywijanych ściągaczy.',
    rightHandedSteps: [
      { stepNumber: 1, instruction: 'Zrób odwrotny narzut na prawy drut, przerób pierwsze oczko na prawo.' },
      { stepNumber: 2, instruction: 'Przeciągnij narzut nad przerobionym oczkiem.' },
      { stepNumber: 3, instruction: 'Zrób kolejny narzut na prawy drut, przerób następne oczko zgodnie ze wzorem.' },
      { stepNumber: 4, instruction: 'Przeciągnij narzut nad nowym oczkiem, a następnie przeciągnij poprzednie oczko nad nowym oczkiem.' },
    ],
    leftHandedSteps: [
      { stepNumber: 1, instruction: 'Zrób odwrotny narzut na lewy drut, przerób pierwsze oczko na prawo.' },
      { stepNumber: 2, instruction: 'Przeciągnij narzut nad przerobionym oczkiem na lewym drucie.' },
      { stepNumber: 3, instruction: 'Zrób kolejny narzut na lewy drut, przerób następne oczko zgodnie ze wzorem.' },
      { stepNumber: 4, instruction: 'Przeciągnij narzut nad nowym oczkiem, a potem poprzednie oczko nad nowym oczkiem.' },
    ],
    commonMistakes: [
      'Mylenie kierunku narzutu przed oczkami prawymi i lewymi.',
    ],
    proTip: 'Przed oczkiem prawym wykonaj narzut odwrotny (od tyłu do przodu), a przed lewym narzut standardowy.',
    visualSchema: {
      primaryShape: 'spiral',
      needleAction: 'Narzut kompensacyjny przeciągany wspólnie z oczkiem',
      yarnPath: 'Zygzak elastyczny rozciągliwy do 200% obwodu',
      accentColor: '#8B5CF6',
      viewBox: '0 0 100 100',
    },
  },
  {
    id: 'k2tog',
    titlePl: 'Dwa oczka razem na prawo (w prawo)',
    titleEn: 'Knit Two Together',
    discipline: 'knitting',
    level: 'beginner',
    abbreviation: 'k2tog',
    categoryLabel: 'Redukcje',
    summary: 'Klasyczne odejmowanie oczek pochylające się symetrycznie w prawą stronę.',
    rightHandedSteps: [
      { stepNumber: 1, instruction: 'Wbij prawy drut jednocześnie w dwa pierwsze oczka na lewym drucie od przodu (jak do oczka prawego).' },
      { stepNumber: 2, instruction: 'Nawiń włóczkę wokół prawego drutu.' },
      { stepNumber: 3, instruction: 'Przeciągnij pętlę przez OBA oczka naraz.' },
      { stepNumber: 4, instruction: 'Zsuń oba oczka z lewego drutu (zmniejszenie o 1 oczko).' },
    ],
    leftHandedSteps: [
      { stepNumber: 1, instruction: 'Wbij lewy drut jednocześnie w dwa pierwsze oczka na prawym drucie od przodu.' },
      { stepNumber: 2, instruction: 'Nawiń włóczkę wokół lewego drutu.' },
      { stepNumber: 3, instruction: 'Przeciągnij pętlę przez oba oczka naraz ku przodowi.' },
      { stepNumber: 4, instruction: 'Zsuń oba oczka z prawego drutu (pochylenie w prawo dla leworęcznych).' },
    ],
    commonMistakes: [
      'Złapanie tylko jednego oczka zamiast dwóch przy ciasnej dzianinie.',
    ],
    proTip: 'Przed wbiciem drutu lekko rozluźnij oba oczka, przesuwając je czubkiem drutu w przód.',
    visualSchema: {
      primaryShape: 'cross',
      needleAction: 'Drut penetruje oczko 2 i 1 równolegle, tworząc spadek prawy',
      yarnPath: 'Jedna nić spinająca parę nóżek z nachyleniem 45° w prawo',
      accentColor: '#EC4899',
      viewBox: '0 0 100 100',
    },
  },
  {
    id: 'ssk',
    titlePl: 'Slip, Slip, Knit (spadek w lewo)',
    titleEn: 'Slip Slip Knit',
    discipline: 'knitting',
    level: 'intermediate',
    abbreviation: 'SSK',
    categoryLabel: 'Redukcje',
    summary: 'Redukcja o 1 oczko pochylająca się symetrycznie w lewą stronę, tworząca parę z k2tog.',
    rightHandedSteps: [
      { stepNumber: 1, instruction: 'Zdejmij pierwsze oczko jak do oczka prawego (od przodu) na prawy drut bez przerabiania.' },
      { stepNumber: 2, instruction: 'Zdejmij drugie oczko jak do oczka prawego na prawy drut.' },
      { stepNumber: 3, instruction: 'Wbij lewy drut od przodu w oba zdjęte oczka na prawym drucie.' },
      { stepNumber: 4, instruction: 'Przerób oba oczka razem na prawo za tylne nóżki.' },
    ],
    leftHandedSteps: [
      { stepNumber: 1, instruction: 'Zdejmij pierwsze oczko jak do oczka prawego na lewy drut bez przerabiania.' },
      { stepNumber: 2, instruction: 'Zdejmij drugie oczko jak do oczka prawego na lewy drut.' },
      { stepNumber: 3, instruction: 'Wbij prawy drut od przodu w oba zdjęte oczka na lewym drucie.' },
      { stepNumber: 4, instruction: 'Przerób oba oczka razem na prawo za tylne nóżki.' },
    ],
    commonMistakes: [
      'Zdejmowanie oczek jak do oczka lewego (co uniemożliwia odkręcenie nóżek i daje zniekształcony splot).',
    ],
    proTip: 'Drugie oczko możesz zdjąć jak do oczka lewego (tzw. improved SSK), co sprawia, że lewe pochylenie jest jeszcze bardziej płaskie.',
    visualSchema: {
      primaryShape: 'cross',
      needleAction: 'Przełożenie oczek ze zmianą orientacji nóżek i przerobienie tbl',
      yarnPath: 'Oczka nakładają się z pochyleniem 45° w lewo',
      accentColor: '#6366F1',
      viewBox: '0 0 100 100',
    },
  },
  {
    id: 'm1l',
    titlePl: 'Dodawanie oczka z poprzeczki w lewo',
    titleEn: 'Make 1 Left',
    discipline: 'knitting',
    level: 'intermediate',
    abbreviation: 'M1L',
    categoryLabel: 'Dodawanie',
    summary: 'Niewidoczne dodawanie oczka z poprzeczki między oczkami, pochylające się ku lewej stronie (idealne w raglanie).',
    rightHandedSteps: [
      { stepNumber: 1, instruction: 'Zlokalizuj poziomą nitkę (poprzeczkę) biegnącą między oczkiem na lewym i prawym drucie.' },
      { stepNumber: 2, instruction: 'Podnieś poprzeczkę lewym drutem od przodu do tyłu.' },
      { stepNumber: 3, instruction: 'Wbij prawy drut w tę podniesioną pętelkę za tylną nóżkę (od prawej do lewej z tyłu).' },
      { stepNumber: 4, instruction: 'Przerób na prawo. Skręcenie pętelki zamyka dziurkę.' },
    ],
    leftHandedSteps: [
      { stepNumber: 1, instruction: 'Zlokalizuj poziomą poprzeczkę między drutami.' },
      { stepNumber: 2, instruction: 'Podnieś poprzeczkę prawym drutem od przodu do tyłu.' },
      { stepNumber: 3, instruction: 'Wbij lewy drut w podniesioną pętelkę za tylną nóżkę.' },
      { stepNumber: 4, instruction: 'Przerób na prawo, zamykając dziurkę.' },
    ],
    commonMistakes: [
      'Przerobienie poprzeczki za przednią nóżkę, co zamiast niewidocznego przyrostu tworzy wielką dziurkę ażurową.',
    ],
    proTip: 'Zapamiętaj mnemotechnikę: M1L = Left = od przodu (Left/Front), przerabiamy z tyłu.',
    visualSchema: {
      primaryShape: 'bar',
      needleAction: 'Uniesienie poprzeczki front-to-back i przerobienie przez tylną nóżkę',
      yarnPath: 'Skręcona pętla poprzeczki zamykająca prześwit',
      accentColor: '#0EA5E9',
      viewBox: '0 0 100 100',
    },
  },
  {
    id: 'm1r',
    titlePl: 'Dodawanie oczka z poprzeczki w prawo',
    titleEn: 'Make 1 Right',
    discipline: 'knitting',
    level: 'intermediate',
    abbreviation: 'M1R',
    categoryLabel: 'Dodawanie',
    summary: 'Niewidoczne dodawanie oczka z poprzeczki pochylające się ku prawej stronie.',
    rightHandedSteps: [
      { stepNumber: 1, instruction: 'Zlokalizuj poprzeczkę między ostatnim przerobionym a kolejnym oczkiem.' },
      { stepNumber: 2, instruction: 'Podnieś poprzeczkę lewym drutem od tyłu do przodu.' },
      { stepNumber: 3, instruction: 'Wbij prawy drut w uniesioną pętelkę od przodu za przednią nóżkę.' },
      { stepNumber: 4, instruction: 'Przerób na prawo. Pętla skręca się w prawo, maskując dziurkę.' },
    ],
    leftHandedSteps: [
      { stepNumber: 1, instruction: 'Zlokalizuj poprzeczkę między drutami.' },
      { stepNumber: 2, instruction: 'Podnieś poprzeczkę prawym drutem od tyłu do przodu.' },
      { stepNumber: 3, instruction: 'Wbij lewy drut w uniesioną pętelkę od przodu za przednią nóżkę.' },
      { stepNumber: 4, instruction: 'Przerób na prawo, zamykając dziurkę w prawo.' },
    ],
    commonMistakes: [
      'Mylenie kierunku podnoszenia poprzeczki z M1L.',
    ],
    proTip: 'Zapamiętaj mnemotechnikę: M1R = Right = od tyłu (I will be Right Back), przerabiamy z przodu.',
    visualSchema: {
      primaryShape: 'bar',
      needleAction: 'Uniesienie poprzeczki back-to-front i przerobienie przez przednią nóżkę',
      yarnPath: 'Skręcona pętla poprzeczki nachylona w prawo',
      accentColor: '#14B8A6',
      viewBox: '0 0 100 100',
    },
  },
  {
    id: 'yarn_over',
    titlePl: 'Narzut (ażury i dodawanie)',
    titleEn: 'Yarn Over',
    discipline: 'knitting',
    level: 'beginner',
    abbreviation: 'YO',
    categoryLabel: 'Dodawanie',
    summary: 'Dodanie 1 oczka przez owinięcie nitki wokół drutu bez wbijania w oczko. Tworzy ozdobną dziurkę w ażurach.',
    rightHandedSteps: [
      { stepNumber: 1, instruction: 'Przełóż włóczkę między drutami do przodu robótki.' },
      { stepNumber: 2, instruction: 'Nawiń włóczkę na prawy drut od przodu do tyłu ponad drutem.' },
      { stepNumber: 3, instruction: 'Przytrzymaj narzuconą pętelkę palcem wskazującym i przerób kolejne oczko zgodnie ze wzorem.' },
    ],
    leftHandedSteps: [
      { stepNumber: 1, instruction: 'Przełóż włóczkę między drutami do przodu robótki.' },
      { stepNumber: 2, instruction: 'Nawiń włóczkę na lewy drut od przodu do tyłu ponad drutem.' },
      { stepNumber: 3, instruction: 'Przytrzymaj pętelkę palcem i przerób następne oczko.' },
    ],
    commonMistakes: [
      'Podwójne owinięcie drutu powodujące zbyt dużą dziurę, chyba że wzór jawnie wymaga Double YO.',
    ],
    proTip: 'W rzędzie powrotnym przerabiaj narzut normalnie na lewo/prawo bez skręcania, aby uzyskać czystą geometrię ażuru.',
    visualSchema: {
      primaryShape: 'loop',
      needleAction: 'Swobodny oplot nitki nad prawym drutem od przodu do tyłu',
      yarnPath: 'Pętla wisząca nad drutem tworząca oczko ażurowe',
      accentColor: '#F97316',
      viewBox: '0 0 100 100',
    },
  },
  {
    id: 'german_short_row',
    titlePl: 'Rzędy skrócone GSR (podwójne oczko)',
    titleEn: 'German Short Row (Double Stitch)',
    discipline: 'knitting',
    level: 'intermediate',
    abbreviation: 'GSR / DS',
    categoryLabel: 'Kształtowanie',
    summary: 'Najczystsza metoda rzędów skróconych do modelowania podkroju dekoltu, pięty skarpet i karczków raglanowych.',
    rightHandedSteps: [
      { stepNumber: 1, instruction: 'Przerób zadaną liczbę oczek, odwróć robótkę na drugą stronę.' },
      { stepNumber: 2, instruction: 'Trzymając nitkę z przodu robótki, zdejmij pierwsze oczko jak do oczka lewego na prawy drut.' },
      { stepNumber: 3, instruction: 'Pociągnij mocno nitkę roboczą w górę i do tyłu ponad drutem, aż obie nóżki oczka wyjdą na drut, tworząc podwójne oczko (DS).' },
      { stepNumber: 4, instruction: 'Kontynuuj rząd zgodnie ze wzorem. W kolejnym rzędzie przerób obie nóżki podwójnego oczka razem jak jedno oczko.' },
    ],
    leftHandedSteps: [
      { stepNumber: 1, instruction: 'Przerób wskazaną liczbę oczek, odwróć robótkę na drugą stronę.' },
      { stepNumber: 2, instruction: 'Trzymając nitkę z przodu, zdejmij pierwsze oczko na lewy drut jak do lewego.' },
      { stepNumber: 3, instruction: 'Pociągnij nitkę mocno w górę i do tyłu ponad lewym drutem, formując podwójne oczko (DS).' },
      { stepNumber: 4, instruction: 'Przerabiaj dalej. W kolejnym podejściu przerób obie nóżki DS razem jako jedno oczko.' },
    ],
    commonMistakes: [
      'Zbyt słabe pociągnięcie nitki przy tworzeniu DS, co skutkuje widoczną dziurką w miejscu nawrotu.',
    ],
    proTip: 'Przerabiając DS w następnym rzędzie, upewnij się, że drut przechodzi pod obydwoma ramionami podwójnego oczka.',
    visualSchema: {
      primaryShape: 'loop',
      needleAction: 'Pociągnięcie oczka w górę i do tyłu eksponujące parę nóżek',
      yarnPath: 'Podwójna pętla naprężona bez dziurki obrotowej',
      accentColor: '#A855F7',
      viewBox: '0 0 100 100',
    },
  },
  {
    id: 'kitchener_stitch',
    titlePl: 'Ścieg dziewiarski (Kitchener Stitch)',
    titleEn: 'Kitchener Stitch / Grafting',
    discipline: 'knitting',
    level: 'advanced',
    abbreviation: 'Grafting',
    categoryLabel: 'Łączenie',
    summary: 'Niewidoczne łączenie igłą dziewiarską dwóch otwartych brzegów dzianiny imitujące rząd oczek prawych (czubki skarpet).',
    rightHandedSteps: [
      { stepNumber: 1, instruction: 'Ułóż druty równolegle z otwartymi oczkami, nitka robocza nawleczona na tępą igłę dziewiarską.' },
      { stepNumber: 2, instruction: 'Przygotowanie: Wbij igłę w 1. oczko przedniego drutu jak do lewego (zostaw na drucie), w 1. oczko tylnego drutu jak do prawego (zostaw).' },
      { stepNumber: 3, instruction: 'Krok przedni: Wbij w 1. oczko przednie jak do prawego (zsuń), w kolejne przednie jak do lewego (zostaw na drucie).' },
      { stepNumber: 4, instruction: 'Krok tylny: Wbij w 1. oczko tylne jak do lewego (zsuń), w kolejne tylne jak do prawego (zostaw na drucie). Powtarzaj kroki 3 i 4.' },
    ],
    leftHandedSteps: [
      { stepNumber: 1, instruction: 'Ułóż druty równolegle, trzymając robótkę lewą ręką, z igłą dziewiarską w lewej dłoni.' },
      { stepNumber: 2, instruction: 'Przygotowanie: Wbij igłę w oczko przednie jak do lewego (zostaw), w oczko tylne jak do prawego (zostaw).' },
      { stepNumber: 3, instruction: 'Krok przedni: Wbij w 1. oczko przednie jak do prawego (zsuń), w kolejne przednie jak do lewego (zostaw).' },
      { stepNumber: 4, instruction: 'Krok tylny: Wbij w 1. oczko tylne jak do lewego (zsuń), w kolejne tylne jak do prawego (zostaw). Powtarzaj kroki 3 i 4.' },
    ],
    commonMistakes: [
      'Zbyt mocne ściąganie nitki po każdym kroku (powstaje twardy, ciasny szew zamiast elastycznego rzędu).',
    ],
    proTip: 'Rytm pamięciowy: Przedni: Prawe zsuń, Lewe zostaw. Tylny: Lewe zsuń, Prawe zostaw. Dociągaj nitkę dopiero po co 2-3 krokach.',
    visualSchema: {
      primaryShape: 'chain',
      needleAction: 'Igła przewleka nić po śladzie ósemkowym imitującym oczka dżerseju',
      yarnPath: 'Front (k zsuń, p zostaw) -> Back (p zsuń, k zostaw)',
      accentColor: '#059669',
      viewBox: '0 0 100 100',
    },
  },

  // ==========================================
  // 9 TECHNIK SZYDEŁKOWYCH (CROCHET) - DEC-20
  // ==========================================
  {
    id: 'slip_knot_and_chain',
    titlePl: 'Pętla początkowa i łańcuszek',
    titleEn: 'Slip Knot and Foundation Chain',
    discipline: 'crochet',
    level: 'beginner',
    abbreviation: 'ch',
    categoryLabel: 'Podstawy',
    summary: 'Początek niemal każdego projektu szydełkowego. Tworzy elastyczny fundament pod pierwsze słupki lub półsłupki.',
    rightHandedSteps: [
      { stepNumber: 1, instruction: 'Utwórz pętlę ze skrzyżowanych nitek, przeciągnij nitkę roboczą przez pętlę i zaciśnij na szydełku.' },
      { stepNumber: 2, instruction: 'Chwyć szydełko w prawą dłoń, nitkę roboczą owiń wokół palca wskazującego lewej dłoni.' },
      { stepNumber: 3, instruction: 'Nawiń nitkę na szydełko od tyłu ku przodowi (yarn over).' },
      { stepNumber: 4, instruction: 'Obróć haczyk lekko w dół i przeciągnij nitkę przez pętlę na szydełku. Powtarzaj, licząc oczka.' },
    ],
    leftHandedSteps: [
      { stepNumber: 1, instruction: 'Utwórz pętlę początkową i zaciśnij na szydełku trzymanym w lewej dłoni.' },
      { stepNumber: 2, instruction: 'Nitkę roboczą napręż na palcu wskazującym prawej dłoni.' },
      { stepNumber: 3, instruction: 'Nawiń nitkę na szydełko od tyłu ku przodowi haczykiem lewej dłoni.' },
      { stepNumber: 4, instruction: 'Przeciągnij nitkę przez pętlę na szydełku, tworząc kolejne oczka łańcuszka.' },
    ],
    commonMistakes: [
      'Zbyt ścisły łańcuszek uniemożliwiający wkłucie szydełka w pierwszym rzędzie.',
    ],
    proTip: 'Wykonaj łańcuszek szydełkiem o 0.5 mm większym niż reszta projektu, aby brzeg nie ściągał robótki w łuk.',
    visualSchema: {
      primaryShape: 'chain',
      needleAction: 'Narzut i przeciągnięcie przez pętlę roboczą',
      yarnPath: 'Seria zagnieżdżonych pętli w kształcie literek V',
      accentColor: '#10B981',
      viewBox: '0 0 100 100',
    },
  },
  {
    id: 'single_crochet',
    titlePl: 'Półsłupek (US sc / UK dc)',
    titleEn: 'Single Crochet (US) / Double Crochet (UK)',
    discipline: 'crochet',
    level: 'beginner',
    abbreviation: 'sc',
    categoryLabel: 'Ściegi podstawowe',
    summary: 'Zwarty, gęsty ścieg szydełkowy. Podstawa zabawek amigurumi, koszyków i ciepłych akcesoriów.',
    rightHandedSteps: [
      { stepNumber: 1, instruction: 'Wbij szydełko pod obie nitki (V) wskazanego oczka w rzędzie.' },
      { stepNumber: 2, instruction: 'Nawiń włóczkę na szydełko od tyłu do przodu.' },
      { stepNumber: 3, instruction: 'Przeciągnij nitkę przez oczko — masz teraz 2 pętle na szydełku.' },
      { stepNumber: 4, instruction: 'Nawiń włóczkę ponownie i przeciągnij przez obie pętle na szydełku (1 pętla pozostaje).' },
    ],
    leftHandedSteps: [
      { stepNumber: 1, instruction: 'Wbij szydełko lewą dłonią pod obie nitki oczka od prawej do lewej.' },
      { stepNumber: 2, instruction: 'Nawiń nitkę na szydełko prawą dłonią.' },
      { stepNumber: 3, instruction: 'Przeciągnij nitkę przez oczko (2 pętle na szydełku).' },
      { stepNumber: 4, instruction: 'Nawiń nitkę i przeciągnij przez obie pętle naraz.' },
    ],
    commonMistakes: [
      'Wbijanie szydełka tylko pod jedną nóżkę oczka (chyba że wzór specyfikuje BLO lub FLO).',
    ],
    proTip: 'W amigurumi przerabiaj metodą Yarn Under (krzyżyki zamiast literek V), co daje jeszcze ściślejszą strukturę bez prześwitów wypełnienia.',
    visualSchema: {
      primaryShape: 'knot',
      needleAction: 'Wkłucie -> pobranie nici -> narzut -> przeciągnięcie przez 2 pętle',
      yarnPath: 'Zwarty pionowy słupek o wysokości 1 oczka łańcuszka',
      accentColor: '#3B82F6',
      viewBox: '0 0 100 100',
    },
  },
  {
    id: 'double_crochet',
    titlePl: 'Słupek (US dc / UK tr)',
    titleEn: 'Double Crochet (US) / Treble Crochet (UK)',
    discipline: 'crochet',
    level: 'beginner',
    abbreviation: 'dc',
    categoryLabel: 'Ściegi podstawowe',
    summary: 'Dwa razy wyższy niż półsłupek, miękki i przewiewny. Klasyczny element pledów, kwadratów babuni i odzieży.',
    rightHandedSteps: [
      { stepNumber: 1, instruction: 'Nawiń włóczkę na szydełko (yarn over).' },
      { stepNumber: 2, instruction: 'Wbij szydełko w oczko, nawiń nitkę i wyciągnij pętlę (3 pętle na szydełku).' },
      { stepNumber: 3, instruction: 'Nawiń nitkę i przeciągnij przez pierwsze 2 pętle na szydełku (zostają 2 pętle).' },
      { stepNumber: 4, instruction: 'Nawiń nitkę ponownie i przeciągnij przez pozostałe 2 pętle (1 pętla zostaje).' },
    ],
    leftHandedSteps: [
      { stepNumber: 1, instruction: 'Nawiń włóczkę na szydełko trzymane w lewej ręce.' },
      { stepNumber: 2, instruction: 'Wbij szydełko w oczko, nawiń nitkę i wyciągnij (3 pętle na szydełku).' },
      { stepNumber: 3, instruction: 'Nawiń nitkę i przeciągnij przez 2 pętle (zostają 2 pętle).' },
      { stepNumber: 4, instruction: 'Nawiń nitkę i przeciągnij przez 2 ostatnie pętle.' },
    ],
    commonMistakes: [
      'Gubienie pierwszego lub ostatniego słupka w rzędzie, co powoduje zwężanie się robótki.',
    ],
    proTip: 'Na początku rzędu zamiast 3 oczek łańcuszka zwrotnego zastosuj tzw. stojący słupek (standing dc), by uniknąć dziury na brzegu.',
    visualSchema: {
      primaryShape: 'bar',
      needleAction: 'Narzut przed wkłuciem, redukcja pętli parami: 3 -> 2 -> 1',
      yarnPath: 'Wysoki słupek z pojedynczą poziomą poprzeczką',
      accentColor: '#F59E0B',
      viewBox: '0 0 100 100',
    },
  },
  {
    id: 'half_double_crochet',
    titlePl: 'Półsłupek z narzutem (US hdc / UK htr)',
    titleEn: 'Half Double Crochet (US) / Half Treble (UK)',
    discipline: 'crochet',
    level: 'beginner',
    abbreviation: 'hdc',
    categoryLabel: 'Ściegi podstawowe',
    summary: 'Średnia wysokość między półsłupkiem a słupkiem. Posiada unikalną trzecią pętelkę tworzącą efekt dżerseju na szydełku.',
    rightHandedSteps: [
      { stepNumber: 1, instruction: 'Nawiń nitkę na szydełko (narzut).' },
      { stepNumber: 2, instruction: 'Wbij szydełko w oczko, nawiń nitkę i wyciągnij (3 pętle na szydełku).' },
      { stepNumber: 3, instruction: 'Nawiń nitkę na szydełko raz jeszcze.' },
      { stepNumber: 4, instruction: 'Płynnym ruchem przeciągnij nitkę przez WSZYSTKIE 3 pętle na szydełku naraz.' },
    ],
    leftHandedSteps: [
      { stepNumber: 1, instruction: 'Nawiń nitkę na szydełko w lewej dłoni.' },
      { stepNumber: 2, instruction: 'Wbij szydełko w oczko i wyciągnij pętlę (3 pętle na szydełku).' },
      { stepNumber: 3, instruction: 'Nawiń nitkę ponownie.' },
      { stepNumber: 4, instruction: 'Przeciągnij nitkę przez wszystkie 3 pętle naraz.' },
    ],
    commonMistakes: [
      'Zbyt mocne zaciskanie 3 pętli, przez co haczyk zacina się przy przeciąganiu.',
    ],
    proTip: 'Przerabiając w kolejnym rzędzie za trzecią pętelkę z tyłu (third loop), wypchniesz litery V na przód, imitując ściągacz dziewiarski.',
    visualSchema: {
      primaryShape: 'knot',
      needleAction: 'Narzut, wkłucie, narzut i przeciągnięcie przez 3 pętle za jednym razem',
      yarnPath: 'Trzy pętle zebrane u szczytu jednym pociągnięciem',
      accentColor: '#14B8A6',
      viewBox: '0 0 100 100',
    },
  },
  {
    id: 'slip_stitch',
    titlePl: 'Oczko ścisłe',
    titleEn: 'Slip Stitch',
    discipline: 'crochet',
    level: 'beginner',
    abbreviation: 'sl st',
    categoryLabel: 'Wykończenie',
    summary: 'Najniższy ścieg szydełkowy. Służy do zamykania okrążeń, przemieszczania nitki bez dodawania wysokości i ozdobnego lamowania.',
    rightHandedSteps: [
      { stepNumber: 1, instruction: 'Wbij szydełko pod obie nitki wskazanego oczka.' },
      { stepNumber: 2, instruction: 'Nawiń nitkę na szydełko.' },
      { stepNumber: 3, instruction: 'Jednym ruchem przeciągnij nitkę przez oczko ORAZ bezpośrednio przez pętlę na szydełku.' },
    ],
    leftHandedSteps: [
      { stepNumber: 1, instruction: 'Wbij lewe szydełko pod obie nitki oczka.' },
      { stepNumber: 2, instruction: 'Nawiń nitkę na szydełko.' },
      { stepNumber: 3, instruction: 'Przeciągnij nitkę przez oczko i natychmiast przez pętlę na szydełku.' },
    ],
    commonMistakes: [
      'Nawijanie dodatkowego narzutu (przekształca oczko ścisłe w półsłupek).',
      'Zaciskanie oczek zamykających okrążenie, co utrudnia wbicie w kolejnym okrążeniu.',
    ],
    proTip: 'Używaj oczek ścisłych do wzmacniania dekoltów i brzegów toreb — zapobiegają rozciąganiu się krawędzi.',
    visualSchema: {
      primaryShape: 'chain',
      needleAction: 'Wkłucie i bezpośrednie przeciągnięcie bez pośredniego narzutu',
      yarnPath: 'Płaski ścieg leżący bezpośrednio na poprzednim rzędzie',
      accentColor: '#6B7280',
      viewBox: '0 0 100 100',
    },
  },
  {
    id: 'magic_ring',
    titlePl: 'Magiczny pierścień (Magic Ring)',
    titleEn: 'Magic Ring / Magic Circle',
    discipline: 'crochet',
    level: 'intermediate',
    abbreviation: 'MR',
    categoryLabel: 'Początek robótki',
    summary: 'Niezastąpiona technika rozpoczęcia robótek w okrążeniach (czapki, serwetki, amigurumi) z zamykanym do zera otworem centralnym.',
    rightHandedSteps: [
      { stepNumber: 1, instruction: 'Owiń włóczkę dwukrotnie wokół palców lewej dłoni, tworząc krzyżujące się pętle.' },
      { stepNumber: 2, instruction: 'Wsuń szydełko pod pierwszą nitkę, chwyć drugą nitkę i wyciągnij pętlę.' },
      { stepNumber: 3, instruction: 'Nawiń nitkę roboczą i zrób 1 oczko łańcuszka, aby zabezpieczyć pierścień.' },
      { stepNumber: 4, instruction: 'Wbijaj szydełko do środka pętli wokół OBU nitek pierścienia, przerabiając zadaną liczbę półsłupków.' },
      { stepNumber: 5, instruction: 'Pociągnij za krótki ogon włóczki, całkowicie zaciskając otwór w środku.' },
    ],
    leftHandedSteps: [
      { stepNumber: 1, instruction: 'Owiń włóczkę wokół palców prawej dłoni ze skrzyżowaniem nitek.' },
      { stepNumber: 2, instruction: 'Wsuń szydełko lewą ręką pod pierwszą nitkę, chwyć drugą i wyciągnij pętlę.' },
      { stepNumber: 3, instruction: 'Wykonaj 1 oczko łańcuszka blokujące pierścień.' },
      { stepNumber: 4, instruction: 'Przerabiaj półsłupki do wnętrza pierścienia obejmując obie nitki.' },
      { stepNumber: 5, instruction: 'Pociągnij za wolny ogon, zamykając otwór.' },
    ],
    commonMistakes: [
      'Przerabianie półsłupków wokół tylko jednej nitki pierścienia (ogon nie będzie mógł zacisnąć pętli).',
      'Ucięcie ogona bez zabezpieczenia igłą (otwór rozluźni się podczas prania).',
    ],
    proTip: 'Zawsze po zaciągnięciu pierścienia nawlecz ogon na igłę i przeszyj go 2 razy w przeciwnych kierunkach pod słupkami bazy.',
    visualSchema: {
      primaryShape: 'spiral',
      needleAction: 'Zaciskana regulowana pętla bazowa',
      yarnPath: 'Okrąg zbiegający się centralnie po pociągnięciu ogona',
      accentColor: '#EC4899',
      viewBox: '0 0 100 100',
    },
  },
  {
    id: 'crochet_increase',
    titlePl: 'Dodawanie słupków / półsłupków',
    titleEn: 'Crochet Increase',
    discipline: 'crochet',
    level: 'beginner',
    abbreviation: 'inc',
    categoryLabel: 'Kształtowanie',
    summary: 'Proste zwiększenie obwodu robótki poprzez przerobienie 2 ściegów w to samo oczko podstawy.',
    rightHandedSteps: [
      { stepNumber: 1, instruction: 'Przerób standardowy półsłupek lub słupek w wyznaczone oczko rzędu.' },
      { stepNumber: 2, instruction: 'Wbij szydełko ponownie w DOKŁADNIE TO SAMO oczko podstawy.' },
      { stepNumber: 3, instruction: 'Przerób drugi słupek lub półsłupek (wzrost liczby oczek o 1).' },
    ],
    leftHandedSteps: [
      { stepNumber: 1, instruction: 'Przerób słupek lub półsłupek w wyznaczone oczko lewą ręką.' },
      { stepNumber: 2, instruction: 'Wbij szydełko ponownie w dokładnie to samo oczko bazy.' },
      { stepNumber: 3, instruction: 'Przerób drugi ścieg w ten sam punkt podstawy.' },
    ],
    commonMistakes: [
      'Pomyłkowe wkłucie w sąsiednie oczko zamiast w to samo.',
    ],
    proTip: 'W robótkach płaskich w okrążeniach rozkładaj dodawania równomiernie (np. co 6 oczek), by koło nie falowało ani nie zamieniało się w wielokąt.',
    visualSchema: {
      primaryShape: 'cross',
      needleAction: 'Dwa słupki wychodzące z jednego punktu bazowego w kształcie V',
      yarnPath: 'Rozgałęzienie 1 -> 2',
      accentColor: '#8B5CF6',
      viewBox: '0 0 100 100',
    },
  },
  {
    id: 'crochet_decrease',
    titlePl: 'Niewidoczne odejmowanie (Invisible Dec)',
    titleEn: 'Invisible Decrease (inv-dec)',
    discipline: 'crochet',
    level: 'intermediate',
    abbreviation: 'dec / inv-dec',
    categoryLabel: 'Kształtowanie',
    summary: 'Technika łączenia 2 oczek w 1 z wykorzystaniem wyłącznie przednich nóżek, eliminująca zgrubienia i dziurki.',
    rightHandedSteps: [
      { stepNumber: 1, instruction: 'Wbij szydełko TYLKO pod przednią nóżkę (front loop) pierwszego oczka.' },
      { stepNumber: 2, instruction: 'Bez robienia narzutu wbij szydełko natychmiast pod przednią nóżkę drugiego oczka (3 pętle na szydełku).' },
      { stepNumber: 3, instruction: 'Nawiń nitkę i przeciągnij przez pierwsze 2 pętle na szydełku (przednie nóżki obu oczek).' },
      { stepNumber: 4, instruction: 'Nawiń nitkę ponownie i przeciągnij przez pozostałe 2 pętle na szydełku.' },
    ],
    leftHandedSteps: [
      { stepNumber: 1, instruction: 'Wbij szydełko tylko pod przednią nóżkę pierwszego oczka lewą dłonią.' },
      { stepNumber: 2, instruction: 'Wbij natychmiast pod przednią nóżkę kolejnego oczka.' },
      { stepNumber: 3, instruction: 'Nawiń nitkę i przeciągnij przez obie przednie nóżki.' },
      { stepNumber: 4, instruction: 'Nawiń nitkę i przeciągnij przez 2 ostatnie pętle na szydełku.' },
    ],
    commonMistakes: [
      'Wkłucie pod obie nitki (zwykłe sc2tog), co tworzy widoczny guzek na prawej stronie maskotki.',
    ],
    proTip: 'Invisible Decrease to sekret perfekcyjnych maskotek amigurumi — redukcja jest w 100% niewidoczna od zewnątrz.',
    visualSchema: {
      primaryShape: 'cross',
      needleAction: 'Zebranie dwóch przednich nóżek (FLO) na szydełko przed przerobieniem',
      yarnPath: 'Zbieżność 2 -> 1 gładka na licowej stronie',
      accentColor: '#EF4444',
      viewBox: '0 0 100 100',
    },
  },
  {
    id: 'granny_square_corner',
    titlePl: 'Narożnik kwadratu babuni',
    titleEn: 'Granny Square Corner Cluster',
    discipline: 'crochet',
    level: 'beginner',
    abbreviation: '3dc, ch2, 3dc',
    categoryLabel: 'Motywy',
    summary: 'Klasyczny narożnik tradycyjnego kwadratu babuni zapewniający idealny kąt prosty 90 stopni bez marszczenia.',
    rightHandedSteps: [
      { stepNumber: 1, instruction: 'Zbliżając się do przestrzeni narożnika z poprzedniego okrążenia, wykonaj narzut.' },
      { stepNumber: 2, instruction: 'Przerób grupę 3 słupków (3 dc cluster) w przestrzeń narożnika.' },
      { stepNumber: 3, instruction: 'Zrób 2 oczka łańcuszka (ch 2), tworząc ostry łuk narożnika.' },
      { stepNumber: 4, instruction: 'W TĘ SAMĄ przestrzeń narożnika przerób kolejną grupę 3 słupków (3 dc).' },
    ],
    leftHandedSteps: [
      { stepNumber: 1, instruction: 'Dojdź do przestrzeni narożnej szydełkiem w lewej dłoni.' },
      { stepNumber: 2, instruction: 'Przerób 3 słupki bezpośrednio w przestrzeń pod łańcuszkiem narożnika.' },
      { stepNumber: 3, instruction: 'Wykonaj 2 oczka łańcuszka na obrót pod kątem 90 stopni.' },
      { stepNumber: 4, instruction: 'Przerób kolejne 3 słupki w tę samą przestrzeń narożnika.' },
    ],
    commonMistakes: [
      'Zrobienie 1 oczka łańcuszka zamiast 2, co powoduje zwijanie się rogów kwadratu do góry.',
    ],
    proTip: 'Blokuj gotowe kwadraty babuni na macie z kołeczkami przed zszyciem — dzięki temu wszystkie elementy uzyskają idealnie identyczne wymiary.',
    visualSchema: {
      primaryShape: 'spiral',
      needleAction: 'Klastry 3 słupków rozdzielone łukiem 2 oczek łańcuszka pod kątem 90°',
      yarnPath: '[3 dc] -> ch 2 -> [3 dc] w ten sam otwór',
      accentColor: '#F97316',
      viewBox: '0 0 100 100',
    },
  },
];

export interface TechniqueFilterOptions {
  discipline?: TechniqueDiscipline | 'all';
  level?: TechniqueLevel | 'all';
  query?: string;
}

export function getAllTechniqueCards(): TechniqueCard[] {
  return [...TECHNIQUE_CARDS];
}

export function getTechniqueCardById(id: string): TechniqueCard | undefined {
  if (!id) return undefined;
  return TECHNIQUE_CARDS.find((card) => card.id === id);
}

export function filterTechniqueCards(options?: TechniqueFilterOptions): TechniqueCard[] {
  if (!options) return [...TECHNIQUE_CARDS];

  const { discipline = 'all', level = 'all', query = '' } = options;
  const cleanQuery = query.trim().toLowerCase();

  return TECHNIQUE_CARDS.filter((card) => {
    if (discipline !== 'all' && card.discipline !== discipline) {
      return false;
    }
    if (level !== 'all' && card.level !== level) {
      return false;
    }
    if (cleanQuery) {
      const matchPl = card.titlePl.toLowerCase().includes(cleanQuery);
      const matchEn = card.titleEn.toLowerCase().includes(cleanQuery);
      const matchAbbr = card.abbreviation.toLowerCase().includes(cleanQuery);
      const matchSummary = card.summary.toLowerCase().includes(cleanQuery);
      const matchCategory = card.categoryLabel.toLowerCase().includes(cleanQuery);
      if (!matchPl && !matchEn && !matchAbbr && !matchSummary && !matchCategory) {
        return false;
      }
    }
    return true;
  });
}

export function getTechniqueSteps(card: TechniqueCard, handedness: Handedness): TechniqueStep[] {
  return handedness === 'left' ? [...card.leftHandedSteps] : [...card.rightHandedSteps];
}

export function countTechniquesByDiscipline(): { knitting: number; crochet: number; total: number } {
  const knitting = TECHNIQUE_CARDS.filter((c) => c.discipline === 'knitting').length;
  const crochet = TECHNIQUE_CARDS.filter((c) => c.discipline === 'crochet').length;
  return {
    knitting,
    crochet,
    total: TECHNIQUE_CARDS.length,
  };
}
