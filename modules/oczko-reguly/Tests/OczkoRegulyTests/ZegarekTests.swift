// Skrzynka zegarka (ADR-0009 uzupełnienie, NFR-ZEG-001, P-039): stuknięcia bez telefonu, potwierdzenie przez `glowa` kontekstu, Pro ze StoreKit
// zegarka (KP-17, OR źródeł) na złotych plikach stanu v2.
import Foundation
import OczkoDziennik
import OczkoReguly
import XCTest

final class ZegarekTests: XCTestCase {
  func stan(_ plik: String) throws -> StanEkranuBlokady { try StanEkranuBlokady.dekoduj(Repo.dane("tests/wspolne/\(plik)")) }
  let wieczor: Int64 = 1_794_340_800_000 // 2026-11-10 21:00 Europe/Warsaw

  func testBezTelefonuIPotwierdzenie() throws {
    var s = SkrzynkaZegarka()
    XCTAssertEqual(try s.stuknijNaZegarku(.plus, teraz: wieczor, strefa: "Europe/Warsaw", id: "z0", urzadzenie: "zegarek"), .bezZmiany, "przed pierwszym kontekstem")
    let k = try stan("stan-zegarka-typowy.json")
    s.przyjmij(k)
    for (i, id) in ["z1", "z2", "z3"].enumerated() {
      guard case let .zapisz(z, _) = try s.stuknijNaZegarku(.plus, teraz: wieczor + Int64(i) * 60_000, strefa: "Europe/Warsaw", id: id, urzadzenie: "zegarek") else { return XCTFail() }
      XCTAssertEqual(z.zrodlo, .zegarek)
    }
    XCTAssertEqual(s.pokazywany?.wartosc, k.wartosc + 3)
    XCTAssertEqual(s.oczekujace.map(\.rodzice), [[k.glowa!], ["z1"], ["z2"]])
    // Telefon scalił z1 i z2 (glowa = z2): z3 dalej oczekuje i jest nałożone na nowy kontekst.
    let poScaleniu = k.po(2, glowa: "z2", czasMs: wieczor + 60_000, dzien: k.dzien, dni: k.dniWMiesiacu)
    s.przyjmij(poScaleniu)
    XCTAssertEqual(s.oczekujace.map(\.id), ["z3"])
    XCTAssertEqual([s.pokazywany?.wartosc, s.pokazywany.map { $0.glowa == "z3" ? 1 : 0 }], [k.wartosc + 3, 1])
  }

  /// P-039, ADR-0009 D: limit na zegarku bez telefonu; Pro ze StoreKit zegarka zdejmuje limit (OR źródeł).
  func testLimitIProZeSklepu() throws {
    var s = SkrzynkaZegarka()
    let limit = try stan("stan-ekranu-blokady-limit.json") // 2026-11-07, 5 darmowych dni użytych
    s.przyjmij(limit)
    let rano: Int64 = 1794124800000 // 2026-11-08 09:00 Europe/Warsaw (nowy dzień)
    XCTAssertEqual(try s.stuknijNaZegarku(.plus, teraz: rano, strefa: "Europe/Warsaw", id: "x", urzadzenie: "zegarek"), .limit)
    let dozywotni = [Uprawnienie(produkt: "oczko.pro.lifetime", wygasa: nil, odebrane: false)]
    guard case let .zapisz(z, nowy) = try s.stuknijNaZegarku(.plus, teraz: rano, strefa: "Europe/Warsaw", id: "y", urzadzenie: "zegarek", sklep: dozywotni) else { return XCTFail("Pro ze sklepu zegarka nie zdjęło limitu") }
    XCTAssertEqual([String(z.pro), z.dzien], ["true", "2026-11-08"])
    XCTAssertTrue(nowy.dniWMiesiacu.contains(DzienStanu(dzien: "2026-11-08", pro: true)))
  }

  /// Kontekst innego licznika: oczekujące poprzedniego licznika nie giną, wartość pokazywana = nowy kontekst.
  func testZmianaLicznika() throws {
    var s = SkrzynkaZegarka()
    let k = try stan("stan-zegarka-typowy.json")
    s.przyjmij(k)
    _ = try s.stuknijNaZegarku(.plus, teraz: wieczor, strefa: "Europe/Warsaw", id: "a", urzadzenie: "zegarek")
    let inny = try StanEkranuBlokady.dekoduj(Data(try Repo.tekst("tests/wspolne/stan-zegarka-typowy.json").replacingOccurrences(of: k.licznikId, with: "11111111-2222-4333-8444-555555555555").utf8))
    s.przyjmij(inny)
    XCTAssertEqual([s.oczekujace.map(\.id), [String(s.pokazywany?.wartosc ?? -1)]], [["a"], [String(inny.wartosc)]])
  }
}

final class ZegarekTrwaloscTests: XCTestCase {
  /// Trwały zapis zegarka: kontekst i linie oczekujących → po odtworzeniu ten sam stan pokazywany (zegarek uruchomiony ponownie bez telefonu).
  func testOdtworzenie() throws {
    var s = SkrzynkaZegarka()
    let k = try StanEkranuBlokady.dekoduj(Repo.dane("tests/wspolne/stan-zegarka-typowy.json"))
    s.przyjmij(k)
    _ = try s.stuknijNaZegarku(.plus, teraz: 1_794_340_800_000, strefa: "Europe/Warsaw", id: "a", urzadzenie: "zegarek")
    let linie = s.oczekujace.map(\.linia)
    let odtworzona = SkrzynkaZegarka(kontekst: try JSONDecoder().decode(StanEkranuBlokady.self, from: JSONEncoder().encode(k)),
                                     oczekujace: linie.compactMap { ZdarzenieWejsciowe.zLinii(Substring($0)) })
    XCTAssertEqual(odtworzona, s)
  }
}
