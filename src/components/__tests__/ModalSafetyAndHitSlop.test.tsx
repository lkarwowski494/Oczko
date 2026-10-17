import React from 'react';
import renderer, { act } from 'react-test-renderer';
import AppleWatchCompanionModal from '../AppleWatchCompanionModal';
import { GarminCompanionModal } from '../GarminCompanionModal';
import { EaseCalculatorModal } from '../EaseCalculatorModal';
import { HatCalculatorModal } from '../HatCalculatorModal';
import { NeedleGaugeModal } from '../NeedleGaugeModal';
import { ShapingCalculatorModal } from '../ShapingCalculatorModal';
import { RaglanCalculatorModal } from '../RaglanCalculatorModal';
import GaugeCalculatorModal from '../GaugeCalculatorModal';
import { YarnSubstitutionModal } from '../YarnSubstitutionModal';
import YarnUsageEstimatorModal from '../YarnUsageEstimatorModal';
import ProjectShareCardModal from '../ProjectShareCardModal';
import { ImpulsePaywallModal } from '../ImpulsePaywallModal';
import { LinkedCounterModal } from '../LinkedCounterModal';
import { IntervalConfigModal } from '../IntervalConfigModal';
import { KnitProofOverlay } from '../KnitProofOverlay';

const mockSnapshot: any = {
  projectId: 'p1',
  projectName: 'Test',
  partId: 'part_1',
  partName: 'Body',
  counterId: 'c1',
  counterName: 'Main',
  currentValue: 10,
  targetValue: 20,
  progressPercent: 50,
  activeReminder: false,
  reminderReason: '',
  lastUpdatedMs: Date.now(),
};

const mockPayload: any = {
  projectId: 'p1',
  projectName: 'Test',
  partName: 'Body',
  currentCount: 10,
  targetCount: 20,
  activeReminder: false,
  reminderMessage: '',
  timestamp: Date.now(),
};

