// Bezpieczny obszar ekranu (pasek stanu, wycięcie, wskaźnik Home): pasek nawigacji ekranów rysuje design-spec, nie system, więc trasa
// pełnoekranowa odsuwa treść od krawędzi (E2E 40290477970: „‹ Projects” i „•••” pod paskiem stanu nie przyjmowały stuknięć).
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useKolory } from '../ekrany/motyw';

export function Bezpieczny({ children }: { children: React.ReactNode }): React.ReactElement {
  const k = useKolory();
  return <SafeAreaView edges={['top', 'bottom', 'left', 'right']} style={{ flex: 1, backgroundColor: k.papier }}>{children}</SafeAreaView>;
}
