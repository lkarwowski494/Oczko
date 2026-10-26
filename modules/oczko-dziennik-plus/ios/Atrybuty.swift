// Atrybuty Live Activity sesji (ADR-0008, moduly.md „Stan Live Activity i zegarka”): stan treści = StanEkranuBlokady (wersja 2).
// Ten sam typ (nazwa i pola) w module aplikacji i w widżecie — kopia targets/widget/Atrybuty.swift (scripts/natywne/kopie.json).
import ActivityKit
import Foundation

public struct OczkoAtrybuty: ActivityAttributes {
  public typealias ContentState = StanEkranuBlokady
  /// Identyfikator urządzenia do pola `urzadzenie` linii dziennika (stały przez całą Live Activity).
  public let urzadzenie: String
  public init(urzadzenie: String) { self.urzadzenie = urzadzenie }
}
