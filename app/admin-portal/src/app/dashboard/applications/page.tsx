'use client';

import { trpc } from '@/utils/trpc';

const STATUSES = ['pending', 'accepted', 'rejected', 'waitlisted'] as const;

export default function ApplicationsPage() {
  const utils = trpc.useUtils();
  const applications = trpc.applications.listByEvent.useQuery();
  const updateStatus = trpc.applications.updateStatus.useMutation({
    onSuccess: () => utils.applications.listByEvent.invalidate()
  });

  if (applications.isLoading) return <p className="text-sm text-gray-500">Loading applications…</p>;
  if (applications.isError) return <p className="text-sm text-red-600">{applications.error.message}</p>;

  return (
    <div>
      <h1 className="mb-4 text-lg font-semibold">
        Applications ({applications.data?.length ?? 0})
      </h1>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b text-left text-gray-500">
            <th className="py-2 pr-4">Name</th>
            <th className="py-2 pr-4">School</th>
            <th className="py-2 pr-4">Status</th>
            <th className="py-2 pr-4">Set status</th>
          </tr>
        </thead>
        <tbody>
          {applications.data?.map((app) => (
            <tr key={app.id} className="border-b">
              <td className="py-2 pr-4">
                {app.profile.firstName} {app.profile.lastName}
              </td>
              <td className="py-2 pr-4">{app.school ?? '—'}</td>
              <td className="py-2 pr-4">{app.publicStatus ?? 'pending'}</td>
              <td className="py-2 pr-4">
                <div className="flex gap-1">
                  {STATUSES.map((status) => (
                    <button
                      key={status}
                      disabled={updateStatus.isPending}
                      onClick={() =>
                        updateStatus.mutate({ applicationId: app.id, publicStatus: status })
                      }
                      className="rounded border px-2 py-1 text-xs hover:bg-gray-100 disabled:opacity-50"
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
