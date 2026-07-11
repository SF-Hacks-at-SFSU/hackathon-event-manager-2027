# Roadmap

Status as of 2026-07-11, and what's left before this can run SF Hacks 2027.
The applicant portal is live against a real Supabase project and the admin
portal works end to end locally against the same backend — this is past
"scaffold," but most flows are still MVP-depth, not production-depth, and
the API itself isn't deployed yet. See "Deployed / verified for real" below
for exactly what's actually been proven to work versus what's still
untested assumption.

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
4. **No design system yet.** `admin-portal` and `judge-portal` are plain
   Tailwind, not the shadcn/ui setup `applicant-portal` already has. Decide
   whether to port shadcn over or pick something else before building out
   real UI.
5. **`postcss` moderate advisory** (GHSA-qx2v-qp2m-jg93) via a transitive dep
   inside `next` itself — no non-breaking fix upstream yet. Low real risk for
   this app; re-run `npm audit` when bumping Next.
6. **No test coverage for the new judging/comms logic beyond
   `computeLeaderboard`.** The scoring aggregation is unit tested; assignment,
   template rendering, and the application-status-change email trigger are not.
7. **Mentor queue, sponsor tooling, and a schedule view** were flagged in the
   2026 analysis as day-of-event gaps and are still gaps here — only
   announcements shipped.
8. **Bootstrapping the first organizer is a manual script, not a flow.**
   `app/api/scripts/make-organizer.mjs <profileId> <eventId>` promotes a user
   directly in the database — fine for one tech lead standing up an event,
   not a real invite/admin-management UI. Build that before onboarding more
   organizers.

## Deployed / verified for real (not just locally)

As of 2026-07-11, this is running against real infrastructure, not just
local dev — the applicant sign-in → application → team-creation flow, and
the admin portal (applications review, judging, announcements) both work
end to end against:
- A real Supabase project (Postgres + Auth), schema pushed via `prisma db push`
  through Supabase's session-mode pooler (the direct connection is IPv6-only
  and unreachable from networks without IPv6 egress — use the pooler).
- Resend as custom SMTP (Supabase's built-in mailer rate-limits hard within
  a few sends; `onboarding@resend.dev` works unverified but **only sends to
  the Resend account's own email** — verify a real sending domain before
  applicants use this for real).
- The repo is pushed to `github.com/SF-Hacks-at-SFSU/hackathon-event-manager-2027`
  with CI genuinely green, including `teams.test.ts` passing against a real
  Postgres for the first time ever (it never ran in the 2026 repo's CI at all).
- `app/applicant-portal` deploys to Vercel. Getting there surfaced several
  monorepo-specific build issues now fixed (see git history around
  2026-07-11): Vercel's per-app deploy only installs that one workspace's
  dependencies, not the whole monorepo, so every frontend's build script now
  runs `npm install` inside `../api` before `prisma generate` — needed
  because all three frontends import the API's `AppRouter` *type*, which
  transitively touches everything the API imports (Prisma client, zod
  schemas, `ws`, `@aws-sdk/client-ses`, ...), not just the pieces a
  frontend actually uses.
- **The API itself is not deployed yet.** It's a traditional `app.listen()`
  Express server — Vercel's serverless model fights that pattern. Deploy it
  to Railway (matches what the 2026 app used) or another always-on host,
  not Vercel, to avoid re-fighting this.
- One real, non-obvious OTP detail: this Supabase project's configured
  email-OTP length is **8 digits**, not Supabase's documented default of 6.
  All three portals now read this from an `OTP_LENGTH` constant per app
  instead of a hardcoded `6` — check this value against your own project's
  actual setting if you spin up a different Supabase project.

## Verified via local reproduction (not guessed)

- `app/api`'s full CI job (Postgres service + `auth.uid()`/`pgcrypto` stub +
  `db push` + lint + build + `npm test`) was reproduced with a real local
  Postgres (`brew install postgresql@16`) before trusting it in CI — this
  caught a real gap (the schema's `gen_random_bytes()` default needs the
  `pgcrypto` extension, not just the `auth.uid()` stub) that would have kept
  failing silently otherwise.
- Vercel's scoped, single-workspace install was reproduced locally too
  (wiping `node_modules`, installing only from within one frontend's
  directory) before trusting the monorepo build fix above.
