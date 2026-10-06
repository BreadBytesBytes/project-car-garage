# Project Car Garage — V1 Implementation Backlog

Derived from `FUNCTIONAL_SPEC_V1.md`. This file defines the recommended build order. Requirement IDs and acceptance criteria remain authoritative in the functional spec.

## Backlog rules

- Build phases in order unless a dependency explicitly requires otherwise.
- Do not implement Future Ideas as part of V1.
- `Must` requirements define the V1 acceptance boundary.
- Prefer vertical slices that can be demonstrated on a physical phone.
- Add tests as each capability is built.
- AI/transcription are Phase 6; the application must already be useful before they are enabled.
- When a task materially changes an ADR or spec behavior, stop and record the proposed change before implementing it.

## Status vocabulary

Use one of: `TODO`, `IN PROGRESS`, `BLOCKED`, `DONE`, `DESCOPED`.

---

# Phase 0 — Foundation

**Goal:** A secure, testable Expo/Supabase repository with authentication, navigation shell, migrations, RLS, CI, and developer controls. Do not implement Garage features beyond the minimum needed to prove the foundation.

### P0-01 — Initialize monorepo and tooling

- **Status:** DONE
- **Depends on:** none
- **Related:** ADR-001..004, ADR-020, ADR-024; NFR-009..010
- **Work:**
  - Initialize Git repository/project workspace.
  - Create `apps/mobile`, `packages/domain`, `packages/database`, `packages/recommendation-engine`, `packages/knowledge`, `packages/ai`, `packages/ui`, `packages/shared`, `supabase/migrations`, `supabase/functions`.
  - Initialize Expo + React Native + TypeScript + Expo Router in `apps/mobile`.
  - Configure package manager/workspaces and shared TypeScript config.
  - Add `.gitignore`, `.env.example`, formatting/lint config.
- **Tests/checks:** clean install; Expo boots; typecheck/lint commands run.
- **Done when:** a fresh clone can install dependencies and start the mobile/web shell from documented commands.

### P0-02 — Establish CI quality gates

- **Status:** DONE
- **Depends on:** P0-01
- **Related:** NFR-003, NFR-009; Section 17
- **Work:** add CI workflow for install, format check, lint, typecheck, unit tests; no deployment required yet.
- **Tests/checks:** intentionally fail one check locally to verify the script exits non-zero; then restore green state.
- **Done when:** pull requests can be automatically checked for baseline code quality.

### P0-03 — Create Supabase development project and project configuration

- **Status:** DONE
- **Depends on:** P0-01
- **Related:** ADR-003; Section 18
- **Work:** create free Supabase project; add project-scoped Supabase CLI dependency; initialize `supabase/`; document environment variables; do not commit secrets.
- **Tests/checks:** CLI can connect/link to development project; generated config is committed where safe.
- **Done when:** migrations can be applied predictably from the repository.

### P0-04 — Implement authentication foundation

- **Status:** DONE
- **Depends on:** P0-03
- **FR/AC:** FR-ACC-001, FR-ACC-002, FR-ACC-003, FR-ACC-008; AC-001
- **Work:** email/password signup/sign-in/sign-out; authenticated route boundary; create default `My Garage` on account setup.
- **Tests/checks:** auth service unit/integration tests; unauthenticated user cannot access authenticated screens.
- **Done when:** a new account reaches authenticated app shell and owns one default Garage.

### P0-04A — Complete account recovery and credential management

- **Status:** DONE
- **Depends on:** P0-04
- **FR/AC:** FR-ACC-002; FR-SET-001; Security 14.1
- **Work:** password-reset request and native return link; set a recovered password; resend signup confirmation; authenticated email/password updates; neutral signed-out responses that do not reveal whether an account exists.
- **Tests/checks:** auth service and recovery-link parser tests; protected account route; manual email delivery and native deep-link checks on a physical device.
- **Done when:** a user can recover a known-email account and manage credentials without exposing account existence or putting privileged credentials in the client.

### P0-05 — Create first database migration set and ownership model

