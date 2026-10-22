// Zasoby w pakiecie (statyczne importy dla Metro). Kolejne języki dochodzą z falami tłumaczeń (E3),
// razem z wpisem w app.json (supportedLocales, locales) i w docs/lokalizacja/jezyki.md.
import en from './en.json';
import type { Zasoby } from '../i18n';

export const ZASOBY: Zasoby = {
  en: { translation: en },
};
