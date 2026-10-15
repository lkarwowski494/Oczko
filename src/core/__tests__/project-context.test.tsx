import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { Text, Button, View } from 'react-native';
import {
  ProjectProvider,
  useProject,
  useOptionalProject,
} from '../project-context';
import { createInMemoryDatabase } from '../database';

// Komponent testowy konsumujący kontekst
function TestConsumer({
  onState,
}: {
  onState?: (ctx: ReturnType<typeof useProject>) => void;
}) {
  const ctx = useProject();

  React.useEffect(() => {
    onState?.(ctx);
  }, [ctx, onState]);

  return (
    <View>
      <Text testID="loading">{ctx.isLoading ? 'LOADING' : 'READY'}</Text>
      <Text testID="error">{ctx.error ?? 'NO_ERROR'}</Text>
      <Text testID="projectName">{ctx.activeProject?.name ?? 'NO_PROJECT'}</Text>
      <Text testID="partName">{ctx.activePartName ?? 'NO_PART'}</Text>
      <Text testID="counterVal">
        {ctx.activeCounterState ? String(ctx.activeCounterState.rawValue) : 'NO_COUNTER'}
      </Text>
      <Text testID="linkedCount">{String(ctx.activeLinkedCounterStates.length)}</Text>
      <Button
        title="Step Increment"
        onPress={() => ctx.stepCounter('increment')}
      />
      <Button
        title="Undo"
        onPress={() => ctx.undoCounter()}
      />
    </View>
  );
}

function OptionalConsumer({
  onCtx,
}: {
  onCtx: (ctx: ReturnType<typeof useOptionalProject>) => void;
}) {
  const ctx = useOptionalProject();
  React.useEffect(() => {
    onCtx(ctx);
  }, [ctx, onCtx]);
  return <Text>{ctx ? 'HAS_CTX' : 'NULL_CTX'}</Text>;
}

class TestErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  state = { error: null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return <Text>{(this.state.error as Error).message}</Text>;
    }
    return this.props.children;
  }
}