- **Status:** DONE
- **Depends on:** P0-03
- **FR/AC:** FR-ACC-001..007; Security 14.1
- **Work:** create initial profile/garage ownership tables and common timestamps/UUID conventions; define archive/delete patterns.
- **Tests/checks:** migration applies from empty DB; down/reset path documented if used.
- **Done when:** ownership foundation exists before feature tables are added.

### P0-06 — Implement Row Level Security baseline and isolation tests

- **Status:** DONE
- **Depends on:** P0-05
- **FR/AC:** FR-SET-009; AC-012; NFR-008
- **Work:** enable RLS on exposed user-owned tables; policies based on authenticated ownership; create repeatable cross-user isolation tests.
- **Tests/checks:** User A cannot select/update/delete User B rows using client credentials.
- **Done when:** AC-012 is automated for current tables and pattern is documented for future tables.

### P0-07 — Build five-tab navigation shell + More + Quick Add placeholder

- **Status:** DONE
- **Depends on:** P0-01, P0-04
- **FR/AC:** FR-NAV-001, FR-NAV-002, FR-NAV-006, FR-NAV-008
- **Related:** ADR-024
- **Work:** bottom navigation: Garage, Work, Events, Parts, More; persistent Quick Add affordance; native back hierarchy; empty-state placeholders. Use gluestack-ui as the component foundation and keep shared product components and design tokens in `packages/ui`.
- **Tests/checks:** route tests/smoke navigation on physical device or emulator.
- **Done when:** all primary destinations exist without feature implementation.
- **Follow-up:** TODO — add a visible in-screen Back/Close button to the Quick Add placeholder; retain native header navigation.

### P0-08 — Add feature flag and developer/debug foundation

- **Status:** DONE
- **Depends on:** P0-04
- **FR/AC:** FR-SET-010
- **Work:** simple typed feature-flag service/config; private developer screen; flags for AI, native share, knowledge, debug scoring.
- **Tests/checks:** flag change can hide/show an experimental route or placeholder without code deletion.
- **Done when:** experimental features can be disabled safely.

### P0-09 — Create shared domain/service conventions

- **Status:** TODO
- **Depends on:** P0-01
- **Related:** Appendix B; NFR-009
- **Work:** define service result/error conventions, validation approach, domain types, repository/query boundary, UTC/timezone conventions.
- **Tests/checks:** representative domain type/validator tests.
- **Done when:** Phase 1 can implement features without putting domain logic inside screens.

### P0-10 — Foundation review checkpoint

- **Status:** TODO
- **Depends on:** P0-01..09
- **Related:** Phase 0 exit
- **Work:** run full checks; review secrets/RLS/navigation/dependency setup; update README setup commands.
- **Done when:** Codex `/review` or equivalent review finds no unresolved high-priority foundation issues and Phase 1 may begin.

---

# Phase 1 — Garage Core

**Goal:** Complete **AC-001** as the first vertical slice, then make Garage Home and Vehicle Overview useful with real persisted data.

### P1-01 — Vehicle schema and VehicleService

- **Status:** TODO
- **Depends on:** Phase 0
- **FR/AC:** FR-VEH-001..011; AC-001, AC-008
- **Work:** migrations/types/services for vehicles, mileage history, components, modifications, usage profiles; RLS policies.
- **Tests:** CRUD ownership; component swaps; mileage history append behavior.

### P1-02 — Manual vehicle onboarding vertical slice

- **Status:** TODO
- **Depends on:** P1-01
- **FR/AC:** FR-VEH-001..009; AC-001
- **Work:** manual year/make/model; stock/modified/swapped progressive disclosure; mileage; usage; optional modifications; skip advanced fields.
- **Tests:** user can add simple stock car in minimal flow; swapped path stores independent engine/chassis.
- **Done when:** **AC-001 passes on a physical phone.**

### P1-03 — VIN-assisted onboarding

- **Status:** TODO
- **Depends on:** P1-02
- **FR/AC:** FR-VEH-001, FR-VEH-002; ADR-006
- **Work:** vPIC adapter; VIN decode error/fallback handling; decoded identity flows into same confirmation screen as manual entry.
- **Tests:** mocked success/failure/partial VIN responses; manual edit always available.

### P1-04 — Vehicle configuration editor

