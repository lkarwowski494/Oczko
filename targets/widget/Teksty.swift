// Wygenerowane z src/i18n/slowniki/*.json (sekcja `aktywnosc`) przez tests/adaptery/teksty-natywne.test.ts — nie edytować (ADR-0017).
import Foundation

enum Teksty {
  static let tabela: [String: [String: String]] = [
    "en": ["dodaj": "+1 row", "limit": "No free knitting days left this month.", "odejmij": "−1 row"],
  ]
  /// Język z preferencji systemu (pierwszy obsługiwany), zapas: angielski.
  static func t(_ klucz: String) -> String {
    for jezyk in Locale.preferredLanguages {
      for kandydat in [jezyk, String(jezyk.prefix(while: { $0 != "-" }))] { if let tekst = tabela[kandydat]?[klucz] { return tekst } }
    }
    return tabela["en"]?[klucz] ?? klucz
  }
}
