# Słownik terminów dziewiarskich i szydełkowych (35 języków)

Plik generowany z `docs/lokalizacja/slownik-terminow.json` (jedno źródło); nie edytuj ręcznie: `node docs/lokalizacja/narzedzia/slownik.mjs --md`.

Termin zalecany = słowo, którego używają wzory i producenci włóczek w danym kraju (nie dosłowny przekład z en ani z pl), z przeczytanego źródła według hierarchii P-017 (normy → podręczniki → organizacje i producenci → przewodniki; fora i Wikipedia tylko wskazówka). Brak źródła = pewność niska i [DO SPRAWDZENIA], nie zgadujemy. „zakazane” = kalki i fałszywi przyjaciele z powodem; wzorzec to wyrażenie regularne (bez wielkości liter, Unicode). Źródłem tekstów jest en-US (P-075); pułapki US/UK (szydełko, bind off/cast off, gauge/tension) rozstrzyga znaczenie US. Pojedyncze terminy ze słownika producenta S-DRP tylko jako fakty z ID (P-104, P-106).

Pojęć: 44 · języków: 35 · wpisów: 1540 (wysoka 55, średnia 23, niska 1462). Pewność: **wysoka** — termin dosłownie w przeczytanym źródle szczebla 1–3, w tym znaczeniu (cytat); nadal bez przeglądu rodzimego użytkownika; **srednia** — źródło szczebla 4, termin tylko pośrednio w źródle szczebla 1–3, cytat niesprawdzony dosłownie albo termin produktu (brzmienie 04); **niska** — bez przeczytanego źródła: [DO SPRAWDZENIA] u rodzimego użytkownika albo w źródle.

## Pojęcia

