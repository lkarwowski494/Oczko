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

  it('handles native share error and user did not share error', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    // 1. Native error (logged to console.error)
    (Share.share as jest.Mock).mockRejectedValueOnce(new Error('Share failure'));
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
    const shareBtn = tree.root.find((n: any) => n.props?.onPress && extractAllStrings(n.props?.children).includes('Udostępnij kartę'));
    await act(async () => {
      await shareBtn.props.onPress();
    });
    expect(consoleErrorSpy).toHaveBeenCalled();

    // 2. User did not share (cancellation, not logged)
    consoleErrorSpy.mockClear();
    (Share.share as jest.Mock).mockRejectedValueOnce(new Error('User did not share'));
    await act(async () => {
      await shareBtn.props.onPress();
    });
    expect(consoleErrorSpy).not.toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  it('renders finished crochet project and resumes project to WIP', async () => {
    const finishedCrochetProject: EnrichedProject = {
      ...mockProject,
      craftType: 'crochet',
      status: 'finished',
      parts: [
        {
          id: 'part-2',
          projectId: 'proj-modal-1',
          name: 'Chusta',
          sortOrder: 0,
          counters: [
            {
              id: 'cnt-2',
              partId: 'part-2',
              name: 'Rzędy',
              initialValue: 0,
              step: 1,
              currentValue: 50,
            },
          ],
        },
      ],
    };

    const mockStatusChange = jest.fn();
    const mockClose = jest.fn();
    let tree: any;
    act(() => {
      tree = renderer.create(
        <ProjectShareCardModal
          visible={true}
          project={finishedCrochetProject}
          onClose={mockClose}
          onStatusChange={mockStatusChange}
        />
      );
    });

    const text = extractAllStrings(tree.toJSON());
    expect(text).toContain('SZYDEŁKO (CROCHET)');
    expect(text).toContain('FO (UKOŃCZONY)');

    // Kliknij przycisk zamknięcia ✕
    const closeBtn = tree.root.find((n: any) => n.props?.onPress && extractAllStrings(n).includes('✕'));
    act(() => {
      closeBtn.props.onPress();
    });
    expect(mockClose).toHaveBeenCalledTimes(1);

    // Wprowadź nazwę włóczki i narzędzia do TextInput
    const textInputs = tree.root.findAll((n: any) => n.type === 'TextInput');
    expect(textInputs.length).toBe(2);
    act(() => {
      textInputs[0].props.onChangeText('Drops Safran');
      textInputs[1].props.onChangeText('Szydełko 3.0 mm');
    });

    // Wznów projekt (zmień finished na active)
    const resumeBtn = tree.root.find((n: any) => n.props?.onPress && extractAllStrings(n.props?.children).includes('Wznów robótkę'));
    await act(async () => {
      await resumeBtn.props.onPress();
    });
    expect(mockStatusChange).toHaveBeenCalledWith('proj-modal-1', 'active');
  });

  it('renders time spent on card when totalDurationSeconds is provided', () => {
    let tree: any;
    act(() => {
      tree = renderer.create(
        <ProjectShareCardModal
          visible={true}
          project={mockProject}
          onClose={jest.fn()}
          totalDurationSeconds={3600} // 1h 0m
        />
      );
    });

    const text = extractAllStrings(tree.toJSON());
    expect(text).toContain('⏱️ Czas robótki: 1h 0m');
  });

  it('renders vector QR code and includes deep link oczko://project in share message', async () => {
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

    const qrNode = tree.root.findByProps({ testID: 'share-card-qr' });
    expect(qrNode).toBeDefined();

    const shareBtn = tree.root.find((n: any) => n.props?.onPress && extractAllStrings(n).includes('Udostępnij kartę'));
    await act(async () => {
      await shareBtn.props.onPress();
    });

    expect(Share.share).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('oczko://project?v=1&d='),
      })
    );
  });
});

