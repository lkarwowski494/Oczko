import React from 'react';
import renderer, { act } from 'react-test-renderer';

jest.mock('react-native-svg', () => {
  const React = require('react');
  const View = require('react-native').View;
  const mockComponent = (name: string) => (props: any) =>
    React.createElement(View, { ...props, testID: name }, props.children);
  return {
    __esModule: true,
    default: mockComponent('Svg'),
    Svg: mockComponent('Svg'),
    Path: mockComponent('Path'),
    Rect: mockComponent('Rect'),
    Circle: mockComponent('Circle'),
    G: mockComponent('G'),
    Line: mockComponent('Line'),
  };
});
import {
  CounterIcon,
  ProjectsIcon,
  StashIcon,
  LearnIcon,
  SettingsIcon,
  CloseIcon,
  UndoIcon,
  CheckIcon,
  KnittingIcon,
  CrochetIcon,
  MixedCraftIcon,
  NaparSuiteIcon,
  PiekarzSuiteIcon,
  SloikSuiteIcon,
  DymSuiteIcon,
} from '../CraftIcons';

describe('CraftIcons (Apps4Craft Studio Vector Icons)', () => {
  it('renders all core navigation and action icons without errors', () => {
    act(() => {
      expect(renderer.create(<CounterIcon size={24} color="#D46A43" />).toJSON()).toBeDefined();
      expect(renderer.create(<ProjectsIcon size={24} color="#D46A43" />).toJSON()).toBeDefined();
      expect(renderer.create(<StashIcon size={24} color="#D46A43" />).toJSON()).toBeDefined();
      expect(renderer.create(<LearnIcon size={24} color="#D46A43" />).toJSON()).toBeDefined();
      expect(renderer.create(<SettingsIcon size={24} color="#D46A43" />).toJSON()).toBeDefined();
      expect(renderer.create(<CloseIcon size={20} color="#FFFFFF" />).toJSON()).toBeDefined();
      expect(renderer.create(<UndoIcon size={20} color="#FFFFFF" />).toJSON()).toBeDefined();
      expect(renderer.create(<CheckIcon size={20} color="#4E8D72" />).toJSON()).toBeDefined();
    });
  });

  it('renders craft discipline icons', () => {
    act(() => {
      expect(renderer.create(<KnittingIcon size={24} />).toJSON()).toBeDefined();
      expect(renderer.create(<CrochetIcon size={24} />).toJSON()).toBeDefined();
      expect(renderer.create(<MixedCraftIcon size={24} />).toJSON()).toBeDefined();
    });
  });

  it('renders Apps4Craft Suite family icons', () => {
    act(() => {
      expect(renderer.create(<NaparSuiteIcon size={22} />).toJSON()).toBeDefined();
      expect(renderer.create(<PiekarzSuiteIcon size={22} />).toJSON()).toBeDefined();
      expect(renderer.create(<SloikSuiteIcon size={22} />).toJSON()).toBeDefined();
      expect(renderer.create(<DymSuiteIcon size={22} />).toJSON()).toBeDefined();
    });
  });
});
