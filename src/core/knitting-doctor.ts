/**
 * Oczko Core — Doktor Błędów i Ratowanie Dzianiny (BR-BIB-010..015).
 * Czysto deterministyczna baza procedur ratunkowych bez AI (ZP-05, ZP-12).
 * Pomaga dziewiarce i szydełkomaniaczce zdiagnozować błąd i naprawić go krok po kroku.
 */

export type DoctorEmergencyId =
  | 'dropped_stitch'
  | 'twisted_stitch'
  | 'accidental_yarnover'
  | 'tink_unknitting'
  | 'lifeline_insertion'
  | 'crochet_escaped_loop';

export type CraftDiscipline = 'knitting' | 'crochet' | 'both';

export type DangerLevel = 'critical' | 'moderate' | 'low';

export interface DoctorStep {
  stepNumber: number;
  title: string;
  instruction: string;
  tip?: string;
}

export interface EmergencyProcedure {
  id: DoctorEmergencyId;
  title: string;
  craftType: CraftDiscipline;
  symptoms: string[];
  dangerLevel: DangerLevel;
  toolsNeeded: string[];
  summary: string;
  steps: DoctorStep[];
  preventionTip: string;
}

export const DOCTOR_PROCEDURES: EmergencyProcedure[] = [
  {
    id: 'dropped_stitch',
    title: 'Spuszczone oczko (drabinka w dół)',
    craftType: 'knitting',
    symptoms: [
      'oczko spadło z drutu',
      'oczko pruje się w dół',
      'drabinka w dzianinie',
      'brakuje jednego oczka',
      'dziura pionowa',
    ],
    dangerLevel: 'critical',
    toolsNeeded: ['Szydełko o rozmiarze drutów lub o 0.5 mm mniejsze', 'Marker dziewiarski / agrafka'],
    summary:
      'Gdy oczko zsunie się z drutu, natychmiast zabezpiecz je markerem, aby nie poleciało niżej. Oczko w ściegu dżersejowym lub francuskim można precyzyjnie podciągnąć szydełkiem rząd po rzędzie.',
    steps: [
      {
        stepNumber: 1,
        title: 'Zabezpieczenie uciekającej pętelki',
        instruction:
          'Zatrzymaj dzierganie. Złap najniższą pętelkę spuszczonego oczka agrafką dziewiarską lub markerem, aby nie pruła się dalej w dół.',
        tip: 'Nie napinaj dzianiny na boki, bo to przyspiesza uciekanie oczka.',
      },
      {
        stepNumber: 2,
        title: 'Dojście drutem do kolumny błędu',
        instruction:
          'Przerób rzędy normalnie aż do miejsca dokładnie nad spuszczonym oczkiem.',
      },
      {
        stepNumber: 3,
        title: 'Wprowadzenie szydełka',
        instruction:
          'Włóż szydełko od przodu (dla oczka prawego) w ocaloną dolną pętelkę.',
      },
      {
        stepNumber: 4,
        title: 'Podciąganie kolejnych poprzeczek',
        instruction:
          'Złap haczykiem szydełka poziomą nitkę (szczebel drabinki) znajdującą się tuż nad pętelką i przeciągnij ją przez pętelkę. Powtarzaj dla każdej kolejnej poprzeczki w górę.',
        tip: 'Dla ściegu francuskiego zmieniaj stronę wbijania szydełka co rząd (raz od przodu, raz od tyłu).',
      },
      {
        stepNumber: 5,
        title: 'Powrót oczka na lewy drut',
        instruction:
          'Ostatnią podciągniętą pętelkę nałóż z powrotem na lewy drut, dbając by prawa nóżka oczka leżała z przodu drutu (unikanie przekręcenia).',
      },
    ],
    preventionTip:
      'Stosuj zatyczki na końcówki drutów (point protectors) przy odkładaniu robótki do torby.',
  },
  {
    id: 'twisted_stitch',
    title: 'Przekręcone oczko (skrzyżowane nóżki)',
    craftType: 'knitting',
    symptoms: [
      'jedno oczko wygląda inaczej',
      'oczko jest ciasne i skręcone',
      'kolumienka dżerseju jest zaburzona',
      'krzyżyk zamiast litery V',
    ],
    dangerLevel: 'low',
    toolsNeeded: ['Tylko druty robocze'],
    summary:
      'Oczko przekręcone powstaje, gdy zostanie przerobione za tylną nóżkę (tbl) zamiast przednią lub nałożone na drut odwrotnie. Jeśli zauważysz je w bieżącym rzędzie, wystarczy je obrócić.',
    steps: [
      {
        stepNumber: 1,
        title: 'Identyfikacja ułożenia nóżek',
        instruction:
          'W standardowym dziewiarstwie zachodnim przednia nóżka oczka powinna znajdować się po prawej stronie (bliżej czubka drutu). Jeśli prawa nóżka jest z tyłu drutu, oczko jest przekręcone.',
      },
      {
        stepNumber: 2,
        title: 'Obrócenie oczka na drucie',
        instruction:
          'Przełóż oczko na prawy drut jak do przerobienia na lewo (slip as to purl), a następnie nałóż je z powrotem na lewy drut, odwracając tak, by przednia nóżka była z przodu.',
      },
      {
        stepNumber: 3,
        title: 'Przerobienie właściwym sposobem',
        instruction:
          'Przerób oczko normalnie za przednią nóżkę od lewej do prawej.',
      },
    ],
    preventionTip:
      'Zwracaj uwagę na kierunek narzucania nitki: nawijaj nitkę przeciwnie do ruchu wskazówek zegara (counter-clockwise).',
  },
  {
    id: 'accidental_yarnover',
    title: 'Przypadkowy narzut (nadmiarowe oczko / dziura)',
    craftType: 'knitting',
    symptoms: [
      'nagle mam o jedno oczko za dużo',
      'tajemnicza dziurka w gładkim dżerseju',
      'oczko wisi luźno bez kolumny pod spodem',
      'liczba oczek się nie zgadza',
    ],
    dangerLevel: 'moderate',
    toolsNeeded: ['Druty robocze'],
    summary:
      'Przypadkowy narzut pojawia się najczęściej przy zmianie z oczek lewych na prawe, gdy nitka została omyłkowo poprowadzona nad drutem. Można go bezpiecznie spuścić w kolejnym rzędzie lub zredukować.',
    steps: [
      {
        stepNumber: 1,
        title: 'Weryfikacja pod lupą',
        instruction:
          'Spójrz pod podejrzane oczko. Prawdziwe oczko ma pod sobą pionową kolumienkę litery V. Przypadkowy narzut to jedynie luźny mostek nitki leżący na drucie bez oczka pod spodem.',
      },
      {
        stepNumber: 2,
        title: 'Wariant A: Jesteś w kolejnym rzędzie',
        instruction:
          'Gdy dojdziesz do przypadkowego narzutu, po prostu zsuń go z lewego drutu i nie przerabiaj go. Pozwól mu opaść. Rozmasuj dzianinę palcami w poprzek, aby nadmiar nitki rozłożył się w sąsiednich oczkach.',
      },
      {
        stepNumber: 3,
        title: 'Wariant B: Błąd zauważony kilka rzędów wyżej',
        instruction:
          'Jeśli dziurka powstała kilka rzędów niżej i nie chcesz pruć, zredukuj nadmiarowe oczko w dyskretnym miejscu (np. pod pachą lub przy brzegu) przerabiając 2 oczka razem na prawo (k2tog).',
      },
    ],
    preventionTip:
      'Przy przejściu z oczek lewych na prawe zawsze upewnij się, że przekładasz nitkę POD drutami, a nie NAD nimi.',
  },
  {
    id: 'tink_unknitting',
    title: 'Tink — Prucie oczko po oczku na drutach',
    craftType: 'knitting',
    symptoms: [
      'muszę cofnąć kilka oczek lub cały rząd',
      'wzór warkocza lub ażuru się rozjechał',
      'boję się wyciągać drut z robótki',
      'chcę bezpiecznie cofnąć błąd',
    ],
    dangerLevel: 'low',
    toolsNeeded: ['Druty robocze'],
    summary:
      'Słowo "TINK" to "KNIT" czytane od tyłu. Ta technika pozwala cofnąć oczka jedno po drugim bez wyciągania drutu z dzianiny, gwarantując zero ryzyka utraty oczek.',
    steps: [
      {
        stepNumber: 1,
        title: 'Ułożenie nitki roboczej',
        instruction:
          'Trzymaj nitkę roboczą luźno z tyłu (dla oczek prawych) lub z przodu (dla oczek lewych).',
      },
      {
        stepNumber: 2,
        title: 'Wbicie lewego drutu w oczko poniżej',
        instruction:
          'Wbij czubek lewego drutu od przodu do tyłu w pętelkę oczka znajdującego się bezpośrednio pod ostatnio przerobionym oczkiem na prawym drucie.',
      },
      {
        stepNumber: 3,
        title: 'Wysunięcie prawego drutu i pociągnięcie nitki',
        instruction:
          'Wysuń prawy drut z górnego oczka i delikatnie pociągnij za nitkę roboczą. Oczko poniżej spoczywa bezpiecznie na lewym drucie z poprawnym ułożeniem nóżek.',
      },
      {
        stepNumber: 4,
        title: 'Powtórzenie do miejsca błędu',
        instruction:
          'Powtarzaj procedurę oczko po oczku. W liczniku Oczko użyj przycisku Undo, aby utrzymać zgodność rzędów i raportów.',
      },
    ],
    preventionTip:
      'Tink jest idealny do cofnięcia 1–2 rzędów. Przy większej liczbie rzędów rozważ zastosowanie linii ratunkowej (Lifeline).',
  },
  {
    id: 'lifeline_insertion',
    title: 'Linia ratunkowa (Lifeline) — polisa ubezpieczeniowa',
    craftType: 'knitting',
    symptoms: [
      'zaczynam trudny ażur lub warkocze',
      'boję się, że będę musiała pruć skomplikowany wzór',
      'chcę zabezpieczyć stan robótki przed trudną sekcją',
    ],
    dangerLevel: 'low',
    toolsNeeded: ['Cienka gładka nitka bawełniana (kordonek) lub nić dentystyczna', 'Tępa igła dziewiarska'],
    summary:
      'Lifeline to nitka przeciągnięta przez wszystkie oczka w rzędzie. W razie pomyłki można bez strachu wysunąć druty i spruć dzianinę dokładnie do linii ratunkowej, która zatrzyma prucie.',
    steps: [
      {
        stepNumber: 1,
        title: 'Przygotowanie kontrastowej nitki',
        instruction:
          'Odetnij kawałek gładkiej bawełnianej nitki (nie wełny!) o długości około 1.5 raza większej niż szerokość robótki. Nawlecz na tępą igłę.',
      },
      {
        stepNumber: 2,
        title: 'Przewlekanie przez oczka na drucie',
        instruction:
          'Przewlecz igłę przez każde oczko spoczywające na lewym drucie, omijając markery dziewiarskie (nie nawlekaj markerów na lifeline!).',
        tip: 'Uważaj, by nie rozszczepić włóczki roboczej.',
      },
      {
        stepNumber: 3,
        title: 'Kontynuowanie dziergania',
        instruction:
          'Dziergaj dalej normalnie. Linia ratunkowa pozostanie w dzianinie jako pas bezpieczeństwa. Zapisz numer rzędu z lifeline w notatkach projektu.',
      },
      {
        stepNumber: 4,
        title: 'Jak pruć do Lifeline w razie katastrofy',
        instruction:
          'Wyciągnij drut roboczy i spruj dzianinę bez obaw. Prucie zatrzyma się na linii ratunkowej. Wprowadź mniejszy drut z powrotem w oczka oparte na nitce i wyjmij lifeline.',
      },
    ],
    preventionTip:
      'Wprowadzaj linię ratunkową po każdym ukończonym pełnym raporcie trudnego wzoru (np. co 12 lub 24 rzędy).',
  },
  {
    id: 'crochet_escaped_loop',
    title: 'Uciekająca pętla w szydełkowaniu',
    craftType: 'crochet',
    symptoms: [
      'szydełko wypadło z pętli',
      'rząd szydełkowy się pruje',
      'słupek lub półsłupek stracił pętlę',
    ],
    dangerLevel: 'moderate',
    toolsNeeded: ['Szydełko', 'Marker ze spiralą lub agrafka'],
    summary:
      'W szydełkowaniu aktywne jest zazwyczaj tylko jedno oczko (pętelka na szydełku). Gdy pętla wypadnie, dzianina może pruć się w ułamku sekundy.',
    steps: [
      {
        stepNumber: 1,
        title: 'Natychmiastowe zabezpieczenie pętli',
        instruction:
          'Złap palcami ostatnią otwartą pętelkę i nie ciągnij za nitkę kłębka. Zabezpiecz pętlę agrafką dziewiarską.',
      },
      {
        stepNumber: 2,
        title: 'Cofnięcie do ostatniego pełnego splotu',
        instruction:
          'Częściowo spruty słupek lub półsłupek najlepiej delikatnie spruć o 1 splot wstecz, do miejsca gdzie oczko podstawy jest nienaruszone.',
      },
      {
        stepNumber: 3,
        title: 'Włożenie szydełka i ponowne przerobienie',
        instruction:
          'Włóż szydełko w oczko, napnij nitkę roboczą do odpowiedniego naprężenia i przerób brakujący splot zgodnie ze wzorem.',
      },
    ],
    preventionTip:
      'Zawsze wpinaj zamykany marker dziewiarski w pętlę na szydełku za każdym razem, gdy odkładasz robótkę nawet na minutę.',
  },
];

