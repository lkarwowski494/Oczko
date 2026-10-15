import { buildProjectSummary, generateShareableText } from '../project-summary';
import { EnrichedProject } from '../project-service';
import { CounterEvent } from '../counter-engine';

describe('Project Summary & Share Card Core (DEC-01)', () => {
  const mockProject: EnrichedProject = {
    id: 'proj-card-1',
    name: 'Sweter Alpejski',
    craftType: 'knitting',
    status: 'active',
    createdAt: '2026-10-15T10:00:00.000Z',
    updatedAt: '2026-10-15T12:00:00.000Z',
    parts: [
      {
        id: 'part-1',
        projectId: 'proj-card-1',
        name: 'Korpus',
        sortOrder: 0,
        targetRows: 150,
        counters: [
          {
            id: 'cnt-1',
            partId: 'part-1',
            name: 'Rzędy',
            initialValue: 0,
            step: 1,
            currentValue: 120,
          },
        ],
      },
      {
        id: 'part-2',
        projectId: 'proj-card-1',
        name: 'Rękaw lewy',
        sortOrder: 1,
        targetRows: 50,
        counters: [
          {
            id: 'cnt-2',
            partId: 'part-2',
            name: 'Rzędy',
            initialValue: 0,
            step: 1,
            currentValue: 30,
          },
        ],
      },
    ],
  };

  const mockEvents: CounterEvent[] = [
    {
      id: 'ev-1',
      counterId: 'cnt-1',
      type: 'INCREMENT',
      delta: 1,
      source: 'iphone',
      timestampMs: new Date('2026-10-10T10:00:00.000Z').getTime(),
    },
    {
      id: 'ev-2',
      counterId: 'cnt-1',
      type: 'INCREMENT',
      delta: 1,
      source: 'iphone',
      timestampMs: new Date('2026-10-15T12:00:00.000Z').getTime(),
    },
  ];

  it('builds comprehensive project summary statistics across multiple parts', () => {
    const summary = buildProjectSummary(mockProject, mockEvents);

    expect(summary.projectId).toBe('proj-card-1');
    expect(summary.projectName).toBe('Sweter Alpejski');
    expect(summary.craftType).toBe('knitting');
    expect(summary.status).toBe('active');
    expect(summary.totalRowsKnitted).toBe(150); // 120 + 30
    expect(summary.totalTargetRows).toBe(200); // 150 + 50
    expect(summary.progressPercent).toBe(75); // 150 / 200 = 75%
    expect(summary.partsCount).toBe(2);
    expect(summary.countersCount).toBe(2);
    expect(summary.eventsCount).toBe(2);
    expect(summary.firstEventDate).toBe('2026-10-10');
    expect(summary.lastEventDate).toBe('2026-10-15');

    expect(summary.partsSummary[0].progressPercent).toBe(80); // 120 / 150 = 80%
    expect(summary.partsSummary[1].progressPercent).toBe(60); // 30 / 50 = 60%
  });

  it('generates formatted shareable text with yarn, tool, and part breakdown', () => {
    const summary = buildProjectSummary(mockProject, mockEvents);
    const text = generateShareableText(summary, {
      yarnName: 'Drops Air (4 motki)',
      toolName: 'Druty z żyłką 4.5 mm',
    });

    expect(text).toContain('Sweter Alpejski');
    expect(text).toContain('Postęp: 75%');
    expect(text).toContain('150 / 200 rz.');
    expect(text).toContain('Drops Air');
    expect(text).toContain('Druty z żyłką 4.5 mm');
    expect(text).toContain('• Korpus: 120 / 150 rz. (80%)');
    expect(text).toContain('• Rękaw lewy: 30 / 50 rz. (60%)');
    expect(text).toContain('#knitting');
  });

  it('marks finished projects with celebration emoji and FO tag', () => {
    const finishedProj: EnrichedProject = {
      ...mockProject,
      status: 'finished',
    };
    const summary = buildProjectSummary(finishedProj, []);
    const text = generateShareableText(summary);

    expect(text).toContain('🎉 Ukończony (FO)');
  });
});
