"use client";

import { trpc } from "@/utils/trpc";
import Link from "next/link";
import { useParams } from "next/navigation";

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-400">
        {label}
      </dt>
      <dd className="mt-1.5 break-words text-sm text-gray-900">
        {value || "—"}
      </dd>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="admin-card p-5 sm:p-6">
      <h2 className="mb-5 text-[15px] font-semibold tracking-[-0.02em] text-gray-950">
        {title}
      </h2>
      <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">{children}</dl>
    </section>
  );
}

function formatValue(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") return "—";
  return String(value).replaceAll("_", " ");
}

function yesNo(value: boolean | null | undefined) {
  if (value === null || value === undefined) return "—";
  return value ? "Yes" : "No";
}

export default function ParticipantProfilePage() {
  const params = useParams<{ applicationId: string }>();
  const applications = trpc.applications.listByEvent.useQuery();
  const participant = applications.data?.find(
    (application) => application.id === params.applicationId,
  );

  if (applications.isLoading) {
    return <div className="admin-card h-72 animate-pulse bg-white/50" />;
  }

  if (applications.isError || !participant) {
    return (
      <div className="admin-card p-6">
        <p className="text-sm font-medium text-red-700">
          {applications.error?.message ?? "Participant profile is unavailable."}
        </p>
        <Link
          href="/dashboard/applications"
          className="mt-4 inline-flex text-sm font-semibold text-gray-700 hover:text-gray-950"
        >
          ← Back to applications
        </Link>
      </div>
    );
  }

  const fullName =
    [participant.profile.firstName, participant.profile.lastName]
      .filter(Boolean)
      .join(" ") || "Participant";
  const dietaryNeeds = [
    participant.dietaryNone && "None",
    participant.dietaryVegetarian && "Vegetarian",
    participant.dietaryVegan && "Vegan",
    participant.dietaryCeliacDisease && "Celiac disease",
    participant.dietaryKosher && "Kosher",
    participant.dietaryHalal && "Halal",
    participant.dietaryNutAllergy && "Nut allergy",
    participant.dietaryOther && "Other",
  ].filter(Boolean);

  return (
    <div>
      <Link
        href="/dashboard/applications"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-gray-950"
      >
        <span aria-hidden="true">←</span>
        Back to applications
      </Link>

      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="admin-kicker">Participant profile</p>
          <h1 className="admin-title">{fullName}</h1>
          <p className="admin-subtitle">
            {participant.applicantEmail ?? "Email unavailable"}
          </p>
        </div>
        <span className="rounded-full bg-gray-950 px-3.5 py-2 text-xs font-semibold capitalize text-white shadow-sm">
          {participant.publicStatus ?? "pending"}
        </span>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Section title="Contact">
          <Detail label="Email" value={participant.applicantEmail} />
          <Detail label="School email" value={participant.schoolEmail} />
          <Detail
            label="Phone number"
            value={participant.phoneNumber ?? participant.profile.phoneNumber}
          />
          <Detail label="Discord" value={participant.discordUsername} />
          <Detail
            label="LinkedIn"
            value={
              participant.linkedinUrl ? (
                <a
                  href={participant.linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-[#b20f70] underline decoration-[#d41486]/30 underline-offset-4 hover:decoration-[#d41486]"
                >
                  View profile ↗
                </a>
              ) : null
            }
          />
          <Detail
            label="GitHub"
            value={
              participant.githubUrl ? (
                <a
                  href={participant.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-[#b20f70] underline decoration-[#d41486]/30 underline-offset-4 hover:decoration-[#d41486]"
                >
                  View profile ↗
                </a>
              ) : null
            }
          />
        </Section>

        <Section title="Education">
          <Detail label="School" value={participant.schoolName} />
          <Detail
            label="Graduation year"
            value={formatValue(participant.graduationYear)}
          />
          <Detail
            label="Level of study"
            value={formatValue(participant.levelOfStudy)}
          />
          <Detail
            label="Education level"
            value={formatValue(participant.educationLevel)}
          />
          <Detail
            label="Major / field of study"
            value={participant.majorFieldOfStudy}
          />
          <Detail
            label="Experience level"
            value={formatValue(participant.experienceLevel)}
          />
        </Section>

        <Section title="Participant details">
          <Detail
            label="Date of birth"
            value={participant.dob ?? participant.profile.dob}
          />
          <Detail
            label="Country of residence"
            value={participant.countryOfResidence}
          />
          <Detail label="Gender" value={participant.gender} />
          <Detail label="Pronouns" value={participant.pronouns} />
          <Detail label="Race / ethnicity" value={participant.raceEthnicity} />
          <Detail
            label="Sexual orientation"
            value={participant.sexualOrientation}
          />
        </Section>

        <Section title="Event preferences">
          <Detail
            label="Team preference"
            value={formatValue(participant.teamPreference)}
          />
          <Detail
            label="T-shirt size"
            value={formatValue(participant.tshirtSize)}
          />
          <Detail
            label="Dietary needs"
            value={dietaryNeeds.length ? dietaryNeeds.join(", ") : "—"}
          />
          <Detail
            label="Checked in"
            value={participant.checkedIn ? "Yes" : "No"}
          />
        </Section>

        <section className="admin-card p-5 sm:p-6 xl:col-span-2">
          <h2 className="mb-5 text-[15px] font-semibold tracking-[-0.02em] text-gray-950">
            Agreements
          </h2>
          <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
            <Detail
              label="MLH code of conduct"
              value={yesNo(participant.mlhCodeOfConductAgreement)}
            />
            <Detail
              label="MLH data sharing"
              value={yesNo(participant.mlhAuthorizedDataShare)}
            />
            <Detail
              label="MLH promotional email"
              value={yesNo(participant.mlhAuthorizedPromoEmail)}
            />
            <Detail
              label="SF Hacks promotional email"
              value={yesNo(participant.sfHacksPromoEmail)}
            />
            <Detail
              label="Photo release"
              value={yesNo(participant.photoReleaseConsent)}
            />
            <Detail
              label="Resume sharing"
              value={yesNo(participant.resumeShareConsent)}
            />
          </dl>
        </section>
      </div>
    </div>
  );
}
