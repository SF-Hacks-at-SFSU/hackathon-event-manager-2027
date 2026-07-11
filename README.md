# SF Hacks Event Manager (2027)

Centralized full-stack platform for running SF Hacks. This is v2 of the
[2026 event manager](https://github.com/sfsuacm-garden/hackathon-event-manager-web-app),
rebuilt on the same core stack with the gaps from last year closed:
a real admin dashboard (wired to live data, not mocks), a judging system,
and day-of-event tooling.

## Apps

| App | Path | Purpose |
| --- | --- | --- |
| `api` | `app/api` | Express + tRPC + Prisma backend (Postgres via Supabase) |
| `applicant-portal` | `app/applicant-portal` | Hacker-facing: apply, form a team, check in |
| `admin-portal` | `app/admin-portal` | Organizer-facing: review applications, manage teams/events, send comms |
| `judge-portal` | `app/judge-portal` | Judge-facing: view assigned submissions, score against a rubric |

All frontends share the API through generated tRPC types — no REST/OpenAPI drift.

## What's new vs. the 2026 app

- **Judging is a first-class feature**, not just a role enum value: submissions, rubrics, judge assignment, scoring, live leaderboard.
- **Admin portal ships wired to the real API from day one.** In 2026 it was built against mock data on a branch and never merged.
- **Templated, triggered email** (acceptance/rejection/waitlist/confirmation) with a send log, instead of a bare mailer with nothing wired to status changes.
- **Day-of-event tooling**: announcements/schedule, mentor queue, in addition to the QR check-in that already existed.
- **Test coverage is a CI gate**, not an afterthought — see `CONTRIBUTING.md`.

## Getting started

```bash
npm install
cp app/api/.env.example app/api/.env            # fill in Supabase/DB credentials
cp app/applicant-portal/.env.example app/applicant-portal/.env.local
cp app/admin-portal/.env.example app/admin-portal/.env.local
cp app/judge-portal/.env.example app/judge-portal/.env.local

npm run dev:api          # http://localhost:4000
npm run dev:applicant    # http://localhost:3000
npm run dev:admin        # http://localhost:3001
npm run dev:judge        # http://localhost:3002
```

See [ROADMAP.md](./ROADMAP.md) for what's scaffolded vs. what's still to build,
and [CONTRIBUTING.md](./CONTRIBUTING.md) for branching/PR conventions.

## License

MIT — see [LICENSE](./LICENSE).
