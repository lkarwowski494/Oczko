// Skrzynka zegarka (ADR-0009, uzupełnienie: „własny plik stanu i lista wysłanych, jeszcze niepotwierdzonych zdarzeń; potwierdzeniem jest
// `glowa` z kolejnego kontekstu telefonu”): czysta logika stanu pokazywanego na zegarku bez telefonu. Transport (WatchConnectivity) w celu watch.
import Foundation
#if canImport(OczkoReguly)
import OczkoReguly
#endif

public struct SkrzynkaZegarka: Equatable {
  /// Ostatni stan od telefonu (updateApplicationContext).
  public private(set) var kontekst: StanEkranuBlokady?
  /// Zdarzenia wysłane (transferUserInfo), których telefon jeszcze nie potwierdził, w kolejności stuknięć.
  public private(set) var oczekujace: [ZdarzenieWejsciowe] = []
  /// Stan po ostatnim stuknięciu na zegarku (rodzic następnego zdarzenia, wartość pokazywana).
  public private(set) var pokazywany: StanEkranuBlokady?

  public init() {}
  /// Odtworzenie z trwałego zapisu zegarka (kontekst i oczekujące); pokazywany liczony od nowa.
  public init(kontekst: StanEkranuBlokady?, oczekujace: [ZdarzenieWejsciowe]) {
    self.oczekujace = oczekujace
    if let kontekst { przyjmij(kontekst) }
  }

  /// Nowy kontekst z telefonu: zdarzenia aż do `glowa` kontekstu są potwierdzone; późniejsze zostają i są nakładane na kontekst.
  /// Kontekst innego licznika: oczekujące poprzedniego licznika zostają w kolejce wysyłki (nie giną), pokazywany = kontekst.
  public mutating func przyjmij(_ k: StanEkranuBlokady) {
    kontekst = k
    if let g = k.glowa, let i = oczekujace.firstIndex(where: { $0.id == g }) { oczekujace.removeSubrange(...i) }
    pokazywany = oczekujace.filter { $0.licznikId == k.licznikId }.reduce(k) { s, z in s.po(z, dni: s.dniWMiesiacu) }
  }

  /// Stuknięcie na zegarku: reguła limitu na stanie pokazywanym (ADR-0009, mozeZaczacDzien w Swift), zdarzenie do wysłania.
  public mutating func stuknijNaZegarku(_ rodzaj: ZdarzenieWejsciowe.Rodzaj, teraz: Int64, strefa: String, id: String, urzadzenie: String, sklep: [Uprawnienie] = []) throws -> WynikIntencji {
    guard let s = pokazywany else { return .bezZmiany } // przed pierwszym kontaktem z telefonem zegarek nie zna licznika
    let w = try stuknij(rodzaj, stan: s, teraz: teraz, strefa: strefa, id: id, urzadzenie: urzadzenie, zrodlo: .zegarek, proZegarkaSklep: sklep)
    if case let .zapisz(z, nowy) = w { oczekujace.append(z); pokazywany = nowy }
    return w
  }
}
