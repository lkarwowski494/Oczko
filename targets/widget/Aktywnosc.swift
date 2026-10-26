// Live Activity sesji (F-11, F-21; ADR-0008): nazwa, liczba, tylko +1 przez intencję (P-133 (1.1a)), stoper od `sesjaStartMs` rysowany przez
// system (bez odliczania w kodzie). Stany według pierwszeństwa design-spec „Ekran blokady i zegarek”: zablokowany → limit → `uwaga` → typowy
// (P-142). Wygląd z tokenów 04 (kolory celu), teksty z tabeli generowanej z t() w języku aplikacji ze stanu (Teksty.swift, ADR-0017, P-139).
import ActivityKit
import AppIntents
import SwiftUI
import WidgetKit

struct OczkoAktywnosc: Widget {
  var body: some WidgetConfiguration {
    ActivityConfiguration(for: OczkoAtrybuty.self) { kontekst in
      EkranBlokady(a: kontekst.state)
        .activityBackgroundTint(Color("papier"))
        .activitySystemActionForegroundColor(Color("grafit"))
    } dynamicIsland: { kontekst in
      DynamicIsland {
        DynamicIslandExpandedRegion(.leading) { Text(kontekst.state.stan.nazwa).font(.headline).lineLimit(1) }
        DynamicIslandExpandedRegion(.trailing) { Liczba(stan: kontekst.state.stan).font(.title2.monospacedDigit()) }
        DynamicIslandExpandedRegion(.bottom) {
          VStack(alignment: .leading, spacing: 4) {
            HStack { Opis(a: kontekst.state, zPodpisem: false); Spacer(); Przycisk(a: kontekst.state) }
            if let pas = pasTypowy(kontekst.state) { Pas(pas: pas, jezyk: kontekst.state.jezyk, wyspa: true) }
          }
        }
      } compactLeading: {
        Image(systemName: "number") // znak kresek z ikony: zasób dla celu widżetu — zgłoszenie (partia 4, raport)
      } compactTrailing: {
        Liczba(stan: kontekst.state.stan).monospacedDigit()
      } minimal: {
        Liczba(stan: kontekst.state.stan).monospacedDigit()
      }
    }
  }
}

/// Pas przypomnienia pod liczbą (RD-13, P-158, P-161): zakreślacz = rząd z instrukcją; najwyżej 2 wiersze, dalej wielokropek.
/// `rzadWRobocie` i `pasPrzypomnienia` z pakietu reguł (Wspolne/Przypomnienia.swift) — ta sama reguła co pas w aplikacji.
struct Pas: View {
  let pas: PasPrzypomnienia
  let jezyk: String?
  let wyspa: Bool // rozwinięta Dynamic Island: kolory systemCzarny.zakreslacz* (tło wyspy zawsze czarne)
  var body: some View {
    let p: [String: String] = ["n": String(pas.rzad), "tekst": pas.tekst, "k": String(pas.k), "razy": String(pas.razy)]
    let k = wyspa ? "wyspa" : ""
    Text(Teksty.t("przypomnienie", jezyk, p))
      .font(.footnote.weight(.semibold)).lineLimit(2).truncationMode(.tail)
      .foregroundStyle(Color(k + "tekstNaZakreslaczu"))
      .padding(.horizontal, 6).padding(.vertical, 2)
      .background(RoundedRectangle(cornerRadius: 4).fill(Color(k + "zakreslacz")))
      .overlay(alignment: .leading) { Rectangle().fill(Color(k + "zakreslaczKrawedz")).frame(width: 2) }
      .accessibilityLabel(Teksty.t("przypomnienie_a11y", jezyk, p))
  }
}

/// Pas tylko w stanie typowym (pierwszeństwo: zablokowany → limit → `uwaga` → typowy, design-spec „Ekran blokady i zegarek”).
func pasTypowy(_ a: StanAktywnosci) -> PasPrzypomnienia? {
  a.stan.zablokowany || !a.stan.dzienDozwolony || a.uwaga != nil ? nil : pasPrzypomnienia(a.stan)
}

/// Duża liczba: skończone rzędy albo rząd w trakcie (BR-LIC-012), jak na ekranie licznika.
struct Liczba: View {
  let stan: StanEkranuBlokady
  var body: some View { Text(String(stan.znaczenie == .w_trakcie ? stan.wartosc + 1 : stan.wartosc)) }
}

