// Widok wzoru (moduly.md „Kontrakt partii 6”, ADR-0011, ADR-0012; P-218 (1)–(3), Q2a; P-220 W5a, W6a): PDFView z płótnem PencilKit nad każdą
// stroną (`PDFPageOverlayViewProvider`, iOS 16+). Rysunki to osobna warstwa (PKDrawing na stronę w pliku z magazynu) — widok nigdy nie zapisuje
// do pliku PDF, bez OCR, bez wycinania i łączenia stron. Stan (strona, znacznik, rysunki, narzędzie, polityka) przychodzi z JS; widok rysuje
// i zgłasza zdarzenia. Kolory: zakreślacz = token `kolor.zakreslacz` (#F6E04A), pióro i znacznik = `kolor.wzor.znacznik` (#26282C) — design-spec.
import ExpoModulesCore
import PDFKit
import PencilKit
import UIKit
import UIKit.UIGestureRecognizerSubclass

struct Znacznik: Equatable {
  let strona: Int
  let y: Double        // ułamek wysokości strony od góry (0–1), układ strony bez /Rotate
  let wysokosc: Double // wysokość rzędu jako ułamek
  let pozaStrona: Bool
  let kierunek: Int    // 1 w dół, -1 w górę
  let etykieta: String // etykieta VoiceOver z `wzor.znacznik_a11y_*` (P-237 (2))
}

private func kolor(_ hex: UInt32) -> UIColor {
  UIColor(red: CGFloat((hex >> 16) & 0xFF) / 255, green: CGFloat((hex >> 8) & 0xFF) / 255, blue: CGFloat(hex & 0xFF) / 255, alpha: 1)
}
private let KOLOR_ZAKRESLACZA = kolor(0xF6E04A) // tokeny.json kolor.zakreslacz
private let KOLOR_GRAFIT = kolor(0x26282C)      // tokeny.json kolor.wzor.znacznik

/// Wykrywa pierwsze dotknięcie rysikiem w dowolnym miejscu widoku (P-218 Q2a); nigdy nie rozpoznaje gestu, nie blokuje dotyków.
final class DetektorRysika: UIGestureRecognizer {
  var naRysik: (() -> Void)?
  override init(target: Any?, action: Selector?) {
    super.init(target: target, action: action)
    cancelsTouchesInView = false
    delaysTouchesBegan = false
    delaysTouchesEnded = false
  }
  override func touchesBegan(_ touches: Set<UITouch>, with event: UIEvent) {
    if touches.contains(where: { $0.type == .pencil }) { naRysik?() }
    state = .failed
  }
}

/// Nakładka strony: płótno PencilKit i znacznik rzędu (pas z dwiema grafitowymi krawędziami i zakładką z etykietą).
final class NakladkaStrony: UIView {
  let plotno = PKCanvasView()
  let pas = UIView()
  private let gora = UIView(), dol = UIView(), zakladka = UILabel()
  var znacznik: Znacznik? { didSet { setNeedsLayout() } }

  override init(frame: CGRect) {
    super.init(frame: frame)
    plotno.backgroundColor = .clear
    plotno.isOpaque = false
    plotno.isScrollEnabled = false
    addSubview(plotno)
    for k in [gora, dol] { k.backgroundColor = KOLOR_GRAFIT; pas.addSubview(k) }
    zakladka.backgroundColor = KOLOR_GRAFIT
    zakladka.textColor = .white
    zakladka.font = .systemFont(ofSize: 13, weight: .semibold)
    pas.addSubview(zakladka)
    pas.isUserInteractionEnabled = false
    pas.isAccessibilityElement = true
    pas.accessibilityIdentifier = "wzor-znacznik"
    pas.accessibilityTraits = .adjustable
    addSubview(pas)
  }
  required init?(coder: NSCoder) { fatalError("init(coder:)") }

  override func layoutSubviews() {
    super.layoutSubviews()
    plotno.frame = bounds
    guard let z = znacznik else { pas.isHidden = true; return }
    pas.isHidden = false
    let h = bounds.height
    let gorny = CGFloat(min(max(z.y, 0), 1)) * h
    let wys = max(CGFloat(z.wysokosc) * h, 4)
    pas.frame = CGRect(x: 0, y: gorny, width: bounds.width, height: wys)
    gora.frame = CGRect(x: 0, y: 0, width: bounds.width, height: 2)
    dol.frame = CGRect(x: 0, y: wys - 2, width: bounds.width, height: 2)
    zakladka.text = " \(z.kierunek < 0 ? "↑" : "↓") "
    zakladka.sizeToFit()
    zakladka.frame.origin = CGPoint(x: 0, y: z.kierunek < 0 ? -zakladka.frame.height : wys)
    pas.accessibilityLabel = z.etykieta
  }
}

final class WidokWzoru: ExpoView, PDFPageOverlayViewProvider, PKCanvasViewDelegate, UIGestureRecognizerDelegate {
  let onRysunek = EventDispatcher()
  let onStukniecie = EventDispatcher()
  let onStrona = EventDispatcher()
  let onPierwszyRysik = EventDispatcher()
  let onZakreslenia = EventDispatcher()

