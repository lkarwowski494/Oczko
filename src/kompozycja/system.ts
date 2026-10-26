// Adaptery cyklu życia, ogłoszeń VoiceOver i systemu dla ekranów (src/ekrany/wspolne.ts). Prośba o ocenę, zarządzanie subskrypcją
// i arkusz udostępniania dochodzą z ekranami kroku 3C (pakiety store-review i sharing po kontroli wieku P-036, wiersze ADR-0016).
import { AccessibilityInfo, AppState, Linking } from 'react-native';
import type { CyklAplikacji, Oglos, StanCyklu, System } from '../ekrany/wspolne';

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
