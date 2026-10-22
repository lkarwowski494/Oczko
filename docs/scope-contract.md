# Kontrakt zakresu: Oczko
Stan: **STOP E0** (rama) · Aktualizacja: 2026-10-22 · Rola 03-zakres, tryb build (prompt `prompts` @97ec212, złożony 2026-10-22, 55 540 znaków) · Wejście: BRD `docs/brd/` (E4 + poprawka ER-06–ER-08), `docs/monetyzacja.md` (sesja 2, E3), P-001–P-039, ZAL-001–026

Kontrakt powstaje etapami E0–E3; tabele „Zakres” i „NIE robimy” w formacie `zakres.mjs` pojawią się w E3. Do tego czasu ID F-nn to kandydaci, nie decyzje.

## E0: Rama

### Środowisko (sprawdzone 2026-10-22)
| Sprawdzenie | Wynik | Skutek |
|---|---|---|
| System, Node, git | Linux x86_64 w chmurze, Node v22.22.0; gałąź `claude/jolly-thompson-paz6d8` @2855dbf | — |
| GitHub | push przez git na gałąź roboczą (Oczko) i na `main` (`oczko-warsztat`, P-010); biblioteka `prompts` tylko do odczytu | — |
| Sieć | 200: `itunes.apple.com/lookup`, `developer.apple.com/app-store/review/guidelines/`; `apps.apple.com` odpowiada (404 dla testowego id, host osiągalny) | wzorzec najlepszych w E1 z odczytu z dziś |
| BRD i dokument roli 02 | oba w `docs/` | brak STOP z powodu braku wejścia |
| Bramka opłacalności (zasada wspólna 20) | werdykt „budować” (P-013, 2026-10-21), następne odświeżenie 04.2027 (P-016) | aktualna |
| Xcode, symulator | brak (właściciel też nie ma Maca) | testy na telefonie tylko przez TestFlight: koszt w godzinach właściciela |
| Wysiłek sesji | nie da się sprawdzić narzędziem | zalecany: high |

### Wyjątki nazwane (zasada wspólna 7)
- **Sesja roli 03 nie jest świeża** (zasada wspólna 19; zalecenie sztafety: nowa sesja). Właściciel, 2026-10-22: „Pracuj tutaj”. Ta sama sesja wcześniej przewinęła gałąź i poprawiła `docs/sztafeta.md`.
- **Naruszenie kwarantanny P-003 przed startem roli (nieumyślne).** Zanim sesja dostała rolę 03, na gałęzi `claude/amazing-ride-iup4to` (stan poprzedniej wersji) zobaczyła: listę katalogów w korzeniu repo, tytuły 5 ostatnich commitów poprzedniej wersji (m.in. kalkulator próbki na mokro i kompensacji blokowania, motyw UI, wdrożenie TestFlight), stary `CLAUDE.md` z opisem standardu jakości oraz listę zależności z `package.json` (m.in. `qrcode`, `expo-document-picker`, `expo-haptics`). Kodu, testów, dokumentów ani BRD poprzedniej wersji nie otwierała. Ryzyko zakotwiczenia dotyczy dwóch miejsc: F-41 (długość po blokowaniu, BR-KAL-006) i obszaru 10 z `docs/pomysl.md` (przekazanie projektu). **Tańsza kontrola zamiast pominiętej:** soczewki E1 i ocena tych dwóch pozycji w E2 robią subagenci bez kontekstu tej sesji (nie fork), a decyzje o nich mają w Uzasadnieniu źródło z BRD albo z odczytu z dziś.

