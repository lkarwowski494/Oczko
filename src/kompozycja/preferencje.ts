// Preferencje urządzenia z Ustawień (BR-LIC-020/S3 wibracje). W pamięci procesu: klucze tabeli `ustawienie` dla preferencji czekają na
// wiersze w dane.md (zgłoszenie 08 partia 4 do 05) — do tego czasu po restarcie wartość domyślna (wibracje włączone).
export type Preferencje = { wibracje: boolean };
export function preferencje(): { stan(): Preferencje; ustaw(p: Partial<Preferencje>): void } {
  let p: Preferencje = { wibracje: true };
  return { stan: () => p, ustaw: (z) => { p = { ...p, ...z }; } };
}
