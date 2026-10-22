-- Oczko · schemat bazy wersji 1 (rola 05, E2, 2026-10-22) · ADR-0001, ADR-0002, ADR-0005, ADR-0013
-- Konwencje (moduł dane-lokalne-sqlite): tabele STRICT (SQLite ≥ 3.37), id TEXT (UUID nadaje aplikacja),
-- czas INTEGER ms UTC (nadaje jeden moduł zegara), JSON jako TEXT CHECK (json_valid(...)),
-- CHECK tylko dla niezmienników strukturalnych; progi dziedzinowe w src/konfiguracja.ts.
-- Listy stanów i rodzajów: jedna definicja w docs/architektura/stany.json (test „stany ⊆ CHECK”).
-- „Ostatnio usunięte” (F-33, P-026): usunieto_ms, trwałe usunięcie po 30 dniach przy uruchomieniu.
-- Zapis rekordu nadrzędnego: UPSERT, nigdy INSERT OR REPLACE (ADR-0002, rejestr SQLite, eksperyment A).

CREATE TABLE plik (                                   -- pliki poza bazą: Application Support/pliki/<sha256>.<rozszerzenie> (ADR-0001)
  sha256 TEXT PRIMARY KEY NOT NULL CHECK (length(sha256) = 64),
  rozszerzenie TEXT NOT NULL CHECK (length(rozszerzenie) > 0),
  bajty INTEGER NOT NULL CHECK (bajty >= 0),
  utworzono_ms INTEGER NOT NULL
) STRICT;

CREATE TABLE projekt (                                -- F-14, F-15, F-17, F-18, F-19, F-20, F-49, F-50, F-54, F-61
  id TEXT PRIMARY KEY NOT NULL,
  nazwa TEXT NOT NULL CHECK (length(nazwa) > 0),
  stan TEXT NOT NULL DEFAULT 'w_toku' CHECK (stan IN ('w_toku', 'ukonczony')),
  notatka TEXT NOT NULL DEFAULT '',
  drut_mm REAL CHECK (drut_mm IS NULL OR drut_mm > 0),
  probka TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(probka)),   -- {oczka, rzedy, na_cm} wpisane raz (U-10)
  termin_dzien TEXT CHECK (termin_dzien IS NULL OR termin_dzien GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'),
  kopia_z TEXT REFERENCES projekt(id) ON DELETE SET NULL,          -- „Zrób taką samą” (F-20)
  utworzono_ms INTEGER NOT NULL,
  zmieniono_ms INTEGER NOT NULL,
  ostatnia_praca_ms INTEGER NOT NULL,
  ukonczono_ms INTEGER,
  usunieto_ms INTEGER,
  CHECK ((stan = 'ukonczony') = (ukonczono_ms IS NOT NULL))
) STRICT;
CREATE INDEX projekt_lista ON projekt(stan, ostatnia_praca_ms DESC) WHERE usunieto_ms IS NULL;
CREATE INDEX projekt_kopia_z ON projekt(kopia_z);

CREATE TABLE czesc (                                  -- kawałek projektu (F-14, F-08, F-52)
  id TEXT PRIMARY KEY NOT NULL,
  projekt_id TEXT NOT NULL REFERENCES projekt(id) ON DELETE CASCADE,
  nazwa TEXT NOT NULL CHECK (length(nazwa) > 0),
  kolejnosc INTEGER NOT NULL,
  cel_rzedow INTEGER CHECK (cel_rzedow IS NULL OR cel_rzedow >= 1),
  para_z TEXT REFERENCES czesc(id) ON DELETE SET NULL,            -- bliźniak (BR-PRJ-014)
  zmieniono_ms INTEGER NOT NULL,
  usunieto_ms INTEGER
) STRICT;
CREATE INDEX czesc_projekt ON czesc(projekt_id, kolejnosc);
CREATE INDEX czesc_para_z ON czesc(para_z);

