"use client";

import { RouterOutputs, trpc } from "@/utils/trpc";
import { useMemo, useState } from "react";

type Application = RouterOutputs["applications"]["listByEvent"][number];
type Scope = "approved" | "checked-in" | "all";

const DIETARY_OPTIONS: Array<{
  key: keyof Pick<
    Application,
    | "dietaryNone"
    | "dietaryVegetarian"
    | "dietaryVegan"
    | "dietaryCeliacDisease"
    | "dietaryKosher"
    | "dietaryHalal"
    | "dietaryNutAllergy"
    | "dietaryOther"
  >;
  label: string;
  color: string;
}> = [
  { key: "dietaryNone", label: "No restrictions", color: "#a1a1aa" },
  { key: "dietaryVegetarian", label: "Vegetarian", color: "#22a06b" },
  { key: "dietaryVegan", label: "Vegan", color: "#72b344" },
  { key: "dietaryHalal", label: "Halal", color: "#7367d9" },
  { key: "dietaryKosher", label: "Kosher", color: "#3e8ed0" },
  { key: "dietaryNutAllergy", label: "Nut allergy", color: "#e39b2d" },
  { key: "dietaryCeliacDisease", label: "Celiac disease", color: "#e06b65" },
  { key: "dietaryOther", label: "Other", color: "#d41486" },
];

const STATUS_COLORS: Record<string, string> = {
  pending: "#a1a1aa",
  accepted: "#22a06b",
  waitlisted: "#e39b2d",
  rejected: "#e06b65",
};

function countBy(
  applications: Application[],
  getValue: (application: Application) => string | null | undefined,
) {
  const counts = new Map<string, number>();
  for (const application of applications) {
    const value = getValue(application)?.trim() || "Not provided";
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label));
}

