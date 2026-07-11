'use client';

import { trpc } from '@/utils/trpc';
import { useState } from 'react';

interface CriterionDraft {
  name: string;
  maxScore: number;
  weight: number;
}

export default function JudgingPage() {
  const utils = trpc.useUtils();
  const rubrics = trpc.judging.listRubrics.useQuery();
  const leaderboard = trpc.judging.leaderboard.useQuery({});

  const createRubric = trpc.judging.createRubric.useMutation({
    onSuccess: () => utils.judging.listRubrics.invalidate()
  });
  const autoAssign = trpc.judging.autoAssignJudges.useMutation();

  const [rubricName, setRubricName] = useState('');
  const [criteria, setCriteria] = useState<CriterionDraft[]>([
    { name: 'Technical Complexity', maxScore: 10, weight: 1 }
  ]);

  const updateCriterion = (i: number, patch: Partial<CriterionDraft>) => {
    setCriteria((prev) => prev.map((c, idx) => (idx === i ? { ...c, ...patch } : c)));
  };

  return (
    <div className="flex flex-col gap-10">
      <section>
        <h1 className="mb-4 text-lg font-semibold">Rubrics</h1>
        <form
          className="mb-6 flex flex-col gap-3 rounded border p-4"
          onSubmit={(e) => {
            e.preventDefault();
            createRubric.mutate({ name: rubricName, criteria });
            setRubricName('');
          }}
        >
          <input
            required
            placeholder="Rubric name (e.g. Main Track)"
            className="rounded border px-3 py-2 text-sm"
            value={rubricName}
            onChange={(e) => setRubricName(e.target.value)}
          />
          {criteria.map((c, i) => (
            <div key={i} className="flex gap-2">
              <input
                required
                placeholder="Criterion name"
                className="flex-1 rounded border px-3 py-2 text-sm"
                value={c.name}
                onChange={(e) => updateCriterion(i, { name: e.target.value })}
              />
              <input
                type="number"
                min={1}
                className="w-24 rounded border px-3 py-2 text-sm"
                value={c.maxScore}
                onChange={(e) => updateCriterion(i, { maxScore: Number(e.target.value) })}
              />
              <input
                type="number"
                min={0}
                step={0.1}
                className="w-24 rounded border px-3 py-2 text-sm"
                value={c.weight}
                onChange={(e) => updateCriterion(i, { weight: Number(e.target.value) })}
              />
            </div>
          ))}
          <button
            type="button"
            className="self-start text-xs text-gray-500 hover:text-gray-800"
            onClick={() =>
              setCriteria((prev) => [...prev, { name: '', maxScore: 10, weight: 1 }])
            }
          >
            + Add criterion
          </button>
          <button
            type="submit"
            disabled={createRubric.isPending}
            className="self-start rounded bg-black px-3 py-2 text-sm text-white disabled:opacity-50"
          >
            {createRubric.isPending ? 'Creating…' : 'Create rubric'}
          </button>
        </form>

        <ul className="flex flex-col gap-2 text-sm">
          {rubrics.data?.map((r) => (
            <li key={r.id} className="rounded border p-3">
              <p className="font-medium">{r.name}</p>
              <p className="text-gray-500">
                {r.criteria.map((c) => `${c.name} (max ${c.maxScore}, weight ${c.weight})`).join(', ')}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold">Judge assignment</h2>
        <button
          onClick={() => autoAssign.mutate({ submissionsPerJudge: 6 })}
          disabled={autoAssign.isPending}
          className="rounded bg-black px-3 py-2 text-sm text-white disabled:opacity-50"
        >
          {autoAssign.isPending ? 'Assigning…' : 'Auto-assign judges (6 submissions each)'}
        </button>
        {autoAssign.isSuccess && (
          <p className="mt-2 text-sm text-gray-500">
            Created {autoAssign.data.assignedCount} assignments.
          </p>
        )}
        {autoAssign.isError && <p className="mt-2 text-sm text-red-600">{autoAssign.error.message}</p>}
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold">Live leaderboard</h2>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b text-left text-gray-500">
              <th className="py-2 pr-4">Rank</th>
              <th className="py-2 pr-4">Project</th>
              <th className="py-2 pr-4">Team</th>
              <th className="py-2 pr-4">Judges scored</th>
              <th className="py-2 pr-4">Avg score</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.data?.map((row, i) => (
              <tr key={row.submissionId} className="border-b">
                <td className="py-2 pr-4">{i + 1}</td>
                <td className="py-2 pr-4">{row.title}</td>
                <td className="py-2 pr-4">{row.teamName ?? '—'}</td>
                <td className="py-2 pr-4">{row.judgeCount}</td>
                <td className="py-2 pr-4">{row.averageScore.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
