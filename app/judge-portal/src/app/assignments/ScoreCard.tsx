'use client';

import { trpc } from '@/utils/trpc';
import { useState } from 'react';

interface Criterion {
  id: string;
  name: string;
  maxScore: number;
}

interface ExistingScore {
  criterionId: string;
  value: number;
  comment: string | null;
}

interface Submission {
  id: string;
  title: string;
  description: string | null;
  repoUrl: string | null;
  demoUrl: string | null;
  videoUrl: string | null;
  scores: ExistingScore[];
}

export function ScoreCard({ submission, criteria }: { submission: Submission; criteria: Criterion[] }) {
  const utils = trpc.useUtils();
  const submitScore = trpc.judging.submitScore.useMutation({
    onSuccess: () => utils.judging.myAssignments.invalidate()
  });

  const [values, setValues] = useState<Record<string, number>>(() =>
    Object.fromEntries(
      criteria.map((c) => [
        c.id,
        submission.scores.find((s) => s.criterionId === c.id)?.value ?? 0
      ])
    )
  );

  const alreadyScored = submission.scores.length === criteria.length && criteria.length > 0;

  return (
    <div className="rounded border p-4">
      <p className="font-medium">{submission.title}</p>
      {submission.description && <p className="mt-1 text-sm text-gray-600">{submission.description}</p>}
      <div className="mt-2 flex gap-3 text-xs text-blue-600">
        {submission.repoUrl && (
          <a href={submission.repoUrl} target="_blank" rel="noreferrer">
            Repo
          </a>
        )}
        {submission.demoUrl && (
          <a href={submission.demoUrl} target="_blank" rel="noreferrer">
            Demo
          </a>
        )}
        {submission.videoUrl && (
          <a href={submission.videoUrl} target="_blank" rel="noreferrer">
            Video
          </a>
        )}
      </div>

      {criteria.length === 0 ? (
        <p className="mt-3 text-sm text-gray-500">No rubric published yet.</p>
      ) : (
        <form
          className="mt-3 flex flex-col gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            submitScore.mutate({
              submissionId: submission.id,
              scores: criteria.map((c) => ({ criterionId: c.id, value: values[c.id] ?? 0 }))
            });
          }}
        >
          {criteria.map((c) => (
            <label key={c.id} className="flex items-center justify-between text-sm">
              <span>
                {c.name} (0-{c.maxScore})
              </span>
              <input
                type="number"
                min={0}
                max={c.maxScore}
                className="w-20 rounded border px-2 py-1"
                value={values[c.id] ?? 0}
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, [c.id]: Number(e.target.value) }))
                }
              />
            </label>
          ))}
          <button
            type="submit"
            disabled={submitScore.isPending}
            className="mt-2 self-start rounded bg-black px-3 py-1.5 text-sm text-white disabled:opacity-50"
          >
            {submitScore.isPending ? 'Saving…' : alreadyScored ? 'Update score' : 'Submit score'}
          </button>
        </form>
      )}
    </div>
  );
}