- **Status:** TODO
- **Depends on:** P1-01, P1-02
- **FR/AC:** FR-VEH-003..008; AC-008
- **Work:** edit chassis/engine/transmission, original/swapped/unknown history, modifications, usage; preserve history fields.
- **Tests:** S13 + M50 configuration survives reload and remains distinct from VIN/original identity.

### P1-05 — Mileage update/history

- **Status:** TODO
- **Depends on:** P1-01
- **FR/AC:** FR-VEH-006
- **Work:** simple mileage update action; timestamped history; validation for obvious bad values while permitting corrections through controlled operation.
- **Tests:** updates append history; current mileage reflects latest accepted record.

### P1-06 — Initial maintenance-baseline data model placeholder

- **Status:** TODO
- **Depends on:** P1-01
- **FR/AC:** FR-VEH-009, FR-VEH-010
- **Work:** capture known/unknown/needs-attention/not-applicable baseline statuses without full recurring maintenance engine yet.
- **Tests:** unknown never auto-maps to overdue.

### P1-07 — Garage Home

- **Status:** TODO
- **Depends on:** P1-01
- **FR/AC:** FR-HOME-001..004
- **Work:** vehicle-centric cards, sorting scaffold by attention, event/parts counters as zero/placeholder until later phases, optional photo/nickname.
- **Tests:** multiple vehicles render in stable order; no health percentage exists.

### P1-08 — Vehicle Overview

- **Status:** TODO
- **Depends on:** P1-07
- **FR/AC:** FR-HOME-005..008
- **Work:** scrollable sections: Needs Attention, Current Work, Parts Ready, Upcoming Event, Maintenance, Recent History, configuration summary, Plan My Next Work Session placeholder.
- **Tests:** sections handle empty states and vehicle context correctly.

### P1-09 — Archive/delete vehicle flows

- **Status:** TODO
- **Depends on:** P1-01, P1-07
- **FR/AC:** FR-ACC-006, FR-ACC-007
- **Work:** archive removes from active default view while preserving data; delete uses controlled confirmation/service operation.
- **Tests:** archived vehicle remains retrievable; direct raw delete is not exposed through UI.

### P1-10 — Phase 1 acceptance/review

- **Status:** TODO
- **Depends on:** P1-01..09
- **Work:** execute AC-001; physical mobile test; verify RLS for vehicle tables; run review.

---

# Phase 2 — Capture & Work

**Goal:** Make the app useful during real garage work: quick capture, Issues, Tasks, deterministic readiness, Work Plans, Work Mode, photos, and voice recording.

### P2-01 — Inbox schema and InboxService

- **Status:** TODO
- **Depends on:** Phase 1
- **FR/AC:** FR-INBOX-001..010; AC-002, AC-014
- **Work:** raw capture, context IDs, saved URL, attachments, classification metadata, processed/dismissed state; RLS.
- **Tests:** original raw capture persists after processing.

### P2-02 — Quick Add text + contextual capture

- **Status:** TODO
- **Depends on:** P2-01
- **FR/AC:** FR-INBOX-001..004, FR-INBOX-007
- **Work:** global Quick Add, inherited Vehicle/Event/Work context, immediate save, simple offline local queue path.
- **Tests:** capture from Garage and Vehicle contexts.

### P2-03 — Quick Add URL capture / private reference input

- **Status:** TODO
- **Depends on:** P2-01
- **FR/AC:** FR-INBOX-003, FR-INBOX-010; AC-014
- **Work:** paste URL, optional note, context, destination suggestion later; no metadata scraper required.
- **Tests:** valid/invalid URL handling; URL reopens.

### P2-04 — Media attachments: photos and voice recording

- **Status:** TODO
- **Depends on:** P2-01
- **FR/AC:** FR-INBOX-003; FR-SET-006; AC-010 partial
- **Work:** contextual permission requests; local-first attachment record; Expo audio recording/playback; photo capture/picker; pending upload state.
- **Tests:** recording works with AI disabled; offline local attachment survives app restart.

### P2-05 — Garage Inbox review and manual classification

- **Status:** TODO
- **Depends on:** P2-01..04
- **FR/AC:** FR-INBOX-005..009; AC-002
- **Work:** destinations Issue, Task, Part, Research, Note; advisory suggested type placeholder; process/dismiss; no Inbox Zero nagging.
- **Tests:** convert raw offline capture into Issue without losing source capture.

