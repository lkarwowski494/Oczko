// Most do modułu Swift OczkoWzor (ADR-0007, ADR-0011, ADR-0012; moduly.md „Kontrakt partii 6”); jedyne miejsce require dla tego modułu.
// Moduł opcjonalny: build bez modułu (np. nocny przebieg sprzed partii 6) dostaje null — adapter src/platforma/ zwraca wtedy błąd zamiast awarii.
// Funkcje zwracają JSON `{ ok: true, … }` albo `{ ok: false, powod }` (powody z src/domena/bledy.ts: brak_sieci, odmowa, pusty, anulowano, uszkodzony, …).
import type { ComponentType } from 'react';
import type { NativeSyntheticEvent, StyleProp, ViewStyle } from 'react-native';
import { requireNativeViewManager, requireOptionalNativeModule } from 'expo-modules-core';

export interface OczkoWzorNatywny {
  naPdf(zrodloJson: string): Promise<string>;      // ZrodloWzoru → {ok, sciezka, strony} (plik tymczasowy)
  sprawdzPdf(sciezka: string): Promise<string>;     // PDFKit: {ok, strony} | uszkodzony (w tym zaszyfrowany) | pusty
  skanerDostepny(): boolean;                         // VNDocumentCameraViewController.isSupported
  skanuj(): Promise<string>;                         // {ok, sciezki: JPEG stron} | anulowano | odmowa (aparat)
}

export type ZnacznikNatywny = { strona: number; y: number; wysokosc: number; pozaStrona: boolean; przedSchematem: boolean; kierunek: 1 | -1; etykieta: string };
export type PropsWidokuNatywnego = {
  /** Dokument jednym propsem (kolejność propsów nieokreślona): zmiana wzorId najpierw zapisuje kreski starego wzoru (przegląd 2026-10-26).
   *  rysunki: pliki PKDrawing z magazynu (osobna warstwa, P-218 (2)) — wczytywane tylko przy zmianie wzoru; obroty: P-246 S3a. */
  dokument: { wzorId: string; plikPdf: string; rysunki: { strona: number; plik: string }[]; obroty: { strona: number; kat: number }[] };
  katalogRysunkow: string;                           // katalog plików rysunków czekających na zapis (odzyskiwane przy następnym otwarciu)
  strona: number;                                    // 0 = pierwsza; zmiana z JS przewija do strony
  znacznik: ZnacznikNatywny | null;                  // wynik polozenieZnacznika — widok tylko rysuje (testID `wzor-znacznik`, P-237 (2))
  narzedzie: 'brak' | 'zakreslacz' | 'pioro' | 'gumka';
  polityka: 'wylaczone' | 'dowolne' | 'tylkoRysik'; // politykaPlotna (src/domena/rysik.ts)
  cofnij: number;                                    // licznik: każda zmiana = cofnięcie ostatniej kreski na bieżącej stronie
  style?: StyleProp<ViewStyle>;
  testID?: string;
  onRysunek?: (e: NativeSyntheticEvent<{ wzorId: string; strona: number; plikTymczasowy: string }>) => void; // po RYSUNEK_ZAPIS_MS, zmianie strony, zamknięciu, tle
  onStukniecie?: (e: NativeSyntheticEvent<{ wzorId: string; strona: number; y: number }>) => void;            // przytrzymanie; y = ułamek wysokości strony bez /Rotate
  onStrona?: (e: NativeSyntheticEvent<{ strona: number; stron: number }>) => void;
  onPierwszyRysik?: (e: NativeSyntheticEvent<Record<string, never>>) => void;                  // P-218 Q2a
  onZakreslenia?: (e: NativeSyntheticEvent<{ liczba: number }>) => void;                       // kreski zakreślacza na wszystkich stronach
};

export const natywny = (): OczkoWzorNatywny | null => requireOptionalNativeModule<OczkoWzorNatywny>('OczkoWzor');
export const WidokWzoruNatywny: ComponentType<PropsWidokuNatywnego> | null = natywny() ? requireNativeViewManager<PropsWidokuNatywnego>('OczkoWzor') : null;
