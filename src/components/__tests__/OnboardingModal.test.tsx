import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { OnboardingModal } from '../OnboardingModal';

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
  return `${childrenText} ${propsText}`;
}

describe('OnboardingModal (Apps4Craft Studio Ritual Personalization)', () => {
  it('renders welcome modal when visible=true', () => {
    const onComplete = jest.fn();
    let tree: any;
    act(() => {
      tree = renderer.create(<OnboardingModal visible={true} onComplete={onComplete} />);
    });

    const text = extractAllStrings(tree.toJSON());
    expect(text).toContain('Witaj w Oczku');
    expect(text).toContain('Tylko Druty (Knitting)');
    expect(text).toContain('Tylko Szydełko (Crochet)');
    expect(text).toContain('Druty i Szydełko (Pełny warsztat)');
  });

  it('selects knitting preference and completes onboarding', () => {
    const onComplete = jest.fn();
    let tree: any;
    act(() => {
      tree = renderer.create(<OnboardingModal visible={true} onComplete={onComplete} />);
    });

    const root = tree.root;
    const knittingCard = root.find((n: any) => n.props?.testID === 'onboarding-pref-knitting');
    const startBtn = root.find((n: any) => n.props?.testID === 'onboarding-start-btn');

    act(() => {
      knittingCard.props.onPress();
    });

    act(() => {
      startBtn.props.onPress();
    });

    expect(onComplete).toHaveBeenCalledWith('knitting');
  });

  it('selects crochet preference and completes onboarding', () => {
    const onComplete = jest.fn();
    let tree: any;
    act(() => {
      tree = renderer.create(<OnboardingModal visible={true} onComplete={onComplete} />);
    });

    const root = tree.root;
    const crochetCard = root.find((n: any) => n.props?.testID === 'onboarding-pref-crochet');
    const startBtn = root.find((n: any) => n.props?.testID === 'onboarding-start-btn');

    act(() => {
      crochetCard.props.onPress();
    });

    act(() => {
      startBtn.props.onPress();
    });

    expect(onComplete).toHaveBeenCalledWith('crochet');
  });

  it('defaults to both crafts if start is pressed without changing', () => {
    const onComplete = jest.fn();
    let tree: any;
    act(() => {
      tree = renderer.create(<OnboardingModal visible={true} onComplete={onComplete} />);
    });

    const root = tree.root;
    const startBtn = root.find((n: any) => n.props?.testID === 'onboarding-start-btn');

    act(() => {
      startBtn.props.onPress();
    });

    expect(onComplete).toHaveBeenCalledWith('both');
  });
});
