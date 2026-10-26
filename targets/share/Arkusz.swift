// Arkusz „Add to Oczko” (design-spec „Arkusz rozszerzenia (R1a)”, makieta docs/design/fix7-2026-10-26/udostepnij-icloud.html, stany udostepnij*):
// nagłówek Cancel / tytuł / Save; podgląd pliku; lista projektów w toku z migawki (radio, domyślnie pierwszy = ostatnio otwarty) i „New project”;
// zdanie pod listą (`udostepnij.gotowe*`, `udostepnij.kolejny`); link: Pattern / Video link (P-218 (4)). Bez migawki: `udostepnij.bez_migawki`
// bez listy (R1b jako stan zastępczy). Za duży i nieobsługiwany: linia ostrzeżenia i tylko „Close”. Teksty: Teksty.swift (generator, ADR-0017).
import SwiftUI

enum StanArkusza: Equatable { case ladowanie, gotowy, zaDuzy, nieobslugiwany }

final class ModelArkusza: ObservableObject {
  @Published var stan: StanArkusza = .ladowanie
  @Published var zalaczniki: [Zalacznik] = []
  @Published var projekty: [ProjektMigawki]? // nil = brak migawki
  @Published var wybrany: String?            // nil = „New project” (aplikacja zapyta o projekt przy otwarciu)
  @Published var jakoFilm = false
  var naAnuluj: () -> Void = {}
  var naZapisz: () -> Void = {}
}

/// Pierwszy język systemu, który ma tabelę (rozszerzenie nie czyta preferencji języka z bazy aplikacji) [DO USTALENIA: język aplikacji w migawce].
let JEZYK: String? = Locale.preferredLanguages.lazy.compactMap { id -> String? in
  let czesci = id.split(separator: "-").map(String.init)
  let kandydaci = (1...czesci.count).reversed().map { czesci.prefix($0).joined(separator: "-") }
  return kandydaci.first { Teksty.lancuch[$0] != nil }
}.first

struct ArkuszUdostepnij: View {
  @ObservedObject var model: ModelArkusza

  var body: some View {
    NavigationStack {
      Group {
        switch model.stan {
        case .ladowanie: ProgressView()
        case .zaDuzy: ostrzezenie(Teksty.t("wzor.blad_rozmiar", JEZYK), Teksty.t("udostepnij.za_duzy", JEZYK, ["mb": String(StaleWzoru.wzorMaksMb)]))
        case .nieobslugiwany: ostrzezenie(Teksty.t("wzor.blad_typ", JEZYK), Teksty.t("udostepnij.nieobslugiwany", JEZYK))
        case .gotowy: lista
        }
      }
      .navigationTitle(Teksty.t("udostepnij.tytul", JEZYK))
      .navigationBarTitleDisplayMode(.inline)
      .toolbar {
        if model.stan == .gotowy {
          ToolbarItem(placement: .cancellationAction) { Button(Teksty.t("wspolne.anuluj", JEZYK)) { model.naAnuluj() } }
          ToolbarItem(placement: .confirmationAction) { Button(Teksty.t("wspolne.zapisz", JEZYK)) { model.naZapisz() }.bold() }
        } else {
          ToolbarItem(placement: .cancellationAction) { Button(Teksty.t("wspolne.zamknij", JEZYK)) { model.naAnuluj() } }
        }
      }
    }
    .tint(Color("grafit"))
  }

  private func ostrzezenie(_ tytul: String, _ opis: String) -> some View {
    VStack(alignment: .leading, spacing: 8) {
      Label(tytul, systemImage: "exclamationmark.circle").font(.headline) // ikona „!”, nigdy sam kolor
      Text(opis).foregroundStyle(Color("olowek"))
    }
    .frame(maxWidth: .infinity, alignment: .leading)
    .padding()
    .accessibilityElement(children: .combine)
  }

  private var maAdres: Bool { model.zalaczniki.contains { $0.adres != nil } }

