// Skrzynka zegarka (ADR-0009, uzupełnienie 2026-10-26 pkt 1–5; NZ-08-P3-05 (e), P-135): kolejka niepotwierdzonych stuknięć w trwałym
// magazynie (`skrzynka-zegarka.jsonl`, rdzeń `DziennikPlus`), potwierdzenie przez `glowa` i `potwierdzone` kontekstu telefonu w obrębie
// licznika, ponowienie wysyłki po `Stale.zegarekPonowienieMs`. Czysta logika i plik; transport (WatchConnectivity) w celu watch.
import Foundation
#if canImport(OczkoReguly)
import OczkoReguly
#endif

/// Trwała kolejka zegarka (ADR-0009, 2026-10-26 pkt 2): `dopisz` z `fsync` przed zmianą stanu; `zastap` = przepisanie atomowe.
public protocol MagazynSkrzynki: AnyObject {
  func odczytaj() throws -> [String]
  func dopisz(_ linia: String) throws
  func zastap(_ linie: [String]) throws
}

/// Plik `skrzynka-zegarka.jsonl` (zaślepka 08, partia 4 C1: bez zapisu — kod w następnym commicie).
public final class PlikSkrzynki: MagazynSkrzynki {
  public let dziennik: DziennikPlus
  public init(sciezka: String) { dziennik = DziennikPlus(sciezka: sciezka) }
  public func odczytaj() throws -> [String] { [] }
  public func dopisz(_ linia: String) throws {}
  public func zastap(_ linie: [String]) throws {}
}

public struct SkrzynkaZegarka: Equatable {
  /// Ostatni stan od telefonu (updateApplicationContext, klucz `stan`).
  public private(set) var kontekst: StanEkranuBlokady?
  /// Ostatnia lista `potwierdzone` z kontekstu (utrwalana obok kontekstu; po restarcie usuwa z kolejki to, co plik jeszcze ma).
  public private(set) var potwierdzone: [String] = []
  /// Zdarzenia zapisane na zegarku, których telefon jeszcze nie potwierdził, w kolejności stuknięć.
  public private(set) var oczekujace: [ZdarzenieWejsciowe] = []
  /// Stan po ostatnim stuknięciu na zegarku (rodzic następnego zdarzenia, wartość pokazywana).
  public private(set) var pokazywany: StanEkranuBlokady?
  private let magazyn: MagazynSkrzynki
  /// Czas ostatniej wysyłki linii (tylko pamięć: po restarcie wszystkie niepotwierdzone są do wysłania, pkt 5).
  private var wyslano: [String: Int64] = [:]

  /// Odtworzenie z magazynu (kolejka) i ostatniego kontekstu z listą potwierdzonych.
  public init(magazyn: MagazynSkrzynki, kontekst: StanEkranuBlokady? = nil, potwierdzone: [String] = []) throws {
    self.magazyn = magazyn
    oczekujace = try magazyn.odczytaj().compactMap { ZdarzenieWejsciowe.zLinii(Substring($0)) }
    if let kontekst { przyjmij(kontekst, potwierdzone: potwierdzone) }
  }

  public static func == (a: SkrzynkaZegarka, b: SkrzynkaZegarka) -> Bool {
    a.kontekst == b.kontekst && a.potwierdzone == b.potwierdzone && a.oczekujace == b.oczekujace && a.pokazywany == b.pokazywany
  }

  /// Nowy kontekst z telefonu (zaślepka 08, partia 4 C1: dawna reguła głowy po całej kolejce, bez `potwierdzone`).
  public mutating func przyjmij(_ k: StanEkranuBlokady, potwierdzone: [String] = []) {
    kontekst = k
    self.potwierdzone = potwierdzone
    if let g = k.glowa, let i = oczekujace.firstIndex(where: { $0.id == g }) { oczekujace.removeSubrange(...i) }
    pokazywany = oczekujace.filter { $0.licznikId == k.licznikId }.reduce(k) { s, z in s.po(z, dni: s.dniWMiesiacu) }
  }

  /// Stuknięcie na zegarku (zaślepka 08, partia 4 C1: bez zapisu do magazynu).
  public mutating func stuknijNaZegarku(_ rodzaj: ZdarzenieWejsciowe.Rodzaj, teraz: Int64, strefa: String, id: String, urzadzenie: String, sklep: [Uprawnienie] = []) throws -> WynikIntencji {
    guard let s = pokazywany else { return .bezZmiany } // przed pierwszym kontaktem z telefonem zegarek nie zna licznika
    let w = try stuknij(rodzaj, stan: s, teraz: teraz, strefa: strefa, id: id, urzadzenie: urzadzenie, zrodlo: .zegarek, proZegarkaSklep: sklep)
    if case let .zapisz(z, nowy) = w { oczekujace.append(z); pokazywany = nowy }
    return w
  }

  /// Linie do `transferUserInfo` (zaślepka 08, partia 4 C1: nic).
  public mutating func doWyslania(teraz: Int64, wToku: Set<String>) -> [ZdarzenieWejsciowe] { [] }
}
