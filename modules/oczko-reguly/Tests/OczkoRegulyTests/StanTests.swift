// X-ST-01–06 (xctest-specyfikacja.md §2): złote pliki stanu wersji 2 z tests/wspolne/wzorce.json (typy StanEkranuBlokady, StanZegarka).
import Foundation
import OczkoReguly
import XCTest

final class StanTests: XCTestCase {
  func plikiV2() throws -> [String] {
    try (Repo.json("tests/wspolne/wzorce.json")["stany"]?.tablica ?? [])
      .filter { ["StanEkranuBlokady", "StanZegarka"].contains($0["typ"]?.tekst ?? "") }.compactMap { $0["plik"]?.tekst }
  }

  /// X-ST-01, X-ST-02, X-ST-03: dekodowanie ścisłe, ponowne kodowanie = ten sam zbiór kluczy i wartości, ładunek < 4096 B.
  func testZloteplikiV2() throws {
    let pliki = try plikiV2()
    let w = Wykonane("stany v2")
    for p in pliki {
      w.dodaj(p)
      let dane = try Repo.dane("tests/wspolne/\(p)")
      let stan = try StanEkranuBlokady.dekoduj(dane)
      XCTAssertEqual(stan.wersja, wersjaStanu, p)
      let ponownie = try JSONEncoder().encode(stan)
      XCTAssertEqual(try Json.z(ponownie), try Json.z(dane), p)
      XCTAssertLessThan(ponownie.count, 4096, p)
    }
    w.sprawdz(oczekiwane: pliki, minimum: 7)
  }

  /// X-ST-01, X-ST-04: brak pola, pole przemianowane (R-027) i wersja nowsza niż znana → błąd dekodowania, nie wartość domyślna.
  func testPulapkiDekodera() throws {
    let wzor = try Repo.tekst("tests/wspolne/stan-ekranu-blokady-limit.json")
    XCTAssertNoThrow(try StanEkranuBlokady.dekoduj(Data(wzor.utf8)))
    for (opis, zly) in [
      ("dzien_dozwolony", wzor.replacingOccurrences(of: "\"dzienDozwolony\"", with: "\"dzien_dozwolony\"")),
      ("brak glowa (null ≠ brak)", wzor.replacingOccurrences(of: "\"glowa\": null,", with: "")),
      ("wersja 3", wzor.replacingOccurrences(of: "\"wersja\": 2", with: "\"wersja\": 3")),
      ("pro jako liczba", wzor.replacingOccurrences(of: "\"pro\": false,\n  \"proWaznoscDo\"", with: "\"pro\": 0,\n  \"proWaznoscDo\"")),
    ] {
      XCTAssertNotEqual(zly, wzor, "\(opis): pułapka niczego nie zmieniła")
      XCTAssertThrowsError(try StanEkranuBlokady.dekoduj(Data(zly.utf8)), opis)
    }
    let nowszePole = wzor.replacingOccurrences(of: "\"wersja\": 2,", with: "\"wersja\": 2,\n  \"nowe\": 1,")
    XCTAssertNoThrow(try StanEkranuBlokady.dekoduj(Data(nowszePole.utf8)), "nieznane pole ma być pominięte")
  }

  /// X-ST-05, X-ST-06: Pro ze stanu — dożywotni (null = bez końca), subskrypcja z granicą jak odczyt pamięci (okno offline, koniec wyłączny).
  func testProZeStanu() throws {
    let dozywotni = try StanEkranuBlokady.dekoduj(Repo.dane("tests/wspolne/stan-zegarka-pro-dozywotni.json"))
    XCTAssertEqual(dozywotni.proWaznoscDo, nil)
    XCTAssertTrue(dozywotni.maPro(teraz: 4_000_000_000_000))
    let sub = try StanEkranuBlokady.dekoduj(Repo.dane("tests/wspolne/stan-zegarka-pro-subskrypcja.json"))
    let koniec = try XCTUnwrap(sub.proWaznoscDo)
    XCTAssertTrue(sub.maPro(teraz: koniec - 1))
    XCTAssertTrue(sub.maPro(teraz: koniec + Stale.oknoOfflineProMs - 1))
    XCTAssertFalse(sub.maPro(teraz: koniec + Stale.oknoOfflineProMs))
    XCTAssertFalse(try StanEkranuBlokady.dekoduj(Repo.dane("tests/wspolne/stan-zegarka-typowy.json")).maPro(teraz: 0))
  }
}
