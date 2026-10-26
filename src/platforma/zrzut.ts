// Zrzut widoku do PNG (P-219 2A, F-53): react-native-view-shot 5.1.0 `captureRef` → plik tymczasowy. Rozmiar w punktach z `rozmiarZrzutu`
// (plik 1080 × 1350 px przy każdej skali ekranu).
import type { RefObject } from 'react';
import { PixelRatio, type View } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import { rozmiarZrzutu } from '../ekrany/ObrazKarty';

export async function zrzutKarty(ref: RefObject<View | null>): Promise<string> {
  const uri = await captureRef(ref, { format: 'png', result: 'tmpfile', ...rozmiarZrzutu(PixelRatio.get()) });
  return decodeURIComponent(uri.replace(/^file:\/\//, ''));
}
