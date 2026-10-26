// Stan danych: synchronizacja iCloud i zegarek (F-58, BR-DAN-011). Ekran nienarysowany (Z07-05), teksty robocze 08.
// Sygnatura: propozycja 07 (E3), granice 05 (Z07-22). Zawsze mówi, że dane są zapisane na telefonie (bez straszenia utratą, design-spec „Głos”).
import React from 'react';
import { Arkusz, Tresc } from './Arkusz';
import type { StanSynchronizacji } from '../domena/porty';
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
export function StanDanych({ stan: s, t }: PropsStanuDanych): React.ReactElement {
  return (
    <Arkusz tytul={t('stan_danych.tytul')} przyciski={null}>
      <Tresc>{t(s.synchronizacja === 'wylaczona' ? 'stan_danych.wylaczona' : 'stan_danych.aktywna')}</Tresc>
      {s.ostatniaUdana && <Tresc podpis>{t('stan_danych.ostatnia', { data: s.ostatniaUdana })}</Tresc>}
      {s.czekaNaSiec && <Tresc>{t('stan_danych.czeka')}</Tresc>}
      <Tresc>{t('stan_danych.zapisane')}</Tresc>
      {s.zegarek && s.zegarek.oczekujace > 0 && (
        <Tresc>{`${t('stan_danych.zegarek', { count: s.zegarek.oczekujace })} ${t('stan_danych.zegarek_co')}`}</Tresc>
      )}
    </Arkusz>
  );
}
