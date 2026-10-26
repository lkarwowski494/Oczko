// Most do modułu Swift OczkoDziennikPlus (ADR-0007, ADR-0008, P-130); jedyne miejsce `requireNativeModule` dla tego modułu.
// Adaptery portów: src/platforma/dziennik-plus.ts, src/platforma/live-activity.ts.
import { requireNativeModule } from 'expo-modules-core';

export interface OczkoDziennikPlusNatywny {
  odczytajTekst(): Promise<string>;
  skroc(doId: string): Promise<void>;
  liveStart(stanJson: string, urzadzenie: string): Promise<string>;
  liveAktualizuj(stanJson: string): Promise<void>;
  liveZakoncz(): Promise<void>;
  liveDostepne(): boolean;
  sha256Pliku(sciezka: string): Promise<string>;
}

export const natywny = (): OczkoDziennikPlusNatywny => requireNativeModule<OczkoDziennikPlusNatywny>('OczkoDziennikPlus');
