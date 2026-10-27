// Wygenerowane z src/i18n/slowniki/*.json (klucze `udostepnij.*` i wybrane `wspolne`, `projekty`, `wzor`), src/i18n/jezyki.ts i src/i18n/plural.ts
// przez tests/adaptery/teksty-natywne.test.ts — nie edytować (ADR-0017). Język = pierwszy obsługiwany z języków systemu (rozszerzenie nie czyta bazy).
import Foundation

enum Teksty {
  static let tabela: [String: [String: String]] = [
    "en": ["projekty.nazwa_robocza": "Counter from {{data}}", "projekty.ostatnia_praca_dni_one": "last worked {{count}} day ago", "projekty.ostatnia_praca_dni_other": "last worked {{count}} days ago", "projekty.ostatnia_praca_dzis": "last worked today", "projekty.ostatnia_praca_wczoraj": "last worked yesterday", "udostepnij.bez_migawki": "Oczko will ask which project it’s for when you open it.", "udostepnij.do_projektu": "Add as a pattern to", "udostepnij.do_projektu_film": "Add the video link to", "udostepnij.film_zastapi": "{{projekt}} already has a video link. Saving replaces it with this one.", "udostepnij.gotowe": "It’ll be in {{projekt}} next time you open Oczko.", "udostepnij.gotowe_nowy": "It’ll be in a new project next time you open Oczko.", "udostepnij.jako": "Add as", "udostepnij.jako_film": "Video link", "udostepnij.jako_wzor": "Pattern", "udostepnij.kolejny": "{{projekt}} already has a pattern. This one is added next to it, and you can switch between them.", "udostepnij.nieobslugiwany": "Patterns can be PDFs, Word documents, photos or web pages.", "udostepnij.nowy_projekt": "New project", "udostepnij.tytul": "Add to Oczko", "udostepnij.wiersz": "{{ostatnia}} · {{wzory}}", "udostepnij.wzory_one": "{{count}} pattern", "udostepnij.wzory_other": "{{count}} patterns", "udostepnij.za_duzy": "A pattern can be up to {{mb}} MB, so Oczko can’t add this file.", "wspolne.anuluj": "Cancel", "wspolne.zamknij": "Close", "wspolne.zapisz": "Save", "wzor.blad_rozmiar": "This file is too large", "wzor.blad_rozmiar_opis": "A pattern can be up to {{mb}} MB. Nothing was added.", "wzor.blad_typ": "Oczko can’t add this type of file", "wzor.blad_typ_opis": "Patterns can be PDFs, Word documents, photos or web pages. Nothing was added.", "wzor.rodzaj_pdf": "PDF", "wzor.rodzaj_strona": "Web page", "wzor.rodzaj_word": "Word document", "wzor.rodzaj_zdjecie": "Photo", "wzor.strony_one": "{{count}} page", "wzor.strony_other": "{{count}} pages", "wzor.wiersz_opis": "{{rodzaj}} · {{strony}}"],
  ]
  /// Łańcuch zastępczy jak w aplikacji (wariant → język bazowy → źródło), `lancuchZastepczy` w src/i18n/jezyki.ts.
  static let lancuch: [String: [String]] = [
    "bg": ["bg", "en"],
    "cs": ["cs", "en"],
    "da": ["da", "en"],
    "de": ["de", "en"],
    "el": ["el", "en"],
    "en": ["en"],
    "es-419": ["es-419", "es", "en"],
    "es": ["es", "en"],
    "et": ["et", "en"],
    "fi": ["fi", "en"],
    "fr": ["fr", "en"],
    "hr": ["hr", "en"],
    "hu": ["hu", "en"],
    "id": ["id", "en"],
    "it": ["it", "en"],
    "ja": ["ja", "en"],
    "ko": ["ko", "en"],
    "lt": ["lt", "en"],
    "lv": ["lv", "en"],
    "ms": ["ms", "en"],
    "nb": ["nb", "en"],
    "nl": ["nl", "en"],
    "pl": ["pl", "en"],
    "pt-BR": ["pt-BR", "pt", "en"],
    "pt": ["pt", "en"],
    "ro": ["ro", "en"],
    "ru": ["ru", "en"],
    "sk": ["sk", "en"],
    "sl": ["sl", "en"],
    "sr": ["sr", "en"],
    "sv": ["sv", "en"],
    "tr": ["tr", "en"],
    "uk": ["uk", "en"],
    "vi": ["vi", "en"],
    "zh-Hant": ["zh-Hant", "en"],
  ]
  /// Kategorie CLDR liczb całkowitych (z, o, t, f, m, r = zero, one, two, few, many, other): n < 200 wprost, dalej 100 + n mod 100, pełne miliony osobno.
  static let liczby: [String: (String, String)] = [
    "bg": ("rorrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr", "r"),
    "cs": ("rofffrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr", "r"),
    "da": ("rorrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr", "r"),
    "de": ("rorrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr", "r"),
    "el": ("rorrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr", "r"),
    "en": ("rorrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr", "r"),
    "es-419": ("rorrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr", "m"),
    "es": ("rorrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr", "m"),
    "et": ("rorrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr", "r"),
    "fi": ("rorrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr", "r"),
    "fr": ("oorrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr", "m"),
    "hr": ("rofffrrrrrrrrrrrrrrrrofffrrrrrrofffrrrrrrofffrrrrrrofffrrrrrrofffrrrrrrofffrrrrrrofffrrrrrrofffrrrrrrofffrrrrrrrrrrrrrrrrofffrrrrrrofffrrrrrrofffrrrrrrofffrrrrrrofffrrrrrrofffrrrrrrofffrrrrrrofffrrrrr", "r"),
    "hu": ("rorrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr", "r"),
    "id": ("rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr", "r"),
    "it": ("rorrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr", "m"),
    "ja": ("rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr", "r"),
    "ko": ("rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr", "r"),
    "lt": ("roffffffffrrrrrrrrrrroffffffffroffffffffroffffffffroffffffffroffffffffroffffffffroffffffffroffffffffroffffffffrrrrrrrrrrroffffffffroffffffffroffffffffroffffffffroffffffffroffffffffroffffffffroffffffff", "r"),
    "lv": ("zorrrrrrrrzzzzzzzzzzzorrrrrrrrzorrrrrrrrzorrrrrrrrzorrrrrrrrzorrrrrrrrzorrrrrrrrzorrrrrrrrzorrrrrrrrzorrrrrrrrzzzzzzzzzzzorrrrrrrrzorrrrrrrrzorrrrrrrrzorrrrrrrrzorrrrrrrrzorrrrrrrrzorrrrrrrrzorrrrrrrr", "z"),
    "ms": ("rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr", "r"),
    "nb": ("rorrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr", "r"),
    "nl": ("rorrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr", "r"),
    "pl": ("mofffmmmmmmmmmmmmmmmmmfffmmmmmmmfffmmmmmmmfffmmmmmmmfffmmmmmmmfffmmmmmmmfffmmmmmmmfffmmmmmmmfffmmmmmmmfffmmmmmmmmmmmmmmmmmfffmmmmmmmfffmmmmmmmfffmmmmmmmfffmmmmmmmfffmmmmmmmfffmmmmmmmfffmmmmmmmfffmmmmm", "m"),
    "pt-BR": ("oorrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr", "m"),
    "pt": ("rorrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr", "m"),
    "ro": ("foffffffffffffffffffrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrfffffffffffffffffffrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr", "r"),
    "ru": ("mofffmmmmmmmmmmmmmmmmofffmmmmmmofffmmmmmmofffmmmmmmofffmmmmmmofffmmmmmmofffmmmmmmofffmmmmmmofffmmmmmmofffmmmmmmmmmmmmmmmmofffmmmmmmofffmmmmmmofffmmmmmmofffmmmmmmofffmmmmmmofffmmmmmmofffmmmmmmofffmmmmm", "m"),
    "sk": ("rofffrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr", "r"),
    "sl": ("rotffrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrotffrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr", "r"),
    "sr": ("rofffrrrrrrrrrrrrrrrrofffrrrrrrofffrrrrrrofffrrrrrrofffrrrrrrofffrrrrrrofffrrrrrrofffrrrrrrofffrrrrrrofffrrrrrrrrrrrrrrrrofffrrrrrrofffrrrrrrofffrrrrrrofffrrrrrrofffrrrrrrofffrrrrrrofffrrrrrrofffrrrrr", "r"),
    "sv": ("rorrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr", "r"),
    "tr": ("rorrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr", "r"),
    "uk": ("mofffmmmmmmmmmmmmmmmmofffmmmmmmofffmmmmmmofffmmmmmmofffmmmmmmofffmmmmmmofffmmmmmmofffmmmmmmofffmmmmmmofffmmmmmmmmmmmmmmmmofffmmmmmmofffmmmmmmofffmmmmmmofffmmmmmmofffmmmmmmofffmmmmmmofffmmmmmmofffmmmmm", "m"),
    "vi": ("rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr", "r"),
    "zh-Hant": ("rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr", "r"),
  ]