| id | en | pl | znaczenie | kluczy en |
|---|---|---|---|---|
| `robotka` | knitting (as the app's general word for the craft: "knitting day", "Keep knitting", "knitting time") | robótka / dzierganie | ogólne słowo na pracę ręczną, której użytkownik się oddaje w aplikacji: obejmuje i druty, i szydełko (aplikacja jest dla obu). W en źródło używa „knitting” także dla osób szydełkujących. NIE: tylko robienie na drutach, jeśli język ma słowo wspólne; NIE: dzianina maszynowa. | 28 |
| `dziergac_na_drutach` | knit (on needles) | robić na drutach | tworzyć dzianinę drutami; czynność (czasownik). NIE: szydełkować. | 6 |
| `szydelkowac` | crochet | szydełkować | tworzyć robótkę szydełkiem (czynność i rzemiosło). | 0 |
| `rzad` | row | rząd | jedna warstwa oczek przerobiona od brzegu do brzegu (albo jedno okrążenie przy robótce na okrągło) — jednostka licznika. NIE: wiersz tabeli, kolejka, szereg. | 130 |
| `okrazenie` | round | okrążenie | rząd przerabiany na okrągło (druty z żyłką, szydełko w kółko). W interfejsie en nie występuje (licznik mówi „row”), ale tłumacz musi go znać, żeby nie użyć go zamiast „rzędu”. | 0 |
| `oczko` | stitch (single loop on the needle) | oczko | pojedyncza pętla dzianiny/robótki — jednostka liczona (licznik „Stitches”, próbka „stitches per 10 cm”). NIE: ścieg (wzór splotu), NIE: ścieg szwalniczy/hafciarski. | 21 |
| `scieg` | stitch pattern (e.g. "stockinette stitch") | ścieg / splot | sposób przerabiania oczek dający określoną fakturę (np. dżersej, ścieg francuski). NIE: pojedyncze oczko. | 2 |
| `scieg_dzersejowy` | stockinette stitch (US) / stocking stitch (UK) | ścieg dżersejowy (pończoszniczy) | ścieg: na prawej stronie same oczka prawe, na lewej same lewe (w rzędach). Używany w opisie kategorii grubości („knitted in stockinette stitch”). | 2 |
| `licznik` | counter (row counter) | licznik (rzędów) | narzędzie w aplikacji liczące rzędy albo oczka danej części. | 37 |
| `czesc` | part (a piece counted separately: a sleeve, the back, a sock) | część (element robótki) | element projektu liczony osobno, np. rękaw, tył, skarpeta. NIE: część zamienna, rozdział. | 37 |
| `powtorzenie` | repeat (pattern repeat) | powtórzenie (raport wzoru) | zestaw rzędów (albo oczek) wzoru powtarzany wielokrotnie; „Rows in one repeat”. NIE: „powtórz” w sensie ponów operację, NIE: ponowne odtwarzanie. | 5 |
| `wzor` | pattern (written instructions for a project) | wzór (opis / instrukcja wykonania) | dokument z instrukcją wykonania robótki (PDF, zdjęcie, strona). NIE: wzór splotu/ornament (ścieg), NIE: szablon/form krawiecki. | 37 |
| `schemat` | chart (knitting/crochet chart) | schemat | graficzny zapis wzoru w kratkach/symbolach, czytany zwykle od dołu. NIE: wykres statystyczny. | 2 |
| `znacznik_rzedu` | marker / row marker (on the pattern page in the app) | znacznik (rzędu na stronie wzoru) | pozioma linia w aplikacji pokazująca bieżący rząd na stronie wzoru. NIE: znacznik oczek (fizyczny kółeczko na drucie) — choć słowo bywa to samo, w aplikacji chodzi o zakładkę/linijkę. | 5 |
| `probka` | swatch | próbka | mały kawałek dzianiny wykonany przed projektem do zmierzenia gęstości. | 11 |
| `gestosc` | gauge (US) / tension (UK) | gęstość dzianiny (oczka i rzędy na 10 cm) | liczba oczek i rzędów na 10 cm / 4 in, zmierzona na próbce. NIE: kaliber, NIE: przyrząd pomiarowy (miarka do drutów). | 9 |
| `blokowanie` | block / blocking | blokowanie (wykończenie: namoczenie/naparowanie i rozpięcie) | nadanie gotowej dzianinie (lub próbce) kształtu i wymiaru przez zwilżenie/parowanie i suszenie rozpiętej. NIE: blokowanie ekranu/dostępu. | 1 |
| `wloczka` | yarn | włóczka | nić do robótek ręcznych. NIE: przędza przemysłowa w sensie technicznym, NIE: nić do szycia. | 16 |
| `motek` | skein (unit of yarn as sold; ball/hank) | motek | jednostka sprzedaży włóczki (motek/kłębek), liczona w zapasie i zużyciu. | 13 |
| `zapas` | stash (yarn stash) | zapas (włóczki) | włóczka, którą użytkownik ma w domu. NIE: kryjówka, NIE: magazyn sklepu. | 7 |
| `grubosc_wloczki` | yarn weight (category 0–7) | grubość włóczki (kategoria) | kategoria grubości nici według standardu CYC (0 lace … 7 jumbo). NIE: masa w gramach (osobne pojęcie masa_motka). | 7 |
| `masa_motka` | weight per skein (grams) | waga (masa) motka w gramach | masa jednego motka, np. 50 g. NIE: grubość włóczki. | 1 |
| `metraz` | length per skein (yardage) | długość nici w motku (metraż) | długość nici w jednym motku, np. 200 m / 50 g. | 1 |
| `etykieta_wloczki` | yarn label (ball band) | etykieta (banderola) włóczki | opaska na motku z danymi włóczki (skład, masa, długość, zalecane druty). | 4 |
| `wloczka_lace` | lace yarn / lace weight (category 0) | włóczka koronkowa (najcieńsza, kategoria 0) | najcieńsza kategoria grubości włóczki. NIE: robótka ażurowa/koronka jako technika (choć w wielu językach to samo słowo). | 2 |
| `druty` | knitting needles | druty (do robótek) | narzędzie do robienia na drutach. NIE: igły do szycia, NIE: drut metalowy. | 11 |
| `szydelko` | crochet hook | szydełko | narzędzie z haczykiem do szydełkowania. NIE: hak, haczyk wędkarski. | 11 |
| `druty_z_zylka` | circular needles | druty z żyłką (okrągłe) | dwa krótkie druty połączone żyłką, do robótki na okrągło lub dużych prac. | 1 |
| `rozmiar_drutu` | needle size / hook size (mm; US number) | rozmiar (grubość) drutów / szydełka w mm | średnica drutu lub szydełka w milimetrach (w USA dodatkowo numer). NIE: długość drutu. | 2 |
| `oczko_prawe` | knit stitch (k) | oczko prawe | podstawowe oczko przerabiane na prawo. | 0 |
| `oczko_lewe` | purl stitch (p) | oczko lewe | podstawowe oczko przerabiane na lewo. | 0 |
| `nabieranie_oczek` | cast on (CO) | nabieranie oczek | założenie pierwszych oczek na drut. | 0 |
| `zamykanie_oczek` | bind off (US) / cast off (UK) | zamykanie (zakańczanie) oczek | zdjęcie oczek z drutu tak, by dzianina się nie spruła. NIE (pl): „oczko zamykające” w szydełku (slip stitch). | 0 |
| `ujmowanie` | decrease (dec) | ujmowanie (gubienie) oczek | zmniejszenie liczby oczek, np. przez przerobienie 2 razem. | 1 |
| `dodawanie` | increase (inc) | dodawanie (dobieranie) oczek | zwiększenie liczby oczek. | 0 |
| `narzut` | yarn over (yo; UK also yfwd/yrn) | narzut | owinięcie nici wokół drutu (dodatkowa pętla, zwykle dziurka w ażurze). | 0 |
| `dwa_razem_na_prawo` | knit two together (k2tog) | 2 oczka razem na prawo | ujęcie: dwa oczka przerobione razem jak jedno prawe (pochylenie w prawo). | 0 |
| `scieg_francuski` | garter stitch | ścieg francuski | w rzędach same oczka prawe po obu stronach. | 0 |
| `sciagacz` | ribbing / rib | ściągacz | naprzemienne kolumny oczek prawych i lewych (np. 1×1, 2×2), elastyczny brzeg. | 0 |
| `lancuszek` | chain (ch) | oczko łańcuszka / łańcuszek | podstawowe oczko szydełkowe tworzące łańcuszek. | 0 |
| `oczko_zamykajace_szyd` | slip stitch (sl st) — crochet | oczko zamykające (szydełko) | najniższe oczko szydełkowe do łączenia i przesuwania się. NIE (pl): zamykanie oczek na drutach. | 0 |
| `oczko_scisle` | single crochet (US sc) = double crochet (UK dc) | oczko ścisłe / półsłupek zwykły | wkłucie, przeciągnięcie, przerobienie dwóch pętli razem — PUŁAPKA US/UK: „double crochet” w UK to ten ścieg, w US — słupek. | 0 |
| `polslupek` | half double crochet (US hdc) = half treble (UK htr) | półsłupek (nawijany) | narzut, wkłucie, przeciągnięcie, przerobienie trzech pętli razem. | 0 |
| `slupek` | double crochet (US dc) = treble (UK tr) | słupek | narzut, wkłucie, przeciągnięcie, dwa razy po dwie pętle. PUŁAPKA US/UK. | 0 |

## Terminy zalecane (pewność: ✓ wysoka, ~ średnia, ? niska = [DO SPRAWDZENIA])

| pojęcie | en | pl | bg | cs | da | de | el | es | es-419 |
|---|---|---|---|---|---|---|---|---|---|
| `robotka` | knitting ~ | robótka ~ |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `dziergac_na_drutach` | knit ✓ | robić na drutach ~ |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `szydelkowac` | crochet ✓ | szydełkować ~ |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `rzad` | row ✓ | rząd ✓ |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `okrazenie` | round ✓ | okrążenie ✓ |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `oczko` | stitch ✓ | oczko ✓ |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `scieg` | stitch pattern ~ | ścieg ✓ |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `scieg_dzersejowy` | stockinette stitch ✓ | ścieg dżersejowy ✓ |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `licznik` | counter ~ | licznik ~ |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `czesc` | part ~ | część ~ |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `powtorzenie` | repeat ✓ | powtórzenie ~ |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `wzor` | pattern ✓ | wzór ~ |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `schemat` | chart ✓ | schemat ✓ |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `znacznik_rzedu` | marker ~ | znacznik ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `probka` | swatch ✓ | próbka ✓ |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `gestosc` | gauge ✓ | gęstość splotu ✓ |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `blokowanie` | blocking ✓ | blokowanie ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `wloczka` | yarn ✓ | włóczka ✓ |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `motek` | skein ~ | motek ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `zapas` | stash ~ | zapas włóczki ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `grubosc_wloczki` | yarn weight ✓ | grubość włóczki ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `masa_motka` | weight per skein ~ | waga motka ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `metraz` | length per skein ~ | długość nici w motku ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `etykieta_wloczki` | yarn label ✓ | etykieta ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `wloczka_lace` | lace ✓ | włóczka koronkowa ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `druty` | needles ✓ | druty ✓ |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `szydelko` | hook ✓ | szydełko ✓ |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `druty_z_zylka` | circular needles ~ | druty z żyłką ~ |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `rozmiar_drutu` | size (mm) ✓ | rozmiar (mm) ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `oczko_prawe` | knit stitch ✓ | oczko prawe ✓ |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `oczko_lewe` | purl stitch ✓ | oczko lewe ✓ |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `nabieranie_oczek` | cast on ✓ | nabieranie oczek ✓ |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `zamykanie_oczek` | bind off ✓ | zakańczanie oczek ✓ |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `ujmowanie` | decrease ✓ | odejmowanie oczek ~ |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `dodawanie` | increase ✓ | dodawanie oczek ✓ |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `narzut` | yarn over ✓ | narzut ✓ |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `dwa_razem_na_prawo` | knit 2 together ✓ | 2 oczka razem na prawo ✓ |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `scieg_francuski` | garter stitch ~ | ścieg francuski ✓ |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `sciagacz` | ribbing ~ | ściągacz ✓ |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `lancuszek` | chain ✓ | oczko łańcuszka ✓ |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `oczko_zamykajace_szyd` | slip stitch ✓ | oczko zamykające ✓ |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `oczko_scisle` | single crochet ✓ | półsłupek zwykły ~ |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `polslupek` | half double crochet ✓ | półsłupek nawijany ~ |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `slupek` | double crochet ✓ | słupek ✓ |  ? |  ? |  ? |  ? |  ? |  ? |  ? |

| pojęcie | et | fi | fr | hr | hu | id | it | ja | ko |
|---|---|---|---|---|---|---|---|---|---|
| `robotka` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `dziergac_na_drutach` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `szydelkowac` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `rzad` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `okrazenie` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `oczko` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `scieg` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `scieg_dzersejowy` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `licznik` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `czesc` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `powtorzenie` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `wzor` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `schemat` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `znacznik_rzedu` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `probka` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `gestosc` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `blokowanie` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `wloczka` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `motek` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `zapas` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `grubosc_wloczki` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `masa_motka` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `metraz` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `etykieta_wloczki` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `wloczka_lace` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `druty` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `szydelko` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `druty_z_zylka` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `rozmiar_drutu` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `oczko_prawe` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `oczko_lewe` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `nabieranie_oczek` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `zamykanie_oczek` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `ujmowanie` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `dodawanie` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `narzut` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `dwa_razem_na_prawo` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `scieg_francuski` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `sciagacz` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `lancuszek` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `oczko_zamykajace_szyd` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `oczko_scisle` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `polslupek` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `slupek` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |

| pojęcie | lt | lv | ms | nb | nl | pt | pt-BR | ro | ru |
|---|---|---|---|---|---|---|---|---|---|
| `robotka` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `dziergac_na_drutach` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `szydelkowac` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `rzad` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `okrazenie` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `oczko` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `scieg` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `scieg_dzersejowy` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `licznik` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `czesc` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `powtorzenie` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `wzor` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `schemat` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `znacznik_rzedu` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `probka` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `gestosc` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `blokowanie` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `wloczka` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `motek` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `zapas` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `grubosc_wloczki` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `masa_motka` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `metraz` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `etykieta_wloczki` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `wloczka_lace` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `druty` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `szydelko` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `druty_z_zylka` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `rozmiar_drutu` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `oczko_prawe` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `oczko_lewe` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `nabieranie_oczek` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `zamykanie_oczek` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `ujmowanie` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `dodawanie` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `narzut` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `dwa_razem_na_prawo` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `scieg_francuski` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `sciagacz` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `lancuszek` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `oczko_zamykajace_szyd` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `oczko_scisle` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `polslupek` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `slupek` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |

| pojęcie | sk | sl | sr | sv | tr | uk | vi | zh-Hant |
|---|---|---|---|---|---|---|---|---|
| `robotka` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `dziergac_na_drutach` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `szydelkowac` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `rzad` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `okrazenie` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `oczko` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `scieg` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `scieg_dzersejowy` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `licznik` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `czesc` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `powtorzenie` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `wzor` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `schemat` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `znacznik_rzedu` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `probka` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `gestosc` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `blokowanie` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `wloczka` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `motek` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `zapas` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `grubosc_wloczki` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `masa_motka` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `metraz` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `etykieta_wloczki` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `wloczka_lace` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `druty` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `szydelko` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `druty_z_zylka` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `rozmiar_drutu` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `oczko_prawe` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `oczko_lewe` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `nabieranie_oczek` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `zamykanie_oczek` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `ujmowanie` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `dodawanie` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `narzut` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `dwa_razem_na_prawo` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `scieg_francuski` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `sciagacz` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `lancuszek` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `oczko_zamykajace_szyd` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `oczko_scisle` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `polslupek` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |
| `slupek` |  ? |  ? |  ? |  ? |  ? |  ? |  ? |  ? |

## Terminy zakazane (kalki)

| pojęcie | język | wzorzec | powód |
|---|---|---|---|
| `robotka` | pl | `dzianin` | „dzianina” to wyrób (materiał), nie czynność ani robótka szydełkowa |
| `rzad` | pl | `(?<![\p{L}])wiersz` | „wiersz” to wiersz tekstu/tabeli, nie rząd dzianiny |
| `rzad` | pl | `(?<![\p{L}])szereg` | kalka „row” → szereg [DO SPRAWDZENIA] |
| `oczko` | pl | `(?<![\p{L}])ścieg(?:u\|i\|ów\|iem)?(?![\p{L}])` | „stitch” jako jednostka liczona to oczko, nie ścieg (ścieg = rodzaj splotu) |
| `schemat` | pl | `wykres` | „chart” to schemat dziewiarski, nie wykres statystyczny |
| `wloczka` | pl | `przędz` | „przędza” to termin techniczny/przemysłowy; w robótkach „włóczka” [DO SPRAWDZENIA] |
| `grubosc_wloczki` | pl | `(?<![\p{L}])wag[aię]\s+włóczk` | kalka „yarn weight” — w pl grubość, nie waga [DO SPRAWDZENIA] |
| `druty` | pl | `(?<![\p{L}])igł` | „needles” w robótkach to druty, nie igły (igła dziewiarska to inne narzędzie) |
| `szydelko` | pl | `(?<![\p{L}])ha(?:k\|cz)` | „hook” to szydełko, nie hak/haczyk |
| `nabieranie_oczek` | pl | `narzucani` | „narzucanie oczek” (S-BAR) koliduje z „narzut” (yo) |
| `zamykanie_oczek` | pl | `zamyk` | niejednoznaczne: u S-BAR ujmowanie, w szydełku oczko zamykające; używać „zakańczanie” [decyzja nazwy: 06] |
| `ujmowanie` | pl | `zamykan` | „zamykanie” w pl częściej = zakańczanie (bind off) |
| `oczko_scisle` | pl | `(?<![\p{L}])słup(?:ek\|ka\|ki)(?![\p{L}])` | „słupek” to US dc; kalka UK „double crochet” → słupek przesuwa ścieg |
| `slupek` | pl | `podwójn\w* słup` | kalka „double crochet” → „podwójny słupek” to US tr |

## Do sprawdzenia przez rodzimego użytkownika albo źródło (pewność niska)

- **pl** (10): znacznik_rzedu („znacznik”), blokowanie („blokowanie”), motek („motek”), zapas („zapas włóczki”), grubosc_wloczki („grubość włóczki”), masa_motka („waga motka”), metraz („długość nici w motku”), etykieta_wloczki („etykieta”), wloczka_lace („włóczka koronkowa”), rozmiar_drutu („rozmiar (mm)”)
- **bg** (44): robotka („undefined”), dziergac_na_drutach („undefined”), szydelkowac („undefined”), rzad („undefined”), okrazenie („undefined”), oczko („undefined”), scieg („undefined”), scieg_dzersejowy („undefined”), licznik („undefined”), czesc („undefined”), powtorzenie („undefined”), wzor („undefined”), schemat („undefined”), znacznik_rzedu („undefined”), probka („undefined”), gestosc („undefined”), blokowanie („undefined”), wloczka („undefined”), motek („undefined”), zapas („undefined”), grubosc_wloczki („undefined”), masa_motka („undefined”), metraz („undefined”), etykieta_wloczki („undefined”), wloczka_lace („undefined”), druty („undefined”), szydelko („undefined”), druty_z_zylka („undefined”), rozmiar_drutu („undefined”), oczko_prawe („undefined”), oczko_lewe („undefined”), nabieranie_oczek („undefined”), zamykanie_oczek („undefined”), ujmowanie („undefined”), dodawanie („undefined”), narzut („undefined”), dwa_razem_na_prawo („undefined”), scieg_francuski („undefined”), sciagacz („undefined”), lancuszek („undefined”), oczko_zamykajace_szyd („undefined”), oczko_scisle („undefined”), polslupek („undefined”), slupek („undefined”)
- **cs** (44): robotka („undefined”), dziergac_na_drutach („undefined”), szydelkowac („undefined”), rzad („undefined”), okrazenie („undefined”), oczko („undefined”), scieg („undefined”), scieg_dzersejowy („undefined”), licznik („undefined”), czesc („undefined”), powtorzenie („undefined”), wzor („undefined”), schemat („undefined”), znacznik_rzedu („undefined”), probka („undefined”), gestosc („undefined”), blokowanie („undefined”), wloczka („undefined”), motek („undefined”), zapas („undefined”), grubosc_wloczki („undefined”), masa_motka („undefined”), metraz („undefined”), etykieta_wloczki („undefined”), wloczka_lace („undefined”), druty („undefined”), szydelko („undefined”), druty_z_zylka („undefined”), rozmiar_drutu („undefined”), oczko_prawe („undefined”), oczko_lewe („undefined”), nabieranie_oczek („undefined”), zamykanie_oczek („undefined”), ujmowanie („undefined”), dodawanie („undefined”), narzut („undefined”), dwa_razem_na_prawo („undefined”), scieg_francuski („undefined”), sciagacz („undefined”), lancuszek („undefined”), oczko_zamykajace_szyd („undefined”), oczko_scisle („undefined”), polslupek („undefined”), slupek („undefined”)
- **da** (44): robotka („undefined”), dziergac_na_drutach („undefined”), szydelkowac („undefined”), rzad („undefined”), okrazenie („undefined”), oczko („undefined”), scieg („undefined”), scieg_dzersejowy („undefined”), licznik („undefined”), czesc („undefined”), powtorzenie („undefined”), wzor („undefined”), schemat („undefined”), znacznik_rzedu („undefined”), probka („undefined”), gestosc („undefined”), blokowanie („undefined”), wloczka („undefined”), motek („undefined”), zapas („undefined”), grubosc_wloczki („undefined”), masa_motka („undefined”), metraz („undefined”), etykieta_wloczki („undefined”), wloczka_lace („undefined”), druty („undefined”), szydelko („undefined”), druty_z_zylka („undefined”), rozmiar_drutu („undefined”), oczko_prawe („undefined”), oczko_lewe („undefined”), nabieranie_oczek („undefined”), zamykanie_oczek („undefined”), ujmowanie („undefined”), dodawanie („undefined”), narzut („undefined”), dwa_razem_na_prawo („undefined”), scieg_francuski („undefined”), sciagacz („undefined”), lancuszek („undefined”), oczko_zamykajace_szyd („undefined”), oczko_scisle („undefined”), polslupek („undefined”), slupek („undefined”)
- **de** (44): robotka („undefined”), dziergac_na_drutach („undefined”), szydelkowac („undefined”), rzad („undefined”), okrazenie („undefined”), oczko („undefined”), scieg („undefined”), scieg_dzersejowy („undefined”), licznik („undefined”), czesc („undefined”), powtorzenie („undefined”), wzor („undefined”), schemat („undefined”), znacznik_rzedu („undefined”), probka („undefined”), gestosc („undefined”), blokowanie („undefined”), wloczka („undefined”), motek („undefined”), zapas („undefined”), grubosc_wloczki („undefined”), masa_motka („undefined”), metraz („undefined”), etykieta_wloczki („undefined”), wloczka_lace („undefined”), druty („undefined”), szydelko („undefined”), druty_z_zylka („undefined”), rozmiar_drutu („undefined”), oczko_prawe („undefined”), oczko_lewe („undefined”), nabieranie_oczek („undefined”), zamykanie_oczek („undefined”), ujmowanie („undefined”), dodawanie („undefined”), narzut („undefined”), dwa_razem_na_prawo („undefined”), scieg_francuski („undefined”), sciagacz („undefined”), lancuszek („undefined”), oczko_zamykajace_szyd („undefined”), oczko_scisle („undefined”), polslupek („undefined”), slupek („undefined”)
- **el** (44): robotka („undefined”), dziergac_na_drutach („undefined”), szydelkowac („undefined”), rzad („undefined”), okrazenie („undefined”), oczko („undefined”), scieg („undefined”), scieg_dzersejowy („undefined”), licznik („undefined”), czesc („undefined”), powtorzenie („undefined”), wzor („undefined”), schemat („undefined”), znacznik_rzedu („undefined”), probka („undefined”), gestosc („undefined”), blokowanie („undefined”), wloczka („undefined”), motek („undefined”), zapas („undefined”), grubosc_wloczki („undefined”), masa_motka („undefined”), metraz („undefined”), etykieta_wloczki („undefined”), wloczka_lace („undefined”), druty („undefined”), szydelko („undefined”), druty_z_zylka („undefined”), rozmiar_drutu („undefined”), oczko_prawe („undefined”), oczko_lewe („undefined”), nabieranie_oczek („undefined”), zamykanie_oczek („undefined”), ujmowanie („undefined”), dodawanie („undefined”), narzut („undefined”), dwa_razem_na_prawo („undefined”), scieg_francuski („undefined”), sciagacz („undefined”), lancuszek („undefined”), oczko_zamykajace_szyd („undefined”), oczko_scisle („undefined”), polslupek („undefined”), slupek („undefined”)
- **es** (44): robotka („undefined”), dziergac_na_drutach („undefined”), szydelkowac („undefined”), rzad („undefined”), okrazenie („undefined”), oczko („undefined”), scieg („undefined”), scieg_dzersejowy („undefined”), licznik („undefined”), czesc („undefined”), powtorzenie („undefined”), wzor („undefined”), schemat („undefined”), znacznik_rzedu („undefined”), probka („undefined”), gestosc („undefined”), blokowanie („undefined”), wloczka („undefined”), motek („undefined”), zapas („undefined”), grubosc_wloczki („undefined”), masa_motka („undefined”), metraz („undefined”), etykieta_wloczki („undefined”), wloczka_lace („undefined”), druty („undefined”), szydelko („undefined”), druty_z_zylka („undefined”), rozmiar_drutu („undefined”), oczko_prawe („undefined”), oczko_lewe („undefined”), nabieranie_oczek („undefined”), zamykanie_oczek („undefined”), ujmowanie („undefined”), dodawanie („undefined”), narzut („undefined”), dwa_razem_na_prawo („undefined”), scieg_francuski („undefined”), sciagacz („undefined”), lancuszek („undefined”), oczko_zamykajace_szyd („undefined”), oczko_scisle („undefined”), polslupek („undefined”), slupek („undefined”)
- **es-419** (44): robotka („undefined”), dziergac_na_drutach („undefined”), szydelkowac („undefined”), rzad („undefined”), okrazenie („undefined”), oczko („undefined”), scieg („undefined”), scieg_dzersejowy („undefined”), licznik („undefined”), czesc („undefined”), powtorzenie („undefined”), wzor („undefined”), schemat („undefined”), znacznik_rzedu („undefined”), probka („undefined”), gestosc („undefined”), blokowanie („undefined”), wloczka („undefined”), motek („undefined”), zapas („undefined”), grubosc_wloczki („undefined”), masa_motka („undefined”), metraz („undefined”), etykieta_wloczki („undefined”), wloczka_lace („undefined”), druty („undefined”), szydelko („undefined”), druty_z_zylka („undefined”), rozmiar_drutu („undefined”), oczko_prawe („undefined”), oczko_lewe („undefined”), nabieranie_oczek („undefined”), zamykanie_oczek („undefined”), ujmowanie („undefined”), dodawanie („undefined”), narzut („undefined”), dwa_razem_na_prawo („undefined”), scieg_francuski („undefined”), sciagacz („undefined”), lancuszek („undefined”), oczko_zamykajace_szyd („undefined”), oczko_scisle („undefined”), polslupek („undefined”), slupek („undefined”)
- **et** (44): robotka („undefined”), dziergac_na_drutach („undefined”), szydelkowac („undefined”), rzad („undefined”), okrazenie („undefined”), oczko („undefined”), scieg („undefined”), scieg_dzersejowy („undefined”), licznik („undefined”), czesc („undefined”), powtorzenie („undefined”), wzor („undefined”), schemat („undefined”), znacznik_rzedu („undefined”), probka („undefined”), gestosc („undefined”), blokowanie („undefined”), wloczka („undefined”), motek („undefined”), zapas („undefined”), grubosc_wloczki („undefined”), masa_motka („undefined”), metraz („undefined”), etykieta_wloczki („undefined”), wloczka_lace („undefined”), druty („undefined”), szydelko („undefined”), druty_z_zylka („undefined”), rozmiar_drutu („undefined”), oczko_prawe („undefined”), oczko_lewe („undefined”), nabieranie_oczek („undefined”), zamykanie_oczek („undefined”), ujmowanie („undefined”), dodawanie („undefined”), narzut („undefined”), dwa_razem_na_prawo („undefined”), scieg_francuski („undefined”), sciagacz („undefined”), lancuszek („undefined”), oczko_zamykajace_szyd („undefined”), oczko_scisle („undefined”), polslupek („undefined”), slupek („undefined”)
- **fi** (44): robotka („undefined”), dziergac_na_drutach („undefined”), szydelkowac („undefined”), rzad („undefined”), okrazenie („undefined”), oczko („undefined”), scieg („undefined”), scieg_dzersejowy („undefined”), licznik („undefined”), czesc („undefined”), powtorzenie („undefined”), wzor („undefined”), schemat („undefined”), znacznik_rzedu („undefined”), probka („undefined”), gestosc („undefined”), blokowanie („undefined”), wloczka („undefined”), motek („undefined”), zapas („undefined”), grubosc_wloczki („undefined”), masa_motka („undefined”), metraz („undefined”), etykieta_wloczki („undefined”), wloczka_lace („undefined”), druty („undefined”), szydelko („undefined”), druty_z_zylka („undefined”), rozmiar_drutu („undefined”), oczko_prawe („undefined”), oczko_lewe („undefined”), nabieranie_oczek („undefined”), zamykanie_oczek („undefined”), ujmowanie („undefined”), dodawanie („undefined”), narzut („undefined”), dwa_razem_na_prawo („undefined”), scieg_francuski („undefined”), sciagacz („undefined”), lancuszek („undefined”), oczko_zamykajace_szyd („undefined”), oczko_scisle („undefined”), polslupek („undefined”), slupek („undefined”)
- **fr** (44): robotka („undefined”), dziergac_na_drutach („undefined”), szydelkowac („undefined”), rzad („undefined”), okrazenie („undefined”), oczko („undefined”), scieg („undefined”), scieg_dzersejowy („undefined”), licznik („undefined”), czesc („undefined”), powtorzenie („undefined”), wzor („undefined”), schemat („undefined”), znacznik_rzedu („undefined”), probka („undefined”), gestosc („undefined”), blokowanie („undefined”), wloczka („undefined”), motek („undefined”), zapas („undefined”), grubosc_wloczki („undefined”), masa_motka („undefined”), metraz („undefined”), etykieta_wloczki („undefined”), wloczka_lace („undefined”), druty („undefined”), szydelko („undefined”), druty_z_zylka („undefined”), rozmiar_drutu („undefined”), oczko_prawe („undefined”), oczko_lewe („undefined”), nabieranie_oczek („undefined”), zamykanie_oczek („undefined”), ujmowanie („undefined”), dodawanie („undefined”), narzut („undefined”), dwa_razem_na_prawo („undefined”), scieg_francuski („undefined”), sciagacz („undefined”), lancuszek („undefined”), oczko_zamykajace_szyd („undefined”), oczko_scisle („undefined”), polslupek („undefined”), slupek („undefined”)
- **hr** (44): robotka („undefined”), dziergac_na_drutach („undefined”), szydelkowac („undefined”), rzad („undefined”), okrazenie („undefined”), oczko („undefined”), scieg („undefined”), scieg_dzersejowy („undefined”), licznik („undefined”), czesc („undefined”), powtorzenie („undefined”), wzor („undefined”), schemat („undefined”), znacznik_rzedu („undefined”), probka („undefined”), gestosc („undefined”), blokowanie („undefined”), wloczka („undefined”), motek („undefined”), zapas („undefined”), grubosc_wloczki („undefined”), masa_motka („undefined”), metraz („undefined”), etykieta_wloczki („undefined”), wloczka_lace („undefined”), druty („undefined”), szydelko („undefined”), druty_z_zylka („undefined”), rozmiar_drutu („undefined”), oczko_prawe („undefined”), oczko_lewe („undefined”), nabieranie_oczek („undefined”), zamykanie_oczek („undefined”), ujmowanie („undefined”), dodawanie („undefined”), narzut („undefined”), dwa_razem_na_prawo („undefined”), scieg_francuski („undefined”), sciagacz („undefined”), lancuszek („undefined”), oczko_zamykajace_szyd („undefined”), oczko_scisle („undefined”), polslupek („undefined”), slupek („undefined”)
- **hu** (44): robotka („undefined”), dziergac_na_drutach („undefined”), szydelkowac („undefined”), rzad („undefined”), okrazenie („undefined”), oczko („undefined”), scieg („undefined”), scieg_dzersejowy („undefined”), licznik („undefined”), czesc („undefined”), powtorzenie („undefined”), wzor („undefined”), schemat („undefined”), znacznik_rzedu („undefined”), probka („undefined”), gestosc („undefined”), blokowanie („undefined”), wloczka („undefined”), motek („undefined”), zapas („undefined”), grubosc_wloczki („undefined”), masa_motka („undefined”), metraz („undefined”), etykieta_wloczki („undefined”), wloczka_lace („undefined”), druty („undefined”), szydelko („undefined”), druty_z_zylka („undefined”), rozmiar_drutu („undefined”), oczko_prawe („undefined”), oczko_lewe („undefined”), nabieranie_oczek („undefined”), zamykanie_oczek („undefined”), ujmowanie („undefined”), dodawanie („undefined”), narzut („undefined”), dwa_razem_na_prawo („undefined”), scieg_francuski („undefined”), sciagacz („undefined”), lancuszek („undefined”), oczko_zamykajace_szyd („undefined”), oczko_scisle („undefined”), polslupek („undefined”), slupek („undefined”)
- **id** (44): robotka („undefined”), dziergac_na_drutach („undefined”), szydelkowac („undefined”), rzad („undefined”), okrazenie („undefined”), oczko („undefined”), scieg („undefined”), scieg_dzersejowy („undefined”), licznik („undefined”), czesc („undefined”), powtorzenie („undefined”), wzor („undefined”), schemat („undefined”), znacznik_rzedu („undefined”), probka („undefined”), gestosc („undefined”), blokowanie („undefined”), wloczka („undefined”), motek („undefined”), zapas („undefined”), grubosc_wloczki („undefined”), masa_motka („undefined”), metraz („undefined”), etykieta_wloczki („undefined”), wloczka_lace („undefined”), druty („undefined”), szydelko („undefined”), druty_z_zylka („undefined”), rozmiar_drutu („undefined”), oczko_prawe („undefined”), oczko_lewe („undefined”), nabieranie_oczek („undefined”), zamykanie_oczek („undefined”), ujmowanie („undefined”), dodawanie („undefined”), narzut („undefined”), dwa_razem_na_prawo („undefined”), scieg_francuski („undefined”), sciagacz („undefined”), lancuszek („undefined”), oczko_zamykajace_szyd („undefined”), oczko_scisle („undefined”), polslupek („undefined”), slupek („undefined”)
- **it** (44): robotka („undefined”), dziergac_na_drutach („undefined”), szydelkowac („undefined”), rzad („undefined”), okrazenie („undefined”), oczko („undefined”), scieg („undefined”), scieg_dzersejowy („undefined”), licznik („undefined”), czesc („undefined”), powtorzenie („undefined”), wzor („undefined”), schemat („undefined”), znacznik_rzedu („undefined”), probka („undefined”), gestosc („undefined”), blokowanie („undefined”), wloczka („undefined”), motek („undefined”), zapas („undefined”), grubosc_wloczki („undefined”), masa_motka („undefined”), metraz („undefined”), etykieta_wloczki („undefined”), wloczka_lace („undefined”), druty („undefined”), szydelko („undefined”), druty_z_zylka („undefined”), rozmiar_drutu („undefined”), oczko_prawe („undefined”), oczko_lewe („undefined”), nabieranie_oczek („undefined”), zamykanie_oczek („undefined”), ujmowanie („undefined”), dodawanie („undefined”), narzut („undefined”), dwa_razem_na_prawo („undefined”), scieg_francuski („undefined”), sciagacz („undefined”), lancuszek („undefined”), oczko_zamykajace_szyd („undefined”), oczko_scisle („undefined”), polslupek („undefined”), slupek („undefined”)
- **ja** (44): robotka („undefined”), dziergac_na_drutach („undefined”), szydelkowac („undefined”), rzad („undefined”), okrazenie („undefined”), oczko („undefined”), scieg („undefined”), scieg_dzersejowy („undefined”), licznik („undefined”), czesc („undefined”), powtorzenie („undefined”), wzor („undefined”), schemat („undefined”), znacznik_rzedu („undefined”), probka („undefined”), gestosc („undefined”), blokowanie („undefined”), wloczka („undefined”), motek („undefined”), zapas („undefined”), grubosc_wloczki („undefined”), masa_motka („undefined”), metraz („undefined”), etykieta_wloczki („undefined”), wloczka_lace („undefined”), druty („undefined”), szydelko („undefined”), druty_z_zylka („undefined”), rozmiar_drutu („undefined”), oczko_prawe („undefined”), oczko_lewe („undefined”), nabieranie_oczek („undefined”), zamykanie_oczek („undefined”), ujmowanie („undefined”), dodawanie („undefined”), narzut („undefined”), dwa_razem_na_prawo („undefined”), scieg_francuski („undefined”), sciagacz („undefined”), lancuszek („undefined”), oczko_zamykajace_szyd („undefined”), oczko_scisle („undefined”), polslupek („undefined”), slupek („undefined”)
- **ko** (44): robotka („undefined”), dziergac_na_drutach („undefined”), szydelkowac („undefined”), rzad („undefined”), okrazenie („undefined”), oczko („undefined”), scieg („undefined”), scieg_dzersejowy („undefined”), licznik („undefined”), czesc („undefined”), powtorzenie („undefined”), wzor („undefined”), schemat („undefined”), znacznik_rzedu („undefined”), probka („undefined”), gestosc („undefined”), blokowanie („undefined”), wloczka („undefined”), motek („undefined”), zapas („undefined”), grubosc_wloczki („undefined”), masa_motka („undefined”), metraz („undefined”), etykieta_wloczki („undefined”), wloczka_lace („undefined”), druty („undefined”), szydelko („undefined”), druty_z_zylka („undefined”), rozmiar_drutu („undefined”), oczko_prawe („undefined”), oczko_lewe („undefined”), nabieranie_oczek („undefined”), zamykanie_oczek („undefined”), ujmowanie („undefined”), dodawanie („undefined”), narzut („undefined”), dwa_razem_na_prawo („undefined”), scieg_francuski („undefined”), sciagacz („undefined”), lancuszek („undefined”), oczko_zamykajace_szyd („undefined”), oczko_scisle („undefined”), polslupek („undefined”), slupek („undefined”)
- **lt** (44): robotka („undefined”), dziergac_na_drutach („undefined”), szydelkowac („undefined”), rzad („undefined”), okrazenie („undefined”), oczko („undefined”), scieg („undefined”), scieg_dzersejowy („undefined”), licznik („undefined”), czesc („undefined”), powtorzenie („undefined”), wzor („undefined”), schemat („undefined”), znacznik_rzedu („undefined”), probka („undefined”), gestosc („undefined”), blokowanie („undefined”), wloczka („undefined”), motek („undefined”), zapas („undefined”), grubosc_wloczki („undefined”), masa_motka („undefined”), metraz („undefined”), etykieta_wloczki („undefined”), wloczka_lace („undefined”), druty („undefined”), szydelko („undefined”), druty_z_zylka („undefined”), rozmiar_drutu („undefined”), oczko_prawe („undefined”), oczko_lewe („undefined”), nabieranie_oczek („undefined”), zamykanie_oczek („undefined”), ujmowanie („undefined”), dodawanie („undefined”), narzut („undefined”), dwa_razem_na_prawo („undefined”), scieg_francuski („undefined”), sciagacz („undefined”), lancuszek („undefined”), oczko_zamykajace_szyd („undefined”), oczko_scisle („undefined”), polslupek („undefined”), slupek („undefined”)
- **lv** (44): robotka („undefined”), dziergac_na_drutach („undefined”), szydelkowac („undefined”), rzad („undefined”), okrazenie („undefined”), oczko („undefined”), scieg („undefined”), scieg_dzersejowy („undefined”), licznik („undefined”), czesc („undefined”), powtorzenie („undefined”), wzor („undefined”), schemat („undefined”), znacznik_rzedu („undefined”), probka („undefined”), gestosc („undefined”), blokowanie („undefined”), wloczka („undefined”), motek („undefined”), zapas („undefined”), grubosc_wloczki („undefined”), masa_motka („undefined”), metraz („undefined”), etykieta_wloczki („undefined”), wloczka_lace („undefined”), druty („undefined”), szydelko („undefined”), druty_z_zylka („undefined”), rozmiar_drutu („undefined”), oczko_prawe („undefined”), oczko_lewe („undefined”), nabieranie_oczek („undefined”), zamykanie_oczek („undefined”), ujmowanie („undefined”), dodawanie („undefined”), narzut („undefined”), dwa_razem_na_prawo („undefined”), scieg_francuski („undefined”), sciagacz („undefined”), lancuszek („undefined”), oczko_zamykajace_szyd („undefined”), oczko_scisle („undefined”), polslupek („undefined”), slupek („undefined”)
- **ms** (44): robotka („undefined”), dziergac_na_drutach („undefined”), szydelkowac („undefined”), rzad („undefined”), okrazenie („undefined”), oczko („undefined”), scieg („undefined”), scieg_dzersejowy („undefined”), licznik („undefined”), czesc („undefined”), powtorzenie („undefined”), wzor („undefined”), schemat („undefined”), znacznik_rzedu („undefined”), probka („undefined”), gestosc („undefined”), blokowanie („undefined”), wloczka („undefined”), motek („undefined”), zapas („undefined”), grubosc_wloczki („undefined”), masa_motka („undefined”), metraz („undefined”), etykieta_wloczki („undefined”), wloczka_lace („undefined”), druty („undefined”), szydelko („undefined”), druty_z_zylka („undefined”), rozmiar_drutu („undefined”), oczko_prawe („undefined”), oczko_lewe („undefined”), nabieranie_oczek („undefined”), zamykanie_oczek („undefined”), ujmowanie („undefined”), dodawanie („undefined”), narzut („undefined”), dwa_razem_na_prawo („undefined”), scieg_francuski („undefined”), sciagacz („undefined”), lancuszek („undefined”), oczko_zamykajace_szyd („undefined”), oczko_scisle („undefined”), polslupek („undefined”), slupek („undefined”)
- **nb** (44): robotka („undefined”), dziergac_na_drutach („undefined”), szydelkowac („undefined”), rzad („undefined”), okrazenie („undefined”), oczko („undefined”), scieg („undefined”), scieg_dzersejowy („undefined”), licznik („undefined”), czesc („undefined”), powtorzenie („undefined”), wzor („undefined”), schemat („undefined”), znacznik_rzedu („undefined”), probka („undefined”), gestosc („undefined”), blokowanie („undefined”), wloczka („undefined”), motek („undefined”), zapas („undefined”), grubosc_wloczki („undefined”), masa_motka („undefined”), metraz („undefined”), etykieta_wloczki („undefined”), wloczka_lace („undefined”), druty („undefined”), szydelko („undefined”), druty_z_zylka („undefined”), rozmiar_drutu („undefined”), oczko_prawe („undefined”), oczko_lewe („undefined”), nabieranie_oczek („undefined”), zamykanie_oczek („undefined”), ujmowanie („undefined”), dodawanie („undefined”), narzut („undefined”), dwa_razem_na_prawo („undefined”), scieg_francuski („undefined”), sciagacz („undefined”), lancuszek („undefined”), oczko_zamykajace_szyd („undefined”), oczko_scisle („undefined”), polslupek („undefined”), slupek („undefined”)
- **nl** (44): robotka („undefined”), dziergac_na_drutach („undefined”), szydelkowac („undefined”), rzad („undefined”), okrazenie („undefined”), oczko („undefined”), scieg („undefined”), scieg_dzersejowy („undefined”), licznik („undefined”), czesc („undefined”), powtorzenie („undefined”), wzor („undefined”), schemat („undefined”), znacznik_rzedu („undefined”), probka („undefined”), gestosc („undefined”), blokowanie („undefined”), wloczka („undefined”), motek („undefined”), zapas („undefined”), grubosc_wloczki („undefined”), masa_motka („undefined”), metraz („undefined”), etykieta_wloczki („undefined”), wloczka_lace („undefined”), druty („undefined”), szydelko („undefined”), druty_z_zylka („undefined”), rozmiar_drutu („undefined”), oczko_prawe („undefined”), oczko_lewe („undefined”), nabieranie_oczek („undefined”), zamykanie_oczek („undefined”), ujmowanie („undefined”), dodawanie („undefined”), narzut („undefined”), dwa_razem_na_prawo („undefined”), scieg_francuski („undefined”), sciagacz („undefined”), lancuszek („undefined”), oczko_zamykajace_szyd („undefined”), oczko_scisle („undefined”), polslupek („undefined”), slupek („undefined”)
- **pt** (44): robotka („undefined”), dziergac_na_drutach („undefined”), szydelkowac („undefined”), rzad („undefined”), okrazenie („undefined”), oczko („undefined”), scieg („undefined”), scieg_dzersejowy („undefined”), licznik („undefined”), czesc („undefined”), powtorzenie („undefined”), wzor („undefined”), schemat („undefined”), znacznik_rzedu („undefined”), probka („undefined”), gestosc („undefined”), blokowanie („undefined”), wloczka („undefined”), motek („undefined”), zapas („undefined”), grubosc_wloczki („undefined”), masa_motka („undefined”), metraz („undefined”), etykieta_wloczki („undefined”), wloczka_lace („undefined”), druty („undefined”), szydelko („undefined”), druty_z_zylka („undefined”), rozmiar_drutu („undefined”), oczko_prawe („undefined”), oczko_lewe („undefined”), nabieranie_oczek („undefined”), zamykanie_oczek („undefined”), ujmowanie („undefined”), dodawanie („undefined”), narzut („undefined”), dwa_razem_na_prawo („undefined”), scieg_francuski („undefined”), sciagacz („undefined”), lancuszek („undefined”), oczko_zamykajace_szyd („undefined”), oczko_scisle („undefined”), polslupek („undefined”), slupek („undefined”)
- **pt-BR** (44): robotka („undefined”), dziergac_na_drutach („undefined”), szydelkowac („undefined”), rzad („undefined”), okrazenie („undefined”), oczko („undefined”), scieg („undefined”), scieg_dzersejowy („undefined”), licznik („undefined”), czesc („undefined”), powtorzenie („undefined”), wzor („undefined”), schemat („undefined”), znacznik_rzedu („undefined”), probka („undefined”), gestosc („undefined”), blokowanie („undefined”), wloczka („undefined”), motek („undefined”), zapas („undefined”), grubosc_wloczki („undefined”), masa_motka („undefined”), metraz („undefined”), etykieta_wloczki („undefined”), wloczka_lace („undefined”), druty („undefined”), szydelko („undefined”), druty_z_zylka („undefined”), rozmiar_drutu („undefined”), oczko_prawe („undefined”), oczko_lewe („undefined”), nabieranie_oczek („undefined”), zamykanie_oczek („undefined”), ujmowanie („undefined”), dodawanie („undefined”), narzut („undefined”), dwa_razem_na_prawo („undefined”), scieg_francuski („undefined”), sciagacz („undefined”), lancuszek („undefined”), oczko_zamykajace_szyd („undefined”), oczko_scisle („undefined”), polslupek („undefined”), slupek („undefined”)
- **ro** (44): robotka („undefined”), dziergac_na_drutach („undefined”), szydelkowac („undefined”), rzad („undefined”), okrazenie („undefined”), oczko („undefined”), scieg („undefined”), scieg_dzersejowy („undefined”), licznik („undefined”), czesc („undefined”), powtorzenie („undefined”), wzor („undefined”), schemat („undefined”), znacznik_rzedu („undefined”), probka („undefined”), gestosc („undefined”), blokowanie („undefined”), wloczka („undefined”), motek („undefined”), zapas („undefined”), grubosc_wloczki („undefined”), masa_motka („undefined”), metraz („undefined”), etykieta_wloczki („undefined”), wloczka_lace („undefined”), druty („undefined”), szydelko („undefined”), druty_z_zylka („undefined”), rozmiar_drutu („undefined”), oczko_prawe („undefined”), oczko_lewe („undefined”), nabieranie_oczek („undefined”), zamykanie_oczek („undefined”), ujmowanie („undefined”), dodawanie („undefined”), narzut („undefined”), dwa_razem_na_prawo („undefined”), scieg_francuski („undefined”), sciagacz („undefined”), lancuszek („undefined”), oczko_zamykajace_szyd („undefined”), oczko_scisle („undefined”), polslupek („undefined”), slupek („undefined”)
- **ru** (44): robotka („undefined”), dziergac_na_drutach („undefined”), szydelkowac („undefined”), rzad („undefined”), okrazenie („undefined”), oczko („undefined”), scieg („undefined”), scieg_dzersejowy („undefined”), licznik („undefined”), czesc („undefined”), powtorzenie („undefined”), wzor („undefined”), schemat („undefined”), znacznik_rzedu („undefined”), probka („undefined”), gestosc („undefined”), blokowanie („undefined”), wloczka („undefined”), motek („undefined”), zapas („undefined”), grubosc_wloczki („undefined”), masa_motka („undefined”), metraz („undefined”), etykieta_wloczki („undefined”), wloczka_lace („undefined”), druty („undefined”), szydelko („undefined”), druty_z_zylka („undefined”), rozmiar_drutu („undefined”), oczko_prawe („undefined”), oczko_lewe („undefined”), nabieranie_oczek („undefined”), zamykanie_oczek („undefined”), ujmowanie („undefined”), dodawanie („undefined”), narzut („undefined”), dwa_razem_na_prawo („undefined”), scieg_francuski („undefined”), sciagacz („undefined”), lancuszek („undefined”), oczko_zamykajace_szyd („undefined”), oczko_scisle („undefined”), polslupek („undefined”), slupek („undefined”)
- **sk** (44): robotka („undefined”), dziergac_na_drutach („undefined”), szydelkowac („undefined”), rzad („undefined”), okrazenie („undefined”), oczko („undefined”), scieg („undefined”), scieg_dzersejowy („undefined”), licznik („undefined”), czesc („undefined”), powtorzenie („undefined”), wzor („undefined”), schemat („undefined”), znacznik_rzedu („undefined”), probka („undefined”), gestosc („undefined”), blokowanie („undefined”), wloczka („undefined”), motek („undefined”), zapas („undefined”), grubosc_wloczki („undefined”), masa_motka („undefined”), metraz („undefined”), etykieta_wloczki („undefined”), wloczka_lace („undefined”), druty („undefined”), szydelko („undefined”), druty_z_zylka („undefined”), rozmiar_drutu („undefined”), oczko_prawe („undefined”), oczko_lewe („undefined”), nabieranie_oczek („undefined”), zamykanie_oczek („undefined”), ujmowanie („undefined”), dodawanie („undefined”), narzut („undefined”), dwa_razem_na_prawo („undefined”), scieg_francuski („undefined”), sciagacz („undefined”), lancuszek („undefined”), oczko_zamykajace_szyd („undefined”), oczko_scisle („undefined”), polslupek („undefined”), slupek („undefined”)
- **sl** (44): robotka („undefined”), dziergac_na_drutach („undefined”), szydelkowac („undefined”), rzad („undefined”), okrazenie („undefined”), oczko („undefined”), scieg („undefined”), scieg_dzersejowy („undefined”), licznik („undefined”), czesc („undefined”), powtorzenie („undefined”), wzor („undefined”), schemat („undefined”), znacznik_rzedu („undefined”), probka („undefined”), gestosc („undefined”), blokowanie („undefined”), wloczka („undefined”), motek („undefined”), zapas („undefined”), grubosc_wloczki („undefined”), masa_motka („undefined”), metraz („undefined”), etykieta_wloczki („undefined”), wloczka_lace („undefined”), druty („undefined”), szydelko („undefined”), druty_z_zylka („undefined”), rozmiar_drutu („undefined”), oczko_prawe („undefined”), oczko_lewe („undefined”), nabieranie_oczek („undefined”), zamykanie_oczek („undefined”), ujmowanie („undefined”), dodawanie („undefined”), narzut („undefined”), dwa_razem_na_prawo („undefined”), scieg_francuski („undefined”), sciagacz („undefined”), lancuszek („undefined”), oczko_zamykajace_szyd („undefined”), oczko_scisle („undefined”), polslupek („undefined”), slupek („undefined”)
- **sr** (44): robotka („undefined”), dziergac_na_drutach („undefined”), szydelkowac („undefined”), rzad („undefined”), okrazenie („undefined”), oczko („undefined”), scieg („undefined”), scieg_dzersejowy („undefined”), licznik („undefined”), czesc („undefined”), powtorzenie („undefined”), wzor („undefined”), schemat („undefined”), znacznik_rzedu („undefined”), probka („undefined”), gestosc („undefined”), blokowanie („undefined”), wloczka („undefined”), motek („undefined”), zapas („undefined”), grubosc_wloczki („undefined”), masa_motka („undefined”), metraz („undefined”), etykieta_wloczki („undefined”), wloczka_lace („undefined”), druty („undefined”), szydelko („undefined”), druty_z_zylka („undefined”), rozmiar_drutu („undefined”), oczko_prawe („undefined”), oczko_lewe („undefined”), nabieranie_oczek („undefined”), zamykanie_oczek („undefined”), ujmowanie („undefined”), dodawanie („undefined”), narzut („undefined”), dwa_razem_na_prawo („undefined”), scieg_francuski („undefined”), sciagacz („undefined”), lancuszek („undefined”), oczko_zamykajace_szyd („undefined”), oczko_scisle („undefined”), polslupek („undefined”), slupek („undefined”)
- **sv** (44): robotka („undefined”), dziergac_na_drutach („undefined”), szydelkowac („undefined”), rzad („undefined”), okrazenie („undefined”), oczko („undefined”), scieg („undefined”), scieg_dzersejowy („undefined”), licznik („undefined”), czesc („undefined”), powtorzenie („undefined”), wzor („undefined”), schemat („undefined”), znacznik_rzedu („undefined”), probka („undefined”), gestosc („undefined”), blokowanie („undefined”), wloczka („undefined”), motek („undefined”), zapas („undefined”), grubosc_wloczki („undefined”), masa_motka („undefined”), metraz („undefined”), etykieta_wloczki („undefined”), wloczka_lace („undefined”), druty („undefined”), szydelko („undefined”), druty_z_zylka („undefined”), rozmiar_drutu („undefined”), oczko_prawe („undefined”), oczko_lewe („undefined”), nabieranie_oczek („undefined”), zamykanie_oczek („undefined”), ujmowanie („undefined”), dodawanie („undefined”), narzut („undefined”), dwa_razem_na_prawo („undefined”), scieg_francuski („undefined”), sciagacz („undefined”), lancuszek („undefined”), oczko_zamykajace_szyd („undefined”), oczko_scisle („undefined”), polslupek („undefined”), slupek („undefined”)
- **tr** (44): robotka („undefined”), dziergac_na_drutach („undefined”), szydelkowac („undefined”), rzad („undefined”), okrazenie („undefined”), oczko („undefined”), scieg („undefined”), scieg_dzersejowy („undefined”), licznik („undefined”), czesc („undefined”), powtorzenie („undefined”), wzor („undefined”), schemat („undefined”), znacznik_rzedu („undefined”), probka („undefined”), gestosc („undefined”), blokowanie („undefined”), wloczka („undefined”), motek („undefined”), zapas („undefined”), grubosc_wloczki („undefined”), masa_motka („undefined”), metraz („undefined”), etykieta_wloczki („undefined”), wloczka_lace („undefined”), druty („undefined”), szydelko („undefined”), druty_z_zylka („undefined”), rozmiar_drutu („undefined”), oczko_prawe („undefined”), oczko_lewe („undefined”), nabieranie_oczek („undefined”), zamykanie_oczek („undefined”), ujmowanie („undefined”), dodawanie („undefined”), narzut („undefined”), dwa_razem_na_prawo („undefined”), scieg_francuski („undefined”), sciagacz („undefined”), lancuszek („undefined”), oczko_zamykajace_szyd („undefined”), oczko_scisle („undefined”), polslupek („undefined”), slupek („undefined”)
- **uk** (44): robotka („undefined”), dziergac_na_drutach („undefined”), szydelkowac („undefined”), rzad („undefined”), okrazenie („undefined”), oczko („undefined”), scieg („undefined”), scieg_dzersejowy („undefined”), licznik („undefined”), czesc („undefined”), powtorzenie („undefined”), wzor („undefined”), schemat („undefined”), znacznik_rzedu („undefined”), probka („undefined”), gestosc („undefined”), blokowanie („undefined”), wloczka („undefined”), motek („undefined”), zapas („undefined”), grubosc_wloczki („undefined”), masa_motka („undefined”), metraz („undefined”), etykieta_wloczki („undefined”), wloczka_lace („undefined”), druty („undefined”), szydelko („undefined”), druty_z_zylka („undefined”), rozmiar_drutu („undefined”), oczko_prawe („undefined”), oczko_lewe („undefined”), nabieranie_oczek („undefined”), zamykanie_oczek („undefined”), ujmowanie („undefined”), dodawanie („undefined”), narzut („undefined”), dwa_razem_na_prawo („undefined”), scieg_francuski („undefined”), sciagacz („undefined”), lancuszek („undefined”), oczko_zamykajace_szyd („undefined”), oczko_scisle („undefined”), polslupek („undefined”), slupek („undefined”)
- **vi** (44): robotka („undefined”), dziergac_na_drutach („undefined”), szydelkowac („undefined”), rzad („undefined”), okrazenie („undefined”), oczko („undefined”), scieg („undefined”), scieg_dzersejowy („undefined”), licznik („undefined”), czesc („undefined”), powtorzenie („undefined”), wzor („undefined”), schemat („undefined”), znacznik_rzedu („undefined”), probka („undefined”), gestosc („undefined”), blokowanie („undefined”), wloczka („undefined”), motek („undefined”), zapas („undefined”), grubosc_wloczki („undefined”), masa_motka („undefined”), metraz („undefined”), etykieta_wloczki („undefined”), wloczka_lace („undefined”), druty („undefined”), szydelko („undefined”), druty_z_zylka („undefined”), rozmiar_drutu („undefined”), oczko_prawe („undefined”), oczko_lewe („undefined”), nabieranie_oczek („undefined”), zamykanie_oczek („undefined”), ujmowanie („undefined”), dodawanie („undefined”), narzut („undefined”), dwa_razem_na_prawo („undefined”), scieg_francuski („undefined”), sciagacz („undefined”), lancuszek („undefined”), oczko_zamykajace_szyd („undefined”), oczko_scisle („undefined”), polslupek („undefined”), slupek („undefined”)
- **zh-Hant** (44): robotka („undefined”), dziergac_na_drutach („undefined”), szydelkowac („undefined”), rzad („undefined”), okrazenie („undefined”), oczko („undefined”), scieg („undefined”), scieg_dzersejowy („undefined”), licznik („undefined”), czesc („undefined”), powtorzenie („undefined”), wzor („undefined”), schemat („undefined”), znacznik_rzedu („undefined”), probka („undefined”), gestosc („undefined”), blokowanie („undefined”), wloczka („undefined”), motek („undefined”), zapas („undefined”), grubosc_wloczki („undefined”), masa_motka („undefined”), metraz („undefined”), etykieta_wloczki („undefined”), wloczka_lace („undefined”), druty („undefined”), szydelko („undefined”), druty_z_zylka („undefined”), rozmiar_drutu („undefined”), oczko_prawe („undefined”), oczko_lewe („undefined”), nabieranie_oczek („undefined”), zamykanie_oczek („undefined”), ujmowanie („undefined”), dodawanie („undefined”), narzut („undefined”), dwa_razem_na_prawo („undefined”), scieg_francuski („undefined”), sciagacz („undefined”), lancuszek („undefined”), oczko_zamykajace_szyd („undefined”), oczko_scisle („undefined”), polslupek („undefined”), slupek („undefined”)

## Źródła

Tytuły, adresy i kopie surowych tekstów są w prywatnym rejestrze (kolumna „rejestr”); w repo publicznym tylko ID (decyzja koordynatora 2026-10-27, bramka marek P-121 (5)).

| ID | szczebel | kraj | język | odczyt | rejestr |
|---|---|---|---|---|---|
| S-BAR | 3 | PL | pl | 2026-10-25 | oczko-warsztat/09-lokalizacja/2026-10-27-slownik/zrodla.json |
| S-CYC-C | 1 | US | en | 2026-10-21 | oczko-warsztat/09-lokalizacja/2026-10-27-slownik/zrodla.json |
| S-CYC-H | 1 | US | en | 2026-10-21 | oczko-warsztat/09-lokalizacja/2026-10-27-slownik/zrodla.json |
| S-CYC-K | 1 | US | en | 2026-10-27 | oczko-warsztat/09-lokalizacja/2026-10-27-slownik/zrodla.json |
| S-CYC-W | 1 | US | en | 2026-10-21 | oczko-warsztat/09-lokalizacja/2026-10-27-slownik/zrodla.json |
| S-DRP | 3 | NO | wiele | 2026-10-26 | oczko-warsztat/09-lokalizacja/2026-10-27-slownik/zrodla.json |
| S-GUZ | 3 | PL | pl | 2026-10-25 | oczko-warsztat/09-lokalizacja/2026-10-27-slownik/zrodla.json |
| S-KD | 3 | PL | pl | 2026-10-25 | oczko-warsztat/09-lokalizacja/2026-10-27-slownik/zrodla.json |
| S-RM450 | 3 | PL | pl | 2026-10-25 | oczko-warsztat/09-lokalizacja/2026-10-27-slownik/zrodla.json |
| S-SC-UK | 3 | GB | en | 2026-10-25 | oczko-warsztat/09-lokalizacja/2026-10-27-slownik/zrodla.json |
| S-TKG-B | 3 | US | en | 2026-10-21 | oczko-warsztat/09-lokalizacja/2026-10-27-slownik/zrodla.json |
| S-TKG-G | 3 | US | en | 2026-10-21 | oczko-warsztat/09-lokalizacja/2026-10-27-slownik/zrodla.json |
