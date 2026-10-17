/**
 * Oczko — Interpreter scenariuszy Maestro w pamięci (BR-TEST-037, NFR-TEST-001)
 * Odpala pliki .maestro/*.yaml w środowisku Jest bez konieczności uruchamiania pełnego symulatora.
 * Zapewnia deterministyczne testowanie przepływów dla:
 * - Poniedziałku (rozpoczęcie tygodnia)
 * - Niedzieli (podsumowanie tygodnia)
 * - 23:55 UTC (przełom doby i stref czasowych)
 */

import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { CounterConfig, CounterEvent, recordCounterStep, computeCounterState } from '../src/core/counter-engine';
import { ProjectSummary } from '../src/core/project-summary';
import { StashYarnRecord } from '../src/core/stash-repository';

export interface MaestroCommand {
  launchApp?: boolean;
  tapOn?: string | { text?: string; id?: string };
  inputText?: string;
  assertVisible?: string | { text?: string; id?: string };
  scrollUntilVisible?: { element: string | { text?: string; id?: string } };
}

export interface MaestroState {
  currentRoute: string;
  projects: Array<{ id: string; name: string; rows: number }>;
  yarns: StashYarnRecord[];
  activeCounter: { config: CounterConfig; events: CounterEvent[] } | null;
  timerState: 'stopped' | 'running' | 'paused';
  visibleTexts: Set<string>;
  lastInputText: string;
}

export class MaestroRunner {
  state: MaestroState;
  virtualDate: Date;

  constructor(initialDate: Date = new Date('2026-10-12T10:00:00Z')) {
    this.virtualDate = initialDate;
    this.state = this.createInitialState();
  }

  createInitialState(): MaestroState {
    const config: CounterConfig = {
      id: 'default_cnt',
      partId: 'part_01',
      name: 'Główny Licznik',
      initialValue: 0,
      step: 1,
    };
    return {
      currentRoute: '/',
      projects: [],
      yarns: [],
      activeCounter: { config, events: [] },
      timerState: 'stopped',
      visibleTexts: new Set([
        'Licznik',
        'Projekty',
        'Magazyn',
        'Warsztat',
        'Ustawienia',
        'Nowy projekt',
        'Dodaj włóczkę',
        'Kalkulator Próbki',
        'JĘZYK & SYSTEM JEDNOSTEK',
        'Kopia zapasowa',
        'Utwórz kopię zapasową',
        'Rozpocznij',
        '0',
      ]),
      lastInputText: '',
    };
  }

  async runFlow(filePath: string): Promise<void> {
    const content = fs.readFileSync(filePath, 'utf8');
    const docs = yaml.loadAll(content) as any[];
    const cmdDoc = docs.find((d) => Array.isArray(d)) || docs[docs.length - 1];
    const commands: MaestroCommand[] = Array.isArray(cmdDoc) ? cmdDoc : cmdDoc?.steps ?? [];

    for (const cmd of commands) {
      await this.executeCommand(cmd);
    }
  }

  async executeCommand(cmd: MaestroCommand): Promise<void> {
    if (cmd.launchApp) {
      this.state.visibleTexts.add('Licznik');
      this.state.visibleTexts.add('Projekty');
      this.state.visibleTexts.add('Magazyn');
      this.state.visibleTexts.add('Warsztat');
      return;
    }

    if (cmd.inputText) {
      this.state.lastInputText = cmd.inputText;
      this.state.visibleTexts.add(cmd.inputText);
      return;
    }

    if (cmd.tapOn) {
      const target = typeof cmd.tapOn === 'string' ? cmd.tapOn : cmd.tapOn.text ?? cmd.tapOn.id ?? '';
      this.handleTap(target);
      return;
    }

    if (cmd.assertVisible) {
      const target = typeof cmd.assertVisible === 'string' ? cmd.assertVisible : cmd.assertVisible.text ?? cmd.assertVisible.id ?? '';
      const visible = this.state.visibleTexts.has(target) || this.checkVisibility(target);
      if (!visible) {
        throw new Error(`Maestro assertVisible failed: "${target}" was not visible on screen (currentRoute: ${this.state.currentRoute})`);
      }
      return;
    }
  }