/// Nazwa miesiąca i dzień wznowienia limitu (pierwszy dzień następnego miesiąca, `wznowienieLimitu` R-105) w języku aplikacji.
func tekstyLimitu(_ s: StanEkranuBlokady, _ jezyk: String?) -> (miesiac: String, data: String) {
  let czesci = s.dzien.split(separator: "-").compactMap { Int($0) }
  guard czesci.count == 3 else { return ("", "") }
  var kal = Calendar(identifier: .gregorian)
  kal.timeZone = TimeZone(identifier: "UTC") ?? .current
  let locale = Locale(identifier: jezyk ?? "en")
  let dzis = kal.date(from: DateComponents(year: czesci[0], month: czesci[1], day: 1)) ?? Date()
  let wznowienie = kal.date(byAdding: .month, value: 1, to: dzis) ?? dzis
  let m = DateFormatter(); m.locale = locale; m.timeZone = kal.timeZone; m.setLocalizedDateFormatFromTemplate("LLLL")
  let d = DateFormatter(); d.locale = locale; d.timeZone = kal.timeZone; d.setLocalizedDateFormatFromTemplate("MMMd")
  return (m.string(from: dzis), d.string(from: wznowienie))
}

/// Opis obok liczby według pierwszeństwa stanów; przy blokadzie i limicie bez przycisku (Przycisk).
struct Opis: View {
  let a: StanAktywnosci
  let zPodpisem: Bool
  var body: some View {
    let s = a.stan, j = a.jezyk, n = String(rzadWRobocie(s))
    VStack(alignment: .leading, spacing: 2) {
      if s.zablokowany {
        Text(Teksty.t("zablokowany", j)).font(.subheadline.weight(.semibold)).foregroundStyle(Color("grafit"))
        Text(Teksty.t("zablokowany_jak", j)).font(.footnote).foregroundStyle(Color("olowek"))
      } else if !s.dzienDozwolony {
        let l = tekstyLimitu(s, j)
        Text(Teksty.t("wstrzymane", j)).font(.subheadline.weight(.semibold)).foregroundStyle(Color("grafit"))
        Text(Teksty.t("zachowane", j)).font(.footnote).foregroundStyle(Color("olowek"))
        Label(Teksty.t("limit", j, ["miesiac": l.miesiac]) + " " + Teksty.t("limit_wznowienie", j, ["data": l.data]), systemImage: "info.circle")
          .font(.footnote).foregroundStyle(Color("olowek"))
      } else if let u = a.uwaga {
        Text(Teksty.t("nie_dodano", j, ["n": n])).font(.subheadline.weight(.semibold)).foregroundStyle(Color("grafit"))
        Text(Teksty.t(u == .odblokuj ? "odblokuj" : "blad_zapisu", j)).font(.footnote).foregroundStyle(Color("olowek"))
      } else {
        Text(Teksty.t("teraz", j, ["n": n])).font(.subheadline).foregroundStyle(Color("grafit"))
        // Kilka przypomnień w rzędzie: cicha linia „+N more” w miejscu podpisu (P-158 (1.1a)); w wyspie pod „Now row”.
        if let pas = pasPrzypomnienia(s), pas.wiecej > 0 {
          Text(Teksty.tl("przypomnienie_wiecej", pas.wiecej, j)).font(.footnote).foregroundStyle(Color("olowek"))
        } else if zPodpisem {
          Text(Teksty.t("podpis_plus", j, ["n": n])).font(.footnote).foregroundStyle(Color("olowek"))
        }
      }
    }
    .accessibilityElement(children: .combine)
  }
}

/// Jedyny element sterujący Live Activity: +1 (P-133 (1.1a)); brak przy blokadzie i limicie (stan znany z góry, P-142 (2a)).
struct Przycisk: View {
  let a: StanAktywnosci
  var body: some View {
    if !a.stan.zablokowany && a.stan.dzienDozwolony {
      Button(intent: OczkoStuknij(rodzaj: "plus")) { Text(Teksty.t("plus", a.jezyk)).font(.headline).frame(minWidth: 96, minHeight: 60) }
        .accessibilityLabel(Teksty.t("plus_a11y", a.jezyk, ["n": String(rzadWRobocie(a.stan))]))
        .buttonStyle(.borderedProminent)
        .tint(Color("przyciskTlo"))
        .foregroundStyle(Color("przyciskTekst"))
    }
  }
}

struct EkranBlokady: View {
  let a: StanAktywnosci
  var body: some View {
    let s = a.stan
    VStack(alignment: .leading, spacing: 8) {
      HStack(alignment: .firstTextBaseline) {
        Text(s.nazwa).font(.headline).foregroundStyle(Color("grafit")).lineLimit(1)
        Spacer()
        if let start = s.sesjaStartMs {
          Text(timerInterval: Date(timeIntervalSince1970: TimeInterval(start) / 1000)...Date.distantFuture, countsDown: false)
            .font(.subheadline.monospacedDigit()).foregroundStyle(Color("olowek")).multilineTextAlignment(.trailing)
        }
      }
      HStack(alignment: .center, spacing: 12) {
        Liczba(stan: s).font(.system(size: 48, weight: .semibold).monospacedDigit()).foregroundStyle(Color("grafit"))
        Opis(a: a, zPodpisem: true)
        Spacer(minLength: 0)
        Przycisk(a: a)
      }
      if let pas = pasTypowy(a) { Pas(pas: pas, jezyk: a.jezyk, wyspa: false) }
    }
    .padding(14)
  }
}