CREATE TABLE licznik (                                -- F-01, F-03, F-04, F-05, F-09, F-46
  id TEXT PRIMARY KEY NOT NULL,
  czesc_id TEXT NOT NULL REFERENCES czesc(id) ON DELETE CASCADE,
  nazwa TEXT NOT NULL DEFAULT '',
  rodzaj TEXT NOT NULL DEFAULT 'rzedy' CHECK (rodzaj IN ('rzedy', 'oczka')),
  sekcja INTEGER NOT NULL DEFAULT 0 CHECK (sekcja IN (0, 1)),      -- sekcje rzędów kawałka zasilają licznik całości (BR-LIC-018; całość liczona, nie zapisywana)
  znaczenie TEXT NOT NULL DEFAULT 'skonczone' CHECK (znaczenie IN ('skonczone', 'w_trakcie')),
  dlugosc_powtorzenia INTEGER CHECK (dlugosc_powtorzenia IS NULL OR dlugosc_powtorzenia >= 1), -- RD-12-W5
  zablokowany INTEGER NOT NULL DEFAULT 0 CHECK (zablokowany IN (0, 1)),
  wartosc INTEGER NOT NULL DEFAULT 0 CHECK (wartosc >= 0),         -- wynik funkcji scal() na zdarzeniach; pamięć podręczna w tej samej transakcji co zdarzenie
  glowa TEXT,                                                      -- id ostatniego zdarzenia (rodzic kolejnego)
  konflikt INTEGER NOT NULL DEFAULT 0 CHECK (konflikt IN (0, 1)),  -- scal() zwrócił 'konflikt' (NFR-DAN-003, F-58)
  kolejnosc INTEGER NOT NULL,
  zmieniono_ms INTEGER NOT NULL,
  usunieto_ms INTEGER
) STRICT;
CREATE INDEX licznik_czesc ON licznik(czesc_id, kolejnosc);

