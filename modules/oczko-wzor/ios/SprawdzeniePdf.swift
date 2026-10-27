// Pełne otwarcie PDF przed zapisem wzoru (moduly.md „Kontrakt partii 6”, `sprawdzPdf`; BR-WZR-001 S2, BR-WZR-007 S3): zastępuje kontrolę nagłówka
// i `%%EOF` z TS. Nie otwiera się albo zaszyfrowany bez hasła → `uszkodzony`; 0 stron albo bez tekstu i obrazu → `pusty`.
import Foundation
import PDFKit
import UIKit

enum SprawdzeniePdf {
  static func sprawdz(_ url: URL) -> Result<Int, PowodWzoru> {
    guard let d = PDFDocument(url: url) else { return .failure(.uszkodzony) }
    if d.isLocked { return .failure(.uszkodzony) }
    guard d.pageCount > 0 else { return .failure(.pusty) }
    for i in 0..<d.pageCount {
      guard let s = d.page(at: i) else { continue }
      if let t = s.string, !t.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty { return .success(d.pageCount) }
    }
    // Bez tekstu (skan, zdjęcie): strona nie jest jednolicie biała w miniaturze — uproszczenie [OCENA 08] zamiast analizy obiektów XObject.
    for i in 0..<min(d.pageCount, 5) {
      if let s = d.page(at: i), !jednolicieBiala(s.thumbnail(of: CGSize(width: 48, height: 48), for: .mediaBox)) { return .success(d.pageCount) }
    }
    return .failure(.pusty)
  }

  static func jednolicieBiala(_ obraz: UIImage) -> Bool {
    guard let cg = obraz.cgImage else { return true }
    let w = cg.width, h = cg.height
    var piksele = [UInt8](repeating: 0, count: w * h * 4)
    guard let ctx = CGContext(data: &piksele, width: w, height: h, bitsPerComponent: 8, bytesPerRow: w * 4,
                              space: CGColorSpaceCreateDeviceRGB(), bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue) else { return true }
    ctx.setFillColor(UIColor.white.cgColor)
    ctx.fill(CGRect(x: 0, y: 0, width: w, height: h))
    ctx.draw(cg, in: CGRect(x: 0, y: 0, width: w, height: h))
    for i in stride(from: 0, to: piksele.count, by: 4) where piksele[i] < 240 || piksele[i + 1] < 240 || piksele[i + 2] < 240 { return false }
    return true
  }
}

extension SprawdzeniePdf {
  /// ZAŚLEPKA (W1, pusta strona 2 po wydruku WKWebView): przycięcie końcowych jednolicie białych stron — nieużywana, dopóki zrzut z E2E
  /// nie potwierdzi problemu (koordynator 2026-10-27, wariant (a)); test: TestyOknaMaszyn `testW1PustaStronaNaKoncu`.
  static func bezPustychStronNaKoncu(_ url: URL) -> Int {
    PDFDocument(url: url)?.pageCount ?? 0
  }
}

/// Miniatura pierwszej strony do wiersza wzoru (design-spec W8; plan 1.1 pkt 7): PNG o szerokości `szerokoscPt` × skala, proporcje strony
/// (z obrotem zapisanym w PDF; obrót użytkownika `wzor.obroty` nie — nazwane w partia-6.md). Plik pochodny (pamięć podręczna), nie dane wzoru.
enum Miniatura {
  static func zapisz(pdf: URL, cel: URL, szerokoscPt: CGFloat, skala: CGFloat = 2) -> Result<Void, PowodWzoru> {
    guard let d = PDFDocument(url: pdf), !d.isLocked, let s = d.page(at: 0) else { return .failure(.uszkodzony) }
    let r = s.bounds(for: .mediaBox)
    let obrocona = s.rotation % 180 != 0
    let (w, h) = obrocona ? (r.height, r.width) : (r.width, r.height)
    guard w > 0, h > 0 else { return .failure(.uszkodzony) }
    let szer = szerokoscPt * skala
    guard let png = s.thumbnail(of: CGSize(width: szer, height: szer * h / w), for: .mediaBox).pngData() else { return .failure(.zapis) }
    do {
      try FileManager.default.createDirectory(at: cel.deletingLastPathComponent(), withIntermediateDirectories: true)
      try png.write(to: cel, options: .atomic)
      return .success(())
    } catch { return .failure(.zapis) }
  }
}
