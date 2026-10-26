// Adaptery cyklu życia, ogłoszeń VoiceOver i systemu dla ekranów (src/ekrany/wspolne.ts). Arkusz udostępniania i prośba o ocenę przez
// src/platforma/system-plikow-uzytkownika.ts (pakiety po kontroli wieku P-036, wiersze ADR-0016); zarządzanie subskrypcją: strona Apple.
import { AccessibilityInfo, AppState, Linking } from 'react-native';
import type { CyklAplikacji, Oglos, StanCyklu, System } from '../ekrany/wspolne';
import type { PortOceny } from '../przypadki-uzycia/ocena';
import { portOcenySklepu, udostepnijPlik } from '../platforma/system-plikow-uzytkownika';
import { polacz, zapiszTekst } from '../dane/pliki/system';

export const cyklAplikacji: CyklAplikacji = {
  naZmiane(fn) {
    const s = AppState.addEventListener('change', (stan) => { if (stan === 'active' || stan === 'background' || stan === 'inactive') fn(stan as StanCyklu); });
    return () => s.remove();
  },
};
export const oglos: Oglos = (tekst) => AccessibilityInfo.announceForAccessibility(tekst);
const nic = () => undefined;
export const systemAplikacji: System = {
  otworzAdres: (url) => { void Linking.openURL(url).catch(nic); },
  prosbaOOcene: nic,
  // KP-14: systemowe zarządzanie subskrypcjami (adres Apple zamiast arkusza showManageSubscriptions — odstępstwo nazwane, arkusz z expo-iap po 05).
  zarzadzajSubskrypcja: () => { void Linking.openURL('https://apps.apple.com/account/subscriptions').catch(nic); },
  // Zgłoszenie (F-57, R-163): treść zapisana do pliku tekstowego w katalogu tymczasowym systemu, potem arkusz udostępniania.
  udostepnij: (plik) => {
    const sciezka = polacz(katalogTymczasowy, `${plik.nazwa}.txt`);
    zapiszTekst(sciezka, plik.tresc);
    void udostepnijPlik(sciezka, 'text/plain');
  },
};
let katalogTymczasowy = '/tmp';
/** Kontener podaje katalog tymczasowy aplikacji przy starcie. */
export function ustawKatalogTymczasowy(k: string): void { katalogTymczasowy = k; }
/** Prośba o ocenę (moduly.md „Prośba o ocenę”): StoreReview przez adapter platformy; decyzję podejmuje bramka w przypadku użycia. */
export const portOceny: PortOceny = portOcenySklepu;
