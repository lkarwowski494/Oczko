// Układ miar urządzenia dla ekranów „Tools” (R-131, P-075 (4a)); wiersza „Units” w Ustawieniach jeszcze nie ma — preferencja 'auto'.
import { ukladMiar } from '../i18n/format';
import { miaraSystemowa } from '../platforma/lokalizacja';

export const imperialny = (): boolean => ukladMiar('auto', miaraSystemowa()) === 'imperial';
