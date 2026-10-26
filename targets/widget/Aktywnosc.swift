// Live Activity sesji (F-11, F-21; ADR-0008): nazwa, liczba, +1/−1 przez intencję, stoper od `sesjaStartMs` rysowany przez system
// (bez odliczania w kodzie), komunikat limitu zamiast przycisków przy dniu niedozwolonym (P-065 (1a)). Wygląd z tokenów 04 (kolory celu),
// teksty z tabeli generowanej z t() (Teksty.swift, ADR-0017). Makiety 04 nie ma (design-spec: buduje 08 z tokenów, sprawdza audyt 04).
import ActivityKit
import AppIntents
import SwiftUI
import WidgetKit

struct OczkoAktywnosc: Widget {
  var body: some WidgetConfiguration {
    ActivityConfiguration(for: OczkoAtrybuty.self) { kontekst in
      EkranBlokady(stan: kontekst.state)
        .activityBackgroundTint(Color("papier"))
        .activitySystemActionForegroundColor(Color("grafit"))
    } dynamicIsland: { kontekst in
      DynamicIsland {
        DynamicIslandExpandedRegion(.leading) { Text(kontekst.state.nazwa).font(.headline).lineLimit(1) }
        DynamicIslandExpandedRegion(.trailing) { Liczba(stan: kontekst.state).font(.title2.monospacedDigit()) }
        DynamicIslandExpandedRegion(.bottom) { Przyciski(stan: kontekst.state) }
      } compactLeading: {
        Image(systemName: "number")
      } compactTrailing: {
        Liczba(stan: kontekst.state).monospacedDigit()
      } minimal: {
        Liczba(stan: kontekst.state).monospacedDigit()
      }
    }
  }
}

/// Duża liczba: skończone rzędy albo rząd w trakcie (BR-LIC-012), jak na ekranie licznika.
struct Liczba: View {
  let stan: StanEkranuBlokady
  var body: some View { Text(String(stan.znaczenie == .w_trakcie ? stan.wartosc + 1 : stan.wartosc)) }
}

struct EkranBlokady: View {
  let stan: StanEkranuBlokady
  var body: some View {
    VStack(alignment: .leading, spacing: 8) {
      HStack(alignment: .firstTextBaseline) {
        Text(stan.nazwa).font(.headline).foregroundStyle(Color("grafit")).lineLimit(1)
        Spacer()
        if let start = stan.sesjaStartMs {
          Text(timerInterval: Date(timeIntervalSince1970: TimeInterval(start) / 1000)...Date.distantFuture, countsDown: false)
            .font(.subheadline.monospacedDigit()).foregroundStyle(Color("olowek")).multilineTextAlignment(.trailing)
        }
      }
      HStack {
        Liczba(stan: stan).font(.system(size: 44, weight: .semibold).monospacedDigit()).foregroundStyle(Color("grafit"))
        Spacer()
        Przyciski(stan: stan)
      }
    }
    .padding(16)
  }
}

struct Przyciski: View {
  let stan: StanEkranuBlokady
  var body: some View {
    if stan.dzienDozwolony {
      HStack(spacing: 12) {
        Button(intent: OczkoStuknij(rodzaj: "minus")) { Image(systemName: "minus").frame(width: 44, height: 44) }
          .accessibilityLabel(Teksty.t("odejmij"))
        Button(intent: OczkoStuknij(rodzaj: "plus")) { Image(systemName: "plus").frame(width: 64, height: 44) }
          .accessibilityLabel(Teksty.t("dodaj"))
      }
      .buttonStyle(.borderedProminent)
      .tint(Color("przyciskTlo"))
      .foregroundStyle(Color("przyciskTekst"))
    } else {
      Text(Teksty.t("limit")).font(.footnote).foregroundStyle(Color("olowek")).multilineTextAlignment(.trailing)
    }
  }
}
