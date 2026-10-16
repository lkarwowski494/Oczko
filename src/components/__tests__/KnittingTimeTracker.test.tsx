import React from 'react';
import renderer, { act } from 'react-test-renderer';
import KnittingTimeTracker from '../KnittingTimeTracker';
import { createInMemoryDatabase } from '../../core/database';
import { insertProject, saveTimeSession } from '../../core/project-repository';

function extractAllStrings(node: any): string {
  if (!node) return '';
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map(extractAllStrings).join(' ');
  }
  const childrenText = node.children ? node.children.map(extractAllStrings).join(' ') : '';
  const propsText = node.props?.children ? extractAllStrings(node.props.children) : '';
  const valueText = node.props?.value ? String(node.props.value) : '';
  return `${childrenText} ${propsText} ${valueText}`;
}

describe('KnittingTimeTracker Component (BR-CZAS-001..004)', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders initial state without database and advances timer every second', () => {
    let tree: any;
    act(() => {
      tree = renderer.create(
        <KnittingTimeTracker
          projectId="proj-1"
          currentRows={10}
          targetRows={50}
          initialTrackingActive={true}
        />
      );
    });

    expect(tree).toBeDefined();
    let text = extractAllStrings(tree.toJSON());
    expect(text).toContain('Sesja dziergania');
    expect(text).toContain('0s');

    // Przesunięcie czasu o 10 sekund
    act(() => {
      jest.advanceTimersByTime(10000);
    });

    text = extractAllStrings(tree.toJSON());
    expect(text).toContain('10s');
  });

  it('loads total project duration from database when db is provided', async () => {
    const db = createInMemoryDatabase();
    await insertProject(db, {
      id: 'proj-time-db',
      name: 'Projekt Baza',
      craftType: 'knitting',
      status: 'active',
      createdAt: '2026-10-16T08:00:00Z',
      updatedAt: '2026-10-16T08:00:00Z',
    });

    await saveTimeSession(db, {
      id: 'sess-old-1',
      projectId: 'proj-time-db',
      startedAt: '2026-10-16T07:00:00Z',
      endedAt: '2026-10-16T07:30:00Z',
      durationSeconds: 3600, // 1h
      activeRowsCount: 40,
      createdAt: '2026-10-16T07:30:00Z',
    });

    let tree: any;
    await act(async () => {
      tree = renderer.create(
        <KnittingTimeTracker
          projectId="proj-time-db"
          currentRows={10}
          targetRows={100}
          db={db}
        />
      );
    });

    // Otwarcie szczegółów
    const root = tree.root;
    const toggleButton = root.find((n: any) =>
      n.props?.accessibilityLabel === 'Pokaż szczegóły czasu robótki'
    );

    await act(async () => {
      toggleButton.props.onPress();
    });

    const text = extractAllStrings(tree.toJSON());
    expect(text).toContain('Łączny czas projektu:');
    expect(text).toContain('1h 0m');
  });

  it('handles pause, saving session to db, and restart', async () => {
    const db = createInMemoryDatabase();
    await insertProject(db, {
      id: 'proj-toggle',
      name: 'Projekt Toggle',
      craftType: 'knitting',
      status: 'active',
      createdAt: '2026-10-16T08:00:00Z',
      updatedAt: '2026-10-16T08:00:00Z',
    });

    let tree: any;
    await act(async () => {
      tree = renderer.create(
        <KnittingTimeTracker
          projectId="proj-toggle"
          currentRows={10}
          targetRows={100}
          db={db}
          initialTrackingActive={true}
        />
      );
    });

    // Upływ 15 sekund
    act(() => {
      jest.advanceTimersByTime(15000);
    });

    // Zwiększenie liczby rzędów o 2
    act(() => {
      tree.update(
        <KnittingTimeTracker
          projectId="proj-toggle"
          currentRows={12}
          targetRows={100}
          db={db}
          initialTrackingActive={true}
        />
      );
    });

    const root = tree.root;
    const pauseButton = root.find((n: any) =>
      n.props?.accessibilityLabel === 'Wstrzymaj stoper sesji'
    );

    // Kliknięcie Pauza (zapisuje sesję do SQLite)
    await act(async () => {
      await pauseButton.props.onPress();
    });

    let text = extractAllStrings(tree.toJSON());
    expect(text).toContain('Stoper zatrzymany');

    // Kliknięcie Wznów
    const resumeButton = root.find((n: any) =>
      n.props?.accessibilityLabel === 'Rozpocznij stoper sesji'
    );

    await act(async () => {
      await resumeButton.props.onPress();
    });

    text = extractAllStrings(tree.toJSON());
    expect(text).toContain('Sesja dziergania');
  });

  it('auto-pauses after 5 minutes of inactivity and resumes when rows increase', () => {
    let tree: any;
    act(() => {
      tree = renderer.create(
        <KnittingTimeTracker
          projectId="proj-inactivity"
          currentRows={20}
          targetRows={100}
          initialTrackingActive={true}
        />
      );
    });

    // Przesuwamy czas o ponad 5 minut (301 sekund)
    act(() => {
      jest.advanceTimersByTime(301 * 1000);
    });

    let text = extractAllStrings(tree.toJSON());
    expect(text).toContain('Wstrzymano (brak ruchu)');

    // Dodanie rzędu wznawia sesję
    act(() => {
      tree.update(
        <KnittingTimeTracker
          projectId="proj-inactivity"
          currentRows={21}
          targetRows={100}
          initialTrackingActive={true}
        />
      );
    });

    text = extractAllStrings(tree.toJSON());
    expect(text).toContain('Sesja dziergania');
  });

  it('toggles details card back and forth and displays average seconds per row', async () => {
    let tree: any;
    act(() => {
      tree = renderer.create(
        <KnittingTimeTracker
          projectId="proj-details"
          currentRows={5}
          targetRows={20}
          initialTrackingActive={false}
        />
      );
    });

    const root = tree.root;
    const toggleButton = root.find((n: any) =>
      n.props?.accessibilityLabel === 'Pokaż szczegóły czasu robótki'
    );

    // Otwarcie
    act(() => {
      toggleButton.props.onPress();
    });

    let text = extractAllStrings(tree.toJSON());
    expect(text).toContain('Ukryj szczegóły ▲');
    expect(text).toContain('Średni czas na rząd:');

    // Zamknięcie
    act(() => {
      toggleButton.props.onPress();
    });

    text = extractAllStrings(tree.toJSON());
    expect(text).toContain('Łączny czas robótki ▼');
  });
});