  private var lista: some View {
    List {
      Section {
        ForEach(Array(model.zalaczniki.enumerated()), id: \.offset) { _, z in
          VStack(alignment: .leading) {
            Text(z.nazwa).lineLimit(2)
            Text(rodzajTekst(z.rodzaj)).font(.footnote).foregroundStyle(Color("olowek"))
          }
        }
        if maAdres {
          Picker(Teksty.t("udostepnij.jako", JEZYK), selection: $model.jakoFilm) {
            Text(Teksty.t("udostepnij.jako_wzor", JEZYK)).tag(false)
            Text(Teksty.t("udostepnij.jako_film", JEZYK)).tag(true)
          }
          .pickerStyle(.segmented)
          .accessibilityIdentifier("udostepnij-jako")
        }
      }
      if let projekty = model.projekty {
        Section {
          ForEach(Array(projekty.enumerated()), id: \.element.id) { _, p in wiersz(p) }
          Button { model.wybrany = nil } label: { radio(Teksty.t("udostepnij.nowy_projekt", JEZYK), nil, zaznaczony: model.wybrany == nil) }
            .accessibilityIdentifier("udostepnij-nowy-projekt")
        } header: { Text(Teksty.t("udostepnij.do_projektu", JEZYK)) } footer: { Text(podpis(projekty)) }
        .accessibilityElement(children: .contain)
      } else {
        Section { Text(Teksty.t("udostepnij.bez_migawki", JEZYK)).foregroundStyle(Color("olowek")) }
      }
    }
  }

  private func wiersz(_ p: ProjektMigawki) -> some View {
    Button { model.wybrany = p.id } label: { radio(nazwa(p), drugaLinia(p), zaznaczony: model.wybrany == p.id) }
      .accessibilityIdentifier("udostepnij-projekt")
  }
  private func radio(_ tytul: String, _ opis: String?, zaznaczony: Bool) -> some View {
    HStack {
      VStack(alignment: .leading) {
        Text(tytul).foregroundStyle(Color("grafit"))
        if let opis { Text(opis).font(.footnote).foregroundStyle(Color("olowek")) }
      }
      Spacer()
      if zaznaczony { Image(systemName: "checkmark").accessibilityHidden(true) }
    }
    .contentShape(Rectangle())
    .accessibilityElement(children: .combine)
    .accessibilityAddTraits(zaznaczony ? [.isButton, .isSelected] : .isButton)
  }

  private func rodzajTekst(_ r: RodzajZalacznika) -> String {
    switch r {
    case .pdf: return Teksty.t("wzor.rodzaj_pdf", JEZYK)
    case .word: return Teksty.t("wzor.rodzaj_word", JEZYK)
    case .obraz: return Teksty.t("wzor.rodzaj_zdjecie", JEZYK)
    case .adres: return Teksty.t("wzor.rodzaj_strona", JEZYK)
    }
  }
  private func nazwa(_ p: ProjektMigawki) -> String {
    guard p.nienazwany else { return p.nazwa }
    let f = DateFormatter()
    f.locale = Locale(identifier: JEZYK ?? "en")
    f.setLocalizedDateFormatFromTemplate("MMMd jmm")
    return Teksty.t("projekty.nazwa_robocza", JEZYK, ["data": f.string(from: Date(timeIntervalSince1970: Double(p.utworzonoMs) / 1000))])
  }
  private func drugaLinia(_ p: ProjektMigawki) -> String {
    let wzory = Teksty.tl("udostepnij.wzory", p.wzory, JEZYK)
    guard let d = dniOdPracy(ostatniaMs: p.ostatniaPracaMs, terazMs: Int64(Date().timeIntervalSince1970 * 1000), strefa: .current) else { return wzory }
    let ostatnia = d == 0 ? Teksty.t("projekty.ostatnia_praca_dzis", JEZYK) : d == 1 ? Teksty.t("projekty.ostatnia_praca_wczoraj", JEZYK)
      : Teksty.tl("projekty.ostatnia_praca_dni", d, JEZYK)
    return Teksty.t("udostepnij.wiersz", JEZYK, ["ostatnia": ostatnia, "wzory": wzory])
  }
  private func podpis(_ projekty: [ProjektMigawki]) -> String {
    guard let id = model.wybrany, let p = projekty.first(where: { $0.id == id }) else { return Teksty.t("udostepnij.gotowe_nowy", JEZYK) }
    return Teksty.t(p.wzory > 0 ? "udostepnij.kolejny" : "udostepnij.gotowe", JEZYK, ["projekt": nazwa(p)])
  }
}
