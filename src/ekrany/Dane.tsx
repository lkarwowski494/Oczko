// Import archiwum i rozstrzygnięcie konfliktu (F-31–F-34, F-27; R-050, R-068). Ekrany nienarysowane (Z07-05), teksty robocze 08.
// Sygnatury: propozycja 07 (E3), granice 05 (Z07-22). Konflikt: wybór użytkownika, nigdy po cichu (M-04, M-05).
import React from 'react';
import { Arkusz, Przycisk, Tresc } from './Arkusz';
import type { Tlumacz } from './wspolne';

export type PropsImportu = {
  stan: { rodzaj: 'wybor'; plik: string; licznosci?: string } | { rodzaj: 'zastapiono'; kopia: { nazwa: string; miejsce: string } }; // kopia przed „Zastąp” (P-047, dane.md:69)
  t: Tlumacz;
  naZastap(): void;
  naScal(): void;
  naAnuluj(): void;
};
export function Import({ stan, t, naZastap, naScal, naAnuluj }: PropsImportu): React.ReactElement {
  if (stan.rodzaj === 'zastapiono') {
    return (
      <Arkusz tytul={t('dane.import_tytul')} testID="import-wynik" przyciski={<Przycisk tekst={t('wspolne.zamknij')} onPress={naAnuluj} rodzaj="tekstowy" testID="arkusz-zamknij" />}>
        <Tresc>{t('dane.zastapiono', { nazwa: stan.kopia.nazwa, miejsce: stan.kopia.miejsce })}</Tresc>
      </Arkusz>
    );
  }
  return (
    <Arkusz tytul={t('dane.import_tytul')} testID="import-gotowy" przyciski={
      <>
        <Przycisk tekst={t('dane.scal')} onPress={naScal} rodzaj="glowny" testID="import-scal" />
        <Przycisk tekst={t('dane.zastap')} onPress={naZastap} />
        <Przycisk tekst={t('wspolne.anuluj')} onPress={naAnuluj} rodzaj="tekstowy" testID="arkusz-zamknij" />
      </>
    }>
      <Tresc>{t('dane.import_plik', { plik: stan.plik })}</Tresc>
      {stan.licznosci && <Tresc podpis testID="import-licznosci">{stan.licznosci}</Tresc>}
    </Arkusz>
  );
}

export type KandydatKonfliktu = { id: string; wartosc: number; urzadzenie: string; godzina: string };
export type PropsKonfliktu = {
  stan: { licznik: string; kandydaci: KandydatKonfliktu[] };   // M-04, M-05: wybór użytkownika, nigdy po cichu
  t: Tlumacz;
  naWybierz(id: string): void;
};
export function Konflikt({ stan, t, naWybierz }: PropsKonfliktu): React.ReactElement {
  return (
    <Arkusz tytul={t('dane.konflikt_tytul', { licznik: stan.licznik })} przyciski={null}>
      {stan.kandydaci.map((k) => (
        <Przycisk key={k.id} tekst={t('dane.konflikt_wybor', { wartosc: k.wartosc, urzadzenie: k.urzadzenie, godzina: k.godzina })}
          etykieta={t('dane.konflikt_a11y', { wartosc: k.wartosc, urzadzenie: k.urzadzenie, godzina: k.godzina })} onPress={() => naWybierz(k.id)} />
      ))}
    </Arkusz>
  );
}
