// Eksperymenty okna maszyn (moduly.md „Kontrakt partii 6”, P-187; opis i komendy: docs/programista/partia-6-natywne.md). Test spec `Testy`
// podspecu OczkoWzor — uruchamiany na symulatorze iOS po prebuild, poza buildem aplikacji.
// W1: .docx z korpusu (tekst, tabela, obraz) → PDF: plik się otwiera, ≥ 1 strona, tekst obecny (obraz: strona nie jest pusta). Porażka W1 = Word
//     w podglądzie zastępczym 5a (`wzor.pdf_sha256 = NULL`) — decyzja koordynatora po wyniku.
// W2: PDF 100 MB / 300 stron — pomiar w Instruments [DO ZMIERZENIA]; tu tylko kontrola, że widok otwiera duży plik i przewija na ostatnią stronę.
// W3: `pencilOnly` — XCTest nie wytwarza syntetycznego dotyku palcem w PKCanvasView (brak publicznego API UITouch), więc test sprawdza politykę
//     płótna po pierwszym rysiku (drawingPolicy == .pencilOnly); przeciągnięcie palcem bez zmiany `drawing.strokes.count` — lista urządzenia (P-226).
import PDFKit
import PencilKit
import XCTest
@testable import OczkoWzor

final class EksperymentyTests: XCTestCase {
  private func zasob(_ nazwa: String) throws -> URL {
    let b = Bundle(for: EksperymentyTests.self)
    return try XCTUnwrap(b.url(forResource: nazwa, withExtension: "docx"), "korpus: uruchom generuj-korpus.mjs przed pod install")
  }
  private func wynik(_ json: String) throws -> [String: Any] {
    try XCTUnwrap(JSONSerialization.jsonObject(with: Data(json.utf8)) as? [String: Any])
  }

  @MainActor func testW1WordNaPdf() async throws {
    for nazwa in ["tekst", "tabela", "obraz"] {
      let w = try wynik(await Konwersja.naPdf(.word(try zasob(nazwa))))
      XCTAssertEqual(w["ok"] as? Bool, true, "\(nazwa): \(w)")
      guard let s = w["sciezka"] as? String, let d = PDFDocument(url: URL(fileURLWithPath: s)) else { XCTFail("\(nazwa): brak PDF"); continue }
      XCTAssertGreaterThanOrEqual(d.pageCount, 1, nazwa)
      if nazwa != "obraz" { XCTAssertFalse((d.string ?? "").isEmpty, "\(nazwa): brak tekstu") }
      print("W1 \(nazwa): strony \(d.pageCount), znaki \(d.string?.count ?? 0)")
    }
  }

  @MainActor func testW1StronaBezSieciToBrakSieci() async throws {
    let w = try wynik(await Konwersja.naPdf(.adres(URL(string: "https://nie-istnieje.invalid/wzor")!)))
    XCTAssertEqual(w["powod"] as? String, "brak_sieci")
  }

  @MainActor func testW2DuzyPdf() throws {
    let cel = FileManager.default.temporaryDirectory.appendingPathComponent("w2-300.pdf")
    let r = UIGraphicsPDFRenderer(bounds: CGRect(x: 0, y: 0, width: 612, height: 792))
    try r.writePDF(to: cel) { ctx in
      for i in 0..<300 {
        ctx.beginPage()
        ("Row \(i + 1)" as NSString).draw(at: CGPoint(x: 72, y: 72), withAttributes: [.font: UIFont.systemFont(ofSize: 24)])
        // szum 290 × 290 RGBA (ok. 330 KB, nie do skompresowania) na stronę ≈ 100 MB pliku: obraz jak skan
        var szum = (0..<(290 * 290 * 4)).map { _ in UInt8.random(in: 0...255) }
        let b = CGContext(data: &szum, width: 290, height: 290, bitsPerComponent: 8, bytesPerRow: 290 * 4, space: CGColorSpaceCreateDeviceRGB(),
                          bitmapInfo: CGImageAlphaInfo.noneSkipLast.rawValue)
        if let o = b?.makeImage() { UIImage(cgImage: o).draw(in: CGRect(x: 72, y: 120, width: 468, height: 468)) }
      }
    }
    let widok = WidokWzoru(appContext: nil)
    widok.frame = CGRect(x: 0, y: 0, width: 390, height: 844)
    widok.ustawPlik(cel.path)
    widok.przejdzDoStrony(299)
    print("W2: plik \(try FileManager.default.attributesOfItem(atPath: cel.path)[.size] ?? 0) B — pamięć i płynność: Instruments (Allocations, Animation Hitches)")
  }

  @MainActor func testW3PolitykaPoPierwszymRysiku() {
    let c = PKCanvasView()
    let u = ustawieniePlotna(.tylkoRysik)
    c.isUserInteractionEnabled = u.interakcja
    c.drawingPolicy = u.tylkoRysik ? .pencilOnly : .anyInput
    XCTAssertEqual(c.drawingPolicy, .pencilOnly)
    XCTAssertEqual(c.drawing.strokes.count, 0)
    let wyl = ustawieniePlotna(.wylaczone)
    c.isUserInteractionEnabled = wyl.interakcja
    XCTAssertFalse(c.isUserInteractionEnabled) // bez narzędzia palec przewija PDF (BR-WZR-008 S3)
  }
}
