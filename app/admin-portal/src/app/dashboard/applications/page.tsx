"use client";

import { RouterOutputs, trpc } from "@/utils/trpc";
import { useState } from "react";

const STATUSES = ["pending", "accepted", "rejected", "waitlisted"] as const;
type ApplicationStatus = (typeof STATUSES)[number];
type Application = RouterOutputs["applications"]["listByEvent"][number];

const STATUS_SECTIONS: Array<{
  status: ApplicationStatus;
  title: string;
  description: string;
}> = [
  {
    status: "pending",
    title: "Pending review",
    description: "Applications that still need a decision.",
  },
  {
    status: "accepted",
    title: "Approved",
    description: "Participants who have been accepted for this event.",
  },
  {
    status: "waitlisted",
    title: "Waitlisted",
    description: "Applicants currently waiting for an available spot.",
  },
  {
    status: "rejected",
    title: "Not approved",
    description: "Applications that were not accepted.",
  },
];

function ApplicationsSection({
  title,
  description,
  applications,
  isUpdating,
  onStatusChange,
}: {
  title: string;
  description: string;
  applications: Application[];
  isUpdating: boolean;
  onStatusChange: (applicationId: string, status: ApplicationStatus) => void;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-200 px-5 py-4">
        <div>
          <h2 className="font-semibold text-gray-950">{title}</h2>
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        </div>
        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
          {applications.length}
        </span>
      </div>

      {applications.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-gray-500">
          No applications in this section.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">School</th>
                <th className="px-5 py-3">Check-in</th>
                <th className="px-5 py-3">Change decision</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((application) => (
                <tr key={application.id} className="border-b last:border-b-0">
                  <td className="px-5 py-4 font-medium text-gray-950">
                    {application.profile.firstName} {application.profile.lastName}
                  </td>
                  <td className="px-5 py-4 text-gray-600">
                    {application.school ?? "—"}
                  </td>
                  <td className="px-5 py-4">
                    {application.checkedIn ? (
                      <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                        Checked in
                      </span>
                    ) : (
                      <span className="text-gray-400">Not checked in</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-1.5">
                      {STATUSES.map((status) => {
                        const isCurrent =
                          (application.publicStatus ?? "pending") === status;
                        return (
                          <button
                            key={status}
                            type="button"
                            disabled={isUpdating || isCurrent}
                            onClick={() => onStatusChange(application.id, status)}
                            className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium capitalize transition disabled:cursor-default ${
                              isCurrent
                                ? "border-gray-950 bg-gray-950 text-white"
                                : "border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                            }`}
                          >
                            {status}
                          </button>
                        );
                      })}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

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
      <div className="space-y-5">
        {STATUS_SECTIONS.map((section) => (
          <ApplicationsSection
            key={section.status}
            title={section.title}
            description={section.description}
            applications={
              applications.data?.filter(
                (application) =>
                  (application.publicStatus ?? "pending") === section.status,
              ) ?? []
            }
            isUpdating={updateStatus.isPending}
            onStatusChange={(applicationId, publicStatus) =>
              updateStatus.mutate({ applicationId, publicStatus })
            }
          />
        ))}
      </div>
    </div>
  );
}