### Wejście jako hipotezy
| ID | Treść (skrót) | Status w rejestrze | Na czym stoi w 03 |
|---|---|---|---|
| ZAL-008 | Oczko to narzędzie N, nie aplikacja W z treścią | hipoteza (wspierana przez 01, E1–E2) | J-10 i SLO jako słownik, nie kursy |
| ZAL-009 / H-03 | uczciwość i zaufanie do danych jako wyróżnik | potwierdzone (R) | podłogi danych przed rankingiem |
| ZAL-002 | wartość stała dla funkcji sesyjnych | potwierdzone (R); przy modelu B nie jest warunkiem | — |
| ZAL-003 | koszt 0 zł bez konta i sieci | potwierdzone dla iCloud i płatności | F-27 synchronizacja, F-12 zegarek (koszt 0 do potwierdzenia przez 05) |
| ZAL-019 / H-04 | rdzeń: J-01, J-02, J-03, J-05, J-06, J-07 | hipoteza (R) | **sprawdzam w E1** (pętla główna) |
| ZAL-020 / H-05 | kalkulatory swetrowe bez dowodu potrzeby | hipoteza | E2 (F-38–F-43) |
| ZAL-021 / H-06 | funkcje „wow” z luk rynku | hipoteza; dowód zakupu dla zegarka (R mocny) i przypomnień (R) | E2 (F-02, F-06, F-07, F-08, F-11, F-12) |
| ZAL-022 / H-07 | jedna aplikacja z warstwami lepsza od rodziny | hipoteza | **E2, podział** |
| ZAL-023 / H-08 | import od konkurencji przyciąga płacących | hipoteza | F-29 |
| ZAL-024 / H-09 | AI na urządzeniu nie jest potrzebą | hipoteza | brak BR o AI; funkcja AI tylko przez ER do 01 |
| ZAL-025 / KP-01 | lista darmowa raz wydana nie kurczy się | hipoteza (R), reguła kontraktu | **ograniczenie zakresu:** listę darmową zawężam tylko przed wydaniem |
| ZAL-026 / P-029 | Pro 14,99 USD konwertuje ≥ 1,85% | hipoteza, test po wydaniu | wersja 1 musi mieć funkcje Pro, inaczej testu modelu nie ma czym przeprowadzić |
| ZP-07 a zasada 18 | „bijąca funkcjonalnościami liderów” a „bez kombajnu” | napięcie wskazane przez 01 | E2: warianty pokażą koszt szerokości |

### Kandydaci (59 BR → 44 funkcje)
Klasa WTP i poziom dowodu z tabeli „Wartość funkcji” roli 02 (P-027); propozycja darmowe/Pro z „Podziału darmowe / Pro” (P-030–P-032). Podłoga według wzorców roli: `dane`, `bezpieczeństwo` (reguły krytyczne RD i treść krytyczna), `prawo` (OG); `→ F-nn` oznacza kontrolę innej funkcji. Blokery wydania z `docs/brd/README.md` oznaczam „blok.”.

