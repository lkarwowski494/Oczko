// Stan danych: synchronizacja iCloud i zegarek (F-58, BR-DAN-011). Ekran nienarysowany (Z07-05), teksty robocze 08.
// Sygnatura: propozycja 07 (E3, P-202), granice 05 (Z07-22). Liczbę zmian czekających pokazuje tylko zegarek (P-193). Zawsze mówi, że dane są zapisane na telefonie (bez straszenia utratą, design-spec „Głos”).
import React from 'react';
import { Arkusz, Przycisk, Tresc } from './Arkusz';
import type { StanSynchronizacji } from '../domena/porty';
import type { Tlumacz } from './wspolne';

export type PropsStanuDanych = {
  stan: {
    synchronizacja: StanSynchronizacji;
    ostatniaUdana: string | null;     // sformatowana data i godzina
    czekaNaSiec: boolean;
    zegarek: { ostatniKontakt: string } | null;   // sformatowany czas ostatniej partii z zegarka; null = nigdy (BR-DAN-011/S3, P-193)
  };
  t: Tlumacz;
  naZamknij?(): void;
};
export function StanDanych({ stan: s, t, naZamknij }: PropsStanuDanych): React.ReactElement {
  return (
    <Arkusz tytul={t('stan_danych.tytul')} przyciski={naZamknij ? <Przycisk tekst={t('wspolne.zamknij')} onPress={naZamknij} rodzaj="tekstowy" testID="arkusz-zamknij" /> : null}>
      <Tresc>{t(s.synchronizacja === 'wylaczona' ? 'stan_danych.wylaczona' : 'stan_danych.aktywna')}</Tresc>
      {s.ostatniaUdana && <Tresc podpis>{t('stan_danych.ostatnia', { data: s.ostatniaUdana })}</Tresc>}
      {s.czekaNaSiec && <Tresc>{t('stan_danych.czeka')}</Tresc>}
      <Tresc>{t('stan_danych.zapisane')}</Tresc>
      {s.zegarek && <Tresc podpis>{t('stan_danych.zegarek_kontakt', { data: s.zegarek.ostatniKontakt })}</Tresc>}
    </Arkusz>
  );
}
