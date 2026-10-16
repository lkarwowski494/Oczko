/**
 * Oczko Core — Strażnicy Wzorców Architektury i Bezpieczeństwa (Interaction & Architecture Guards)
 * Zgodne ze standardem repozytorium organizer (interaction-guards.test.ts).
 * Automatycznie weryfikuje reguły architektoniczne i bezpieczeństwa w kodzie źródłowym:
 * 1. Ochrona przed SQL Injection: brak interpolacji ciągów `${...}` w zapytaniach SQLite
 * 2. Czystość warstwy domenowej: brak bezpośrednich zależności do React Native w logice rdzenia
 * 3. Standardy modali: każdy modal posiada zdefiniowaną obsługę onRequestClose i przycisk rezygnacji
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const projectRoot = join(__dirname, '../../..');
const srcCoreDir = join(projectRoot, 'src', 'core');
const srcComponentsDir = join(projectRoot, 'src', 'components');
const srcScreensDir = join(projectRoot, 'src', 'screens');

function walk(dir: string, fileExt: string): string[] {
  let results: string[] = [];
  const entries = readdirSync(dir);
  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      if (entry !== 'node_modules' && entry !== '.git' && entry !== '__tests__') {
        results = results.concat(walk(fullPath, fileExt));
      }
    } else if (entry.endsWith(fileExt)) {
      results.push(fullPath);
    }
  }
  return results;
}

describe('Strażnicy Wzorców Architektury i Bezpieczeństwa (Architecture & Interaction Guards)', () => {
  describe('Ochrona przed SQL Injection (Parametryzacja zapytań)', () => {
    it('wszystkie zapytania INSERT, UPDATE, DELETE w repozytoriach używają sparametryzowanych symboli zastępczych (?)', () => {
      const coreFiles = walk(srcCoreDir, '.ts');
      const repoFiles = coreFiles.filter((f) => f.includes('repository') || f.includes('service') || f.includes('database'));

      for (const filePath of repoFiles) {
        const code = readFileSync(filePath, 'utf-8');
        const lines = code.split('\n');

        lines.forEach((line, lineIdx) => {
          // Szukaj zapytań SQL z niebezpieczną interpolacją stringów w klauzulach WHERE lub VALUES
          const hasUnsafeSqlInterpolation =
            /VALUES\s*\([^\)]*\$\{[^\}]+\}/i.test(line) ||
            /WHERE\s+[a-zA-Z0-9_]+\s*=\s*['"]?\$\{[^\}]+\}['"]?/i.test(line);

          if (hasUnsafeSqlInterpolation) {
            throw new Error(
              `Wykryto potencjalne zagrożenie SQL Injection w pliku ${filePath}:${lineIdx + 1}: ${line.trim()}`
            );
          }
        });
      }
    });
  });

  describe('Czystość Architektury Domenowej (Separation of Concerns)', () => {
    it('moduły czystej domeny (counter-engine, gauge-calculator, domain-rules, yarn-usage-estimator) nie importują react-native', () => {
      const pureDomainFiles = [
        join(srcCoreDir, 'counter-engine.ts'),
        join(srcCoreDir, 'gauge-calculator.ts'),
        join(srcCoreDir, 'domain-rules.ts'),
        join(srcCoreDir, 'yarn-usage-estimator.ts'),
        join(srcCoreDir, 'pattern-trainer.ts'),
        join(srcCoreDir, 'glossary-data.ts'),
        join(srcCoreDir, 'stitch-identifier.ts'),
        join(srcCoreDir, 'shaping-calculator.ts'),
        join(srcCoreDir, 'garmin-service.ts'),
        join(srcCoreDir, 'needle-gauge-converter.ts'),
        join(srcCoreDir, 'yarn-substitution-service.ts'),
        join(srcCoreDir, 'ease-calculator-service.ts'),
      ];

      for (const filePath of pureDomainFiles) {
        const code = readFileSync(filePath, 'utf-8');
        expect(code).not.toContain("from 'react-native'");
        expect(code).not.toContain('from "react-native"');
        expect(code).not.toContain("from 'react'");
      }
    });
  });

  describe('Standardy Modali i Odporność Interfejsu (Modal Safety)', () => {
    it('komponenty i ekrany z modalem definiują obsługę onRequestClose oraz przycisk rezygnacji', () => {
      const uiFiles = [
        ...walk(srcComponentsDir, '.tsx'),
        ...walk(srcScreensDir, '.tsx'),
      ];

      for (const filePath of uiFiles) {
        const code = readFileSync(filePath, 'utf-8');
        if (code.includes('<Modal')) {
          expect(code).toContain('onRequestClose=');
          // Modal musi mieć przynajmniej jedno wywołanie zamknięcia (onClose, Anuluj, setVisible(false))
          const hasDismissal =
            code.includes('Anuluj') ||
            code.includes('onClose') ||
            code.includes('setModalVisible(false)') ||
            code.includes('setIntervalModalVisible(false)') ||
            code.includes('setWatchModalVisible(false)') ||
            code.includes('setGarminModalVisible(false)') ||
            code.includes('setIsGarminModalVisible(false)') ||
            code.includes('setNeedleGaugeVisible(false)');
          expect(hasDismissal).toBe(true);
        }
      }
    });
  });
});