| ID | Funkcja | Wymagania | J / PR | WTP (dowód) | 02 | Podłoga |
|---|---|---|---|---|---|---|
| F-01 | Licznik rzędów od pierwszego uruchomienia, dodaj i odejmij, potwierdzenie wibracją | BR-LIC-001, BR-LIC-002, BR-LIC-005 | J-01 / PR-01, PR-02 | WTP-0 (R, B) | darmowa | dane: blok. BR-LIC-001, 002 |
| F-02 | Historia zmian z godziną i cofnięciem | BR-LIC-003 | J-01 / PR-02 | WTP-1 (R słaby) | darmowa | dane: blok. BR-LIC-003 → F-01 |
| F-03 | Blokada przed przypadkowym stuknięciem | BR-LIC-004 | J-01 / PR-02 | WTP-2 (B) | darmowa | — |
| F-04 | Kilka liczników w projekcie, zmiana ustawień w trakcie | BR-LIC-006, BR-LIC-008 | J-02 / PR-03 | WTP-1 (R), WTP-0 (B) | darmowa | — |
| F-05 | Licznik powtórzeń powiązany z rzędami | BR-LIC-007 | J-02 / PR-03 | WTP-1 (R) | Pro | — |
| F-06 | Przypomnienie „co N rzędów, M razy” | BR-LIC-009 | J-03 / PR-04 | WTP-1 (R) | Pro | — |
| F-07 | Plan rzędów z instrukcji wzoru | BR-LIC-010 | J-03 / PR-04 | WTP-2 (H) | Pro | — |
| F-08 | Cel rzędów i jego osiągnięcie | BR-LIC-011 | J-11 / PR-02 | WTP-2 (B) | darmowa | — |
| F-09 | Znaczenie liczby (rząd skończony / w trakcie) | BR-LIC-012 | J-01 / PR-02 | WTP-2 (B) | darmowa | — |
| F-10 | Ekran nie gaśnie podczas liczenia | BR-LIC-013 | J-06 / PR-05 | WTP-0 (R) | darmowa | — |
| F-11 | Liczenie z ekranu blokady | BR-LIC-014 | J-06 / PR-05 | WTP-1 (R słaby) | Pro | — |
| F-12 | Liczenie na zegarku bez telefonu w ręku | BR-LIC-015 | J-06 / PR-05 | WTP-1 (R mocny) | Pro | dane: NFR-ZEG-001 (blok., jeśli w wydaniu) |
| F-13 | Dodanie rzędu głosem (Siri) | BR-LIC-016 | J-06 / PR-05 | WTP-1 (R) | Pro | — |
| F-14 | Projekt z częściami | BR-PRJ-001 | J-02, J-05 / PR-07 | WTP-1 (R) | darmowa | — |
| F-15 | Notatka widoczna przy liczniku | BR-PRJ-002 | J-05 / PR-02, PR-07 | WTP-1 (R słaby) | darmowa | — |
| F-16 | Zdjęcia projektu i etykiet | BR-PRJ-003 | J-05 / PR-07 | WTP-1 (R) | darmowa (P-032) | — |
| F-17 | Dane techniczne projektu (drut w mm i US) | BR-PRJ-004 | J-05 / PR-07 | WTP-2 (B) | darmowa | — |
| F-18 | Powrót do projektu po przerwie | BR-PRJ-005 | J-05 / PR-07 | WTP-0 (R) | darmowa (dane) | dane: odczyt |
| F-19 | Stan projektu i archiwum ukończonych | BR-PRJ-006 | J-05 / PR-07 | WTP-2 (R) | darmowa (dane) | dane: odczyt |
| F-20 | Zrób ponownie (kopia projektu) | BR-PRJ-007 | J-05 / PR-07 | WTP-2 (B) | darmowa (P-032) | — |
| F-21 | Stoper sesji przy zablokowanym ekranie | BR-PRJ-008 | J-11 / PR-14 | WTP-1 (R) | Pro | — |
| F-22 | Postęp i szacowany czas do celu | BR-PRJ-009 | J-11 / PR-14 | WTP-2 (H) | Pro | — |
| F-23 | Przypomnienie o przerwie | BR-PRJ-010 | J-11 / PR-14 | WTP-2 (B), OP-15 | → 03 | — |
| F-24 | Import wzoru z pliku i ze zdjęcia | BR-WZR-001, BR-WZR-002 | J-04 / PR-06 | WTP-1 (R) | darmowa (P-032) | prawo: OG-07 (blok.) |
| F-25 | Wzór i licznik na jednym ekranie | BR-WZR-005 | J-04 / PR-06 | WTP-2 (B) | darmowa (P-032) | prawo: OG-07 (blok.) |
| F-26 | Znacznik bieżącego rzędu we wzorze | BR-WZR-003 | J-04 / PR-06 | WTP-1 (R mocny) | Pro | prawo: OG-07 (blok.) |
| F-27 | Synchronizacja przez iCloud (opcjonalna) | BR-DAN-002 | J-07 / PR-08 | WTP-1 (R) | darmowa (P-031) | dane: NFR-DAN-003 (blok.) |
| F-28 | Pisanie po wzorze (Apple Pencil) | BR-WZR-004 | J-04 / PR-06 | WTP-1 (R najmocniejszy) | Pro | prawo: OG-07 (blok.) |
| F-29 | Import od innej aplikacji (zapas z Ravelry) | BR-DAN-007 | J-07, H-08 / PR-13 | WTP-2 (H) | darmowa | — |
| F-30 | Siatka co 10 oczek na schemacie | BR-WZR-006 | J-04 / PR-06 | WTP-2 (B pojedynczy) | Pro albo → 03 | prawo: OG-07 (blok.) |
| F-31 | Baza na urządzeniu, trwały zapis, dane po aktualizacji | BR-DAN-001, BR-DAN-003 | J-07 / PR-02, PR-08 | dane | dla wszystkich | dane: blok. NFR-DAN-001, 002 |
| F-32 | Nowy telefon, eksport i import własnego eksportu | BR-DAN-004, BR-DAN-005, BR-DAN-006 | J-07 / PR-08 | dane | dla wszystkich | dane: eksport, odczyt (blok.) |
| F-33 | Usunięcie z koszem 30 dni | BR-DAN-008 | J-07 / PR-07 | dane | dla wszystkich | dane: usunięcie |
| F-34 | Usunięcie wszystkich danych | BR-DAN-009 | ZP-03 / PR-08 | dane | dla wszystkich | dane: usunięcie; prawo: OG-04 |
| F-35 | Zakup Pro, przywracanie, opłacone nie znika | BR-ZAK-001, BR-ZAK-003 | J-07 / PR-09 | warunek | dla wszystkich | prawo: OG-02 (blok. BR-ZAK-001) |
| F-36 | Bez reklam i śledzenia, polityka prywatności | BR-ZAK-002, BR-ZAK-004 | ZP-03 / PR-09 | warunek | dla wszystkich | prawo: OG-04, NFR-PRY-001 (blok.) |
| F-37 | Zapas włóczki i narzędzi | BR-ZAP-001, BR-ZAP-002, BR-ZAP-003, BR-ZAP-004 | J-08 / PR-10 | WTP-1 (R), WTP-2 | Pro | prawo: OG-13; bezpieczeństwo: RD-03, RD-10 |
| F-38 | Obliczenia podstawowe: oczka z próbki, jednostki, grubość włóczki | BR-KAL-001, BR-KAL-003, BR-KAL-008 | J-09 / PR-11 | WTP-1 (R), WTP-0 (R), WTP-2 (B) | darmowa | bezpieczeństwo: RD-01, RD-03, RD-04, RD-10 (blok.) |
| F-39 | Przeliczenie wzoru na własną próbkę | BR-KAL-002 | J-09 / PR-11 | WTP-1 (R słaby) | Pro | bezpieczeństwo: RD-02 (blok.) |
| F-40 | Równomierne dodawanie i ujmowanie | BR-KAL-004 | J-09 / PR-11 | WTP-1 (B) | Pro | — (RD-05, RD-06 niekrytyczne) |
| F-41 | Długość po blokowaniu | BR-KAL-006 | J-09 / PR-11 | WTP-2 (B), brak na rynku | → 03 | bezpieczeństwo: RD-08 (blok.) |
| F-42 | Zużycie włóczki z wagi próbki | BR-KAL-005 | J-08, J-09 / PR-11 | WTP-1 (R) | Pro | bezpieczeństwo: RD-07 (blok.) |
| F-43 | Luz w obwodzie | BR-KAL-007 | J-09 / PR-11 | WTP-2 (B), 1 soczewka WTP-X | → 03, kandydat na odcięcie (H-05) | — (RD-09 niekrytyczna) |
| F-44 | Słownik skrótów z systemem US/UK, bez sieci | BR-SLO-001, BR-SLO-002 | J-10 / PR-12 | WTP-2 (R, B) | darmowa | bezpieczeństwo: RYZ-03, treść krytyczna (blok. BR-SLO-001) |

