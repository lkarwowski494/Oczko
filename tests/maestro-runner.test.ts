/**
 * Oczko — Testy przepływów Maestro w Jest (BR-TEST-037, NFR-TEST-001)
 * Weryfikuje wszystkie scenariusze .maestro/*.yaml dla:
 * 1. Poniedziałku (start tygodnia)
 * 2. Niedzieli (podsumowanie tygodnia)
 * 3. 23:55 UTC (przełom doby i stref czasowych)
 * 4. Pary aktualizacji: 06-przygotuj -> 07-sprawdz
 */

import fs from 'fs';
import path from 'path';
import { MaestroRunner } from './maestro-runner';

describe('Interpreter Maestro w pamięci (BR-TEST-037, NFR-TEST-001)', () => {
  const maestroDir = path.join(__dirname, '..', '.maestro');
  const flowFiles = fs
    .readdirSync(maestroDir)
    .filter((f) => f.endsWith('.yaml') && !f.startsWith('07-'))
    .sort();

  const testDates = [
    { label: 'Poniedziałek (10:00 UTC)', date: new Date('2026-10-12T10:00:00Z') },
    { label: 'Niedziela (10:00 UTC)', date: new Date('2026-10-18T10:00:00Z') },
    { label: 'Przełom doby (23:55 UTC)', date: new Date('2026-10-18T23:55:00Z') },
  ];

  for (const { label, date } of testDates) {
    describe(`Warunki czasowe: ${label}`, () => {
      for (const flowFile of flowFiles) {
        test(`przepływ ${flowFile}`, async () => {
          const runner = new MaestroRunner(date);
          await runner.runFlow(path.join(maestroDir, flowFile));

          // Specjalna para: przygotowanie do aktualizacji i sprawdzenie ciągłości danych
          if (flowFile.startsWith('06-')) {
            const checkFile = path.join(maestroDir, '07-aktualizacja-sprawdz.yaml');
            await runner.runFlow(checkFile);
            expect(runner.getCurrentCount()).toBe(4);
          }
        });
      }
    });
  }

  test('para aktualizacji zachowuje ciągłość danych między sesjami', async () => {
    const runner = new MaestroRunner(new Date('2026-10-15T12:00:00Z'));
    await runner.runFlow(path.join(maestroDir, '06-aktualizacja-przygotuj.yaml'));
    expect(runner.getCurrentCount()).toBe(3);

    // Symulacja aktualizacji aplikacji bez kasowania bazy danych
    await runner.runFlow(path.join(maestroDir, '07-aktualizacja-sprawdz.yaml'));
    expect(runner.getCurrentCount()).toBe(4);
    expect(runner.state.projects.some((p) => p.name === 'Szalik Przed Aktualizacją')).toBe(true);
  });
});