function formatLabel(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function BarChart({
  data,
  total,
  emptyMessage = "No responses in this group yet.",
}: {
  data: Array<{ label: string; value: number; color?: string }>;
  total: number;
  emptyMessage?: string;
}) {
  const max = Math.max(...data.map((item) => item.value), 1);

  if (data.every((item) => item.value === 0)) {
    return <p className="py-10 text-center text-sm text-gray-500">{emptyMessage}</p>;
  }

  return (
    <div className="space-y-4">
      {data.map((item) => (
        <div key={item.label}>
          <div className="mb-1.5 flex items-end justify-between gap-3 text-sm">
            <span className="font-medium text-gray-700">{formatLabel(item.label)}</span>
            <span className="shrink-0 text-xs tabular-nums text-gray-500">
              <strong className="text-sm font-semibold text-gray-950">{item.value}</strong>
              {total > 0 && ` · ${Math.round((item.value / total) * 100)}%`}
            </span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-black/[0.055]">
            <div
              className="h-full min-w-0 rounded-full transition-[width] duration-500"
              style={{
                width: `${(item.value / max) * 100}%`,
                backgroundColor: item.color ?? "#d41486",
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function DonutChart({
  value,
  total,
  label,
}: {
  value: number;
  total: number;
  label: string;
}) {
  const percentage = total ? Math.round((value / total) * 100) : 0;

  return (
    <div className="flex items-center gap-5">
      <div
        className="relative grid size-32 shrink-0 place-items-center rounded-full"
        style={{
          background: `conic-gradient(#d41486 ${percentage}%, rgba(0,0,0,0.06) 0)`,
        }}
        role="img"
        aria-label={`${percentage}% ${label}`}
      >
        <div className="grid size-[6.3rem] place-items-center rounded-full bg-white">
          <span className="text-2xl font-semibold tracking-[-0.04em] text-gray-950">
            {percentage}%
          </span>
        </div>
      </div>
      <div>
        <p className="text-3xl font-semibold tracking-[-0.05em] text-gray-950">
          {value}
        </p>
        <p className="mt-1 text-sm leading-5 text-gray-500">{label}</p>
      </div>
    </div>
  );
}

function ChartCard({
  title,
  description,
  children,
  className = "",
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`admin-card p-5 sm:p-6 ${className}`}>
      <div className="mb-6">
        <h2 className="text-[15px] font-semibold tracking-[-0.02em] text-gray-950">
          {title}
        </h2>
        <p className="mt-1 text-[13px] leading-5 text-gray-500">{description}</p>
      </div>
      {children}
    </section>
  );
}

export default function StatsPage() {
  const [scope, setScope] = useState<Scope>("approved");
  const applications = trpc.applications.listByEvent.useQuery();

  const stats = useMemo(() => {
    const all = applications.data ?? [];
    const scoped = all.filter((application) => {
      if (scope === "checked-in") return application.checkedIn;
      if (scope === "approved") return application.publicStatus === "accepted";
      return true;
    });
    const dietary = DIETARY_OPTIONS.map((option) => ({
      ...option,
      value: scoped.filter((application) => application[option.key] === true).length,
    }));
    const accommodated = scoped.filter((application) =>
      DIETARY_OPTIONS.slice(1).some((option) => application[option.key] === true),
    ).length;
    const missingDietary = scoped.filter((application) =>
      DIETARY_OPTIONS.every((option) => application[option.key] !== true),
    ).length;

    return {
      all,
      scoped,
      dietary,
      accommodated,
      missingDietary,
      checkedIn: scoped.filter((application) => application.checkedIn).length,
      shirtSizes: countBy(scoped, (application) => application.tshirtSize),
      studyLevels: countBy(
        scoped,
        (application) => application.levelOfStudy ?? application.educationLevel,
      ),
      statuses: ["pending", "accepted", "waitlisted", "rejected"].map((status) => ({
        label: status,
        value: all.filter(
          (application) => (application.publicStatus ?? "pending") === status,
        ).length,
        color: STATUS_COLORS[status],
      })),
    };
  }, [applications.data, scope]);

  if (applications.isLoading) {
    return <div className="admin-card h-72 animate-pulse bg-white/50" />;
  }

  if (applications.isError) {
    return <p className="text-sm text-red-600">{applications.error.message}</p>;
  }

  const scopeLabel =
    scope === "approved"
      ? "approved participants"
      : scope === "checked-in"
        ? "checked-in participants"
        : "all applicants";

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="admin-kicker">Event intelligence</p>
          <h1 className="admin-title">Stats</h1>
          <p className="admin-subtitle">
            Live participant totals for food, swag, and event planning.
          </p>
        </div>
        <div
          className="inline-flex rounded-full border border-black/[0.08] bg-white/70 p-1 shadow-sm"
          aria-label="Participant group"
        >
          {(
            [
              ["approved", "Approved"],
              ["checked-in", "Checked in"],
              ["all", "All applicants"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setScope(value)}
              aria-pressed={scope === value}
              className={`rounded-full px-3.5 py-2 text-xs font-semibold transition sm:px-4 ${
                scope === value
                  ? "bg-[#1d1d1f] text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-950"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ["In this view", stats.scoped.length],
          ["Need meal options", stats.accommodated],
          ["Checked in", stats.checkedIn],
          ["Missing diet response", stats.missingDietary],
        ].map(([label, value]) => (
          <div key={label} className="admin-card px-5 py-4">
            <p className="text-xs font-medium text-gray-500">{label}</p>
            <p className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-gray-950">
              {value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ChartCard
          title="Dietary needs"
          description={`Responses from ${scopeLabel}. People may select more than one option.`}
          className="xl:row-span-2"
        >
          <BarChart data={stats.dietary} total={stats.scoped.length} />
          {stats.missingDietary > 0 && (
            <p className="mt-5 rounded-xl bg-amber-50 px-3.5 py-3 text-xs leading-5 text-amber-900 ring-1 ring-inset ring-amber-600/10">
              {stats.missingDietary} participant{stats.missingDietary === 1 ? " has" : "s have"} not provided a dietary response.
            </p>
          )}
        </ChartCard>

        <ChartCard
          title="Meal planning"
          description={`Unique ${scopeLabel} who selected at least one dietary accommodation.`}
        >
          <DonutChart
            value={stats.accommodated}
            total={stats.scoped.length}
            label="people need an accommodated meal"
          />
        </ChartCard>

        <ChartCard
          title="T-shirt sizes"
          description={`Requested sizes across ${scopeLabel}.`}
        >
          <BarChart data={stats.shirtSizes} total={stats.scoped.length} />
        </ChartCard>

        <ChartCard
          title="Application decisions"
          description="Current decision mix across every applicant for this event."
        >
          <BarChart data={stats.statuses} total={stats.all.length} />
        </ChartCard>

        <ChartCard
          title="Study level"
          description={`Education mix across ${scopeLabel}.`}
        >
          <BarChart data={stats.studyLevels} total={stats.scoped.length} />
        </ChartCard>
      </div>
    </div>
  );
}
