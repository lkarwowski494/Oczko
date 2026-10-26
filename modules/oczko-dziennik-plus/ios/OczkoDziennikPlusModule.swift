// Most JS ↔ Swift (Expo Modules API, ADR-0007): dziennik +1 (odczyt i skrócenie przez kolejkę jedynego pisarza, ADR-0008), Live Activity
// (start, aktualizacja, koniec; stan = StanEkranuBlokady v2 w JSON), SHA-256 pliku (P-130) i łącze z zegarkiem (ADR-0009). Adaptery TS: src/platforma/.
import ActivityKit
import ExpoModulesCore
import Foundation

public class OczkoDziennikPlusModule: Module {
  public func definition() -> ModuleDefinition {
    Name("OczkoDziennikPlus")

    AsyncFunction("odczytajTekst") { () throws -> String in try DziennikPlus.wspolny.tekst() }
    AsyncFunction("skroc") { (doId: String) throws in try DziennikPlus.wspolny.skroc(doId: doId) }

    AsyncFunction("liveStart") { (stanJson: String, urzadzenie: String) async throws -> String in
      let stan = try StanEkranuBlokady.dekoduj(Data(stanJson.utf8))
      for a in Activity<OczkoAtrybuty>.activities { await a.end(nil, dismissalPolicy: .immediate) } // jedna sesja na ekranie blokady
      let a = try Activity<OczkoAtrybuty>.request(attributes: OczkoAtrybuty(urzadzenie: urzadzenie), content: ActivityContent(state: stan, staleDate: nil), pushType: nil)
      return a.id
    }
    AsyncFunction("liveAktualizuj") { (stanJson: String) async throws in
      let stan = try StanEkranuBlokady.dekoduj(Data(stanJson.utf8))
      for a in Activity<OczkoAtrybuty>.activities { await a.update(ActivityContent(state: stan, staleDate: nil)) }
    }
    AsyncFunction("liveZakoncz") { () async in
      for a in Activity<OczkoAtrybuty>.activities { await a.end(nil, dismissalPolicy: .immediate) }
    }
    Function("liveDostepne") { () -> Bool in ActivityAuthorizationInfo().areActivitiesEnabled }

    AsyncFunction("sha256Pliku") { (sciezka: String) throws -> String in try Skrot.sha256Pliku(sciezka) }

    Events("zegarekZdarzenia")
    AsyncFunction("zegarekWyslij") { (stanJson: String) throws in
      _ = try StanEkranuBlokady.dekoduj(Data(stanJson.utf8)) // zegarek dostaje tylko poprawny stan v2
      try ZegarekHub.shared.wyslijStan(stanJson)
    }
    OnStartObserving { ZegarekHub.shared.poZapisie = { [weak self] linie in self?.sendEvent("zegarekZdarzenia", ["linie": linie]) } }
    OnStopObserving { ZegarekHub.shared.poZapisie = nil }
  }
}
