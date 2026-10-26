// Wykonanie intencji ekranu blokady w procesie aplikacji (ADR-0008 (1), (8A)): stan z bieżącej Live Activity → decyzja `stuknij` (reguły
// z pakietu) → linia przez jedynego pisarza (`dopisz` z fsync) → dopiero potem nowy stan Live Activity. Błąd zapisu = stan bez zmian.
// Wołane z intencji w targets/widget/_shared/Stuknij.swift (kompilowanej też do aplikacji).
import ActivityKit
import Foundation

public enum IntencjaEkranuBlokady {
  public enum Blad: Error { case brakAktywnosci, zlyRodzaj(String) }

  public static func wykonaj(rodzaj: String) async throws {
    guard let r = ZdarzenieWejsciowe.Rodzaj(rawValue: rodzaj) else { throw Blad.zlyRodzaj(rodzaj) }
    guard let aktywnosc = Activity<OczkoAtrybuty>.activities.first else { throw Blad.brakAktywnosci }
    let stan = aktywnosc.content.state
    let teraz = Int64((Date().timeIntervalSince1970 * 1000).rounded(.down))
    let wynik = try stuknij(r, stan: stan, teraz: teraz, strefa: TimeZone.current.identifier, id: UUID().uuidString.lowercased(),
                            urzadzenie: aktywnosc.attributes.urzadzenie)
    switch wynik {
    case let .zapisz(linia, nowy):
      try DziennikPlus.wspolny.dopisz(linia) // rzuca przy krótkim zapisie albo błędzie fsync — stan Live Activity bez zmian (8A)
      await aktywnosc.update(ActivityContent(state: nowy, staleDate: nil))
    case .limit:
      let dzis = try dzienLokalny(ms: teraz, strefa: TimeZone.current.identifier)
      if stan.dzienDozwolony || stan.dzien != dzis { await aktywnosc.update(ActivityContent(state: stan.zLimitem(dzien: dzis), staleDate: nil)) }
    case .bezZmiany:
      break
    }
  }
}

extension StanEkranuBlokady {
  /// Ten sam stan z dniem `dzien` niedozwolonym (Live Activity pokazuje komunikat limitu zamiast +1, P-065 (1a)).
  func zLimitem(dzien: String) -> StanEkranuBlokady {
    StanEkranuBlokady(wersja: wersja, licznikId: licznikId, nazwa: nazwa, wartosc: wartosc, znaczenie: znaczenie, glowa: glowa, ostatniPlusMs: ostatniPlusMs,
                      dzien: dzien, dzienDozwolony: false, sesjaStartMs: sesjaStartMs, pro: pro, proWaznoscDo: proWaznoscDo, dniWMiesiacu: dniWMiesiacu,
                      przypomnienia: przypomnienia)
  }
}

extension DziennikPlus {
  /// Jedyny pisarz w procesie (ADR-0008 (8A)): Application Support/dziennik-plus.jsonl (kontener aplikacji, bez App Group).
  public static let wspolny: DziennikPlus = {
    let katalog = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask)[0]
    try? FileManager.default.createDirectory(at: katalog, withIntermediateDirectories: true)
    return DziennikPlus(sciezka: katalog.appendingPathComponent("dziennik-plus.jsonl").path)
  }()
}
