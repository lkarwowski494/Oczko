// Dziennik +1 z ekranu blokady (ADR-0008): odczyt pliku .jsonl po stronie TS (złote pliki wspólne z XCTest, Z07-11).
// sygnatura: propozycja 07, zatwierdzona w fix 05 2026-10-25 (Z07-22). Reguły odczytu: tests/wspolne/README.md (1–5), ADR-0008 (3), (4).
// `pro` w linii: stan uprawnienia urządzenia w chwili stuknięcia (P-111 (2), ADR-0008 (6)); linia bez `pro` nie spełnia typu.
import type { DziennikPlus, PortBazy, ZdarzenieWejsciowe } from '../domena/porty';
import { zapiszBlad } from './repozytoria/bledy';
import { czytajTekst, istniejePlik, zapiszTekst } from './pliki/system';

const RODZAJE: readonly string[] = ['plus', 'minus'];
const ZRODLA: readonly string[] = ['ekran_blokady', 'zegarek'];
const DZIEN = /^\d{4}-\d{2}-\d{2}$/;

/** Linia → ZdarzenieWejsciowe z samymi polami typu (nieznane pomijane, ADR-0008 (4)); null = linia nie spełnia typu. */
function zdarzenieZLinii(linia: string): ZdarzenieWejsciowe | null {
  let v: unknown;
  try {
    v = JSON.parse(linia);
  } catch {
    return null; // zły JSON (np. ucięta linia) = linia uszkodzona
  }
  if (typeof v !== 'object' || v === null || Array.isArray(v)) return null;
  if (!('id' in v) || typeof v.id !== 'string' || !v.id) return null;
  if (!('licznikId' in v) || typeof v.licznikId !== 'string' || !v.licznikId) return null;
  if (!('rodzaj' in v) || typeof v.rodzaj !== 'string' || !RODZAJE.includes(v.rodzaj)) return null;
  if (!('rodzice' in v) || !Array.isArray(v.rodzice) || !v.rodzice.every((r: unknown) => typeof r === 'string')) return null;
  if (!('czasMs' in v) || typeof v.czasMs !== 'number' || !Number.isInteger(v.czasMs)) return null;
  if (!('strefa' in v) || typeof v.strefa !== 'string' || !v.strefa) return null;
  if (!('dzien' in v) || typeof v.dzien !== 'string' || !DZIEN.test(v.dzien)) return null;
  if (!('zrodlo' in v) || typeof v.zrodlo !== 'string' || !ZRODLA.includes(v.zrodlo)) return null;
  if (!('urzadzenie' in v) || typeof v.urzadzenie !== 'string') return null;
  if (!('pro' in v) || typeof v.pro !== 'boolean') return null;
  const rodzice: string[] = v.rodzice.filter((r: unknown): r is string => typeof r === 'string');
  return {
    id: v.id, licznikId: v.licznikId, rodzaj: v.rodzaj === 'minus' ? 'minus' : 'plus', rodzice, czasMs: v.czasMs, strefa: v.strefa, dzien: v.dzien,
    zrodlo: v.zrodlo === 'zegarek' ? 'zegarek' : 'ekran_blokady', urzadzenie: v.urzadzenie, pro: v.pro,
  };
}

/** Uszkodzona linia (ucięta, zły JSON, brak pola) pominięta; poprzednie zachowane. `uszkodzone` = numery linii od 1. */
export function parsujDziennik(tekst: string): { zdarzenia: ZdarzenieWejsciowe[]; uszkodzone: number[] } {
  const zdarzenia: ZdarzenieWejsciowe[] = [];
  const uszkodzone: number[] = [];
  tekst.split('\n').forEach((linia, i) => {
    if (!linia.trim()) return; // pusty plik albo `\n` na końcu: brak linii
    const z = zdarzenieZLinii(linia);
    if (z) zdarzenia.push(z);
    else uszkodzone.push(i + 1);
  });
  return { zdarzenia, uszkodzone };
}

/**
 * Adapter DziennikPlus na pliku (Node, testy; w aplikacji: moduł Swift `oczko-dziennik-plus`, ADR-0008): uszkodzona linia → wiersz `blad`
 * (diagnostyka F-57: numer linii, bez treści). `skroc(doId)` usuwa linie do `doId` włącznie, późniejsze zostają.
 */
export function utworzDziennikNode(sciezka: string, baza: PortBazy): DziennikPlus {
  return {
    async odczytaj() {
      if (!istniejePlik(sciezka)) return [];
      const { zdarzenia, uszkodzone } = parsujDziennik(await czytajTekst(sciezka));
      // Chwila zapisu diagnostyki: zegar systemu w adapterze platformy (przypadki użycia biorą czas z portu Zegar).
      for (const linia of uszkodzone) await zapiszBlad(baza, { czasMs: Date.now(), kod: 'dziennik_uszkodzona_linia', szczegoly: { linia } });
      return zdarzenia;
    },
    async skroc(doId) {
      if (!istniejePlik(sciezka)) return;
      const linie = (await czytajTekst(sciezka)).split('\n');
      const i = linie.findIndex((l) => zdarzenieZLinii(l)?.id === doId);
      if (i < 0) return; // nie ma takiej linii: nic do skrócenia (R-024)
      zapiszTekst(sciezka, linie.slice(i + 1).join('\n'));
    },
  };
}