/**
 * Wyszukuje procedury pasujące do wpisanego objawu lub słowa kluczowego.
 */
export function diagnoseEmergency(
  query: string,
  craftType?: CraftDiscipline
): EmergencyProcedure[] {
  const cleanQuery = (query || '').trim().toLowerCase();
  
  return DOCTOR_PROCEDURES.filter((proc) => {
    // Filtrowanie dyscypliny
    if (craftType && craftType !== 'both' && proc.craftType !== 'both' && proc.craftType !== craftType) {
      return false;
    }

    if (!cleanQuery) return true;

    // Dopasowanie tytułu lub podsumowania
    if (
      proc.title.toLowerCase().includes(cleanQuery) ||
      proc.summary.toLowerCase().includes(cleanQuery)
    ) {
      return true;
    }

    // Dopasowanie do listy objawów
    return proc.symptoms.some((s) => s.toLowerCase().includes(cleanQuery));
  });
}

/**
 * Zwraca procedurę po jej unikalnym identyfikatorze.
 */
export function getProcedureById(id: DoctorEmergencyId): EmergencyProcedure | undefined {
  return DOCTOR_PROCEDURES.find((p) => p.id === id);
}

/**
 * Zwraca listę wszystkich procedur z opcjonalnym filtrem techniki (druty / szydełko).
 */
export function listAllProcedures(craftType?: CraftDiscipline): EmergencyProcedure[] {
  if (!craftType || craftType === 'both') {
    return [...DOCTOR_PROCEDURES];
  }
  return DOCTOR_PROCEDURES.filter(
    (p) => p.craftType === 'both' || p.craftType === craftType
  );
}
