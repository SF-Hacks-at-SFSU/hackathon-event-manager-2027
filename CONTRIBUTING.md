# Contributing Guide

## Branching Strategy

- **main** — stable, production-ready. Only merges from `development` that have passed CI.
- **development** — integration branch for the current cycle. Should stay deployable.
- **Feature branches** — `feature/<short-description>`, branched off `development`.
- **Bugfix branches** — `bugfix/<short-description>`, branched off `development`.
- **Ops branches** — `ops/<short-description>` for CI/infra/tooling.

## Branch hygiene

The 2026 repo accumulated 20+ stale/duplicate branches (multiple attempts at the
same fix, merged branches never deleted). To avoid repeating that:

- Delete your branch immediately after your PR merges (GitHub's "Delete branch"
  button on the merged PR, or `git push origin --delete <branch>`).
- If you abandon a branch, close the PR and delete the branch — don't leave it dangling.
- Rebase onto `development` before opening a PR instead of stacking merge commits.

## Workflow

1. Branch off `development` using the naming conventions above.
2. Commit with clear, descriptive messages.
3. Open a PR into `development`. CI must pass (lint, build, tests) before review.
4. Get at least one review from another contributor.
5. Squash-merge, then delete the branch.
6. `development` gets merged into `main` on a regular cadence (not ad hoc).

## Tests are a merge gate, not optional

Every new API feature needs at least one integration test covering its happy
path and one error case. Every new frontend flow with business logic (not
pure presentation) needs a test. CI blocks merge on failing/missing checks —
see `.github/workflows/ci.yaml`.

## Code style

Each app has its own `eslint` + `prettier` config. Run `npm run lint` and
`npm run format` before opening a PR; CI will fail otherwise.
