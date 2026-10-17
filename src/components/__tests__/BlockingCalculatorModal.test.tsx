import React from 'react';
import { Share } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { BlockingCalculatorModal } from '../BlockingCalculatorModal';

jest.spyOn(Share, 'share').mockImplementation(() => Promise.resolve({ action: 'sharedAction' } as any));

describe('BlockingCalculatorModal Component (DEC-34)', () => {
  it('renders correctly and displays blocking results and compensation', () => {
    const onClose = jest.fn();
    let tree: any;

    act(() => {
      tree = renderer.create(
        <BlockingCalculatorModal visible={true} onClose={onClose} initialRawWidth={10} initialRawHeight={10} />
      );
    });

    const root = tree.root;
    expect(root.findByProps({ testID: 'blocking-result-card' })).toBeTruthy();

    // Close button test with hitSlop
    const closeBtn = root.findByProps({ testID: 'close-blocking-modal-btn' });
    expect(closeBtn.props.hitSlop).toEqual({ top: 12, bottom: 12, left: 12, right: 12 });
    act(() => {
      closeBtn.props.onPress();
    });
    expect(onClose).toHaveBeenCalled();
  });

  it('allows toggling units between cm and inch', () => {
    let tree: any;
    act(() => {
      tree = renderer.create(<BlockingCalculatorModal visible={true} onClose={jest.fn()} />);
    });

    const inchBtn = tree.root.findByProps({ accessibilityLabel: 'Jednostki imperialne (cale)' });
    act(() => {
      inchBtn.props.onPress();
    });

    const cmBtn = tree.root.findByProps({ accessibilityLabel: 'Jednostki metryczne (cm)' });
    act(() => {
      cmBtn.props.onPress();
    });
  });

  it('updates calculations when user changes inputs', () => {
    let tree: any;
    act(() => {
      tree = renderer.create(<BlockingCalculatorModal visible={true} onClose={jest.fn()} />);
    });

    const rawStInput = tree.root.findByProps({ testID: 'raw-stitches-input' });
    const rawRwInput = tree.root.findByProps({ testID: 'raw-rows-input' });
    const rawWInput = tree.root.findByProps({ testID: 'raw-width-input' });
    const rawHInput = tree.root.findByProps({ testID: 'raw-height-input' });
    const blockedWInput = tree.root.findByProps({ testID: 'blocked-width-input' });
    const blockedHInput = tree.root.findByProps({ testID: 'blocked-height-input' });
    const targetWInput = tree.root.findByProps({ testID: 'target-width-input' });
    const targetHInput = tree.root.findByProps({ testID: 'target-height-input' });

    act(() => {
      rawStInput.props.onChangeText('22');
      rawRwInput.props.onChangeText('30');
      rawWInput.props.onChangeText('10');
      rawHInput.props.onChangeText('10');
      blockedWInput.props.onChangeText('9.5'); // shrinkage
      blockedHInput.props.onChangeText('9.5');
      targetWInput.props.onChangeText('48');
      targetHInput.props.onChangeText('58');
    });

    expect(tree.root.findByProps({ testID: 'blocking-result-card' })).toBeTruthy();
  });

  it('handles invalid numeric inputs gracefully without crashing', () => {
    let tree: any;
    act(() => {
      tree = renderer.create(<BlockingCalculatorModal visible={true} onClose={jest.fn()} />);
    });

    const rawStInput = tree.root.findByProps({ testID: 'raw-stitches-input' });
    act(() => {
      rawStInput.props.onChangeText('abc');
    });

    // Result card should not be rendered when inputs are invalid
    expect(tree.root.findAllByProps({ testID: 'blocking-result-card' }).length).toBe(0);
  });

  it('triggers native Share.share when user presses share button', async () => {
    let tree: any;
    act(() => {
      tree = renderer.create(<BlockingCalculatorModal visible={true} onClose={jest.fn()} />);
    });

    const shareBtn = tree.root.findByProps({ testID: 'share-blocking-report-btn' });
    await act(async () => {
      await shareBtn.props.onPress();
    });

    expect(Share.share).toHaveBeenCalled();
  });
});
