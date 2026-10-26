// Most JS ↔ Swift (Expo Modules API, ADR-0007; moduly.md „Kontrakt partii 6”): konwersja na PDF (`naPdf`), pełne otwarcie PDF (`sprawdzPdf`),
// skaner stron (`skanuj`) i widok wzoru `WidokWzoru` (PDFView + PencilKit na stronach). Wyniki funkcji jako JSON (`wynikOk` / `wynikBlad`,
// Pakiet/Sources/OczkoWzorLogika) — adapter TS: src/platforma/wzor.ts.
import ExpoModulesCore
import Foundation
import VisionKit

struct RysunekStrony: Record {
  @Field var strona: Int = 0
  @Field var plik: String = ""
}
struct ZnacznikProp: Record {
  @Field var strona: Int = 0
  @Field var y: Double = 0
  @Field var wysokosc: Double = 0
  @Field var pozaStrona: Bool = false
  @Field var przedSchematem: Bool = false
  @Field var kierunek: Int = 1
  @Field var etykieta: String = ""
}

public class OczkoWzorModule: Module {
  public func definition() -> ModuleDefinition {
    Name("OczkoWzor")

    AsyncFunction("naPdf") { (zrodloJson: String) async -> String in
      let zrodlo: ZrodloKonwersji
      do { zrodlo = try zrodloKonwersji(zrodloJson) } catch { return wynikBlad(.bledneDane) }
      return await Konwersja.naPdf(zrodlo)
    }
    AsyncFunction("sprawdzPdf") { (sciezka: String) -> String in
      switch SprawdzeniePdf.sprawdz(URL(fileURLWithPath: sciezka)) {
      case let .success(strony): return wynikOk(["strony": strony])
      case let .failure(p): return wynikBlad(p)
      }
    }
    Function("skanerDostepny") { () -> Bool in VNDocumentCameraViewController.isSupported }
    AsyncFunction("skanuj") { () async -> String in await Skaner.skanuj() }

    View(WidokWzoru.self) {
      Events("onRysunek", "onStukniecie", "onStrona", "onPierwszyRysik", "onZakreslenia")
      Prop("plikPdf") { (v: WidokWzoru, s: String) in v.ustawPlik(s) }
      Prop("strona") { (v: WidokWzoru, s: Int) in v.przejdzDoStrony(s) }
      Prop("rysunki") { (v: WidokWzoru, r: [RysunekStrony]) in v.ustawRysunki(r.map { ($0.strona, $0.plik) }) }
      Prop("znacznik") { (v: WidokWzoru, z: ZnacznikProp?) in
        v.ustawZnacznik(z.map { Znacznik(strona: $0.strona, y: $0.y, wysokosc: $0.wysokosc, pozaStrona: $0.pozaStrona, kierunek: $0.kierunek, etykieta: $0.etykieta) })
      }
      Prop("narzedzie") { (v: WidokWzoru, n: String) in v.ustawNarzedzie(NarzedzieWzoru(rawValue: n) ?? .brak) }
      Prop("polityka") { (v: WidokWzoru, p: String) in v.ustawPolityke(PolitykaPlotna(rawValue: p) ?? .wylaczone) }
      Prop("cofnij") { (v: WidokWzoru, n: Int) in v.cofnijDo(n) }
    }
  }
}
