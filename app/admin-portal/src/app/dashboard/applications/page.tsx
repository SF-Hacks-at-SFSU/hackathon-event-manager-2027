"use client";

import { trpc } from "@/utils/trpc";
import { useState } from "react";

const STATUSES = ["pending", "accepted", "rejected", "waitlisted"] as const;

export default function ApplicationsPage() {
  const utils = trpc.useUtils();
  const [resultMessage, setResultMessage] = useState<{
    kind: "success" | "error";
    text: string;
  } | null>(null);
  const applications = trpc.applications.listByEvent.useQuery();
  const statusMode = trpc.applications.statusMode.useQuery();
  const updateStatus = trpc.applications.updateStatus.useMutation({
    onSuccess: (result) => {
      void utils.applications.listByEvent.invalidate();
      const delivery = result.notification.delivery;
      const action = result.statusChanged
        ? `Status changed to ${result.requestedStatus}.`
        : `Tested ${result.requestedStatus}; application status was not changed.`;
      const deliveryText =
        delivery === "sent"
          ? ` Email sent to ${result.notification.toEmail}.`
          : delivery === "simulated"
            ? " Email rendered successfully; no message was sent."
            : ` Email failed: ${result.notification.message ?? "Unknown delivery error"}`;
      setResultMessage({
        kind: delivery === "failed" ? "error" : "success",
        text: action + deliveryText,
      });
    },
    onError: (error) =>
      setResultMessage({ kind: "error", text: error.message }),
  });

  if (applications.isLoading)
    return <p className="text-sm text-gray-500">Loading applications…</p>;
  if (applications.isError)
    return <p className="text-sm text-red-600">{applications.error.message}</p>;

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold">
            Applications ({applications.data?.length ?? 0})
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Review decisions and verify email delivery.
          </p>
        </div>
        {statusMode.data?.mode === "test" && (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">
            Test mode · no status changes
          </span>
        )}
      </div>

      {statusMode.data?.mode === "test" && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">
          {statusMode.data.testRecipientConfigured
            ? "Decision emails go only to the configured test recipient."
            : "Email dry run is active. Templates are validated, but no email is sent."}
        </div>
      )}

      {resultMessage && (
        <div
          className={`mb-4 rounded-xl border p-3 text-sm ${
            resultMessage.kind === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
          role="status"
        >
          {resultMessage.text}
        </div>
      )}
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
              <td className="py-2 pr-4">{app.school ?? "—"}</td>
              <td className="py-2 pr-4">{app.publicStatus ?? "pending"}</td>
              <td className="py-2 pr-4">
                <div className="flex gap-1">
                  {STATUSES.map((status) => (
                    <button
                      key={status}
                      disabled={updateStatus.isPending}
                      onClick={() =>
                        updateStatus.mutate({
                          applicationId: app.id,
                          publicStatus: status,
                        })
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
