// Adresy zewnętrzne ekranów (KP-04, BR-ZAK-004, BR-DAN-012/S3). Polityka prywatności według analogii z Treningiem (P-087: Trening
// `https://apps4brew.com/trening/privacy.html`) — [DO USTALENIA rola 10/11: strona Oczka pod tym adresem]. Terms of Use = standardowa EULA Apple.
// Recenzja: strona App Store z action=write-review — [DO USTALENIA: identyfikator aplikacji w App Store Connect (OP-24)].
export const ADRESY = {
  polityka: 'https://apps4brew.com/oczko/privacy.html',
  warunki: 'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/',
  recenzja: 'https://apps.apple.com/app/id0000000000?action=write-review',
} as const;
/** Family Sharing (P-038): kierunek „włączamy”, włączenie w App Store Connect przy konfiguracji — do tego czasu zdanie o rodzinie się nie pokazuje (P-089 (2)). */
export const FAMILY_SHARING = false;
