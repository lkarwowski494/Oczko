// Kontekst aplikacji dla tras expo-router (app/): kontener zależności i kompozycja licznika tworzone raz na proces.
import React, { createContext, useContext } from 'react';
import type { Kontener } from './kontener';
import type { KompozycjaLicznika } from './licznik';

export type Aplikacja = { kontener: Kontener; licznik: KompozycjaLicznika };
const K = createContext<Aplikacja | null>(null);

export function DostawcaAplikacji({ wartosc, children }: { wartosc: Aplikacja; children: React.ReactNode }): React.ReactElement {
  return <K.Provider value={wartosc}>{children}</K.Provider>;
}
export function useAplikacja(): Aplikacja {
  const a = useContext(K);
  if (!a) throw new Error('useAplikacja poza DostawcaAplikacji');
  return a;
}
