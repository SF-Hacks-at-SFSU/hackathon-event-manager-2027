"use client";

import { trpc } from "@/utils/trpc";
import { useState } from "react";

interface CriterionDraft {
  name: string;
  maxScore: number;
  weight: number;
}

export default function JudgingPage() {
  const utils = trpc.useUtils();
  const rubrics = trpc.judging.listRubrics.useQuery();
  const leaderboard = trpc.judging.leaderboard.useQuery({});
  const [rubricName, setRubricName] = useState("");
  const [criteria, setCriteria] = useState<CriterionDraft[]>([
    { name: "Technical Complexity", maxScore: 10, weight: 1 },
  ]);

  const createRubric = trpc.judging.createRubric.useMutation({
    onSuccess: () => {
      void utils.judging.listRubrics.invalidate();
      setRubricName("");
    },
  });
  const autoAssign = trpc.judging.autoAssignJudges.useMutation();

  const updateCriterion = (index: number, patch: Partial<CriterionDraft>) => {
    setCriteria((previous) =>
      previous.map((criterion, criterionIndex) =>
        criterionIndex === index ? { ...criterion, ...patch } : criterion,
      ),
    );
  };

  return (
    <div>
      <header className="mb-8">
        <p className="admin-kicker">Project evaluation</p>
        <h1 className="admin-title">Judging</h1>
        <p className="admin-subtitle">
          Build scoring rubrics, distribute submissions, and follow results as they arrive.
        </p>
      </header>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <section className="admin-card p-5 sm:p-6">
          <div>
            <p className="text-[15px] font-semibold tracking-[-0.02em]">Create a rubric</p>
            <p className="mt-1 text-[13px] text-gray-500">
              Define the criteria judges will use to evaluate projects.
            </p>
          </div>

          <form
            className="mt-6"
            onSubmit={(event) => {
              event.preventDefault();
              createRubric.mutate({ name: rubricName, criteria });
            }}
          >
            <label className="block text-xs font-semibold text-gray-600">
              Rubric name
              <input
                required
                placeholder="Main track"
                className="admin-input mt-2 text-sm font-normal"
                value={rubricName}
                onChange={(event) => setRubricName(event.target.value)}
              />
            </label>

            <div className="mt-6 flex items-center justify-between">
              <p className="text-xs font-semibold text-gray-600">Scoring criteria</p>
              <span className="text-xs text-gray-400">Score · Weight</span>
            </div>

            <div className="mt-2 space-y-2">
              {criteria.map((criterion, index) => (
                <div
                  key={index}
                  className="grid gap-2 rounded-2xl bg-black/[0.025] p-2 sm:grid-cols-[minmax(0,1fr)_90px_90px_auto]"
                >
                  <input
                    required
                    aria-label={`Criterion ${index + 1} name`}
                    placeholder="Criterion name"
                    className="admin-input text-sm"
                    value={criterion.name}
                    onChange={(event) => updateCriterion(index, { name: event.target.value })}
                  />
                  <input
                    type="number"
                    min={1}
                    aria-label={`Criterion ${index + 1} maximum score`}
                    className="admin-input text-sm"
                    value={criterion.maxScore}
                    onChange={(event) => updateCriterion(index, { maxScore: Number(event.target.value) })}
                  />
                  <input
                    type="number"
                    min={0}
                    step={0.1}
                    aria-label={`Criterion ${index + 1} weight`}
                    className="admin-input text-sm"
                    value={criterion.weight}
                    onChange={(event) => updateCriterion(index, { weight: Number(event.target.value) })}
                  />
                  <button
                    type="button"
                    aria-label={`Remove criterion ${index + 1}`}
                    disabled={criteria.length === 1}
                    onClick={() => setCriteria((previous) => previous.filter((_, itemIndex) => itemIndex !== index))}
                    className="rounded-xl px-3 text-sm text-gray-400 transition hover:bg-white hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-25"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                className="admin-button-secondary"
                onClick={() => setCriteria((previous) => [...previous, { name: "", maxScore: 10, weight: 1 }])}
              >
                Add criterion
              </button>
              <button type="submit" disabled={createRubric.isPending} className="admin-button">
                {createRubric.isPending ? "Creating…" : "Create rubric"}
              </button>
            </div>

            {createRubric.isError && (
              <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700" role="alert">
                {createRubric.error.message}
              </p>
            )}
          </form>
        </section>

        <div className="space-y-6">
          <section className="admin-card p-5 sm:p-6">
            <p className="text-[15px] font-semibold tracking-[-0.02em]">Judge assignment</p>
            <p className="mt-1 text-[13px] leading-relaxed text-gray-500">
              Balance submissions evenly across the available judges.
            </p>
            <button
              type="button"
              onClick={() => autoAssign.mutate({ submissionsPerJudge: 6 })}
              disabled={autoAssign.isPending}
              className="admin-button mt-5 w-full"
            >
              {autoAssign.isPending ? "Assigning…" : "Auto-assign submissions"}
            </button>
            <p className="mt-2 text-center text-[11px] text-gray-400">6 submissions per judge</p>
            {autoAssign.isSuccess && (
              <p className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">
                Created {autoAssign.data.assignedCount} assignments.
              </p>
            )}
            {autoAssign.isError && (
              <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
                {autoAssign.error.message}
              </p>
            )}
          </section>

          <section>
            <div className="mb-3 flex items-center justify-between px-1">
              <h2 className="text-sm font-semibold">Active rubrics</h2>
              <span className="text-xs text-gray-500">{rubrics.data?.length ?? 0} total</span>
            </div>
            <div className="space-y-3">
              {rubrics.data?.map((rubric) => (
                <div key={rubric.id} className="admin-card p-5">
                  <p className="font-semibold tracking-[-0.02em]">{rubric.name}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {rubric.criteria.map((criterion) => (
                      <span key={criterion.id} className="rounded-full bg-black/[0.045] px-3 py-1.5 text-xs text-gray-600">
                        {criterion.name} · {criterion.maxScore} pts · {criterion.weight}×
                      </span>
                    ))}
                  </div>
                </div>
              ))}
              {!rubrics.isLoading && rubrics.data?.length === 0 && (
                <div className="admin-card p-8 text-center text-sm text-gray-500">No rubrics created yet.</div>
              )}
            </div>
          </section>
        </div>
      </div>

      <section className="admin-card mt-6 overflow-hidden">
        <div className="border-b border-black/[0.06] px-5 py-5 sm:px-6">
          <p className="text-[15px] font-semibold tracking-[-0.02em]">Live leaderboard</p>
          <p className="mt-1 text-[13px] text-gray-500">Scores update as judges submit evaluations.</p>
        </div>
        {leaderboard.data?.length === 0 ? (
          <p className="px-6 py-12 text-center text-sm text-gray-500">Scores will appear after judging begins.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-black/[0.055] bg-black/[0.018] text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-500">
                  <th className="px-6 py-3">Rank</th>
                  <th className="px-6 py-3">Project</th>
                  <th className="px-6 py-3">Team</th>
                  <th className="px-6 py-3">Judges</th>
                  <th className="px-6 py-3 text-right">Average</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.data?.map((row, index) => (
                  <tr key={row.submissionId} className="border-b border-black/[0.055] last:border-0 hover:bg-black/[0.018]">
                    <td className="px-6 py-4 font-semibold text-gray-400">{index + 1}</td>
                    <td className="px-6 py-4 font-medium">{row.title}</td>
                    <td className="px-6 py-4 text-gray-500">{row.teamName ?? "—"}</td>
                    <td className="px-6 py-4 text-gray-500">{row.judgeCount}</td>
                    <td className="px-6 py-4 text-right font-semibold">{row.averageScore.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
