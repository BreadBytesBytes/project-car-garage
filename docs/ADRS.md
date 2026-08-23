# Architecture Decision Records — V1 Baseline

Status: **Locked baseline** unless superseded by an explicitly approved ADR.

Material changes must be recorded rather than silently introduced in implementation.

| ADR | Decision | Rationale / consequence |
|---|---|---|
| ADR-001 | Mobile-first product | Core use happens beside the car or at events. |
| ADR-002 | Expo + React Native + TypeScript | Shared iOS/Android/web codebase with strong native-device access. |
| ADR-003 | Supabase/PostgreSQL V1 backend | Managed relational DB/Auth/Storage/RLS with low private-beta cost. |
| ADR-004 | Relational DB over document DB | Vehicle/work/parts/history relationships are strongly relational. |
| ADR-005 | Vehicle identity is separate from current configuration | A VIN-decoded car may be heavily modified or swapped. |
| ADR-006 | VIN is onboarding metadata, not configuration authority | Manual/current configuration wins after onboarding. |
| ADR-007 | Chassis, engine, and transmission may exist independently | Enables swaps such as S13 chassis + BMW M50. |
| ADR-008 | Issues, Tasks, and Maintenance are distinct concepts | Observation ≠ chosen action ≠ recurring service obligation. |
| ADR-009 | Parts include Owned-but-not-installed state | Enables parts backlog and work-readiness recommendations. |
| ADR-010 | Motorsport Events are first-class domain objects | Events drive preparation, maintenance counters, reminders, and planning. |
| ADR-011 | Completed work creates historical records | Preserve build/service history rather than overwrite current state. |
| ADR-012 | Knowledge retains source provenance | Users must be able to inspect where technical guidance originated. |
| ADR-013 | AI contributes zero evidence | AI may synthesize evidence but is not evidence. |
| ADR-014 | Deterministic recommendations precede AI | Cost, predictability, explainability, and testability. |
| ADR-015 | AI is optional and budget-controlled | Core application remains functional without AI. |
| ADR-016 | No dedicated vector DB in V1 | PostgreSQL filters/full-text search are sufficient initially. |
| ADR-017 | No broad autonomous forum crawling in V1 | Avoid quality, licensing, cost, and operational complexity. |
| ADR-018 | No retailer API is a V1 hard dependency | Saved URLs/manual offers make the core workflow useful without API approval. |
| ADR-019 | Offline-tolerant, not fully offline-first | Support practical garage/track connectivity loss without building collaborative sync. |
| ADR-020 | Single-owner permissions for V1 | Avoid premature team/role complexity. |
| ADR-021 | Basic saved URLs are V1; native receive-share is stretch | Copy/paste captures most of the value with less platform-specific work. |
| ADR-022 | Voice recording is V1; transcription optional/on-demand | Audio remains useful without AI cost. |
| ADR-023 | Events support an external URL | Registration/reference pages such as MotorsportReg must remain easy to reopen. |

## ADR change process

When implementation reveals that a locked decision should change:

1. Identify the conflicting FR/AC and affected components.
2. Describe the proposed decision and alternatives.
3. State migration, cost, security, UX, and testing consequences.
4. Get explicit product approval.
5. Add a new ADR that supersedes the old one; do not erase the old history.
6. Update the functional spec/backlog if scope or acceptance behavior changes.
