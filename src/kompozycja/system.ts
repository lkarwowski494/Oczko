// Adaptery cyklu życia, ogłoszeń VoiceOver i systemu dla ekranów (src/ekrany/wspolne.ts). Prośba o ocenę, zarządzanie subskrypcją
// i arkusz udostępniania dochodzą z ekranami kroku 3C (pakiety store-review i sharing po kontroli wieku P-036, wiersze ADR-0016).
import { AccessibilityInfo, AppState, Linking } from 'react-native';
import type { CyklAplikacji, Oglos, StanCyklu, System } from '../ekrany/wspolne';
import type { PortOceny } from '../przypadki-uzycia/ocena';

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
  zarzadzajSubskrypcja: nic,
  udostepnij: nic,
};
/** Prośba o ocenę (moduly.md „Prośba o ocenę”): do pakietu prośby o ocenę (krok 3C, wiek ≥ 14 dni, P-036, wiersz ADR-0016) niedostępna — bez prośby i bez zapisu. */
export const portOceny: PortOceny = { dostepna: async () => false, wersja: () => '', popros: async () => undefined };