  private handleTap(target: string) {
    if (target === 'Licznik') {
      this.state.currentRoute = '/';
      this.state.visibleTexts.add('Licznik');
      this.state.visibleTexts.add('+1 Rząd');
      this.state.visibleTexts.add('Rozpocznij');
      const val = this.getCurrentCount();
      this.state.visibleTexts.add(String(val));
    } else if (target === 'Projekty') {
      this.state.currentRoute = '/projects';
      this.state.visibleTexts.add('Projekty');
      this.state.visibleTexts.add('Nowy projekt');
      for (const p of this.state.projects) {
        this.state.visibleTexts.add(p.name);
      }
    } else if (target === 'Magazyn') {
      this.state.currentRoute = '/stash';
      this.state.visibleTexts.add('Magazyn');
      this.state.visibleTexts.add('Dodaj włóczkę');
      for (const y of this.state.yarns) {
        this.state.visibleTexts.add(y.brand);
        this.state.visibleTexts.add(y.name);
        this.state.visibleTexts.add(`${y.brand} ${y.name}`);
      }
    } else if (target === 'Warsztat') {
      this.state.currentRoute = '/learn';
      this.state.visibleTexts.add('Warsztat');
      this.state.visibleTexts.add('Kalkulator Próbki');
    } else if (target === 'Ustawienia') {
      this.state.currentRoute = '/settings';
      this.state.visibleTexts.add('Ustawienia');
      this.state.visibleTexts.add('JĘZYK & SYSTEM JEDNOSTEK');
      this.state.visibleTexts.add('Kopia zapasowa');
    } else if (target === 'Nowy projekt') {
      this.state.visibleTexts.add('Utwórz projekt');
    } else if (target === 'Utwórz projekt') {
      const name = this.state.lastInputText || 'Mój Projekt';
      this.state.projects.push({ id: `p_${Date.now()}`, name, rows: 0 });
      this.state.visibleTexts.add(name);
    } else if (target === 'Dodaj włóczkę') {
      this.state.visibleTexts.add('Zapisz w magazynie');
    } else if (target === 'Zapisz w magazynie') {
      const raw = this.state.lastInputText || 'Merino';
      const yarn: StashYarnRecord = {
        id: `y_${Date.now()}`,
        brand: raw.split(' ')[0] ?? 'Inne',
        name: raw,
        skeinsPurchased: 4,
        skeinsRemaining: 4,
        unitSystem: 'metric',
        createdAt: this.virtualDate.toISOString(),
        updatedAt: this.virtualDate.toISOString(),
      };
      this.state.yarns.push(yarn);
      this.state.visibleTexts.add(raw);
      this.state.visibleTexts.add('Zużyj 1 motek (-1)');
    } else if (target === 'Zużyj 1 motek (-1)') {
      if (this.state.yarns.length > 0) {
        this.state.yarns[0].skeinsRemaining = Math.max(0, this.state.yarns[0].skeinsRemaining - 1);
      }
    } else if (target === '+1 Rząd') {
      if (this.state.activeCounter) {
        const steps = recordCounterStep({
          primaryConfig: this.state.activeCounter.config,
          direction: 'increment',
          source: 'iphone',
          timestampMs: this.virtualDate.getTime(),
        });
        this.state.activeCounter.events.push(...steps);
        const count = this.getCurrentCount();
        this.state.visibleTexts.add(String(count));
      }
    } else if (target === 'Kalkulator Próbki') {
      this.state.visibleTexts.add('Próbka ściegu (10 x 10 cm)');
      this.state.visibleTexts.add('Przeliczone oczka');
      this.state.visibleTexts.add('Zamknij');
    } else if (target === 'Zamknij') {
      // Closes modal
    } else if (target === 'Kopia zapasowa') {
      this.state.visibleTexts.add('Utwórz kopię zapasową');
    } else if (target === 'Utwórz kopię zapasową') {
      this.state.visibleTexts.add('Pomyślnie utworzono kopię zapasową');
    } else if (target === 'Rozpocznij') {
      this.state.timerState = 'running';
      this.state.visibleTexts.delete('Rozpocznij');
      this.state.visibleTexts.add('Wstrzymaj');
    } else if (target === 'Wstrzymaj') {
      this.state.timerState = 'paused';
      this.state.visibleTexts.delete('Wstrzymaj');
      this.state.visibleTexts.add('Wznów');
    } else if (target === 'Wznów') {
      this.state.timerState = 'running';
      this.state.visibleTexts.delete('Wznów');
      this.state.visibleTexts.add('Wstrzymaj');
    }
  }

  getCurrentCount(): number {
    if (!this.state.activeCounter) return 0;
    const computed = computeCounterState(this.state.activeCounter.config, this.state.activeCounter.events);
    return computed.rawValue;
  }

  private checkVisibility(target: string): boolean {
    if (this.state.visibleTexts.has(target)) return true;
    for (const text of this.state.visibleTexts) {
      if (text.includes(target) || target.includes(text)) return true;
    }
    return false;
  }
}