### P2-06 — Issue model and flows

- **Status:** TODO
- **Depends on:** P2-05
- **FR/AC:** FR-WORK-001..004; FR-HIST-007
- **Work:** Issue statuses; monitoring; notes/attachments; create Task from Issue; resolve/dismiss; no automatic diagnosis.
- **Tests:** one Issue → multiple Tasks; Task completion does not auto-resolve Issue.

### P2-07 — Task model, blockers, priorities, relations

- **Status:** TODO
- **Depends on:** P2-06
- **FR/AC:** FR-WORK-005..011
- **Work:** states/priorities; blockers; task relations; required/optional part relationship placeholder; tools/supplies list; duration bucket.
- **Tests:** dependency and blocker transitions; priority vocabulary.

### P2-08 — Deterministic Task readiness engine

- **Status:** TODO
- **Depends on:** P2-07
- **FR/AC:** FR-WORK-006; ADR-014
- **Work:** infer Ready/Blocked from known dependencies and required Part states; no AI.
- **Tests:** ordered required Part blocks; owned required Part can unblock when other blockers clear.

### P2-09 — Work Plan model and planner basics

- **Status:** TODO
- **Depends on:** P2-07
- **FR/AC:** FR-PLAN-001..006
- **Work:** create from Task/manual/Vehicle; sequence Tasks; optional date/time bucket; readiness; checklist steps distinct from Tasks.
- **Tests:** ordering/dependency consistency; descriptive readiness only.

### P2-10 — Deterministic recommendation engine v1

- **Status:** TODO
- **Depends on:** P2-07, P2-09
- **FR/AC:** FR-PLAN-003; Section 9; AC-003 foundation
- **Work:** configurable scoring for same access area, due maintenance placeholder, owned related Part placeholder, task relation, severity, event relevance; feedback table; top-three cap; reason strings.
- **Tests:** scoring deterministic; rejected suggestion suppressed in same context; AI never called.

### P2-11 — Work Mode

- **Status:** TODO
- **Depends on:** P2-09
- **FR/AC:** FR-PLAN-007..009
- **Work:** simplified large controls; Start; current Task/checklist; notes/photos/voice; Found Something; blocked/partial completion.
- **Tests:** Found Something inherits Work Plan context; incomplete Task can remain after finishing session.

### P2-12 — Phase 2 acceptance/review

- **Status:** TODO
- **Depends on:** P2-01..11
- **Work:** execute AC-002 and partial AC-003/004/010; garage-session physical-device test; offline capture test.

---

# Phase 3 — Parts & History

**Goal:** Complete the Parts lifecycle, saved offers, transactional Work completion, historical records, attachments, and deterministic search.

### P3-01 — Part / VehiclePart schema and lifecycle

- **Status:** TODO
- **Depends on:** Phase 2
- **FR/AC:** FR-PART-001..006; AC-004
- **Work:** Part identity + vehicle-specific state; Wanted/Researching/Ordered/Owned/Installed and optional terminal states; fitment scope/status; task relations; RLS.
- **Tests:** lifecycle transition tests; part may exist without Task.

### P3-02 — Parts screens and Ready-to-Install UX

- **Status:** TODO
- **Depends on:** P3-01
- **FR/AC:** FR-PART-003..006
- **Work:** global and vehicle Parts views grouped by state; fast add; Ready to Install prominence.
- **Tests:** filters/status counts and context.

### P3-03 — Manual retailer offers and delivered cost

- **Status:** TODO
- **Depends on:** P3-01
- **FR/AC:** FR-PART-007..011; AC-014
- **Work:** saved product URL, retailer/seller, item/shipping/tax/fees, destination region, delivery estimate; compute known delivered total; no retailer API dependency.
- **Tests:** partial cost data handled without false total; shopping location stores only minimal location.

### P3-04 — Integrate Parts with Task readiness and recommendations

- **Status:** TODO
- **Depends on:** P3-01, P2-08, P2-10
- **FR/AC:** FR-WORK-006, FR-PLAN-003, FR-PART-012; AC-003, AC-004
- **Work:** owned required Parts contribute readiness; owned related Parts contribute recommendation score/reason.
- **Tests:** **AC-003** wheel studs/lug nuts case without AI; **AC-004** ordered→owned readiness case.

