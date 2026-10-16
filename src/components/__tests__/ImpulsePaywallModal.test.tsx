import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { ImpulsePaywallModal } from '../ImpulsePaywallModal';
import { AppAccessProvider } from '../../core/app-access-context';
import { createInMemoryDatabase } from '../../core/database';
import { activatePlan, resetTrialForTesting } from '../../core/app-access-service';

describe('ImpulsePaywallModal — Monetyzacja Impulsowa Cheaper than Espresso', () => {
  let createdInstances: renderer.ReactTestRenderer[] = [];

  const createTree = async (element: React.ReactElement) => {
    let tree!: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(element);
      await Promise.resolve();
    });
    createdInstances.push(tree);
    return tree;
  };

  afterEach(() => {
    while (createdInstances.length > 0) {
      const instance = createdInstances.pop();
      try {
        act(() => {
          instance?.unmount();
        });
      } catch {
        // Ignoruj błędy podwójnego unmount
      }
    }
  });

  test('renderuje nagłówek, korzyści i 3 pakiety cenowe ($4.99 / $0.99 / $14.99)', async () => {
    const db = createInMemoryDatabase();
    const tree = await createTree(
      <AppAccessProvider db={db} currentProjectsCount={0}>
        <ImpulsePaywallModal visible={true} />
      </AppAccessProvider>
    );

    const str = JSON.stringify(tree.toJSON());
    expect(str).toContain('APPS4BREW STUDIO PASS');
    expect(str).toContain('22,99 zł / rok');
    expect(str).toContain('4,49 zł / miesiąc');
    expect(str).toContain('69,99 zł jednorazowo');
    expect(str).toContain('NAJPOPULARNIEJSZY');
    expect(str).toContain('Gwarancja 4.9★');
  });

  test('pozwala wybrać inny pakiet (np. miesięczny) i zaktualizować etykietę CTA', async () => {
    const db = createInMemoryDatabase();
    const tree = await createTree(
      <AppAccessProvider db={db} currentProjectsCount={0}>
        <ImpulsePaywallModal visible={true} />
      </AppAccessProvider>
    );

    const monthlyButton = tree.root.findByProps({ accessibilityLabel: '4,49 zł / miesiąc' });
    act(() => {
      monthlyButton.props.onPress();
    });

    const str = JSON.stringify(tree.toJSON());
    expect(str).toContain('Odblokuj pełny dostęp (4,49 zł / miesiąc)');
  });

  test('kliknięcie CTA wywołuje purchasePlan i onSuccess callback', async () => {
    const db = createInMemoryDatabase();
    const onSuccess = jest.fn();
    const onClose = jest.fn();

    const tree = await createTree(
      <AppAccessProvider db={db} currentProjectsCount={3}>
        <ImpulsePaywallModal visible={true} onSuccess={onSuccess} onClose={onClose} />
      </AppAccessProvider>
    );

    // Szukamy głównego przycisku CTA
    const primaryCta = tree.root.findByProps({
      accessibilityLabel: 'Odblokuj z planem: 22,99 zł / rok',
    });

    await act(async () => {
      await primaryCta.props.onPress();
    });

    expect(onSuccess).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  test('kliknięcie Przywróć zakupy wywołuje restorePurchases i zamyka modal', async () => {
    const db = createInMemoryDatabase();
    const onClose = jest.fn();

    const tree = await createTree(
      <AppAccessProvider db={db} currentProjectsCount={1}>
        <ImpulsePaywallModal visible={true} onClose={onClose} />
      </AppAccessProvider>
    );

    const restoreBtn = tree.root.findByProps({
      accessibilityLabel: 'Przywróć poprzednie zakupy',
    });

    await act(async () => {
      await restoreBtn.props.onPress();
    });

    expect(onClose).toHaveBeenCalled();
  });

  test('wyświetla komunikat o wygaśnięciu trialu gdy podano powód w ocenie uprawnień', async () => {
    const db = createInMemoryDatabase();
    // Symulacja upływu 10 dni
    await resetTrialForTesting(db, new Date('2026-09-01T10:00:00.000Z'));

    const tree = await createTree(
      <AppAccessProvider db={db} currentProjectsCount={3}>
        <ImpulsePaywallModal visible={true} />
      </AppAccessProvider>
    );

    const str = JSON.stringify(tree.toJSON());
    expect(str).toContain('Upłynął 7-dniowy okres próbny');
  });

  test('przycisk zamykania ma obszar 44x44 pt i wywołuje onClose', async () => {
    const db = createInMemoryDatabase();
    const onClose = jest.fn();

    const tree = await createTree(
      <AppAccessProvider db={db} currentProjectsCount={0}>
        <ImpulsePaywallModal visible={true} onClose={onClose} />
      </AppAccessProvider>
    );

    const closeBtn = tree.root.findByProps({ accessibilityLabel: 'Zamknij' });
    expect(closeBtn.props.style.width).toBe(44);
    expect(closeBtn.props.style.height).toBe(44);

    act(() => {
      closeBtn.props.onPress();
    });
    expect(onClose).toHaveBeenCalled();
  });
});
