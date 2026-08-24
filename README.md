# Project Car Garage

Working repository for **Project Car Garage**, a mobile-first personal garage assistant for project, modified, performance, and motorsport vehicles.

> Working title only. This is not the final product brand.

## Product promise

Help an enthusiast answer:

1. What needs attention on my cars?
2. What should I work on next?
3. What other work makes sense while I am already there?
4. What parts, references, and preparation do I need?
5. What has already been done to the car?

The product must remain useful when every AI feature is disabled.

## Read before coding

- [`docs/FUNCTIONAL_SPEC_V1.md`](docs/FUNCTIONAL_SPEC_V1.md) — source of truth.
- [`docs/IMPLEMENTATION_BACKLOG.md`](docs/IMPLEMENTATION_BACKLOG.md) — ordered build plan.
- [`docs/ADRS.md`](docs/ADRS.md) — locked decisions.
- [`docs/FUTURE_IDEAS.md`](docs/FUTURE_IDEAS.md) — deferred scope.
- [`AGENTS.md`](AGENTS.md) — instructions for Codex/coding agents.

## V1 architecture

- Expo + React Native + TypeScript + Expo Router
- Expo SQLite local cache / pending operations
- Supabase Auth + PostgreSQL + Storage + RLS
- NHTSA vPIC for VIN-assisted onboarding
- PostgreSQL filtering/full-text search
- Deterministic recommendation engine first
- Optional, budget-capped AI and transcription later

## Planned monorepo shape

```text
project-car-garage/
├── AGENTS.md
├── README.md
├── docs/
│   ├── FUNCTIONAL_SPEC_V1.md
│   ├── IMPLEMENTATION_BACKLOG.md
│   ├── ADRS.md
│   └── FUTURE_IDEAS.md
├── apps/
│   └── mobile/
├── packages/
│   ├── domain/
│   ├── database/
│   ├── recommendation-engine/
│   ├── knowledge/
│   ├── ai/
│   ├── ui/
│   └── shared/
└── supabase/
    ├── migrations/
    └── functions/
```

Phase 0 creates these code folders without implementing product features.

## Development

Prerequisites: Node.js 24.19.0 and npm 12.

```sh
npm ci
npm run check
npm start
```

Run the universal web shell with `npm run web`, or verify its production bundle
with `npm run export:web`.

Copy `.env.example` to `.env.local` and set the public URL and publishable key
printed by `npm run supabase:status`. Never commit local `.env` files, database
passwords, access tokens, or service-role keys.

## Local Supabase

Install a Docker-compatible container runtime, then run:

```sh
npm run supabase:start
npm run db:reset
npm run db:test
npm run supabase:stop
```

`db:reset` rebuilds the local database and applies every file in
`supabase/migrations` in filename order. A hosted development project must be
created and linked interactively before the first `npx supabase db push`; do
not store the CLI access token or database password in the repository.

## Implementation order

1. Phase 0 — Foundation
2. Phase 1 — Garage Core
3. Phase 2 — Capture & Work
4. Phase 3 — Parts & History
5. Phase 4 — Maintenance & Events
6. Phase 5 — Knowledge
7. Phase 6 — Optional AI & transcription
8. Phase 7 — Polish & acceptance

Do not attempt to build the entire spec in one Codex task.

## Recommended first Codex task

Ask Codex to read the spec and backlog, inspect this repository, and implement **Phase 0 only**. Require it to stop before Phase 1, run all checks, and report deviations.

## Cost target

Private V1 should use free-tier infrastructure wherever practical. AI is optional and must be subject to a hard server-side budget.
