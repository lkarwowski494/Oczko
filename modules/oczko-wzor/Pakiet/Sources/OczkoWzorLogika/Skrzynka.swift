// Migawka projektów i zlecenie skrzynki importu w App Group (moduly.md „Kontrakt partii 6”, cel targets/share; P-220 R1a/N2, P-243 S1a; ADR-0011).
// Migawkę zapisuje tylko aplikacja (src/platforma/migawka.ts); rozszerzenie ją czyta i zapisuje zlecenie: plik kopiowany bez wczytania do pamięci,
// manifest `zlecenie.json` NA KOŃCU przez plik tymczasowy i przeniesienie — format czyta src/platforma/skrzynka.ts (`sciezka` względna).
import Foundation

public struct ProjektMigawki: Codable, Equatable, Sendable {
  public let id: String
  public let nazwa: String
  public let nienazwany: Bool
  public let utworzonoMs: Int64
  public let ostatniaPracaMs: Int64?
  public let wzory: Int
}
struct KopertaMigawki: Codable {
  let format: String
  let wersja: Int
  let utworzono: Int64
  let projekty: [ProjektMigawki]
}
public let PLIK_MIGAWKI = "projekty-migawka.json"

/// nil = stan zastępczy „Oczko zapyta przy otwarciu” (brak pliku, uszkodzony, inny format albo wersja nowsza niż MIGAWKA_WERSJA).
public func odczytajMigawke(_ dane: Data?) -> [ProjektMigawki]? {
  guard let d = dane, let k = try? JSONDecoder().decode(KopertaMigawki.self, from: d) else { return nil }
  guard k.format == "oczko-migawka", k.wersja <= StaleWzoru.migawkaWersja else { return nil }
  return k.projekty
}

/// Dni kalendarzowe od ostatniej pracy w strefie urządzenia (0 = dziś, 1 = wczoraj) — tekst `projekty.ostatnia_praca_*`.
public func dniOdPracy(ostatniaMs: Int64?, terazMs: Int64, strefa: TimeZone) -> Int? {
  guard let o = ostatniaMs else { return nil }
  var k = Calendar(identifier: .gregorian)
  k.timeZone = strefa
  let a = k.startOfDay(for: Date(timeIntervalSince1970: Double(o) / 1000))
  let b = k.startOfDay(for: Date(timeIntervalSince1970: Double(terazMs) / 1000))
  return max(0, k.dateComponents([.day], from: a, to: b).day ?? 0)
}

public enum RodzajZalacznika: Equatable, Sendable { case pdf, obraz, word, adres }
/// Rodzaj z identyfikatorów typu (UTI) załącznika; kolejność: plik przed adresem (plik z Plików ma też `public.file-url`).
public func rodzajZalacznika(_ typy: [String]) -> RodzajZalacznika? {
  if typy.contains("com.adobe.pdf") { return .pdf }
  if typy.contains(where: { $0 == "org.openxmlformats.wordprocessingml.document" || $0 == "com.microsoft.word.doc" }) { return .word }
  if typy.contains(where: { $0 == "public.image" || $0 == "public.jpeg" || $0 == "public.png" || $0 == "public.heic" }) { return .obraz }
  if typy.contains("public.url") { return .adres }
  return nil
}

public enum WejscieZlecenia: Sendable {
  case plik(URL, typ: String)
  case adres(URL, film: Bool) // film: link jako „Video link” (P-218 (4)) — [DO USTALENIA S4] obsługa w aplikacji
}
public enum BladZlecenia: Error, Equatable { case zaDuzy, brakPliku }

public struct ZlecenieImportu: Codable, Equatable, Sendable {
  public let id: String
  public let rodzaj: String
  public let nazwa: String
  public let sciezka: String?
  public let adres: String?
  public let typ: String
  public let projektId: String?
  public let utworzonoMs: Int64
  // Jawne null (JSONEncoder pomija nil): czytnik TS sprawdza pola, a manifest ma ten sam kształt co ZlecenieImportu w porty.ts.
  public func encode(to e: Encoder) throws {
    var c = e.container(keyedBy: CodingKeys.self)
    try c.encode(id, forKey: .id); try c.encode(rodzaj, forKey: .rodzaj); try c.encode(nazwa, forKey: .nazwa)
    if let s = sciezka { try c.encode(s, forKey: .sciezka) } else { try c.encodeNil(forKey: .sciezka) }
    if let a = adres { try c.encode(a, forKey: .adres) } else { try c.encodeNil(forKey: .adres) }
    try c.encode(typ, forKey: .typ)
    if let p = projektId { try c.encode(p, forKey: .projektId) } else { try c.encodeNil(forKey: .projektId) }
    try c.encode(utworzonoMs, forKey: .utworzonoMs)
  }
}

/// Nazwa pliku w katalogu zlecenia: bez ścieżki i nie `zlecenie.json` (czytnik TS odrzuca `/` w `sciezka`).
public func bezpiecznaNazwa(_ n: String) -> String {
  let ostatni = n.split(separator: "/").last.map(String.init) ?? ""
  if ostatni.isEmpty || ostatni == "." || ostatni == ".." { return "plik" }
  return ostatni == "zlecenie.json" || ostatni.hasSuffix(".tmp") ? "plik-\(ostatni)" : ostatni
}

/// Zapis zlecenia do `<grupa>/skrzynka/<id>/`: plik > WZOR_MAKS_MB → `zaDuzy` bez katalogu; kopia `copyItem` (strumieniowo, bez pamięci);
/// manifest na końcu (plik tymczasowy → `moveItem`), więc katalog bez manifestu = zlecenie niepełne (aplikacja czeka SKRZYNKA_PORZUCONE_H).
public func zapiszZlecenie(grupa: URL, wejscie: WejscieZlecenia, projektId: String?, terazMs: Int64, id: String = UUID().uuidString) throws -> ZlecenieImportu {
  let fm = FileManager.default
  let katalog = grupa.appendingPathComponent("skrzynka", isDirectory: true).appendingPathComponent(id, isDirectory: true)
  let z: ZlecenieImportu
  switch wejscie {
  case let .plik(url, typ):
    let bajty = (try? fm.attributesOfItem(atPath: url.path)[.size] as? NSNumber)?.int64Value
    guard let b = bajty else { throw BladZlecenia.brakPliku }
    if b > Int64(StaleWzoru.wzorMaksMb) * 1024 * 1024 { throw BladZlecenia.zaDuzy }
    let nazwa = bezpiecznaNazwa(url.lastPathComponent)
    try fm.createDirectory(at: katalog, withIntermediateDirectories: true)
    do { try fm.copyItem(at: url, to: katalog.appendingPathComponent(nazwa)) } catch { try? fm.removeItem(at: katalog); throw error }
    z = ZlecenieImportu(id: id, rodzaj: "plik", nazwa: url.lastPathComponent, sciezka: nazwa, adres: nil, typ: typ, projektId: projektId, utworzonoMs: terazMs)
  case let .adres(url, film):
    try fm.createDirectory(at: katalog, withIntermediateDirectories: true)
    z = ZlecenieImportu(id: id, rodzaj: "adres", nazwa: url.host ?? url.absoluteString, sciezka: nil, adres: url.absoluteString,
                        typ: film ? "film" : "public.url", projektId: projektId, utworzonoMs: terazMs)
  }
  let tmp = katalog.appendingPathComponent("zlecenie.json.tmp")
  try JSONEncoder().encode(z).write(to: tmp)
  try fm.moveItem(at: tmp, to: katalog.appendingPathComponent("zlecenie.json"))
  return z
}