  static func tekst(_ klucz: String, _ jezyk: String?) -> String? {
    for j in lancuch[jezyk ?? "en"] ?? ["en"] { if let t = tabela[j]?[klucz] { return t } }
    return nil
  }
  static func podstaw(_ t: String, _ parametry: [String: String]) -> String {
    parametry.reduce(t) { $0.replacingOccurrences(of: "{{\($1.key)}}", with: $1.value) }
  }
  /// Tekst w języku aplikacji z parametrami `{{nazwa}}`; brak tekstu = klucz (wykrywa test kluczy).
  static func t(_ klucz: String, _ jezyk: String?, _ parametry: [String: String] = [:]) -> String {
    podstaw(tekst(klucz, jezyk) ?? klucz, parametry)
  }
  static func kategoria(_ jezyk: String?, _ n: Int) -> String {
    guard n >= 0, let (male, milion) = liczby[jezyk ?? "en"] ?? liczby["en"] else { return "other" }
    let znak: Character
    if n < 200 { znak = Array(male)[n] } else if n % 1_000_000 == 0 { znak = Character(milion) } else { znak = Array(male)[100 + n % 100] }
    return ["z": "zero", "o": "one", "t": "two", "f": "few", "m": "many"][znak] ?? "other"
  }
  /// Liczba mnoga (`klucz_one`, `klucz_few`, …, brak formy → `klucz_other`, ADR-0017) z `{{count}}` i parametrami.
  static func tl(_ klucz: String, _ count: Int, _ jezyk: String?, _ parametry: [String: String] = [:]) -> String {
    let forma = tekst("\(klucz)_\(kategoria(jezyk, count))", jezyk) ?? tekst("\(klucz)_other", jezyk) ?? klucz
    return podstaw(forma, parametry.merging(["count": String(count)]) { a, _ in a })
  }
}
