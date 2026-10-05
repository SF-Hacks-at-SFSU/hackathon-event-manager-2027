import type { RouterOutputs } from "@/utils/trpc";

export type ApplicationExportRow =
  RouterOutputs["applications"]["listByEvent"][number];

const APPLICATION_COLUMNS: Array<{
  label: string;
  value: (application: ApplicationExportRow) => unknown;
}> = [
  { label: "Application ID", value: (application) => application.id },
  {
    label: "First name",
    value: (application) => application.profile.firstName,
  },
  {
    label: "Last name",
    value: (application) => application.profile.lastName,
  },
  { label: "Email", value: (application) => application.applicantEmail },
  { label: "School email", value: (application) => application.schoolEmail },
  { label: "Phone number", value: (application) => application.phoneNumber },
  { label: "Date of birth", value: (application) => application.dob },
  { label: "School", value: (application) => application.schoolName },
  {
    label: "Graduation year",
    value: (application) => application.graduationYear,
  },
  { label: "Level of study", value: (application) => application.levelOfStudy },
  {
    label: "Education level",
    value: (application) => application.educationLevel,
  },
  { label: "Major", value: (application) => application.majorFieldOfStudy },
  {
    label: "Experience level",
    value: (application) => application.experienceLevel,
  },
  {
    label: "Country of residence",
    value: (application) => application.countryOfResidence,
  },
  {
    label: "Team preference",
    value: (application) => application.teamPreference,
  },
  { label: "T-shirt size", value: (application) => application.tshirtSize },
  { label: "Gender", value: (application) => application.gender },
  { label: "Pronouns", value: (application) => application.pronouns },
  {
    label: "Race / ethnicity",
    value: (application) => application.raceEthnicity,
  },
  {
    label: "Sexual orientation",
    value: (application) => application.sexualOrientation,
  },
  { label: "Age group", value: (application) => application.ageGroup },
  {
    label: "Referral source",
    value: (application) => application.referralSource,
  },
  { label: "LinkedIn", value: (application) => application.linkedinUrl },
  { label: "GitHub", value: (application) => application.githubUrl },
  {
    label: "Discord username",
    value: (application) => application.discordUsername,
  },
  { label: "Dietary: none", value: (application) => application.dietaryNone },
  {
    label: "Dietary: vegetarian",
    value: (application) => application.dietaryVegetarian,
  },
  { label: "Dietary: vegan", value: (application) => application.dietaryVegan },
  {
    label: "Dietary: celiac disease",
    value: (application) => application.dietaryCeliacDisease,
  },
  {
    label: "Dietary: kosher",
    value: (application) => application.dietaryKosher,
  },
  { label: "Dietary: halal", value: (application) => application.dietaryHalal },
  {
    label: "Dietary: nut allergy",
    value: (application) => application.dietaryNutAllergy,
  },
  { label: "Dietary: other", value: (application) => application.dietaryOther },
  {
    label: "Application status",
    value: (application) => application.publicStatus ?? "pending",
  },
  {
    label: "Internal status",
    value: (application) => application.internalStatus,
  },
  { label: "Checked in", value: (application) => application.checkedIn },
  { label: "Checked in at", value: (application) => application.checkedInAt },
  { label: "Submitted at", value: (application) => application.createdAt },
  {
    label: "MLH code of conduct",
    value: (application) => application.mlhCodeOfConductAgreement,
  },
  {
    label: "MLH data sharing",
    value: (application) => application.mlhAuthorizedDataShare,
  },
  {
    label: "MLH promotional email",
    value: (application) => application.mlhAuthorizedPromoEmail,
  },
  {
    label: "SF Hacks promotional email",
    value: (application) => application.sfHacksPromoEmail,
  },
  {
    label: "Photo release",
    value: (application) => application.photoReleaseConsent,
  },
  {
    label: "Resume sharing",
    value: (application) => application.resumeShareConsent,
  },
];

function csvCell(value: unknown) {
  if (value === null || value === undefined) return "";
  const text =
    value instanceof Date
      ? value.toISOString()
      : typeof value === "boolean"
        ? value
          ? "Yes"
          : "No"
        : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

export function downloadApplicationsCsv(
  applications: ApplicationExportRow[],
  eventName: string,
  fileLabel = "registrations",
) {
  const rows = [
    APPLICATION_COLUMNS.map((column) => csvCell(column.label)).join(","),
    ...applications.map((application) =>
      APPLICATION_COLUMNS.map((column) =>
        csvCell(column.value(application)),
      ).join(","),
    ),
  ];
  const blob = new Blob(["\uFEFF", rows.join("\r\n")], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  const eventSlug =
    eventName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "event";
  anchor.href = url;
  anchor.download = `${eventSlug}-${fileLabel}-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
