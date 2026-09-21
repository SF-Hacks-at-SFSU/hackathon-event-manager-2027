"use client";

import { useEventSelection } from "@/providers/EventSelectionProvider";
import { trpc } from "@/utils/trpc";
import { QRCodeCanvas } from "qrcode.react";
import { useMemo, useState } from "react";

export default function CheckInPage() {
  const event = useEventSelection();
  const [copyMessage, setCopyMessage] = useState<string | null>(null);
  const mode = trpc.checkIn.mode.useQuery();
  const eventPass = trpc.checkIn.eventPass.useQuery(undefined, {
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
  const applications = trpc.applications.listByEvent.useQuery(undefined, {
    refetchInterval: 2_000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
  });

  const participantPortalUrl = (
    process.env.NEXT_PUBLIC_PARTICIPANT_PORTAL_URL ?? "https://app.sfhacks.io"
  ).replace(/\/$/, "");
  const checkInUrl = useMemo(() => {
    if (!eventPass.data?.token) return null;
    return `${participantPortalUrl}/events/${event.slug}/check-in?token=${encodeURIComponent(eventPass.data.token)}`;
  }, [event.slug, eventPass.data?.token, participantPortalUrl]);

  const acceptedApplications =
    applications.data?.filter(
      (application) => application.publicStatus === "accepted",
    ) ?? [];
  const checkedInApplications =
    acceptedApplications.filter((application) => application.checkedIn) ?? [];

  const formatCheckInTime = (value: string | Date | null) => {
    if (!value) return "Time unavailable";
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  };

  const copyCheckInLink = async () => {
    if (!checkInUrl) return;
    try {
      await navigator.clipboard.writeText(checkInUrl);
      setCopyMessage("Check-in link copied.");
    } catch {
      setCopyMessage("Could not copy the link.");
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="admin-kicker">Event day</p>
          <h1 className="admin-title">Participant self check-in</h1>
          <p className="admin-subtitle">
            Display this QR at the entrance. Accepted participants scan it, sign
            in, and check themselves in.
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-inset ${
            mode.data?.mode === "live"
              ? "bg-emerald-50 text-emerald-800 ring-emerald-600/15"
              : "bg-amber-50 text-amber-800 ring-amber-600/15"
          }`}
        >
          {mode.data?.mode === "live"
            ? "Live check-in"
            : "Test mode · validation only"}
        </span>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {[
          ["Approved", acceptedApplications.length],
          ["Checked in", checkedInApplications.length],
          [
            "Remaining",
            Math.max(
              0,
              acceptedApplications.length - checkedInApplications.length,
            ),
          ],
        ].map(([label, value]) => (
          <div
            key={label}
            className="admin-card px-5 py-4 last:col-span-2 sm:last:col-span-1"
          >
            <p className="text-xs font-medium text-gray-500">{label}</p>
            <p className="mt-1 text-2xl font-semibold tracking-[-0.04em]">
              {value}
            </p>
          </div>
        ))}
      </div>

      {mode.data?.mode === "test" && (
        <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
          Participants can validate the flow, but nobody will be marked as
          checked in until check-in mode is live.
        </div>
      )}

      <section className="admin-card overflow-hidden">
        <div className="border-b border-black/[0.06] px-5 py-5 text-center sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#b20f70]">
            Scan to check in
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-gray-950">
            {event.shortName}
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-gray-500">
            Participants must sign in with the same email used for their
            accepted application. The QR contains no participant information.
          </p>
        </div>

        <div className="flex min-h-[460px] items-center justify-center bg-white p-6 sm:p-10">
          {eventPass.isLoading && (
            <p className="text-sm text-gray-500">Generating secure event QR…</p>
          )}
          {eventPass.isError && (
            <div className="max-w-md rounded-2xl border border-red-200 bg-red-50 p-5 text-center text-sm text-red-800">
              {eventPass.error.message}
            </div>
          )}
          {checkInUrl && (
            <div className="rounded-[2rem] border border-black/[0.08] bg-white p-4 shadow-[0_20px_60px_rgba(0,0,0,0.12)] sm:p-6">
              <QRCodeCanvas
                value={checkInUrl}
                size={320}
                includeMargin
                level="M"
              />
            </div>
          )}
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-black/[0.06] bg-gray-50/70 px-5 py-4 sm:flex-row sm:px-6">
          <p className="text-xs text-gray-500">
            This is the permanent QR for this event. It remains the same after
            refreshing or reopening this page.
          </p>
          <button
            type="button"
            onClick={copyCheckInLink}
            disabled={!checkInUrl}
            className="rounded-full border border-black/[0.1] bg-white px-4 py-2 text-sm font-semibold text-gray-800 transition hover:bg-gray-100 disabled:opacity-50"
          >
            Copy link
          </button>
        </div>
        {copyMessage && (
          <p
            className="px-6 pb-4 text-right text-xs text-gray-500"
            role="status"
          >
            {copyMessage}
          </p>
        )}
      </section>

      <section className="admin-card mt-8 overflow-hidden">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-black/[0.06] px-5 py-5 sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
              Attendance
            </p>
            <h2 className="mt-1 text-lg font-semibold text-gray-950">
              Already checked in
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Live attendance updates automatically every 2 seconds.
            </p>
          </div>
          <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/10">
            {checkedInApplications.length} checked in
          </span>
        </div>

        {applications.isLoading ? (
          <p className="px-5 py-8 text-center text-sm text-gray-500">
            Loading attendance…
          </p>
        ) : applications.isError ? (
          <p className="px-5 py-8 text-center text-sm text-red-700">
            {applications.error.message}
          </p>
        ) : checkedInApplications.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="font-medium text-gray-900">
              Nobody has checked in yet
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Participants appear here after completing self check-in.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-black/[0.055]">
            {checkedInApplications.map((application) => (
              <div
                key={application.id}
                className="flex flex-col gap-2 px-5 py-4 transition hover:bg-black/[0.018] sm:flex-row sm:items-center sm:justify-between sm:px-6"
              >
                <div>
                  <p className="font-medium text-gray-950">
                    {[
                      application.profile.firstName,
                      application.profile.lastName,
                    ]
                      .filter(Boolean)
                      .join(" ") || "Participant"}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    Application {application.id}
                  </p>
                </div>
                <div className="sm:text-right">
                  <p className="text-sm font-medium text-emerald-700">
                    Checked in
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {formatCheckInTime(application.checkedInAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