describe('ProjectContext & ProjectProvider (BR-PROJ-001...005, BR-LICZ-003, BR-LICZ-005)', () => {
  it('rzuca błąd jeśli useProject jest wywołany poza ProjectProvider', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});

    function InvalidComponent() {
      useProject();
      return null;
    }

    let tree: any;
    act(() => {
      tree = renderer.create(
        <TestErrorBoundary>
          <InvalidComponent />
        </TestErrorBoundary>
      );
    });

    expect(tree).toBeDefined();
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('useProject musi być użyte wewnątrz ProjectProvider');
    spy.mockRestore();
  });

  it('useOptionalProject zwraca null poza ProjectProvider', () => {
    let captured: any = 'initial';
    act(() => {
      renderer.create(
        <OptionalConsumer onCtx={(ctx) => { captured = ctx; }} />
      );
    });
    expect(captured).toBeNull();
  });

  it('inicjalizuje ProjectProvider z in-memory database i domyślnym projektem ze seeda', async () => {
    const db = createInMemoryDatabase();
    let currentCtx: any = null;

    let tree: any;
    await act(async () => {
      tree = renderer.create(
        <ProjectProvider initialDb={db}>
          <TestConsumer onState={(ctx) => { currentCtx = ctx; }} />
        </ProjectProvider>
      );
    });

    expect(tree).toBeDefined();
    expect(currentCtx).toBeDefined();
    expect(currentCtx.isLoading).toBe(false);
    expect(currentCtx.error).toBeNull();
    expect(currentCtx.projects.length).toBeGreaterThan(0);
    expect(currentCtx.activeProject).toBeDefined();
    expect(currentCtx.activeCounterState).toBeDefined();
    expect(currentCtx.activeCounterState.rawValue).toBe(0);
  });

  it('obsługuje tworzenie nowego projektu, przełączanie części i liczników', async () => {
    const db = createInMemoryDatabase();
    let currentCtx: any = null;

    await act(async () => {
      renderer.create(
        <ProjectProvider initialDb={db}>
          <TestConsumer onState={(ctx) => { currentCtx = ctx; }} />
        </ProjectProvider>
      );
    });

    // Tworzenie nowego projektu
    let newProjId = '';
    await act(async () => {
      newProjId = await currentCtx.createProject({
        name: 'Kardigan Zimowy',
        craftType: 'knitting',
        parts: [
          { name: 'Tył', targetRows: 120 },
        ],
      });
    });

    expect(newProjId).toBeTruthy();
    expect(currentCtx.activeProject.name).toBe('Kardigan Zimowy');
    expect(currentCtx.activePartName).toBe('Tył');
    expect(currentCtx.activeProject.parts[0].targetRows).toBe(120);
    expect(currentCtx.activeCounterState.rawValue).toBe(0);

    // Dodanie nowej części
    await act(async () => {
      await currentCtx.addPart(newProjId, {
        name: 'Rękaw Lewy',
        targetRows: 80,
      });
    });

    expect(currentCtx.activeProject.parts.length).toBe(2);
    expect(currentCtx.activeProject.parts.some((p: any) => p.name === 'Rękaw Lewy')).toBe(true);

    // Przełączenie aktywnej części
    const sleevePart = currentCtx.activeProject.parts.find((p: any) => p.name === 'Rękaw Lewy');
    await act(async () => {
      await currentCtx.switchActivePart(sleevePart.id);
    });

    expect(currentCtx.activePartName).toBe('Rękaw Lewy');

    // Dodanie licznika powiązanego (np. warkocz)
    const sleevePrimaryCounterId = currentCtx.activeCounterId;
    await act(async () => {
      await currentCtx.addLinkedCounter(sleevePart.id, sleevePrimaryCounterId, {
        name: 'Warkocz 8r',
        moduloCycle: 8,
        reminderInterval: 8,
      });
    });

    expect(currentCtx.activeLinkedCounterStates.length).toBe(1);
    expect(currentCtx.activeLinkedCounterStates[0].name).toBe('Warkocz 8r');
    expect(currentCtx.activeLinkedCounterStates[0].moduloCycle).toBe(8);

    // Wykonanie kroku inkrementacji (+1)
    await act(async () => {
      await currentCtx.stepCounter('increment');
    });

    expect(currentCtx.activeCounterState.rawValue).toBe(1);
    expect(currentCtx.activeLinkedCounterStates[0].rawValue).toBe(1);

    // Wykonanie cofnięcia (UNDO)
    await act(async () => {
      await currentCtx.undoCounter();
    });

    expect(currentCtx.activeCounterState.rawValue).toBe(0);
    expect(currentCtx.activeLinkedCounterStates[0].rawValue).toBe(0);
  });

  it('automatycznie inicjalizuje in-memory database gdy initialDb nie jest podane (fallback)', async () => {
    let currentCtx: any = null;

    await act(async () => {
      renderer.create(
        <ProjectProvider>
          <TestConsumer onState={(ctx) => { currentCtx = ctx; }} />
        </ProjectProvider>
      );
    });

    expect(currentCtx).toBeDefined();
    expect(currentCtx.db).toBeDefined();
    expect(currentCtx.projects.length).toBeGreaterThan(0);
  });

  it('obsługuje błędy bazy w refreshProjects, selectActiveCounter, stepCounter i undoCounter', async () => {
    const errorDb = createInMemoryDatabase();
    let currentCtx: any = null;

    await act(async () => {
      renderer.create(
        <ProjectProvider initialDb={errorDb}>
          <TestConsumer onState={(ctx) => { currentCtx = ctx; }} />
        </ProjectProvider>
      );
    });

    // Sprawdzamy błąd w selectActiveCounter
    jest.spyOn(errorDb, 'getAllAsync').mockRejectedValueOnce(new Error('SQLite error'));
    await act(async () => {
      await currentCtx.selectActiveCounter('p_broken', 'c_broken');
    });
    expect(currentCtx.error).toBe('SQLite error');

    // Sprawdzamy błąd w stepCounter
    jest.spyOn(errorDb, 'withTransactionAsync').mockRejectedValueOnce(new Error('Step error'));
    await act(async () => {
      await currentCtx.stepCounter('increment');
    });
    expect(currentCtx.error).toBe('Step error');

    // Sprawdzamy błąd w undoCounter
    jest.spyOn(errorDb, 'withTransactionAsync').mockRejectedValueOnce(new Error('Undo error'));
    await act(async () => {
      await currentCtx.undoCounter();
    });
    expect(currentCtx.error).toBe('Undo error');

    // Sprawdzamy błąd w refreshProjects
    jest.spyOn(errorDb, 'getAllAsync').mockRejectedValueOnce(new Error('Refresh error'));
    await act(async () => {
      await currentCtx.refreshProjects();
    });
    expect(currentCtx.error).toBe('Refresh error');
  });

  it('obsługuje błąd krytyczny w initDb', async () => {
    const dbModule = require('../database');
    const spy = jest.spyOn(dbModule, 'createInMemoryDatabase').mockImplementationOnce(() => {
      throw new Error('Crash in createInMemoryDatabase');
    });

    let currentCtx: any = null;
    await act(async () => {
      renderer.create(
        <ProjectProvider>
          <TestConsumer onState={(ctx) => { currentCtx = ctx; }} />
        </ProjectProvider>
      );
    });

    expect(currentCtx.error).toBe('Crash in createInMemoryDatabase');
    expect(currentCtx.isLoading).toBe(false);
    spy.mockRestore();
  });

  it('poprawnie czyści flagę montowania przy unmount', () => {
    let tree: any;
    act(() => {
      tree = renderer.create(
        <ProjectProvider>
          <TestConsumer />
        </ProjectProvider>
      );
    });
    act(() => {
      tree.unmount();
    });
  });
});