Kontrola przypisania (skrypt, 2026-10-22): 59 BR z BRD, każde w dokładnie jednej funkcji, 0 spoza BRD (wynik niżej w „Dowody E0”).

### Podłogi (stałe przed rankingiem)
- **Dane:** F-01, F-02 (blokery liczenia), F-31, F-32 (blokery danych), F-33, F-34, F-18, F-19 (odczyt własnych danych). Eksport i kopia służą rzadko, a są podłogą (wzorce, kalibracja).
- **Bezpieczeństwo i reguły krytyczne:** każde obliczenie, które zostaje, zostaje z regułą RD i przeglądem 06 (D-027): RD-01–RD-04, RD-07, RD-08, RD-10; słownik z jawnym systemem US/UK (RYZ-03). Nie upraszczam obliczeń bez źródła.
- **Prawo i wytyczne:** F-35 (OG-02), F-36 (OG-04, NFR-PRY-001), każda funkcja wzoru z porównaniem z zastrzeżeniami patentów (OG-07, P-024), F-37 bez symboli pielęgnacji (OG-13), opis w sklepie tylko o funkcjach z wydania (OG-05), więcej niż prosty licznik (OG-01, 4.2/4.3(b)).
- **Kontrakt płatności:** KP-01 (lista darmowa po wydaniu nie kurczy się), KP-10 (zakup nigdy w trakcie liczenia).

