// Panele buildu E2E (e2e/README.md; bez t(), jak „Test store” Treningu). Ładowane wyłącznie przez `src/platforma/tryb-e2e.ts` (`paneleE2e`)
// w gałęzi `process.env.EXPO_PUBLIC_E2E === '1'` — w buildzie wydania moduł nie trafia do bundla (P-238; kontrola `slady-testowe.mjs`).
// testID i napisy bez zmian: używają ich scenariusze 07. Moduł nie importuje `tryb-e2e.ts` (bez cyklu).
import React, { useCallback, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { PLIK_BAZY } from '../../dane/baza/sciezki';
import { stanPlikuBazy } from '../../dane/pliki/magazyn';
import { polacz } from '../../dane/pliki/system';
import { plikiE2e } from '../e2e-pliki';
import { zdjecieTestowe } from '../e2e-zdjecie';

/** Oferty: „wygaś dostęp” sztucznego sklepu (app/oferty.tsx). */
export function PanelSklepu({ naWygas }: { naWygas(): void }): React.ReactElement {
  return (
    <Pressable accessibilityRole="button" onPress={naWygas} testID="e2e-sklep-wygas" style={{ padding: 12 }}>
      <Text>Test store: expire access</Text>
    </Pressable>
  );
}

/**
 * Ustawienia: pliki testowe (zachowaj ostatni eksport, importuj ostatni zachowany) i SHA-256 pary `.db` + `-wal` bez checkpointu z rozmiarem
 * `-wal` (ADR-0019, P-203: liczone przy każdym wejściu na ekran, panel ukryty do końca liczenia).
 */
export function PanelUstawien(p: { katalogDanych: string; ostatniEksport: string | null; naImportuj(sciezka: string): void }): React.ReactElement {
  const pliki = plikiE2e(p.katalogDanych);
  const [zapisane, ustawZapisane] = useState(() => pliki.ile());
  const [sha, ustawSha] = useState<{ sha: string; walBajty: number } | null>(null);
  useFocusEffect(useCallback(() => {
    ustawSha(null);
    void stanPlikuBazy(polacz(p.katalogDanych, PLIK_BAZY)).then(ustawSha);
  }, [p.katalogDanych]));
  return (
    <View style={{ gap: 8 }}>
      <Pressable accessibilityRole="button" testID="e2e-pliki-zachowaj-eksport"
        onPress={() => { if (p.ostatniEksport) ustawZapisane(pliki.zachowaj(p.ostatniEksport)); }}>
        <Text>Test files: keep last export</Text>
      </Pressable>
      {sha ? <Text testID="e2e-sha-bazy" selectable>{sha.sha}</Text> : null /* dopiero po policzeniu (copyTextFrom w scenariuszu 09) */}
      {sha ? <Text testID="e2e-wal-bajty" selectable>{String(sha.walBajty)}</Text> : null}
      <Text testID="e2e-pliki-stan">{`Saved: ${zapisane} file${zapisane === 1 ? '' : 's'}`}</Text>
      <Pressable accessibilityRole="button" testID="e2e-pliki-importuj-ostatni" onPress={() => { const s = pliki.ostatni(); if (s) p.naImportuj(s); }}>
        <Text>Test files: import last kept</Text>
      </Pressable>
    </View>
  );
}

/** Ekran projektu, wybór źródła zdjęcia: zdjęcie testowe z EXIF GPS (scenariusze 17, 42). */
export function PanelZdjecia({ katalogTymczasowy, naPlik }: { katalogTymczasowy: string; naPlik(sciezka: string): void }): React.ReactElement {
  return (
    <Pressable accessibilityRole="button" testID="e2e-zdjecie-testowe" onPress={() => naPlik(zdjecieTestowe(katalogTymczasowy))}>
      <Text>Test photo (EXIF GPS)</Text>
    </Pressable>
  );
}

/** Tryb awaryjny: SHA pary `.db` + `-wal` i rozmiar `-wal` (ADR-0019, P-203); null, dopóki liczenie trwa. */
export function PanelAwaryjny({ sha }: { sha: { sha: string; walBajty: number } | null }): React.ReactElement | null {
  if (!sha) return null;
  return <><Text testID="e2e-sha-bazy" selectable>{sha.sha}</Text><Text testID="e2e-wal-bajty" selectable>{String(sha.walBajty)}</Text></>;
}

/** Wymuszona awaria startu (ADR-0019): znacznik po zapisie „start w toku” (scenariusz 09 czeka na niego, zanim zabije proces). */
export function ZnacznikAwarii({ kolor }: { kolor: string }): React.ReactElement {
  return <View testID="e2e-awaria-startu" style={{ flex: 1, backgroundColor: kolor }} />;
}