### P3-05 — WorkRecord/Attachment/Note persistence

- **Status:** TODO
- **Depends on:** P2-11
- **FR/AC:** FR-HIST-001..006
- **Work:** historical records; generic attachments; notes and audio linkage; preserve installed/removed history.
- **Tests:** attachment ownership/RLS; historical state not overwritten by current configuration edits.

### P3-06 — Transactional `completeWorkPlan`

- **Status:** TODO
- **Depends on:** P3-01, P3-05, P2-09
- **FR/AC:** FR-PLAN-010, FR-WORK-012, FR-PART-012; AC-005
- **Work:** server-side business operation updates selected Tasks, installed Parts, Work Records, mileage, applicable maintenance hooks/event readiness hooks; partial completion supported.
- **Tests:** integration test rollback on failure; idempotency/retry strategy; **AC-005**.

### P3-07 — Vehicle History timeline

- **Status:** TODO
- **Depends on:** P3-05, P3-06
- **FR/AC:** FR-HIST-001..010
- **Work:** meaningful timeline; filters; Work/Issue/Part/config changes; no low-value audit noise; correction operation.
- **Tests:** timeline order; correction preserves valid relationships.

### P3-08 — Deterministic global search v1

- **Status:** TODO
- **Depends on:** P3-05
- **FR/AC:** FR-NAV-003, FR-NAV-004, FR-HIST-008; AC-013
- **Work:** PostgreSQL search over available Vehicles/Issues/Tasks/Work Plans/Parts/part numbers/records/notes/URLs; vehicle-scoped search.
- **Tests:** **AC-013** for currently implemented entity types.

### P3-09 — Phase 3 acceptance/review

- **Status:** TODO
- **Depends on:** P3-01..08
- **Work:** run AC-003, AC-004, AC-005, AC-010 partial, AC-013 partial, AC-014; security/retry review.

---

# Phase 4 — Maintenance & Events

**Goal:** Make maintenance and event preparation interact with Work and Parts deterministically.

### P4-01 — Maintenance rule/instance schema and calculation engine

- **Status:** TODO
- **Depends on:** Phase 3
- **FR/AC:** FR-MAINT-001..012
- **Work:** origin/source/version; mileage/time/event/manual/combined triggers; component scope; unknown/current/due states; deterministic calculator.
- **Tests:** interval boundaries; combined trigger; unknown ≠ overdue.

### P4-02 — Maintenance baseline and previous-service flow

- **Status:** TODO
- **Depends on:** P4-01, P1-06
- **FR/AC:** FR-MAINT-003..004
- **Work:** upgrade Phase 1 baseline into real rules/instances; record previous service; personalized interval override preserving source recommendation.
- **Tests:** baseline recalculation.

### P4-03 — Maintenance UI + Why view + inspection outcomes

- **Status:** TODO
- **Depends on:** P4-01
- **FR/AC:** FR-MAINT-009..011
- **Work:** due/upcoming/current/unknown presentation; Why source/schedule/last completion; Good/Monitor/Needs Attention inspection results.
- **Tests:** source displayed; Needs Attention can offer Issue creation without auto-diagnosis.

### P4-04 — Complete Maintenance → WorkRecord → next instance

- **Status:** TODO
- **Depends on:** P4-01, P3-05
- **FR/AC:** FR-MAINT-010
- **Work:** server-side completion; WorkRecord; next instance calculation; Parts/consumables attachment.
- **Tests:** repeated interval generation.

### P4-05 — Event schema + EventTemplate system

- **Status:** TODO
- **Depends on:** Phase 3
- **FR/AC:** FR-EVT-001..006; AC-006
- **Work:** event types, venue, URL, status, templates/checklist, phased target buckets, blocker confirmation.
- **Tests:** Event URL preserved; late-created event collapses phases appropriately.

### P4-06 — Event preparation engine

- **Status:** TODO
- **Depends on:** P4-01, P4-05, P2-10, P3-04
- **FR/AC:** FR-EVT-003..007
- **Work:** combine template, maintenance, open Issues/Tasks, Parts, blockers; no AI; Plan Remaining Prep passes Event context to planner.
- **Tests:** user-confirmed blocker behavior; completed recent maintenance is not redundantly required.

