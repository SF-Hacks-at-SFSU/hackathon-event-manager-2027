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
    <section className="admin-card overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-black/[0.06] px-5 py-5 sm:px-6">
        <div>
          <h2 className="text-[15px] font-semibold tracking-[-0.02em] text-gray-950">{title}</h2>
          <p className="mt-1 text-[13px] text-gray-500">{description}</p>
        </div>
        <span className="grid min-w-7 place-items-center rounded-full bg-black/[0.055] px-2.5 py-1 text-xs font-semibold text-gray-600">
          {applications.length}
        </span>
      </div>

      {applications.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-gray-500">
          No applications in this section.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-black/[0.055] bg-black/[0.018] text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-500">
                <th className="px-5 py-3 sm:px-6">Name</th>
                <th className="px-5 py-3 sm:px-6">School</th>
                <th className="px-5 py-3 sm:px-6">Check-in</th>
                <th className="px-5 py-3 sm:px-6">Change decision</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((application) => (
                <tr key={application.id} className="border-b border-black/[0.055] transition last:border-b-0 hover:bg-black/[0.018]">
                  <td className="px-5 py-4 font-medium text-gray-950 sm:px-6">
                    {application.profile.firstName} {application.profile.lastName}
                  </td>
                  <td className="max-w-xs truncate px-5 py-4 text-gray-500 sm:px-6">
                    {application.school ?? "—"}
                  </td>
                  <td className="px-5 py-4 sm:px-6">
                    {application.checkedIn ? (
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/10">
                        Checked in
                      </span>
                    ) : (
                      <span className="text-gray-400">Not checked in</span>
                    )}
                  </td>
                  <td className="px-5 py-4 sm:px-6">
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
                            className={`rounded-full border px-3 py-1.5 text-xs font-medium capitalize transition disabled:cursor-default ${
                              isCurrent
                                ? "border-gray-950 bg-gray-950 text-white shadow-sm"
                                : "border-black/[0.1] bg-white/60 text-gray-600 hover:border-black/20 hover:bg-white disabled:opacity-50"
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
    return <div className="admin-card h-52 animate-pulse bg-white/50" />;
  if (applications.isError)
    return <p className="text-sm text-red-600">{applications.error.message}</p>;

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="admin-kicker">Participant management</p>
          <h1 className="admin-title">Applications</h1>
          <p className="admin-subtitle">Review applicants, send decisions, and see who has arrived.</p>
        </div>
        {statusMode.data?.mode === "test" && (
          <span className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800 ring-1 ring-inset ring-amber-600/15">
            Test mode · no status changes
          </span>
        )}
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ["Total", applications.data?.length ?? 0],
          ["Pending", applications.data?.filter((app) => (app.publicStatus ?? "pending") === "pending").length ?? 0],
          ["Approved", applications.data?.filter((app) => app.publicStatus === "accepted").length ?? 0],
          ["Checked in", applications.data?.filter((app) => app.checkedIn).length ?? 0],
        ].map(([label, value]) => (
          <div key={label} className="admin-card px-5 py-4">
            <p className="text-xs font-medium text-gray-500">{label}</p>
            <p className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-gray-950">{value}</p>
          </div>
        ))}
      </div>

      {statusMode.data?.mode === "test" && (
        <div className="mb-5 rounded-2xl border border-amber-200/70 bg-amber-50/80 p-4 text-sm text-amber-950 shadow-sm">
          {statusMode.data.testRecipientConfigured
            ? "Decision emails go only to the configured test recipient."
            : "Email dry run is active. Templates are validated, but no email is sent."}
        </div>
      )}

      {resultMessage && (
        <div
          className={`mb-5 rounded-2xl border p-4 text-sm shadow-sm ${
            resultMessage.kind === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
          role="status"
        >
          {resultMessage.text}
        </div>
      )}
      <div className="space-y-6">
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
