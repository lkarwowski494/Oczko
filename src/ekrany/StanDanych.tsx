// Stan danych: synchronizacja iCloud i zegarek (F-58, BR-DAN-011). Ekran nienarysowany (Z07-05).
// Zaślepka roli 07 (E3, P-090 Q2a): tylko sygnatura, zero logiki i wyglądu. Sygnatura = propozycja 07 do zatwierdzenia przez 04 (teksty, stany) i 05 (porty, granice).
import type React from 'react';
import type { StanSynchronizacji } from '../domena/porty';
import { niezaimplementowane } from '../domena/zaslepka';
import type { Tlumacz } from './wspolne';

export type PropsStanuDanych = {
  stan: {
    synchronizacja: StanSynchronizacji;
    ostatniaUdana: string | null;     // sformatowana data i godzina
    czekaNaSiec: boolean;
    zegarek: { oczekujace: number } | null;   // null = brak zegarka
  };
  t: Tlumacz;
};
export function StanDanych(_p: PropsStanuDanych): React.ReactElement {
  return niezaimplementowane('ekrany/StanDanych');
}