### P4-07 — Event Day and event completion

- **Status:** TODO
- **Depends on:** P4-05
- **FR/AC:** FR-EVT-009..011; AC-007
- **Work:** simplified checklist; Quick Add context; text/voice/photo observations; usage record on completion.
- **Tests:** completion increments event count and can trigger maintenance due; **AC-007**.

### P4-08 — Notifications and deep links

- **Status:** TODO
- **Depends on:** P4-01, P4-05
- **FR/AC:** FR-SET-002; FR-NAV-005; External Integrations 13.4
- **Work:** contextual permission; presets; maintenance/event/work reminders; taps open target route.
- **Tests:** permission denied gracefully; deep-link route test.

### P4-09 — Device calendar actions

- **Status:** TODO
- **Depends on:** P4-05, P2-09
- **FR/AC:** FR-EVT-008; AC-006
- **Work:** user-triggered Add to Calendar for Event and dated Work Plan; contextual calendar permission.
- **Tests:** denied permission; successful create/update behavior as supported.

### P4-10 — Phase 4 acceptance/review

- **Status:** TODO
- **Depends on:** P4-01..09
- **Work:** execute AC-006 and AC-007; test notification fatigue basics; physical Event Day flow.

---

# Phase 5 — Knowledge & Sources

**Goal:** Add a narrow, curated, source-backed knowledge system that can apply independently to chassis/engine/modifications and surface contextually.

### P5-01 — Knowledge schema and admin/seed path

- **Status:** TODO
- **Depends on:** Phase 4
- **FR/AC:** FR-KNOW-001..012; AC-009
- **Work:** KnowledgeSource, KnowledgeClaim, claim-source relations, applicability, evidence label, review/version/retire status; separate product dataset from user garage data.
- **Tests:** user cannot promote private reference into published knowledge through normal client path.

### P5-02 — Private References / Research integration

- **Status:** TODO
- **Depends on:** P2-03, P5-01
- **FR/AC:** FR-KNOW-009, FR-INBOX-010; AC-014
- **Work:** save forum/product/video/technical URLs privately; attach to vehicle/task/research; reopen originals.
- **Tests:** private by RLS; URLs survive history/context changes.

### P5-03 — Applicability resolver

- **Status:** TODO
- **Depends on:** P5-01, P1-04
- **FR/AC:** FR-KNOW-006; FR-MAINT-008; AC-008
- **Work:** exact/likely/related applicability across platform/chassis/engine/transmission/modification/usage.
- **Tests:** S13/M50 receives M50 claim independently of S13 claim; stock FR-S does not receive M50 claim.

### P5-04 — Knowledge UI and evidence presentation

- **Status:** TODO
- **Depends on:** P5-01, P5-03
- **FR/AC:** FR-KNOW-002..008; AC-009
- **Work:** evidence label; applicability; original sources; Known Issue disclaimer; conflicting evidence presentation; contextual references.
- **Tests:** **AC-009**; AI is not listed as evidence.

### P5-05 — Seed curated V1 dataset

- **Status:** TODO
- **Depends on:** P5-01
- **Related:** Appendix C
- **Work:** small traceable dataset for 2013 FR-S/BRZ/FA20; Street + Track Day templates; Autocross template; S13/M50 applicability test content; wheel/hub/brakes, suspension/alignment, fluids relationships.
- **Tests:** every published claim has source and applicability; community claims labeled appropriately.

### P5-06 — Knowledge-aware deterministic recommendations

- **Status:** TODO
- **Depends on:** P5-03, P2-10
- **FR/AC:** Section 9; FR-KNOW-011
- **Work:** knowledge can contribute a reason/candidate but never auto-create Task/Maintenance; source link preserved.
- **Tests:** recommendation requires user action to become stateful work.

### P5-07 — Phase 5 acceptance/review

- **Status:** TODO
- **Depends on:** P5-01..06
- **Work:** execute AC-008 and AC-009; source/licensing review of seed data.

---

# Phase 6 — Optional AI & Transcription

