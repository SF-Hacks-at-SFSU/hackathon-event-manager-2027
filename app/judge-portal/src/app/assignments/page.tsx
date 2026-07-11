'use client';

import { RequireAuth } from '@/components/RequireAuth';
import { trpc } from '@/utils/trpc';
import { useSignOut } from '@/hooks/auth';
import { ScoreCard } from './ScoreCard';

function AssignmentsList() {
  const signOut = useSignOut();
  const assignments = trpc.judging.myAssignments.useQuery();
  const rubrics = trpc.judging.listRubrics.useQuery();

  // MVP: judges score against the event's first published rubric.
  // Multi-track/multi-rubric assignment is a follow-up (see ROADMAP.md).
  const criteria = rubrics.data?.[0]?.criteria ?? [];

  if (assignments.isLoading) return <p className="p-6 text-sm text-gray-500">Loading…</p>;
  if (assignments.isError) return <p className="p-6 text-sm text-red-600">{assignments.error.message}</p>;

  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold">Your assigned projects ({assignments.data?.length ?? 0})</h1>
        <button onClick={() => signOut.mutate()} className="text-sm text-gray-500 hover:text-gray-800">
          Sign out
        </button>
      </div>
      <div className="flex flex-col gap-4">
        {assignments.data?.map((a) => (
          <ScoreCard key={a.id} submission={a.submission} criteria={criteria} />
        ))}
        {assignments.data?.length === 0 && (
          <p className="text-sm text-gray-500">No projects assigned yet — check back after organizers run assignment.</p>
        )}
      </div>
    </div>
  );
}

export default function AssignmentsPage() {
  return (
    <RequireAuth>
      <AssignmentsList />
    </RequireAuth>
  );
}
