import { describe, expect, test } from 'vitest';
import { computeLeaderboard } from '../features/judging/judging.controller';

describe('computeLeaderboard', () => {
  test('ranks submissions by weighted average score, highest first', () => {
    const result = computeLeaderboard([
      {
        id: 'sub-1',
        title: 'Project A',
        team: { name: 'Team A' },
        scores: [
          { judgeProfileId: 'judge-1', value: 8, criterion: { weight: 1 } },
          { judgeProfileId: 'judge-1', value: 4, criterion: { weight: 2 } }
        ]
      },
      {
        id: 'sub-2',
        title: 'Project B',
        team: { name: 'Team B' },
        scores: [{ judgeProfileId: 'judge-1', value: 10, criterion: { weight: 1 } }]
      }
    ]);

    // Project A: (8*1 + 4*2) / (1+2) = 16/3 ≈ 5.33
    expect(result[0]!.submissionId).toBe('sub-2');
    expect(result[0]!.averageScore).toBe(10);
    expect(result[1]!.submissionId).toBe('sub-1');
    expect(result[1]!.averageScore).toBeCloseTo(16 / 3);
  });

  test('unscored submissions rank last with a zero average, not a crash', () => {
    const result = computeLeaderboard([
      { id: 'sub-1', title: 'Unscored', team: { name: 'Team A' }, scores: [] }
    ]);

    expect(result[0]!.averageScore).toBe(0);
    expect(result[0]!.judgeCount).toBe(0);
  });

  test('judgeCount counts distinct judges, not distinct score rows', () => {
    const result = computeLeaderboard([
      {
        id: 'sub-1',
        title: 'Project A',
        team: { name: 'Team A' },
        scores: [
          { judgeProfileId: 'judge-1', value: 5, criterion: { weight: 1 } },
          { judgeProfileId: 'judge-1', value: 7, criterion: { weight: 1 } },
          { judgeProfileId: 'judge-2', value: 6, criterion: { weight: 1 } }
        ]
      }
    ]);

    expect(result[0]!.judgeCount).toBe(2);
  });
});