### Obszary z `docs/pomysl.md` bez BR (dla E1: pominięcie czy świadome „nie”)
P-001 mówi „robi to, co poprzednia wersja, i więcej, jeśli wykaże to research”. Te obszary nie mają wymagania w BRD; rola 01 sprawdziła je i nie znalazła dowodu albo nie spisała:
| Obszar | Co jest w BRD | Do E1 |
|---|---|---|
| 4: schematy ściegów z legendą symboli | tylko siatka na schemacie (BR-WZR-006) | sprawdzić u najlepszych w niszy; brak dowodu → NIE z warunkiem powrotu, dowód → ER do 01 |
| 5: karczek raglanowy, czapka, zamienniki włóczki | H-05 (brak dowodu, OP-07); zamienniki częściowo w BR-KAL-008 | jw. |
| 8: ćwiczenia z czytania instrukcji, rozpoznawanie ściegu, ratowanie błędów | tylko słownik (J-10, ZAL-008: to praca aplikacji W) | jw. |
| 10: przekazanie projektu innej osobie | „sprawdzone, brak dowodu w próbce” (`odkrywanie.md`) | jw.; ocena przez subagenta bez kontekstu tej sesji (wyjątek wyżej) |
| AI na urządzeniu (P-023) | H-09 bez BR | E1: dowód potrzeby → ER do 01; brak → nie w wersji 1 |

### Apetyt (pytanie do właściciela)
Apetyt to godziny **właściciela** na wersję 1: przegląd na bramkach, testy na telefonie przez TestFlight (bez Maca), decyzje, kroki w App Store Connect. Czas agenta się nie liczy (zasada wspólna 13). Liczby to [OCENA]: ok. 1 h na prostą funkcję na ekranie telefonu (przejście przepływu, zgłoszenie błędów, ponowny test), 3–6 h na funkcję natywną albo wieloma urządzeniami (zegarek, ekran blokady, iCloud, zakup w piaskownicy), stała ok. 15 h na role 04–11 (przeglądy STOP). Dokładny koszt każdej funkcji podam w rankingu E2.

| Opcja | Godziny właściciela | Co mniej więcej się mieści | Skutek |
|---|---|---|---|
| A: wąsko | ok. 30 h | podłogi (licznik, historia, dane, eksport, zakup) + kilka funkcji Pro bez zegarka | najszybsza premiera i recenzje; ryzyko 4.3(b) „simple timer” i słaby powód do zakupu Pro (test P-029 na małej ofercie) |
| B: środek | ok. 60 h | A + liczenie bez telefonu (zegarek albo ekran blokady), przypomnienia, wzór ze znacznikiem, zapas | oferta Pro z funkcjami, za które konkurencja bierze pieniądze (R mocny); premiera później |
| C: szeroko | ok. 100 h | prawie cała propozycja roli 02 (darmowe + Pro), bez funkcji z samą hipotezą | najbliżej „bijąca funkcjonalnościami” (ZP-07); najdłużej do pierwszych recenzji, największy koszt utrzymania w 35 językach |

Rekomendacja: **B**. Model B potrzebuje w wersji 1 funkcji Pro z dowodem zakupu (zegarek, znacznik we wzorze, przypomnienia), inaczej test P-029 mierzy słabą ofertę; C dokłada funkcje z dowodem B albo H, których wartość lepiej sprawdzić po pierwszych recenzjach (ZP-05).

