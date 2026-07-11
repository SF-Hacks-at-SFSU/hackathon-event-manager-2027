# Roadmap

Status of this scaffold as of 2026-07-10, and what's left before it can run
SF Hacks 2027. This is a working baseline (every workspace lints, type-checks,
and builds — see "Verified" below) but most flows are MVP-depth, not
production-depth. Treat this as the starting point for the team, not a
finished app.

## What's carried over from the 2026 app (validated, working logic)

- Auth (Supabase OTP), applicant application flow, team creation/join/leave/kick,
  school lookup, event/eventProfile endpoints — ported from
  `hackathon-event-manager-web-app` with lint fixes and one real bug fix
  (an internal `@supabase/supabase-js/dist/...` import that broke on a
  dependency bump; now typed against the public `SupabaseClient['auth']` API).
- The Prisma schema for events/applications/teams/schools.

## What's new for 2027 (built in this scaffold)

- **Judging**: `Submission`, `Rubric`/`RubricCriterion`, `JudgeAssignment`, `Score`
  models; a `judging` tRPC router (submit project, create rubric, auto-assign
  judges round-robin, submit scores, weighted leaderboard); a judge-portal app
  with an assignment queue + scoring form.
- **Admin portal wired to the real API from day one** (`app/admin-portal`) —
  applications review queue with accept/reject/waitlist actions, rubric
  creation, judge auto-assignment, live leaderboard, announcements CRUD. The
  2026 admin dashboard never got past mock data on an unmerged branch; this
  one talks to the live tRPC router.
- **Triggered, templated email**: `EmailTemplate`/`EmailLog` models,
  `sendTemplatedEmail()` (looks up a template by event+key, renders
  `{{variables}}`, sends via SES, always logs the result). Wired into
  `applications.updateStatus` so accept/reject/waitlist actually sends mail
  instead of requiring a separate manual bulk-email step.
- **Day-of-event announcements** (`Announcement` model + CRUD, read by any
  authenticated participant, written by organizers).
- **`applications.listByEvent`**: the 2026 API had no way for an organizer to
  list applications at all — only `me` (your own) and `createOrUpdate`. Added
  this plus `applications.updateStatus` since the admin review flow needs both.
- **CI actually runs tests.** The 2026 `api-ci.yaml` ran lint + build but never
  `npm test` — the one existing test file was never executed in CI. This
  repo's CI spins up a Postgres service container, stubs Supabase's
  `auth.uid()` so `prisma db push` can create the schema, and runs the suite.

## Known gaps / next steps (in rough priority order)

1. **No role-management flow.** `EventProfile.role` defaults to `hacker` and
   nothing currently promotes a user to `organizer` or `judge` — the 2026 app
   had the same gap. Before this can run a real event, someone needs to build
   an organizer-invite flow (or at minimum a seed script) and a bootstrap path
   for the very first organizer account.
2. **Judge portal assumes a single rubric per event.** `assignments/page.tsx`
   scores against `rubrics[0]`. Multi-track events need either a
   `Submission.trackId` → rubric mapping, or a rubric picker in the judge UI.
3. **Email templates have no seed content.** The `EmailTemplate` table is
   empty until an organizer fills in `application_accepted` /
   `application_rejected` / `application_waitlisted` /
   `application_pending` via `emailTemplates.upsert`. Until then, status
   changes will log a `failed` `EmailLog` row ("no template registered")
   rather than silently doing nothing — check `dashboard` → email logs UI
   (not yet built; currently only queryable via `emailTemplates.logs`).
4. **CI's Postgres-service + `auth.uid()` stub was written but not dry-run
   locally** — this sandbox has neither Docker nor a local Postgres install.
   Verify it end-to-end on the first PR that touches `app/api`.
5. **No design system yet.** `admin-portal` and `judge-portal` are plain
   Tailwind, not the shadcn/ui setup `applicant-portal` already has. Decide
   whether to port shadcn over or pick something else before building out
   real UI.
6. **`postcss` moderate advisory** (GHSA-qx2v-qp2m-jg93) via a transitive dep
   inside `next` itself — no non-breaking fix upstream yet. Low real risk for
   this app; re-run `npm audit` when bumping Next.
7. **No test coverage for the new judging/comms logic beyond
   `computeLeaderboard`.** The scoring aggregation is unit tested; assignment,
   template rendering, and the application-status-change email trigger are not.
8. **Mentor queue, sponsor tooling, and a schedule view** were flagged in the
   2026 analysis as day-of-event gaps and are still gaps here — only
   announcements shipped.

## Verified in this session

- `app/api`: `prisma generate`, `eslint --max-warnings 0`, full `tsup` build
  (incl. `.d.ts` generation, which type-checks), and the DB-independent unit
  test suite (`judging.test.ts`) all pass. The ported `teams.test.ts`
  integration test correctly fails fast (connection refused, no hang) without
  a live Postgres — expected, since none is available in this sandbox.
- `app/applicant-portal`, `app/admin-portal`, `app/judge-portal`: each lints
  and builds (including Next's type-check pass) both standalone and via the
  root `npm install && npm run build` workspace flow.
- Not verified: the CI workflow itself (no Docker/GitHub Actions runner
  available here), and anything requiring a live Supabase project or Postgres
  instance (actual sign-in, actual data round-trips).
