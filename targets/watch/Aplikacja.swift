// Aplikacja na zegarku (F-12, ADR-0009): wyświetla licznik z kontekstu telefonu i liczy +1/−1 także bez telefonu (skrzynka oczekujących,
// SkrzynkaZegarka w pakiecie reguł); zdarzenia idą do telefonu przez transferUserInfo (kolejka systemu), Pro z kontekstu albo StoreKit zegarka.
// Makiety zegarka nie ma (design-spec: 08 buduje z tokenów, sprawdza audyt 04).
import StoreKit
import SwiftUI
import WatchConnectivity
import WatchKit

@main
struct OczkoZegarekApp: App {
  @StateObject private var model = ModelZegarka()
  var body: some Scene {
    WindowGroup { EkranZegarka().environmentObject(model) }
  }
}

@MainActor
final class ModelZegarka: NSObject, ObservableObject, WCSessionDelegate {
  @Published private(set) var skrzynka: SkrzynkaZegarka
  @Published private(set) var limit = false
  private var sklep: [Uprawnienie] = []
  private let zapis = UserDefaults.standard
  private let kluczKontekst = "oczko.zegarek.kontekst.v2"
  private let kluczOczekujace = "oczko.zegarek.oczekujace.v1"
  /// Urządzenie w polu linii dziennika: stały identyfikator instalacji na zegarku (bez danych osobowych).
  private lazy var urzadzenie: String = {
    if let u = zapis.string(forKey: "oczko.zegarek.urzadzenie") { return u }
    let u = "zegarek-" + UUID().uuidString.lowercased()
    zapis.set(u, forKey: "oczko.zegarek.urzadzenie")
    return u
  }()

  override init() {
    let kontekst = UserDefaults.standard.data(forKey: "oczko.zegarek.kontekst.v2").flatMap { try? StanEkranuBlokady.dekoduj($0) }
    let linie = UserDefaults.standard.stringArray(forKey: "oczko.zegarek.oczekujace.v1") ?? []
    skrzynka = SkrzynkaZegarka(kontekst: kontekst, oczekujace: linie.compactMap { ZdarzenieWejsciowe.zLinii(Substring($0)) })
    super.init()
    if WCSession.isSupported() { WCSession.default.delegate = self; WCSession.default.activate() }
    Task { await odswiezSklep() }
  }

  func stuknij(_ rodzaj: ZdarzenieWejsciowe.Rodzaj) {
    let teraz = Int64((Date().timeIntervalSince1970 * 1000).rounded(.down))
    do {
      let w = try skrzynka.stuknijNaZegarku(rodzaj, teraz: teraz, strefa: TimeZone.current.identifier, id: UUID().uuidString.lowercased(), urzadzenie: urzadzenie, sklep: sklep)
      switch w {
      case let .zapisz(z, _):
        utrwal()
        WKInterfaceDevice.current().play(.click)
        if WCSession.default.activationState == .activated { WCSession.default.transferUserInfo(["linia": z.linia]) }
        limit = false
      case .limit: limit = true
      case .bezZmiany, .zablokowany: break // zablokowany: widok i haptyka — następny commit 08 (partia 4, N1)
      }
    } catch { limit = false }
  }

  private func utrwal() {
    if let k = skrzynka.kontekst, let d = try? JSONEncoder().encode(k) { zapis.set(d, forKey: kluczKontekst) }
    zapis.set(skrzynka.oczekujace.map(\.linia), forKey: kluczOczekujace)
  }

  /// StoreKit zegarka (ADR-0009 D): bieżące uprawnienia jako `Uprawnienie` (OR z kontekstem telefonu w proZegarka).
  private func odswiezSklep() async {
    var lista: [Uprawnienie] = []
    for await wynik in Transaction.currentEntitlements {
      guard case let .verified(t) = wynik else { continue }
      lista.append(Uprawnienie(produkt: t.productID, wygasa: t.expirationDate.map { Int64($0.timeIntervalSince1970 * 1000) }, odebrane: t.revocationDate != nil))
    }
    sklep = lista
  }

  nonisolated func session(_ session: WCSession, activationDidCompleteWith activationState: WCSessionActivationState, error: Error?) {
    let kontekst = session.receivedApplicationContext
    Task { @MainActor in self.przyjmij(kontekst) }
  }
  nonisolated func session(_ session: WCSession, didReceiveApplicationContext applicationContext: [String: Any]) {
    Task { @MainActor in self.przyjmij(applicationContext) }
  }
  /// Kontekst `{ "stan": <StanZegarka v2 JSON> }`; nowsza wersja albo zły ładunek → zostaje ostatni poprawny stan (moduly.md).
  private func przyjmij(_ kontekst: [String: Any]) {
    guard let tekst = kontekst["stan"] as? String, let s = try? StanEkranuBlokady.dekoduj(Data(tekst.utf8)) else { return }
    skrzynka.przyjmij(s)
    limit = false
    utrwal()
  }
}

struct EkranZegarka: View {
  @EnvironmentObject var model: ModelZegarka
  var body: some View {
    if let s = model.skrzynka.pokazywany {
      VStack(spacing: 6) {
        Text(s.nazwa).font(.footnote).foregroundStyle(Color("olowek")).lineLimit(1)
        Text(String(s.znaczenie == .w_trakcie ? s.wartosc + 1 : s.wartosc)).font(.system(size: 48, weight: .semibold).monospacedDigit())
          .foregroundStyle(Color("grafit"))
        if model.limit || !s.dzienDozwolony {
          Text(Teksty.t("limit")).font(.footnote).foregroundStyle(Color("olowek")).multilineTextAlignment(.center)
        } else {
          HStack {
            Button { model.stuknij(.minus) } label: { Image(systemName: "minus") }.accessibilityLabel(Teksty.t("odejmij"))
            Button { model.stuknij(.plus) } label: { Image(systemName: "plus") }.accessibilityLabel(Teksty.t("dodaj")).tint(Color("przyciskTlo"))
          }
        }
      }
    } else {
      Image(systemName: "iphone").font(.title2).foregroundStyle(Color("olowek")).accessibilityLabel(Teksty.t("polacz"))
    }
  }
}
