// Adapter portu Orientacja (P-221 Q3a, ADR-0026; moduly.md „iPad i orientacja”) na expo-screen-orientation 57.0.3 (ADR-0016): na iPhonie pion
// poza ekranem wzoru (`tylkoPion`), dowolna na wzorze (`dowolna`, F-25); na iPadzie oba no-op — multitasking nie dopuszcza blokady (P-218 Q3a).
import { Platform } from 'react-native';
import * as ScreenOrientation from 'expo-screen-orientation';
import type { Orientacja } from '../domena/porty';

export type ModulOrientacji = { lockAsync(o: number): Promise<void>; unlockAsync(): Promise<void>; OrientationLock: { PORTRAIT_UP: number } };
const nic = (): void => undefined;

export function orientacja(m: ModulOrientacji = ScreenOrientation, ipad: boolean = Platform.OS === 'ios' && Platform.isPad): Orientacja {
  if (ipad) return { tylkoPion: nic, dowolna: nic };
  return {
    tylkoPion: () => { void m.lockAsync(m.OrientationLock.PORTRAIT_UP).catch(nic); },
    dowolna: () => { void m.unlockAsync().catch(nic); },
  };
}