describe('Modal Safety, Safe Area and HitSlop Audits (Phase 2)', () => {
  it('AppleWatchCompanionModal close button has hitSlop and triggers onClose', () => {
    const onClose = jest.fn();
    let tree: any;
    act(() => {
      tree = renderer.create(<AppleWatchCompanionModal visible={true} onClose={onClose} snapshot={mockSnapshot} />);
    });
    const btn = tree.root.find((n: any) => n.props?.accessibilityLabel === 'Zamknij');
    expect(btn.props.hitSlop).toEqual({ top: 12, bottom: 12, left: 12, right: 12 });
    act(() => btn.props.onPress());
    expect(onClose).toHaveBeenCalled();
  });

  it('GarminCompanionModal close button has hitSlop and triggers onClose', () => {
    const onClose = jest.fn();
    let tree: any;
    act(() => {
      tree = renderer.create(
        <GarminCompanionModal
          visible={true}
          onClose={onClose}
          syncPayload={mockPayload}
          onIncrement={jest.fn()}
          onDecrement={jest.fn()}
        />
      );
    });
    const btn = tree.root.find((n: any) => n.props?.accessibilityLabel === 'Zamknij symulator Garmin');
    expect(btn.props.hitSlop).toEqual({ top: 12, bottom: 12, left: 12, right: 12 });
    act(() => btn.props.onPress());
    expect(onClose).toHaveBeenCalled();
  });

  it('EaseCalculatorModal close button has hitSlop and triggers onClose', () => {
    const onClose = jest.fn();
    let tree: any;
    act(() => {
      tree = renderer.create(<EaseCalculatorModal visible={true} onClose={onClose} />);
    });
    const btn = tree.root.find((n: any) => n.props?.accessibilityLabel === 'Zamknij kalkulator luzu');
    expect(btn.props.hitSlop).toEqual({ top: 12, bottom: 12, left: 12, right: 12 });
    act(() => btn.props.onPress());
    expect(onClose).toHaveBeenCalled();
  });

  it('HatCalculatorModal close button has hitSlop and triggers onClose', () => {
    const onClose = jest.fn();
    let tree: any;
    act(() => {
      tree = renderer.create(<HatCalculatorModal visible={true} onClose={onClose} />);
    });
    const btn = tree.root.find((n: any) => n.props?.accessibilityLabel === 'Zamknij kalkulator czapki');
    expect(btn.props.hitSlop).toEqual({ top: 12, bottom: 12, left: 12, right: 12 });
    act(() => btn.props.onPress());
    expect(onClose).toHaveBeenCalled();
  });

  it('NeedleGaugeModal close button has hitSlop and triggers onClose', () => {
    const onClose = jest.fn();
    let tree: any;
    act(() => {
      tree = renderer.create(<NeedleGaugeModal visible={true} onClose={onClose} />);
    });
    const btn = tree.root.find((n: any) => n.props?.accessibilityLabel === 'Zamknij miarkę drutów');
    expect(btn.props.hitSlop).toEqual({ top: 12, bottom: 12, left: 12, right: 12 });
    act(() => btn.props.onPress());
    expect(onClose).toHaveBeenCalled();
  });

  it('ShapingCalculatorModal close button has hitSlop and triggers onClose', () => {
    const onClose = jest.fn();
    let tree: any;
    act(() => {
      tree = renderer.create(<ShapingCalculatorModal visible={true} onClose={onClose} />);
    });
    const btn = tree.root.find((n: any) => n.props?.accessibilityLabel === 'Zamknij kalkulator kształtowania');
    expect(btn.props.hitSlop).toEqual({ top: 12, bottom: 12, left: 12, right: 12 });
    act(() => btn.props.onPress());
    expect(onClose).toHaveBeenCalled();
  });

  it('RaglanCalculatorModal close button has hitSlop and triggers onClose', () => {
    const onClose = jest.fn();
    let tree: any;
    act(() => {
      tree = renderer.create(<RaglanCalculatorModal visible={true} onClose={onClose} />);
    });
    const btn = tree.root.find((n: any) => n.props?.accessibilityLabel === 'Zamknij kalkulator raglanu');
    expect(btn.props.hitSlop).toEqual({ top: 12, bottom: 12, left: 12, right: 12 });
    act(() => btn.props.onPress());
    expect(onClose).toHaveBeenCalled();
  });

  it('GaugeCalculatorModal close button has hitSlop and triggers onClose', () => {
    const onClose = jest.fn();
    let tree: any;
    act(() => {
      tree = renderer.create(<GaugeCalculatorModal visible={true} onClose={onClose} />);
    });
    const btn = tree.root.find((n: any) => n.props?.accessibilityLabel === 'Zamknij kalkulator próbki');
    expect(btn.props.hitSlop).toEqual({ top: 12, bottom: 12, left: 12, right: 12 });
    act(() => btn.props.onPress());
    expect(onClose).toHaveBeenCalled();
  });

  it('YarnSubstitutionModal close button has hitSlop and triggers onClose', () => {
    const onClose = jest.fn();
    let tree: any;
    act(() => {
      tree = renderer.create(<YarnSubstitutionModal visible={true} onClose={onClose} />);
    });
    const btn = tree.root.find((n: any) => n.props?.accessibilityLabel === 'Zamknij kalkulator zamienników');
    expect(btn.props.hitSlop).toEqual({ top: 12, bottom: 12, left: 12, right: 12 });
    act(() => btn.props.onPress());
    expect(onClose).toHaveBeenCalled();
  });

  it('YarnUsageEstimatorModal close button has hitSlop and triggers onClose', () => {
    const onClose = jest.fn();
    let tree: any;
    act(() => {
      tree = renderer.create(<YarnUsageEstimatorModal visible={true} onClose={onClose} />);
    });
    const btn = tree.root.find((n: any) => n.props?.accessibilityLabel === 'Zamknij kalkulator zużycia');
    expect(btn.props.hitSlop).toEqual({ top: 12, bottom: 12, left: 12, right: 12 });
    act(() => btn.props.onPress());
    expect(onClose).toHaveBeenCalled();
  });

  it('ProjectShareCardModal close button has hitSlop and triggers onClose', () => {
    const onClose = jest.fn();
    const dummyProject: any = {
      id: 'p1',
      name: 'Test Project',
      craftType: 'knitting',
      status: 'active',
      parts: [],
    };
    let tree: any;
    act(() => {
      tree = renderer.create(<ProjectShareCardModal visible={true} project={dummyProject} onClose={onClose} />);
    });
    const btn = tree.root.find((n: any) => n.props?.accessibilityLabel === 'Zamknij kartę robótki');
    expect(btn.props.hitSlop).toEqual({ top: 12, bottom: 12, left: 12, right: 12 });
    act(() => btn.props.onPress());
    expect(onClose).toHaveBeenCalled();
  });

  it('ImpulsePaywallModal close button has hitSlop and triggers onClose', () => {
    const onClose = jest.fn();
    let tree: any;
    act(() => {
      tree = renderer.create(<ImpulsePaywallModal visible={true} onClose={onClose} />);
    });
    const btn = tree.root.find((n: any) => n.props?.accessibilityLabel === 'Zamknij');
    expect(btn.props.hitSlop).toEqual({ top: 12, bottom: 12, left: 12, right: 12 });
    act(() => btn.props.onPress());
    expect(onClose).toHaveBeenCalled();
  });

  it('LinkedCounterModal cancel button has hitSlop and triggers onClose', () => {
    const onClose = jest.fn();
    let tree: any;
    act(() => {
      tree = renderer.create(
        <LinkedCounterModal
          visible={true}
          onClose={onClose}
          partName="Body"
          newLinkedName="Cable"
          setNewLinkedName={jest.fn()}
          newModuloCycle="6"
          setNewModuloCycle={jest.fn()}
          newReminderRow="6"
          setNewReminderRow={jest.fn()}
          onCreateLinkedCounter={jest.fn()}
        />
      );
    });
    const btn = tree.root.find((n: any) => n.props?.accessibilityLabel === 'Anuluj');
    expect(btn.props.hitSlop).toEqual({ top: 12, bottom: 12, left: 12, right: 12 });
    act(() => btn.props.onPress());
    expect(onClose).toHaveBeenCalled();
  });

  it('IntervalConfigModal cancel button has hitSlop and triggers onClose', () => {
    const onClose = jest.fn();
    let tree: any;
    act(() => {
      tree = renderer.create(
        <IntervalConfigModal
          visible={true}
          onClose={onClose}
          tempIntervalInput="6"
          setTempIntervalInput={jest.fn()}
          tempLabelInput="Test"
          setTempLabelInput={jest.fn()}
          onSave={jest.fn()}
        />
      );
    });
    const btn = tree.root.find((n: any) => n.props?.accessibilityLabel === 'Anuluj');
    expect(btn.props.hitSlop).toEqual({ top: 12, bottom: 12, left: 12, right: 12 });
    act(() => btn.props.onPress());
    expect(onClose).toHaveBeenCalled();
  });

  it('KnitProofOverlay exit and undo buttons have hitSlop and trigger actions', () => {
    const onExit = jest.fn();
    const onIncrement = jest.fn();
    const onDecrement = jest.fn();
    let tree: any;
    act(() => {
      tree = renderer.create(
        <KnitProofOverlay
          projectName="Sweter"
          partName="Rękaw"
          counterValue={12}
          targetRows={40}
          activeLinkedStates={[]}
          showReminder={true}
          reminderMessage="Zmień kolor"
          onExit={onExit}
          onIncrement={onIncrement}
          onDecrement={onDecrement}
        />
      );
    });

    const exitBtn = tree.root.find((n: any) => n.props?.accessibilityLabel === 'Wyjdź z trybu Knit-Proof');
    expect(exitBtn.props.hitSlop).toEqual({ top: 12, bottom: 12, left: 12, right: 12 });
    act(() => exitBtn.props.onPress());
    expect(onExit).toHaveBeenCalled();

    const undoBtn = tree.root.find((n: any) => n.props?.accessibilityLabel === 'Cofnij ostatni (Undo)');
    expect(undoBtn.props.hitSlop).toEqual({ top: 12, bottom: 12, left: 12, right: 12 });
    act(() => undoBtn.props.onPress());
    expect(onDecrement).toHaveBeenCalled();
  });
});