  private let pdf = PDFView()
  private var plik = ""
  private var nakladki: [Int: NakladkaStrony] = [:]   // strony wyświetlane
  private var rysunki: [Int: PKDrawing] = [:]         // bieżący rysunek każdej strony (wczytany albo narysowany)
  private var historia: [Int: [PKDrawing]] = [:]      // cofanie ostatniej kreski na stronie
  private var doZapisu = Set<Int>()
  private var zegar: Timer?
  private var narzedzie: NarzedzieWzoru = .brak
  private var polityka: PolitykaPlotna = .wylaczone
  private var znacznik: Znacznik?
  private var cofnij: Int?
  private var rysikZgloszony = false
  private var zKodu = false
  private var stronaDocelowa = 0
  private let przytrzymanie = UILongPressGestureRecognizer()

  required init(appContext: AppContext? = nil) {
    super.init(appContext: appContext)
    clipsToBounds = true
    pdf.autoScales = true
    pdf.displayMode = .singlePageContinuous
    pdf.displayDirection = .vertical
    pdf.pageOverlayViewProvider = self
    pdf.isInMarkupMode = true // nakładki dostają dotyk (PDFKit iOS 16)
    addSubview(pdf)
    przytrzymanie.addTarget(self, action: #selector(przytrzymano(_:)))
    przytrzymanie.delegate = self
    pdf.addGestureRecognizer(przytrzymanie)
    let rysik = DetektorRysika(target: nil, action: nil)
    rysik.delegate = self
    rysik.naRysik = { [weak self] in self?.pierwszyRysik() }
    addGestureRecognizer(rysik)
    NotificationCenter.default.addObserver(self, selector: #selector(zmianaStrony), name: .PDFViewPageChanged, object: pdf)
    NotificationCenter.default.addObserver(self, selector: #selector(zapiszTeraz), name: UIApplication.willResignActiveNotification, object: nil)
    NotificationCenter.default.addObserver(self, selector: #selector(zapiszTeraz), name: UIApplication.didEnterBackgroundNotification, object: nil)
  }
  deinit { NotificationCenter.default.removeObserver(self) }

  override func layoutSubviews() {
    super.layoutSubviews()
    pdf.frame = bounds
  }
  override func willMove(toWindow w: UIWindow?) {
    super.willMove(toWindow: w)
    if w == nil { zapiszTeraz() } // zamknięcie ekranu wzoru
  }
  func gestureRecognizer(_ g: UIGestureRecognizer, shouldRecognizeSimultaneouslyWith o: UIGestureRecognizer) -> Bool { true }

  // MARK: właściwości z JS

  func ustawPlik(_ s: String) {
    guard s != plik else { return }
    zapiszTeraz()
    plik = s
    nakladki = [:]; rysunki = [:]; historia = [:]; doZapisu = []
    rysikZgloszony = false
    pdf.document = PDFDocument(url: URL(fileURLWithPath: s))
    przejdzDoStrony(stronaDocelowa)
    zmianaStrony()
  }
  func przejdzDoStrony(_ s: Int) {
    stronaDocelowa = s
    guard let d = pdf.document, s >= 0, s < d.pageCount, let p = d.page(at: s), pdf.currentPage != p else { return }
    pdf.go(to: p)
  }
  func ustawRysunki(_ r: [(Int, String)]) {
    for (s, sciezka) in r where !doZapisu.contains(s) { // zmiana niezapisana na stronie wygrywa z plikiem z magazynu
      guard let d = try? Data(contentsOf: URL(fileURLWithPath: sciezka)), let rys = try? PKDrawing(data: d) else { continue }
      rysunki[s] = rys
      if let n = nakladki[s] { zKodu = true; n.plotno.drawing = rys; zKodu = false }
    }
    zglosZakreslenia()
  }
  func ustawZnacznik(_ z: Znacznik?) {
    znacznik = z
    for (s, n) in nakladki { n.znacznik = z?.strona == s ? z : nil }
  }
  func ustawNarzedzie(_ n: NarzedzieWzoru) {
    narzedzie = n
    for k in nakladki.values { zastosujNarzedzie(k.plotno) }
  }
  func ustawPolityke(_ p: PolitykaPlotna) {
    polityka = p
    for k in nakladki.values { zastosujPolityke(k.plotno) }
    // Tryb zakreślacza palcem: jeden palec rysuje, dwa przewijają (design-spec W5a); poza nim przewija jeden palec.
    przewijanie()?.panGestureRecognizer.minimumNumberOfTouches = p == .dowolne ? 2 : 1
    przytrzymanie.isEnabled = p != .dowolne
  }
  func cofnijDo(_ n: Int) {
    defer { cofnij = n }
    guard let poprzedni = cofnij, n != poprzedni, let s = biezacaStrona(), var h = historia[s], let rys = h.popLast() else { return }
    historia[s] = h
    rysunki[s] = rys
    if let k = nakladki[s] { zKodu = true; k.plotno.drawing = rys; zKodu = false }
    zaplanujZapis(s)
  }

  // MARK: nakładki stron

  func pdfView(_ v: PDFView, overlayViewFor page: PDFPage) -> UIView? {
    guard let s = v.document?.index(for: page) else { return nil }
    if let n = nakladki[s] { return n }
    let n = NakladkaStrony()
    n.plotno.tag = s
    n.plotno.delegate = self
    zKodu = true
    n.plotno.drawing = rysunki[s] ?? PKDrawing()
    zKodu = false
    zastosujNarzedzie(n.plotno)
    zastosujPolityke(n.plotno)
    n.znacznik = znacznik?.strona == s ? znacznik : nil
    nakladki[s] = n
    return n
  }
  func pdfView(_ v: PDFView, willEndDisplayingOverlayView o: UIView, for page: PDFPage) {
    guard let s = v.document?.index(for: page), let n = o as? NakladkaStrony else { return }
    rysunki[s] = n.plotno.drawing
    nakladki[s] = nil
  }

  private func zastosujNarzedzie(_ c: PKCanvasView) {
    switch narzedzie {
    case .zakreslacz, .brak: c.tool = PKInkingTool(.marker, color: KOLOR_ZAKRESLACZA, width: 18)
    case .pioro: c.tool = PKInkingTool(.pen, color: KOLOR_GRAFIT, width: 2)
    case .gumka: c.tool = PKEraserTool(.vector)
    }
  }
  private func zastosujPolityke(_ c: PKCanvasView) {
    let u = ustawieniePlotna(polityka)
    c.isUserInteractionEnabled = u.interakcja
    c.drawingPolicy = u.tylkoRysik ? .pencilOnly : .anyInput
  }

  // MARK: rysunki

  func canvasViewDrawingDidChange(_ c: PKCanvasView) {
    guard !zKodu else { return }
    let s = c.tag
    historia[s, default: []].append(rysunki[s] ?? PKDrawing())
    rysunki[s] = c.drawing
    zaplanujZapis(s)
  }
  private func zaplanujZapis(_ s: Int) {
    doZapisu.insert(s)
    zglosZakreslenia()
    zegar?.invalidate()
    zegar = Timer.scheduledTimer(withTimeInterval: Double(StaleWzoru.rysunekZapisMs) / 1000, repeats: false) { [weak self] _ in self?.zapiszTeraz() }
  }
  /// Rysunki zmienionych stron do plików tymczasowych → `onRysunek` (JS: zapiszRysunek do magazynu i bazy, ADR-0012).
  @objc func zapiszTeraz() {
    zegar?.invalidate()
    zegar = nil
    for s in doZapisu.sorted() {
      let u = FileManager.default.temporaryDirectory.appendingPathComponent("rysunek-\(UUID().uuidString).pkdrawing")
      guard (try? (rysunki[s] ?? PKDrawing()).dataRepresentation().write(to: u)) != nil else { continue } // zostaje w doZapisu: następna próba
      doZapisu.remove(s)
      onRysunek(["strona": s, "plikTymczasowy": u.path])
    }
  }
  private func zglosZakreslenia() {
    let n = rysunki.values.reduce(0) { $0 + $1.strokes.filter { $0.ink.inkType == .marker }.count }
    onZakreslenia(["liczba": n])
  }

  // MARK: gesty i strony

  private func pierwszyRysik() {
    guard !rysikZgloszony else { return }
    rysikZgloszony = true
    onPierwszyRysik([:])
  }
  @objc private func przytrzymano(_ g: UILongPressGestureRecognizer) {
    guard g.state == .began, let d = pdf.document else { return }
    let p = g.location(in: pdf)
    guard let strona = pdf.page(for: p, nearest: true) else { return }
    let wStronie = pdf.convert(p, to: strona)
    let ramka = strona.bounds(for: .mediaBox)
    guard ramka.height > 0 else { return }
    let y = min(max((ramka.maxY - wStronie.y) / ramka.height, 0), 1) // PDF: początek układu na dole strony
    onStukniecie(["strona": d.index(for: strona), "y": y])
  }
  @objc private func zmianaStrony() {
    guard let d = pdf.document, let s = biezacaStrona() else { return }
    if !doZapisu.isEmpty { zapiszTeraz() } // zmiana strony = zapis (kontrakt)
    onStrona(["strona": s, "stron": d.pageCount])
  }
  private func biezacaStrona() -> Int? {
    guard let d = pdf.document, let p = pdf.currentPage else { return nil }
    return d.index(for: p)
  }
  private func przewijanie() -> UIScrollView? {
    var kolejka: [UIView] = [pdf]
    while !kolejka.isEmpty {
      let v = kolejka.removeFirst()
      if let s = v as? UIScrollView { return s }
      kolejka.append(contentsOf: v.subviews)
    }
    return nil
  }
}