**Goal:** Add low-frequency AI enhancements only after the zero-AI product is already working.

### P6-01 — AI Gateway and server-side budget policy

- **Status:** TODO
- **Depends on:** Phase 5
- **FR/AC:** FR-SET-003..005; Section 10; AC-011
- **Work:** provider interface; permitted-operation registry; model/input/output limits; cache hook; usage/cost table; monthly cap; graceful fallback.
- **Tests:** disabled mode; exhausted budget; provider error; no expensive silent fallback; **AC-011**.

### P6-02 — Rule-first Inbox classification + optional AI fallback

- **Status:** TODO
- **Depends on:** P6-01, P2-05
- **FR/AC:** FR-INBOX-006
- **Work:** deterministic keyword/heuristic classifier; low-confidence optional AI structured output; advisory only.
- **Tests:** obvious inputs never call AI; ambiguous output validated before display.

### P6-03 — On-demand transcription

- **Status:** TODO
- **Depends on:** P6-01, P2-04
- **FR/AC:** FR-SET-006..008; AC-010
- **Work:** TranscriptionProvider abstraction; explicit Transcribe action; editable transcript; original audio retained; retry/failure behavior.
- **Tests:** **AC-010** end-to-end; audio remains playable if transcription fails.

### P6-04 — On-demand source summarization

- **Status:** TODO
- **Depends on:** P6-01, P5-04
- **FR/AC:** Section 10.3; FR-KNOW-005
- **Work:** retrieved sources only; cache stable summary; label AI-assisted; sources remain primary/evidence independent.
- **Tests:** no source = no unsupported technical summary; summary never changes evidence label by itself.

### P6-05 — Optional candidate Knowledge Claim extraction

- **Status:** TODO
- **Depends on:** P6-01, P5-01
- **FR/AC:** Section 10.3; Knowledge lifecycle
- **Work:** structured draft candidate only; admin review required; no auto-publish.
- **Tests:** extracted claim status is Draft and has source linkage.

### P6-06 — Optional less-obvious related-work reasoning

- **Status:** TODO
- **Depends on:** P6-01, P2-10
- **FR/AC:** Section 10.3
- **Work:** only after deterministic candidates; bounded context; advisory; label reason source; no silent state mutation.
- **Tests:** AI disabled path identical to deterministic product; accepted suggestion still requires user action.

### P6-07 — AI settings/usage/debug UI

- **Status:** TODO
- **Depends on:** P6-01
- **FR/AC:** FR-SET-003..005, FR-SET-010
- **Work:** Off/On-demand/Enhanced if enabled; usage estimate; private budget/debug controls.
- **Tests:** toggles enforced server-side, not merely hidden client UI.

### P6-08 — Phase 6 acceptance/review

- **Status:** TODO
- **Depends on:** P6-01..07
- **Work:** execute AC-010, AC-011; verify zero-AI regression suite still passes.

---

# Phase 7 — Offline Recovery, Accessibility, Acceptance, and Private Beta

**Goal:** Turn the feature-complete implementation into a robust private V1.

### P7-01 — SQLite cache model and hydration

- **Status:** TODO
- **Depends on:** earlier phases
- **FR/AC:** Section 12; NFR-002..003
- **Work:** cache vehicles/config summary, open Tasks/Work Plans, Events/checklists, Parts, Maintenance summary, recent history.
- **Tests:** primary cached screens render while offline after prior sync.

### P7-02 — Pending operation queue and retry

- **Status:** TODO
- **Depends on:** P7-01
- **FR/AC:** Section 12; AC-002
- **Work:** queued supported mutations, retry_count/last_error, last-write-wins for ordinary fields; append-oriented history.
- **Tests:** kill network during Quick Add, mileage update, checklist, Issue creation; recover without data loss.

### P7-03 — Media upload recovery

- **Status:** TODO
- **Depends on:** P2-04, P7-02
- **FR/AC:** Sections 10.6, 12.6
- **Work:** local file first; pending upload; retry after reconnect/restart; avoid dangling user-visible loss.
- **Tests:** photo and voice note captured offline then uploaded later.

### P7-04 — Transaction boundary/offline safeguards