### Plan i czas (zasada wspólna 9)
| Etap | Co | Czas agenta | Czekanie | Właściciel |
|---|---|---|---|---|
| E1 | pętla główna; 9 wymiarów pokrycia; 4 soczewki jako subagenci bez kontekstu tej sesji; wzorzec 2–3 najlepszych (lookup + recenzje z dziś); pominięcia jako ER do 01 | 2–3 h | limit iTunes ok. 20 zapytań/min | przegląd raportu, ok. 15 min |
| E2 | cięcie (podłogi, WTP-0, zasada 18, RICE w godzinach właściciela, apetyt); kombajn; podział na aplikacje (H-07); co najmniej 2 warianty; F-23, F-30, F-41, F-43 | 2–3 h | — | wybór wariantu, podziału i darmowe/Pro, ok. 20–30 min |
| E3 | `docs/scope-contract.md` w szablonie, `zakres.mjs --brd docs/brd --apetyt <h>` kod 0, definicja ukończenia, przekazanie 04–08, sztafeta | 1–1,5 h | — | akceptacja, ok. 10 min |

Razem: 5–7,5 h pracy agenta; od właściciela ok. 1 h (bez apetytu wersji 1, który jest osobną liczbą).

### Dowody E0
- Prompt roli: `node tools/assemble.mjs 03-zakres --tryb build --galaz claude/jolly-thompson-paz6d8` w `prompts` @97ec212, kod 0, 587 linii.
- Przypisanie BR: `node kontrola-e0.mjs docs/scope-contract.md docs/brd` (funkcje `tabele` i `wymaganiaBrd` ze skryptu `zakres.mjs` roli) → „BR w BRD: 59 · kandydatów F: 44 · BR przypisanych: 59 · błędów: 0”, kod 0. Kontrola negatywna na kopii z BR-LIC-003 zamienionym na BR-LIC-004: 2 błędy („BR-LIC-003 bez kandydata”, „BR-LIC-004 w F-02, F-03”), kod 1. Skrypty i wynik: `oczko-warsztat/03-zakres/2026-10-22-build/`.

## Po E0: decyzje i zgłoszenia (2026-10-22)
- **P-040:** kierunek wersji 1 = wariant B + F-11 (ekran blokady) + F-21 (stoper): „B plus 1, 3”. Linię i koszty potwierdza STOP E2.
- **P-041:** bez testów ręcznych właściciela, tylko automatyczne. Koszt w rankingu E2 = przeglądy, decyzje, utrzymanie; ryzyko „kryterium niesprawdzalne automatem” liczone przy każdej funkcji.
- **P-042: F-28 (pisanie Apple Pencil) w kierunku wersji 1** („1a”). Odrzucanie dłoni zapewnia system: tryb `PKCanvasViewDrawingPolicy.pencilOnly`, „Pencil touches are the only input that draw on the canvas.” (developer.apple.com/documentation/pencilkit/pkcanvasviewdrawingpolicy/pencilonly, odczyt 2026-10-22; od iOS 13); kryterium BR-WZR-004 sprawdza automat (dotyk palcem na płótnie → 0 kresek), a nasz kod (zapis adnotacji, położenie przy powiększeniu, eksport, tryb do odczytu po utracie Pro) testy jednostkowe i UI w symulatorze.
- **Kalendarz, postęp projektu w % i termin z celem dziennym (prośby właściciela): kandydaci K-1–K-5, czeka na decyzję;** wzorce Treningu i Piekarza i dowód z recenzji: `oczko-warsztat/03-zakres/2026-10-22-build/kalendarz-wzorce.md`.

### Zgłoszenia do roli 01 (ER)
| ID | Zgłoszenie | Dowód | Status |
|---|---|---|---|
| ER-10 | Metody NFR zakładają test ręczny albo urządzenie: NFR-OFF-001 („test ręczny i automatyczny”), NFR-DOS-001 („audyt VoiceOver na urządzeniu”), NFR-WYD-001 („pomiar na najstarszym obsługiwanym iPhonie”), NFR-ZEG-001 („test na parze urządzeń”); po P-041 metoda automatyczna albo nazwane ryzyko szczątkowe. Uwaga dla 02 i 07: tabela „Testy, których nie zrobi Node (krok właściciela)” w `docs/monetyzacja.md` potrzebuje zamiennika automatycznego | P-041; `docs/brd/wymagania.md` (NFR) | otwarte |
| ER-11 | (jeśli właściciel wybierze kalendarz) brak BR dla kalendarza dni z robótką (praca J-11, J-05); prefiks `KAL` w BRD Oczka jest zajęty przez obliczenia | prośba właściciela 2026-10-22; `kalendarz-wzorce.md` | czeka na decyzję właściciela |
