import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { Share } from 'react-native';
import ProjectShareCardModal from '../ProjectShareCardModal';
import { EnrichedProject } from '../../core/project-service';

jest.spyOn(Share, 'share').mockImplementation(() => Promise.resolve({ action: 'sharedAction' } as any));

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

describe('ProjectShareCardModal (DEC-01)', () => {
  const mockProject: EnrichedProject = {
    id: 'proj-modal-1',
    name: 'Kardigan Zimowy',
    craftType: 'knitting',
    status: 'active',
    createdAt: '2026-10-15T10:00:00.000Z',
    updatedAt: '2026-10-15T12:00:00.000Z',
    parts: [
      {
        id: 'part-1',
        projectId: 'proj-modal-1',
        name: 'Plecy',
        sortOrder: 0,
        targetRows: 100,
        counters: [
          {
            id: 'cnt-1',
            partId: 'part-1',
            name: 'Rzędy',
            initialValue: 0,
            step: 1,
            currentValue: 80,
          },
        ],
      },
    ],
  };

  it('renders craft card with project title, row count, and WIP status', () => {
    let tree: any;
    act(() => {
      tree = renderer.create(
        <ProjectShareCardModal
          visible={true}
          project={mockProject}
          onClose={jest.fn()}
        />
      );
    });

    expect(tree).toBeDefined();
    const text = extractAllStrings(tree.toJSON());
    expect(text).toContain('Kardigan Zimowy');
    expect(text).toContain('80');
    expect(text).toMatch(/100\s*rzędów/);
    expect(text).toContain('80%');
    expect(text).toContain('WIP');
    expect(text).toContain('OCZKO • PURLO');
  });


  it('calls Share.share when share button is tapped', async () => {
    let tree: any;
    act(() => {
      tree = renderer.create(
        <ProjectShareCardModal
          visible={true}
          project={mockProject}
          onClose={jest.fn()}
        />
      );
    });

    const root = tree.root;
    const shareBtn = root.find((node: any) => {
      return (
        node.props?.onPress &&
        extractAllStrings(node.props?.children).includes('Udostępnij kartę')
      );
    });

    await act(async () => {
      await shareBtn.props.onPress();
    });

    expect(Share.share).toHaveBeenCalledWith(
      expect.objectContaining({
        title: expect.stringContaining('Kardigan Zimowy'),
        message: expect.stringContaining('Kardigan Zimowy'),
      })
    );
  });

  it('calls onStatusChange to mark active project as finished', async () => {
    const mockStatusChange = jest.fn();
    let tree: any;
    act(() => {
      tree = renderer.create(
        <ProjectShareCardModal
          visible={true}
          project={mockProject}
          onClose={jest.fn()}
          onStatusChange={mockStatusChange}
        />
      );
    });

    const root = tree.root;
    const finishBtn = root.find((node: any) => {
      return (
        node.props?.onPress &&
        extractAllStrings(node.props?.children).includes('Oznacz jako ukończony')
      );
    });

    await act(async () => {
      await finishBtn.props.onPress();
    });

    expect(mockStatusChange).toHaveBeenCalledWith('proj-modal-1', 'finished');
  });
});