- **Status:** TODO
- **Depends on:** P3-06, P7-02
- **Related:** Section 12.5
- **Work:** prevent unsafe multi-entity completion offline when transactional semantics cannot be guaranteed; provide clear queued/online-required UX.
- **Tests:** no partial Work Plan completion corruption.

### P7-05 — Accessibility pass

- **Status:** TODO
- **Depends on:** feature-complete UI
- **FR/AC:** FR-NAV-009; NFR-007
- **Work:** touch targets, screen-reader labels, contrast, dynamic text where practical, status not color-only, Work/Event mode usability.
- **Tests:** accessibility inspection on primary journeys.

### P7-06 — Permissions/privacy/security pass

- **Status:** TODO
- **Depends on:** all features
- **FR/AC:** FR-ACC-005; FR-SET-009; Section 14; AC-012
- **Work:** contextual camera/mic/notification/calendar prompts; secret scan; RLS complete; VIN/private defaults; minimal shopping location.
- **Tests:** full RLS suite; denied-permission flows.

### P7-07 — Complete global search coverage

- **Status:** TODO
- **Depends on:** all searchable feature phases
- **FR/AC:** FR-NAV-003..004; AC-013
- **Work:** include Maintenance, Events, Research/References, Knowledge Claims, transcripts when present.
- **Tests:** final AC-013 matrix.

### P7-08 — Seed/demo/private-beta data

- **Status:** TODO
- **Depends on:** feature complete
- **Related:** Appendix C
- **Work:** repeatable dev seed for FR-S example, S13/M50 swapped example, parts/work/event/maintenance/knowledge scenarios; never use real private production data in tests.
- **Tests:** reset/seed works predictably.

### P7-09 — Execute acceptance criteria AC-001 through AC-014

- **Status:** TODO
- **Depends on:** P7-01..08
- **Work:** maintain an acceptance-results checklist with automated/manual evidence; fix blockers rather than waiving Must behavior silently.
- **Done when:** all V1 Must acceptance criteria pass or an explicitly approved spec change exists.

### P7-10 — Private V1 release checklist

- **Status:** TODO
- **Depends on:** P7-09
- **Work:** build/run on primary phone; verify backup/recovery expectations; verify Supabase usage/free-tier state; AI budget configured; developer flags correct; no Future Idea accidentally enabled; final Codex review.
- **Done when:** owner can use the app for a real garage/work/event cycle.

---

# Recommended Codex task sequence

Do **not** ask Codex to build all phases at once. Suggested prompt granularity:

1. P0-01 + P0-02 only.
2. P0-03 through P0-06.
3. P0-07 through P0-10.
4. P1-01 + P1-02 — first vertical slice / AC-001.
5. Remaining Phase 1 in 2–3 focused tasks.
6. Phase 2 in focused feature slices.
7. Continue phase by phase, requiring a review checkpoint at each phase exit.

For every Codex task, include: “Read `AGENTS.md`, the task entry in `docs/IMPLEMENTATION_BACKLOG.md`, and the referenced FR/AC in `docs/FUNCTIONAL_SPEC_V1.md`. Do not implement later backlog tasks.”

# First Codex planning prompt

```text
Read AGENTS.md, docs/FUNCTIONAL_SPEC_V1.md, docs/ADRS.md, docs/FUTURE_IDEAS.md, and docs/IMPLEMENTATION_BACKLOG.md.

Do not implement application code yet.

Review the implementation backlog for internal consistency with the Functional Spec. Identify only material blockers or contradictions. Do not promote Future Ideas into V1.

Then propose the exact file-level implementation plan for tasks P0-01 and P0-02 only, including commands you expect to run and tests/checks you will add. Stop for review before making code changes.
```

# First Codex implementation prompt

```text
Read AGENTS.md and the referenced specification/backlog files.

Implement P0-01 and P0-02 only. Do not begin P0-03 or any product feature.

Create the monorepo/tooling foundation and CI quality gates exactly within the locked V1 architecture. Keep changes minimal and documented. Do not add Future Ideas.

Run formatting, lint, typecheck, and tests. Review the final diff for scope creep and security issues. Report:
1. files created/changed,
2. checks run and results,
3. assumptions,
4. any deviation from the spec,
5. the next backlog task, without implementing it.
```
