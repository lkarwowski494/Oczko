// Maszyna synchronizacji iCloud (moduly.md, „Synchronizacja iCloud (F-27, F-58)”); stan w module natywnym, nie w bazie.
import type { StanSynchronizacji } from '../porty';
import { niezaimplementowane } from '../zaslepka';

export type ZdarzenieSynchronizacji = 'wlacz_konto_jest' | 'wlacz_brak_konta' | 'blad' | 'wylogowanie' | 'ustapienie' | 'wylacz';
export function przejdzSynchronizacje(_s: StanSynchronizacji, _z: ZdarzenieSynchronizacji): StanSynchronizacji {
  return niezaimplementowane('BR-DAN-002 przejdzSynchronizacje');
}
