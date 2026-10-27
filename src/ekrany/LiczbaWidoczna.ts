// Kluczowa liczba licznika widoczna przy dużym tekście (NFR-DOS-002, P-266 (1), scen. 30 AX5): nazwy projektu i części mogą zająć cały
// przewijany środek ekranu (+1 rośnie z tekstem), a kolejność treści z design-spec zostaje. Po zmianie wartości i przy pierwszym układzie
// środek przewija się do liczby, gdy nie jest cała w widoku; przy zwykłym tekście liczba jest widoczna i nic się nie dzieje.
// Osobny plik: Licznik.tsx przy limicie 20 KB (U8).
import { useEffect, useRef } from 'react';
import type { LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent, ScrollView } from 'react-native';

/** Przesunięcie, przy którym góra liczby jest u góry widoku; null, gdy liczba cała widoczna albo widok bez układu. */
export function przewiniecieDoLiczby(w: { przesuniecie: number; wysokosc: number; y: number; h: number }): number | null {
  if (w.wysokosc <= 0) return null;
  return w.y >= w.przesuniecie && w.y + w.h <= w.przesuniecie + w.wysokosc ? null : w.y;
}

export function useLiczbaWidoczna(wartosc: number) {
  const ref = useRef<ScrollView>(null);
  const m = useRef({ przesuniecie: 0, wysokosc: 0, y: -1, h: 0 });
  const pokaz = () => {
    if (m.current.y < 0) return;
    const y = przewiniecieDoLiczby(m.current);
    if (y !== null) ref.current?.scrollTo({ y, animated: false });
  };
  useEffect(pokaz, [wartosc]); // eslint-disable-line react-hooks/exhaustive-deps -- tylko przy zmianie wartości
  return {
    ref,
    naUklad: (e: LayoutChangeEvent) => { m.current.wysokosc = e.nativeEvent.layout.height; },
    naPrzewiniecie: (e: NativeSyntheticEvent<NativeScrollEvent>) => { m.current.przesuniecie = e.nativeEvent.contentOffset.y; },
    naUkladLiczby: (e: LayoutChangeEvent) => {
      const pierwszy = m.current.y < 0;
      m.current.y = e.nativeEvent.layout.y; m.current.h = e.nativeEvent.layout.height;
      if (pierwszy) pokaz();
    },
  };
}
