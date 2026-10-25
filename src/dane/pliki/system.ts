// System plików warstwy danych (P-120 Q1a, jak Trening): jedyne miejsce importu expo-file-system w src/dane; ścieżki bezwzględne bez `file://`.
// Nowe API (File, Directory, FileHandle; expo-file-system 57.0.7, build/File.types.d.ts:80–84) — czytanie i zapis kawałkami, bez wczytania
// całego pliku do pamięci (archiwum do ok. 415 MB, E0 §3 roli 05). W Jest: tests/narzedzia/expo-file-system-node.ts (prawdziwy dysk).
import { Directory, File, FileMode } from 'expo-file-system';

const uri = (sciezka: string): string => `file://${sciezka.split('/').map(encodeURIComponent).join('/')}`;

export const nazwaPliku = (sciezka: string): string => sciezka.slice(sciezka.lastIndexOf('/') + 1);
export const katalogPliku = (sciezka: string): string => sciezka.slice(0, Math.max(0, sciezka.lastIndexOf('/')));
export const polacz = (...czesci: string[]): string => czesci.join('/').replace(/\/{2,}/g, '/');

export function istniejePlik(sciezka: string): boolean {
  return new File(uri(sciezka)).exists;
}
export function istniejeKatalog(sciezka: string): boolean {
  return new Directory(uri(sciezka)).exists;
}
export function rozmiar(sciezka: string): number {
  return new File(uri(sciezka)).size;
}
export function utworzKatalog(sciezka: string): void {
  new Directory(uri(sciezka)).create({ intermediates: true, idempotent: true });
}
/** Nazwy wpisów katalogu (bez ścieżki); brak katalogu = []. */
export function lista(sciezka: string): string[] {
  const k = new Directory(uri(sciezka));
  if (!k.exists) return [];
  return k.list().map((w) => decodeURIComponent(w.uri.replace(/\/$/, '').split('/').pop() ?? ''));
}
export function usunPlik(sciezka: string): void {
  const p = new File(uri(sciezka));
  if (p.exists) p.delete();
}
export function usunKatalog(sciezka: string): void {
  const k = new Directory(uri(sciezka));
  if (k.exists) k.delete();
}
/** Kopia bajt w bajt; cel nie może istnieć (kopia nigdy nie nadpisuje po cichu). */
export function kopiuj(zrodlo: string, cel: string): void {
  new File(uri(zrodlo)).copySync(new File(uri(cel)));
}
export function czytajTekst(sciezka: string): Promise<string> {
  return new File(uri(sciezka)).text();
}
export function zapiszTekst(sciezka: string, tekst: string): void {
  const p = new File(uri(sciezka));
  if (!p.exists) p.create();
  p.write(tekst);
}

export interface Czytnik { czytaj(od: number, dlugosc: number): Uint8Array; readonly rozmiar: number; zamknij(): void }
export interface Pisarz { zapisz(bajty: Uint8Array): void; readonly zapisano: number; zamknij(): void }

export function otworzDoCzytania(sciezka: string): Czytnik {
  const h = new File(uri(sciezka)).open(FileMode.ReadOnly);
  return {
    rozmiar: h.size ?? 0,
    czytaj(od, dlugosc) { h.offset = od; return h.readBytes(dlugosc); },
    zamknij() { h.close(); },
  };
}
/** Nowy plik (cel nie może istnieć); zapis kolejnymi kawałkami. */
export function otworzDoZapisu(sciezka: string): Pisarz {
  const p = new File(uri(sciezka));
  p.create();
  const h = p.open(FileMode.WriteOnly);
  let zapisano = 0;
  return {
    get zapisano() { return zapisano; },
    zapisz(bajty) { h.offset = zapisano; h.writeBytes(bajty); zapisano += bajty.length; },
    zamknij() { h.close(); },
  };
}
