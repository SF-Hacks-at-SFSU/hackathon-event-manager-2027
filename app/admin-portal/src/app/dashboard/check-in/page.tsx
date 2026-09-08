"use client";

import { trpc } from "@/utils/trpc";
import QrScanner from "qr-scanner";
import { QRCodeCanvas } from "qrcode.react";
import { useCallback, useEffect, useRef, useState } from "react";

type ScanResult = {
  mode: "test" | "live";
  recorded: boolean;
  alreadyCheckedIn: boolean;
  participant: {
    applicationId: string;
    name: string;
    checkedIn: boolean;
    checkedInAt: string | null;
  };
};

export default function CheckInPage() {
  const utils = trpc.useUtils();
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<QrScanner | null>(null);
  const scanLockedRef = useRef(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualToken, setManualToken] = useState("");
  const [testApplicationId, setTestApplicationId] = useState("");
  const [result, setResult] = useState<ScanResult | null>(null);
  const mode = trpc.checkIn.mode.useQuery();
  const applications = trpc.applications.listByEvent.useQuery(undefined, {
    refetchInterval: 15_000,
  });
  const testPass = trpc.checkIn.testPass.useMutation({
    onSuccess: (data) => {
      setManualToken(data.token);
      setCameraError(null);
      setResult(null);
    },
    onError: (error) => setCameraError(error.message),
  });

  const scan = trpc.checkIn.scan.useMutation({
    onSuccess: (data) => {
      setResult(data as ScanResult);
      setCameraActive(false);
      void utils.applications.listByEvent.invalidate();
    },
    onError: (error) => {
      setCameraError(error.message);
      setCameraActive(false);
    },
    onSettled: () => {
      scanLockedRef.current = false;
    },
  });

  const submitToken = useCallback(
    (token: string) => {
      const normalized = token.trim();
      if (!normalized || scanLockedRef.current) return;
      scanLockedRef.current = true;
      setCameraError(null);
      setResult(null);
      scan.mutate({ token: normalized });
    },
    [scan],
  );

  useEffect(() => {
    if (!cameraActive || !videoRef.current) return;

    const scanner = new QrScanner(
      videoRef.current,
      (scanResult) => submitToken(scanResult.data),
      {
        preferredCamera: "environment",
        highlightScanRegion: true,
        highlightCodeOutline: true,
        returnDetailedScanResult: true,
      },
    );
    scannerRef.current = scanner;
    void scanner.start().catch((error: unknown) => {
      setCameraError(
        error instanceof Error ? error.message : "Camera could not be started",
      );
      setCameraActive(false);
    });

    return () => {
      scanner.stop();
      scanner.destroy();
      scannerRef.current = null;
    };
  }, [cameraActive, submitToken]);

  const reset = () => {
    setResult(null);
    setCameraError(null);
    setManualToken("");
  };

  const checkedInApplications =
    applications.data?.filter((application) => application.checkedIn) ?? [];

  const formatCheckInTime = (value: string | Date | null) => {
    if (!value) return "Time unavailable";
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
            Event day
          </p>
          <h1 className="mt-1 text-2xl font-semibold">Participant check-in</h1>
          <p className="mt-2 text-sm text-gray-500">
            Scan the secure QR shown in an accepted participant’s dashboard.
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            mode.data?.mode === "live"
              ? "bg-emerald-100 text-emerald-900"
              : "bg-amber-100 text-amber-900"
          }`}
        >
          {mode.data?.mode === "live"
            ? "Live check-in"
            : "Test mode · validation only"}
        </span>
      </div>

      {mode.data?.mode === "test" && (
        <>
          <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
            Scans are validated, but nobody will be marked as checked in.
          </div>
          <section className="mb-5 rounded-2xl border p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
              Safe test pass
            </p>
            <h2 className="mt-1 text-lg font-semibold">
              Try an existing applicant
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              This creates a temporary signed pass without accepting or checking
              in the applicant.
            </p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <select
                value={testApplicationId}
                onChange={(event) => setTestApplicationId(event.target.value)}
                className="min-w-0 flex-1 rounded-xl border bg-white px-3 py-2.5 text-sm"
              >
                <option value="">Choose an applicant</option>
                {applications.data?.map((application) => (
                  <option key={application.id} value={application.id}>
                    {[
                      application.profile.firstName,
                      application.profile.lastName,
                    ]
                      .filter(Boolean)
                      .join(" ") || "Participant"}
                    {" · "}
                    {application.publicStatus ?? "pending"}
                  </option>
                ))}
              </select>
              <button
                type="button"
                disabled={!testApplicationId || testPass.isPending}
                onClick={() =>
                  testPass.mutate({ applicationId: testApplicationId })
                }
                className="rounded-xl bg-gray-950 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
              >
                Generate test pass
              </button>
            </div>
            {testPass.data?.token && (
              <div className="mt-5 flex flex-col items-center gap-3 rounded-2xl bg-gray-50 p-5 sm:flex-row sm:items-center">
                <div className="rounded-xl bg-white p-2 shadow-sm">
                  <QRCodeCanvas
                    value={testPass.data.token}
                    size={150}
                    includeMargin
                  />
                </div>
                <div>
                  <p className="font-semibold">
                    {testPass.data.participantName}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Pass generated. Scan this QR from another device, or use
                    Validate below.
                  </p>
                </div>
              </div>
            )}
          </section>
        </>
      )}

      <section className="overflow-hidden rounded-3xl border bg-gray-950">
        <div className="relative flex min-h-80 items-center justify-center">
          {cameraActive ? (
            <video
              ref={videoRef}
              className="h-full min-h-80 w-full object-cover"
              muted
              playsInline
            />
          ) : (
            <div className="p-10 text-center text-white">
              <div className="mx-auto mb-5 grid size-20 place-items-center rounded-3xl border border-white/20 bg-white/10 text-3xl">
                ⌁
              </div>
              <p className="text-lg font-medium">Ready to scan</p>
              <p className="mt-2 text-sm text-gray-400">
                Camera access is used only while this scanner is open.
              </p>
            </div>
          )}
        </div>
        <div className="flex justify-center border-t border-white/10 p-4">
          <button
            type="button"
            onClick={() => {
              reset();
              setCameraActive((active) => !active);
            }}
            disabled={scan.isPending}
            className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-gray-950 disabled:opacity-50"
          >
            {cameraActive ? "Stop camera" : "Start camera"}
          </button>
        </div>
      </section>

      <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-widest text-gray-400">
        <div className="h-px flex-1 bg-gray-200" />
        or paste a test pass
        <div className="h-px flex-1 bg-gray-200" />
      </div>

      <form
        className="flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          submitToken(manualToken);
        }}
      >
        <input
          value={manualToken}
          onChange={(event) => setManualToken(event.target.value)}
          placeholder="sfh1…"
          className="min-w-0 flex-1 rounded-xl border px-3 py-2.5 text-sm"
        />
        <button
          type="submit"
          disabled={!manualToken.trim() || scan.isPending}
          className="rounded-xl bg-gray-950 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
        >
          Validate
        </button>
      </form>

      {cameraError && (
        <div
          className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          role="alert"
        >
          {cameraError}
        </div>
      )}

      {result && (
        <div
          className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-950"
          role="status"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.16em]">
            {result.mode === "test"
              ? "Pass validated · no record changed"
              : result.alreadyCheckedIn
                ? "Already checked in"
                : "Check-in complete"}
          </p>
          <p className="mt-2 text-2xl font-semibold">
            {result.participant.name}
          </p>
          <p className="mt-1 text-sm opacity-70">
            Application {result.participant.applicationId}
          </p>
          <button
            type="button"
            onClick={reset}
            className="mt-4 text-sm font-semibold underline underline-offset-4"
          >
            Scan another participant
          </button>
        </div>
      )}

      <section className="mt-8 overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-200 px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
              Attendance
            </p>
            <h2 className="mt-1 text-lg font-semibold text-gray-950">
              Already checked in
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              This list refreshes automatically every 15 seconds.
            </p>
          </div>
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
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
            <p className="font-medium text-gray-900">Nobody has checked in yet</p>
            <p className="mt-1 text-sm text-gray-500">
              Participants will appear here immediately after a successful scan.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {checkedInApplications.map((application) => (
              <div
                key={application.id}
                className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
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