CREATE TABLE zdarzenie (                              -- historia zmian (BR-LIC-003), tylko dopisywana (ADR-0005)
  id TEXT PRIMARY KEY NOT NULL,
  licznik_id TEXT NOT NULL REFERENCES licznik(id) ON DELETE CASCADE,
  rodzaj TEXT NOT NULL CHECK (rodzaj IN ('plus', 'minus', 'wpisanie', 'zerowanie', 'cofniecie', 'rozstrzygniecie')),
  wartosc INTEGER CHECK (wartosc IS NULL OR wartosc >= 0),         -- dla wpisanie, cofniecie, rozstrzygniecie
  wartosc_po INTEGER NOT NULL CHECK (wartosc_po >= 0),
  rodzice TEXT NOT NULL DEFAULT '[]' CHECK (json_valid(rodzice) AND json_type(rodzice) = 'array'),
  cofa TEXT NOT NULL DEFAULT '[]' CHECK (json_valid(cofa) AND json_type(cofa) = 'array'), -- id cofniętych zdarzeń (F-02, F-47)
  zrodlo TEXT NOT NULL CHECK (zrodlo IN ('aplikacja', 'ekran_blokady', 'zegarek', 'synchronizacja', 'import')),
  urzadzenie TEXT NOT NULL,
  czas_ms INTEGER NOT NULL,                                        -- chwila UTC (RD-16)
  strefa TEXT NOT NULL CHECK (length(strefa) > 0),                 -- IANA w chwili zmiany (RD-16)
  dzien TEXT NOT NULL CHECK (dzien GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'), -- data lokalna, nie przeliczana później (RD-16)
  CHECK ((rodzaj IN ('wpisanie', 'cofniecie', 'rozstrzygniecie')) = (wartosc IS NOT NULL))
) STRICT;
CREATE INDEX zdarzenie_licznik_czas ON zdarzenie(licznik_id, czas_ms);
CREATE INDEX zdarzenie_dzien ON zdarzenie(dzien, licznik_id);

CREATE TABLE notatka_rzedu (                          -- notatka przy rzędzie (BR-PRJ-014 „to samo miejsce”)
  id TEXT PRIMARY KEY NOT NULL,
  licznik_id TEXT NOT NULL REFERENCES licznik(id) ON DELETE CASCADE,
  rzad INTEGER NOT NULL CHECK (rzad >= 1),
  tekst TEXT NOT NULL CHECK (length(tekst) > 0),
  zmieniono_ms INTEGER NOT NULL
) STRICT;
CREATE INDEX notatka_rzedu_licznik ON notatka_rzedu(licznik_id, rzad);

CREATE TABLE przypomnienie (                          -- „od rzędu s, co N, M razy” (F-06, RD-13)
  id TEXT PRIMARY KEY NOT NULL,
  licznik_id TEXT NOT NULL REFERENCES licznik(id) ON DELETE CASCADE,
  od_rzedu INTEGER NOT NULL CHECK (od_rzedu >= 1),
  co_n INTEGER NOT NULL CHECK (co_n >= 1),
  razy INTEGER NOT NULL CHECK (razy >= 1),
  tekst TEXT NOT NULL DEFAULT '',
  zmieniono_ms INTEGER NOT NULL
) STRICT;
CREATE INDEX przypomnienie_licznik ON przypomnienie(licznik_id);

CREATE TABLE sesja (                                  -- stoper (F-21, F-51); czas ze znaczników, nie z odliczania (ADR-0013)
  id TEXT PRIMARY KEY NOT NULL,
  projekt_id TEXT NOT NULL REFERENCES projekt(id) ON DELETE CASCADE,
  stan TEXT NOT NULL CHECK (stan IN ('trwa', 'wstrzymana', 'zakonczona')),
  start_ms INTEGER NOT NULL,
  wstrzymano_ms INTEGER,
  przerwy_ms INTEGER NOT NULL DEFAULT 0 CHECK (przerwy_ms >= 0),
  koniec_ms INTEGER,
  skorygowano INTEGER NOT NULL DEFAULT 0 CHECK (skorygowano IN (0, 1)),
  strefa TEXT NOT NULL,
  dzien TEXT NOT NULL CHECK (dzien GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'),
  CHECK ((stan = 'zakonczona') = (koniec_ms IS NOT NULL)),
  CHECK ((stan = 'wstrzymana') = (wstrzymano_ms IS NOT NULL)),
  CHECK (koniec_ms IS NULL OR koniec_ms >= start_ms)
) STRICT;
CREATE UNIQUE INDEX sesja_jedna_otwarta ON sesja((stan IN ('trwa', 'wstrzymana'))) WHERE stan IN ('trwa', 'wstrzymana');
CREATE INDEX sesja_projekt ON sesja(projekt_id, start_ms);
CREATE INDEX sesja_dzien ON sesja(dzien);

CREATE TABLE wzor (                                   -- F-24, F-25, F-26, F-55 (ADR-0011)
  id TEXT PRIMARY KEY NOT NULL,
  projekt_id TEXT NOT NULL REFERENCES projekt(id) ON DELETE CASCADE,
  nazwa TEXT NOT NULL CHECK (length(nazwa) > 0),
  zrodlo TEXT NOT NULL CHECK (zrodlo IN ('pdf', 'obraz', 'www', 'word')),
  pdf_sha256 TEXT REFERENCES plik(sha256) ON DELETE RESTRICT,       -- NULL tylko dla Worda w podglądzie (P-071 (5a))
  oryginal_sha256 TEXT REFERENCES plik(sha256) ON DELETE RESTRICT,
  adres TEXT,                                                       -- URL strony albo filmu
  znacznik TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(znacznik)), -- {licznik_id, strona, y, wysokosc_rzedu, rzad_bazowy} (BR-WZR-003)
  zmieniono_ms INTEGER NOT NULL,
  CHECK (pdf_sha256 IS NOT NULL OR (zrodlo = 'word' AND oryginal_sha256 IS NOT NULL))
) STRICT;
CREATE INDEX wzor_projekt ON wzor(projekt_id);
CREATE INDEX wzor_pdf ON wzor(pdf_sha256);
CREATE INDEX wzor_oryginal ON wzor(oryginal_sha256);

CREATE TABLE rysunek (                                -- PKDrawing na stronę (F-28, F-56, ADR-0012)
  wzor_id TEXT NOT NULL REFERENCES wzor(id) ON DELETE CASCADE,
  strona INTEGER NOT NULL CHECK (strona >= 0),
  plik_sha256 TEXT NOT NULL REFERENCES plik(sha256) ON DELETE RESTRICT,
  zmieniono_ms INTEGER NOT NULL,
  PRIMARY KEY (wzor_id, strona)
) STRICT;
CREATE INDEX rysunek_plik ON rysunek(plik_sha256);

CREATE TABLE wloczka (                                -- zapas (F-37, BR-ZAP-001, BR-ZAP-004)
  id TEXT PRIMARY KEY NOT NULL,
  nazwa TEXT NOT NULL CHECK (length(nazwa) > 0),
  producent TEXT NOT NULL DEFAULT '',
  sklad TEXT NOT NULL DEFAULT '',
  kolor TEXT NOT NULL DEFAULT '',
  waga_motka_g REAL CHECK (waga_motka_g IS NULL OR waga_motka_g > 0),
  dlugosc_motka_m REAL CHECK (dlugosc_motka_m IS NULL OR dlugosc_motka_m > 0),
  motki REAL NOT NULL DEFAULT 0 CHECK (motki >= 0),
  pielegnacja TEXT NOT NULL DEFAULT '',                             -- tekstem (OG-13)
  notatka TEXT NOT NULL DEFAULT '',
  zmieniono_ms INTEGER NOT NULL,
  usunieto_ms INTEGER
) STRICT;
CREATE INDEX wloczka_nazwa ON wloczka(nazwa COLLATE NOCASE) WHERE usunieto_ms IS NULL;

CREATE TABLE narzedzie (                              -- BR-ZAP-003
  id TEXT PRIMARY KEY NOT NULL,
  rodzaj TEXT NOT NULL CHECK (rodzaj IN ('druty', 'szydelko', 'inne')),
  rozmiar_mm REAL CHECK (rozmiar_mm IS NULL OR rozmiar_mm > 0),
  opis TEXT NOT NULL DEFAULT '',
  zmieniono_ms INTEGER NOT NULL,
  usunieto_ms INTEGER
) STRICT;

CREATE TABLE projekt_wloczka (                        -- przypisanie i zużycie (BR-ZAP-002, U-9)
  projekt_id TEXT NOT NULL REFERENCES projekt(id) ON DELETE CASCADE,
  wloczka_id TEXT NOT NULL REFERENCES wloczka(id) ON DELETE CASCADE,
  zuzyto_motki REAL CHECK (zuzyto_motki IS NULL OR zuzyto_motki >= 0),
  zmieniono_ms INTEGER NOT NULL,
  PRIMARY KEY (projekt_id, wloczka_id)
) STRICT;
CREATE INDEX projekt_wloczka_wloczka ON projekt_wloczka(wloczka_id);

CREATE TABLE zdjecie (                                -- F-16 (projekt, etykieta włóczki)
  id TEXT PRIMARY KEY NOT NULL,
  projekt_id TEXT REFERENCES projekt(id) ON DELETE CASCADE,
  wloczka_id TEXT REFERENCES wloczka(id) ON DELETE CASCADE,
  plik_sha256 TEXT NOT NULL REFERENCES plik(sha256) ON DELETE RESTRICT,
  utworzono_ms INTEGER NOT NULL,
  CHECK ((projekt_id IS NULL) <> (wloczka_id IS NULL))
) STRICT;
CREATE INDEX zdjecie_projekt ON zdjecie(projekt_id);
CREATE INDEX zdjecie_wloczka ON zdjecie(wloczka_id);
CREATE INDEX zdjecie_plik ON zdjecie(plik_sha256);

CREATE TABLE obliczenie (                             -- F-38: wynik z danymi wejściowymi zapisany w projekcie
  id TEXT PRIMARY KEY NOT NULL,
  projekt_id TEXT REFERENCES projekt(id) ON DELETE CASCADE,
  rodzaj TEXT NOT NULL CHECK (rodzaj IN ('oczka_z_probki', 'jednostki', 'grubosc')),
  wejscie TEXT NOT NULL CHECK (json_valid(wejscie)),
  wynik TEXT NOT NULL CHECK (json_valid(wynik)),
  wersja_regul TEXT NOT NULL,                                       -- wersja rejestru merytorycznego roli 06
  utworzono_ms INTEGER NOT NULL
) STRICT;
CREATE INDEX obliczenie_projekt ON obliczenie(projekt_id);

CREATE TABLE dzien_limitu (                           -- dni limitu V4 (startDnia, P-057, P-067); wejście `dni` funkcji limit.mjs
  dzien TEXT PRIMARY KEY NOT NULL CHECK (dzien GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'),
  pro INTEGER NOT NULL CHECK (pro IN (0, 1)),
  zaczeto_ms INTEGER NOT NULL,
  zdarzenie_id TEXT NOT NULL                                        -- zdarzenie, które zaczęło dzień (bez FK: dzień zostaje po usunięciu licznika; dane.md, KP-15, L-16)
) STRICT;

CREATE TABLE ustawienie (                             -- ustawienia i mały stan (np. ostatnie miejsce F-49, stan Pro dla zegarka)
  klucz TEXT PRIMARY KEY NOT NULL,
  wartosc TEXT NOT NULL CHECK (json_valid(wartosc)),
  zmieniono_ms INTEGER NOT NULL
) STRICT;

CREATE TABLE blad (                                   -- diagnostyka lokalna F-57, bez treści projektów (NFR-PRY-001)
  id INTEGER PRIMARY KEY,
  czas_ms INTEGER NOT NULL,
  kod TEXT NOT NULL CHECK (length(kod) > 0),
  szczegoly TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(szczegoly))
) STRICT;
