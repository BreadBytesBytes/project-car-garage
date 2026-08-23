**PROJECT CAR GARAGE**

Functional Specification

**Version 1.0**

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>V1 product promise</strong></p>
<p>A mobile-first personal garage assistant that helps enthusiasts understand what their cars need, organize work intelligently, prepare for motorsport events, track parts and maintenance, and build a useful history over time—without requiring AI to function.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

| **Document status**  | Implementation-ready baseline                            |
|----------------------|----------------------------------------------------------|
| **Version**          | 1.0                                                      |
| **Date**             | August 22, 2026                                          |
| **Primary audience** | Product owner, software engineers, coding agents, QA     |
| **Working title**    | Project Car Garage (placeholder; not a final brand name) |

**Scope note:** This specification defines a private, single-owner V1. Professional shop/team workflows, broad social/community functionality, automated retailer aggregation, large-scale forum crawling, and telemetry are intentionally deferred.

# Document Control

This document consolidates the product discovery, architecture decisions, user-experience decisions, technical research, and scope boundaries established before implementation. It is the source of truth for V1 unless superseded by a later approved revision.

| **Version** | **Date**   | **Status** | **Change summary**                                     |
|-------------|------------|------------|--------------------------------------------------------|
| 1.0         | 2026-08-22 | Baseline   | Initial implementation-ready functional specification. |

## How to Use This Specification

- **For implementation:** Use requirement IDs and service boundaries as the default contract; do not add Future Ideas to V1 without an explicit scope decision.

- **For coding agents:** Treat “Locked architecture decisions” and “Non-goals” as constraints, not suggestions.

- **For QA:** Use the acceptance criteria and state transitions to derive automated and manual test cases.

- **For product changes:** When a new requirement conflicts with a locked decision, record the change as an Architecture Decision Record (ADR) rather than silently changing behavior.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>Critical V1 guardrail</strong></p>
<p>AI augments the product; AI does not own the domain logic. If every AI feature is disabled, the user must still be able to manage vehicles, issues, tasks, work plans, parts, maintenance, events, reminders, history, references, and search.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

# Contents

1\. Executive Summary

2\. Product Definition

3\. Scope, Goals, Non-goals and Success Criteria

4\. Users and Primary Workflows

5\. V1 Information Architecture

6\. Technical Architecture

7\. Domain Model and State Machines

8\. Functional Requirements

9\. Recommendation Engine

10\. AI and Transcription Layer

11\. Knowledge, Evidence and Safety Model

12\. Offline and Synchronization

13\. External Integrations

14\. Security, Privacy and Data Ownership

15\. Non-functional Requirements

16\. Observability and Operational Controls

17\. Testing and Acceptance Criteria

18\. Deployment and Cost Constraints

19\. Implementation Phases

20\. Locked Architecture Decisions

21\. Risks and Open Questions

22\. Future Ideas Register

Appendix A. Proposed Data Schema

Appendix B. Service Contracts

Appendix C. Initial Curated Data Strategy

Appendix D. Research References

# 1. Executive Summary

Project Car Garage is a mobile-first personal garage-management application for automotive enthusiasts who own project, modified, performance, or motorsport vehicles. It addresses the cognitive overhead created by multiple cars, incomplete repairs, maintenance obligations, purchased-but-uninstalled parts, upcoming events, and useful technical information scattered across forums, retailer sites, videos, receipts, and personal notes.

The product is intentionally not another social network or generic maintenance tracker. Its defining behavior is to combine structured garage data with deterministic recommendation rules so it can answer four practical questions:

- What needs attention on my cars?

- What should I work on next?

- What other work makes sense while I am already there?

- What parts, references, and preparation do I need to complete the job or attend the next event?

V1 is a private, single-owner product optimized for use beside the car on a phone, with a web-capable client for later review. It supports multiple vehicles, modified and swapped configurations, fast capture, issue/task separation, work planning, parts lifecycle tracking, maintenance, motorsport events, work history, source-backed knowledge, voice notes, saved URLs, notifications, global search, and offline-tolerant operation.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>V1 cost objective</strong></p>
<p>A private single-user V1 should operate on free-tier infrastructure wherever practical. AI and transcription are optional enhancements with server-enforced spending limits. Target recurring infrastructure cost for private testing: approximately $0/month, excluding optional API experimentation.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

# 2. Product Definition

## 2.1 Problem Statement

Automotive enthusiasts often manage maintenance, repairs, upgrades, parts purchases, research, and motorsport preparation across multiple vehicles using disconnected notes, forum bookmarks, shopping carts, calendar entries, text messages, photos, and memory. This fragmentation makes it difficult to prioritize work, recognize dependencies, use already-owned parts, prepare early for events, and preserve reliable service/build history.

## 2.2 Product Vision

Provide one calm, trustworthy place where an enthusiast can model the actual configuration of each car, capture problems quickly, decide what work to perform, group related jobs into practical garage sessions, prepare for events, track parts from research through installation, and retain source-backed knowledge and history.

## 2.3 Product Principles

| **Principle**                     | **Implication**                                                                                                              |
|-----------------------------------|------------------------------------------------------------------------------------------------------------------------------|
| **Reduce cognitive load**         | The app must simplify garage planning rather than recreate enterprise project-management complexity.                         |
| **Mobile first**                  | Common actions must be usable next to the car, at the track, and with poor connectivity.                                     |
| **Capture first, organize later** | Quick Add must allow a thought, observation, photo, voice note, or link to be saved in seconds.                              |
| **Suggestions, not commands**     | The system may suggest related work or maintenance but must preserve user control, particularly for modified vehicles.       |
| **Explain why**                   | Recommendations and maintenance status must expose the reason, source, or rule that produced them.                           |
| **Evidence over AI confidence**   | AI may summarize evidence but never counts as evidence itself.                                                               |
| **Unknown is valid**              | Unknown history is not equivalent to overdue maintenance or a fault.                                                         |
| **History grows automatically**   | Completing work should create documentation without requiring a separate build-log chore.                                    |
| **Private by default**            | Garage data, VINs, media, notes, receipts, and history remain private unless explicitly shared.                              |
| **Simple architecture first**     | V1 uses a monolithic managed architecture; no microservice, Kubernetes, dedicated vector DB, or self-hosted LLM requirement. |

# 3. Scope, Goals, Non-goals and Success Criteria

## 3.1 V1 Scope

- Multiple private vehicles in one garage.

- VIN-assisted or manual vehicle onboarding; current configuration may differ from VIN.

- Chassis, engine, transmission and major modification representation, including swaps.

- Garage Home, Vehicle Overview and global Work/Events/Parts views.

- Quick Add via text, photo, voice note or saved URL; Garage Inbox for later classification.

- Issues, Tasks, blockers/dependencies, Work Plans and simplified Work Mode.

- Parts lifecycle: Wanted → Researching → Ordered → Owned → Installed, plus removal/return states.

- Manual/saved retailer links and delivered-cost fields; no retailer API dependency.

- Mileage/time/event-count maintenance rules and progressive service-history baseline.

- Motorsport Events, phased preparation, blockers, checklists, Event URL and calendar export.

- Automatic Work Records and chronological Vehicle History with photos, audio, receipts/documents and notes.

- Curated, source-backed Knowledge Claims and private saved references.

- Global deterministic text search.

- Notifications, deep links, settings, AI budget controls and feature flags.

- Offline-tolerant core actions and queued synchronization.

## 3.2 Explicit Non-goals for V1

- Professional shop workflow, technicians, labor billing, invoices or race-team collaboration.

- Public social network, comments, followers, public discovery feed or community forums.

- Full OBD, GPS, telemetry, lap timing or race timing integration.

- Large-scale automatic scraping of the automotive internet.

- Automatic diagnosis from symptoms or photos.

- Authoritative universal repair procedures or AI-generated torque/specification values.

- Full automatic price comparison across Amazon, eBay, Summit, RockAuto and other retailers.

- Dedicated vector database, self-hosted LLM infrastructure or always-on AI agent.

- Advanced inventory reservations, tool inventory, consumable stock thresholds or package-carrier integrations.

- Health-score percentages, predictive failure probabilities or opaque trust scores.

## 3.3 Success Criteria

The MVP is successful when an enthusiast can reliably answer the following without leaving the application:

**1.** What needs attention on my cars?

**2.** What should I work on next?

**3.** What parts are ordered or waiting to be installed?

**4.** What should I complete before my next motorsport event?

**5.** What work, maintenance, parts, notes and events have already occurred on this vehicle?

Secondary technical success criteria: the private V1 must remain usable with AI disabled, tolerate intermittent connectivity for core garage actions, preserve source provenance for technical recommendations, and stay within free-tier infrastructure for single-user testing where practical.

# 4. Users and Primary Workflows

## 4.1 Primary Persona

Individual automotive enthusiast who owns one or more project, modified, street-performance, autocross, track-day, drift, drag or race-oriented vehicles. The user performs at least some DIY maintenance or project work and currently relies on a mix of memory, notes, forum searches, retailer sites and calendar reminders.

## 4.2 Future Personas (Out of V1 Scope)

- Small race team / shared garage

- Professional or enthusiast shop

- Build collaborator / friend with read-only access

- Buyer reviewing a shared maintenance/build history

## 4.3 Primary End-to-End Workflow

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>Add vehicle → Confirm actual configuration → Set mileage/usage/modifications →<br />
Establish optional maintenance baseline → Capture issues/ideas/parts →<br />
Plan related work → Gather/receive parts → Perform work in Work Mode →<br />
Complete work → Vehicle history updates automatically →<br />
Upcoming events and maintenance recalculate</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## 4.4 Core User Journeys

| **Journey**                    | **Flow**                                                                                                                                                                                |
|--------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Notice a problem**           | Quick Add observation → Inbox → Issue → optional inspection Task → Work Plan → Work Record → resolve/monitor Issue.                                                                     |
| **Bought a part**              | Quick Add or Parts → mark Ordered/Owned → associate with Task later → surfaced as Ready to Install → installed through completed Work Plan.                                             |
| **Prepare for event**          | Create Event + URL → template + open work/maintenance → choose blockers → Plan Remaining Prep → calendar/reminders → Event Day → post-event notes/issues → maintenance counters update. |
| **Research a modification**    | Save product/forum/video URL → Research item/private reference → compare notes/offers → select part → create Part and/or Task.                                                          |
| **Maintain a swapped vehicle** | Base chassis remains separate from swapped engine/transmission; knowledge and maintenance can apply independently to each component.                                                    |

# 5. V1 Information Architecture

## 5.1 Primary Navigation

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>Garage | Work | Events | Parts | More<br />
[+ Quick Add]</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

Maintenance and Knowledge remain primarily vehicle-centric rather than consuming global navigation slots. Quick Add is globally reachable and carries current context such as Vehicle, Event or Work Plan.

## 5.2 Vehicle Overview Sections

- Needs Attention

- Current Work

- Parts Ready

- Upcoming Event

- Maintenance

- Recent History

- Compact configuration summary

- Plan My Next Work Session

## 5.3 More Menu

- Global Search

- Garage Inbox

- Saved References

- Knowledge

- Archived Vehicles

- Settings

## 5.4 Status Vocabulary

| **Object**      | **V1 states**                                                                               |
|-----------------|---------------------------------------------------------------------------------------------|
| **Issue**       | Needs Review → Monitoring → Action Planned → Resolved / Dismissed                           |
| **Task**        | Backlog → Blocked / Ready → Planned → In Progress → Completed / Canceled                    |
| **Part**        | Wanted → Researching → Ordered → Owned → Installed; optional Removed/Sold/Returned/Canceled |
| **Maintenance** | Unknown → Current → Due Soon → Due → Overdue; Monitoring / Not Applicable where relevant    |
| **Event**       | Planned → Completed / Canceled                                                              |
| **Work Plan**   | Draft → Planned → In Progress → Completed                                                   |

# 6. Technical Architecture

## 6.1 Recommended V1 Stack

| **Layer**          | **Choice**                                                    | **Rationale**                                                                   |
|--------------------|---------------------------------------------------------------|---------------------------------------------------------------------------------|
| **Client**         | Expo + React Native + TypeScript + Expo Router                | Shared iOS/Android/Web codebase with native navigation/deep linking.            |
| **Local storage**  | Expo SQLite                                                   | Persistent cache and pending offline operations.                                |
| **Backend**        | Supabase                                                      | Managed Postgres, Auth, Storage, Data API / functions and scheduled processing. |
| **Database**       | PostgreSQL                                                    | Strong fit for relational vehicle/work/parts/history model.                     |
| **Auth**           | Supabase Auth                                                 | Email/password V1; additional identity providers deferred.                      |
| **Media**          | Supabase Storage                                              | Photos, receipts, audio notes and documents.                                    |
| **Vehicle decode** | NHTSA vPIC                                                    | Convenient VIN onboarding; not configuration authority.                         |
| **Search**         | Postgres filters + full-text search                           | No dedicated vector database in V1.                                             |
| **AI**             | Provider abstraction; current low-cost candidate GPT-5.6 Luna | On-demand only by default, deterministic logic first, hard budget.              |
| **Transcription**  | Provider abstraction; low-cost speech-to-text model           | User-triggered by default; audio remains useful without transcription.          |
| **Notifications**  | Expo Notifications                                            | Local and/or push notifications with deep-link navigation.                      |
| **Calendar**       | Expo Calendar                                                 | User-triggered device calendar integration.                                     |

## 6.2 High-Level Component Model

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>Expo / React Native client<br />
├─ Mobile UI + Expo Router<br />
├─ SQLite cache / pending operations<br />
├─ Camera / audio / calendar / notifications<br />
└─ Sync + application service layer<br />
│ HTTPS<br />
▼<br />
Supabase<br />
├─ Auth<br />
├─ PostgreSQL + Row Level Security<br />
├─ Storage<br />
├─ Server/Edge functions<br />
└─ Scheduled jobs<br />
│<br />
├─ NHTSA vPIC<br />
├─ AI / transcription provider (optional)<br />
└─ external URLs / future retailer providers<br />
<br />
Future optional service: controlled knowledge-ingestion worker</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## 6.3 Architectural Boundaries

- Client code may perform simple CRUD, but multi-entity business operations must use explicit application/service functions.

- Garage data is user-owned private operational data. Product Knowledge is a separate product-managed dataset.

- VIN decode supplies original identity metadata; current chassis/powertrain/modifications are the source of truth for the actual configuration.

- Retailer offers are normalized behind an OfferProvider boundary so no single retailer API is a V1 dependency.

- AI calls are isolated behind an AI Gateway; no screen calls an AI provider directly.

- Completion operations that modify tasks, maintenance, parts, history and event readiness must execute transactionally server-side.

## 6.4 Monorepo Structure

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>/project-car-garage<br />
/apps/mobile<br />
/packages/domain<br />
/packages/database<br />
/packages/recommendation-engine<br />
/packages/knowledge<br />
/packages/ai<br />
/packages/shared<br />
/supabase/migrations<br />
/supabase/functions<br />
/services/knowledge-worker # future, not required V1</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

# 7. Domain Model and State Machines

## 7.1 Core Domain Entities

| **Entity**                 | **Purpose**                                                                              |
|----------------------------|------------------------------------------------------------------------------------------|
| **Garage**                 | User-owned container for active and archived Vehicles.                                   |
| **Vehicle**                | Base identity, VIN optional, nickname, mileage and owner context.                        |
| **VehicleComponent**       | Chassis, engine, transmission, differential or other major current/historical component. |
| **Modification**           | Major modification with category, status and installation history.                       |
| **VehicleUsageProfile**    | Street/motorsport usage modes and primary use.                                           |
| **InboxItem**              | Raw capture awaiting optional classification.                                            |
| **Issue**                  | Observed problem or condition; not a diagnosis.                                          |
| **Task**                   | Action the user intends to perform.                                                      |
| **TaskRelation**           | Blocks, related, same-access-area or recommended-with relationship.                      |
| **Part / VehiclePart**     | Part identity and vehicle-specific lifecycle/purchase/install state.                     |
| **RetailerOffer**          | Saved candidate purchase source and delivered-cost components.                           |
| **WorkPlan**               | A practical garage session grouping Tasks.                                               |
| **WorkRecord**             | Historical record produced when meaningful work/maintenance is completed.                |
| **MaintenanceRule**        | Source-backed or user-defined recurring/inspection rule.                                 |
| **MaintenanceInstance**    | Current due/upcoming/completed instance for a Vehicle/component.                         |
| **Event**                  | Motorsport/show event with date, venue, URL and preparation state.                       |
| **EventChecklistItem**     | Event-preparation item from template, maintenance, task or user input.                   |
| **VehicleUsageRecord**     | Completed event or future telemetry usage signal.                                        |
| **KnowledgeSource**        | External source metadata and provenance.                                                 |
| **KnowledgeClaim**         | Structured claim extracted/curated from one or more sources.                             |
| **KnowledgeApplicability** | Links claims to platform, chassis, engine, transmission, modification or usage.          |
| **Recommendation**         | Generated suggestion with reasons, score and feedback.                                   |
| **Attachment / Note**      | Photo, voice audio, document, receipt or text associated with domain objects.            |

## 7.2 Key Relationships

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>Garage → Vehicles<br />
Vehicle → Components / Modifications / Usage<br />
Vehicle → Issues → Tasks → Work Plans → Work Records<br />
Vehicle → Parts ↔︎ Tasks<br />
Vehicle → Maintenance Rules → Maintenance Instances → Work Records<br />
Vehicle → Events → Event Checklist / Usage Records<br />
Knowledge Sources → Claims → Applicability<br />
Recommendation Engine reads Vehicle + Work + Parts + Maintenance + Events + Knowledge</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## 7.3 Vehicle Configuration Rule

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>Configuration source of truth</strong></p>
<p>A Vehicle is not equivalent to a VIN. VIN-decoded identity and original configuration are onboarding metadata. The current configuration may contain a different engine, transmission or major components, and knowledge/maintenance must be able to apply to those components independently.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

# 8. Functional Requirements

Priority uses Must / Should / Could. “Must” items define the V1 acceptance boundary. “Should” items may be simplified if necessary but remain in V1 unless explicitly descoped. “Could” items are V1 stretch features and must not block release.

## 8.1 Account and Garage

| **ID**         | **Requirement**                                                                                                                           | **Priority** |
|----------------|-------------------------------------------------------------------------------------------------------------------------------------------|--------------|
| **FR-ACC-001** | The system shall require an authenticated user account before storing a persistent garage.                                                | Must         |
| **FR-ACC-002** | V1 shall support email/password authentication.                                                                                           | Must         |
| **FR-ACC-003** | A default “My Garage” shall be created automatically after account creation.                                                              | Must         |
| **FR-ACC-004** | The app shall infer sensible unit, currency and timezone defaults and allow later changes.                                                | Must         |
| **FR-ACC-005** | The app shall not request notification, camera or microphone permission until the related capability is first used.                       | Must         |
| **FR-ACC-006** | A Vehicle may be archived without deleting its history.                                                                                   | Must         |
| **FR-ACC-007** | Permanent Vehicle/account deletion shall require explicit confirmation and use application-level operations rather than raw row deletion. | Must         |
| **FR-ACC-008** | Social login and guest accounts shall not be required for V1.                                                                             | Must         |

## 8.2 Vehicle Onboarding and Configuration

| **ID**         | **Requirement**                                                                                                                                         | **Priority** |
|----------------|---------------------------------------------------------------------------------------------------------------------------------------------------------|--------------|
| **FR-VEH-001** | The user shall be able to add a Vehicle by VIN decode or manual entry.                                                                                  | Must         |
| **FR-VEH-002** | VIN shall be optional and shall not determine current configuration after onboarding.                                                                   | Must         |
| **FR-VEH-003** | The onboarding flow shall ask whether the Vehicle is mostly stock, modified, or heavily modified/swapped and progressively reveal configuration fields. | Must         |
| **FR-VEH-004** | The user shall be able to represent current chassis, engine and transmission independently.                                                             | Must         |
| **FR-VEH-005** | Major components may be original, swapped, unknown-history or user-entered.                                                                             | Must         |
| **FR-VEH-006** | Current mileage shall be captured and later updates shall retain timestamped mileage history.                                                           | Must         |
| **FR-VEH-007** | The user shall select one or more usage modes and optionally a primary usage mode.                                                                      | Must         |
| **FR-VEH-008** | The user may add major modifications during onboarding or later; modification detail shall be optional.                                                 | Must         |
| **FR-VEH-009** | An optional maintenance baseline shall classify service history as known, unknown, needs attention or not applicable.                                   | Must         |
| **FR-VEH-010** | The system shall never convert unknown maintenance history into overdue status without a supporting due rule.                                           | Must         |
| **FR-VEH-011** | Vehicle photo and nickname shall be optional.                                                                                                           | Should       |

## 8.3 Garage Home and Vehicle Overview

| **ID**          | **Requirement**                                                                                                                                           | **Priority** |
|-----------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------|--------------|
| **FR-HOME-001** | Garage Home shall be vehicle-centric and show compact cards sorted primarily by attention required.                                                       | Must         |
| **FR-HOME-002** | Vehicle cards shall surface safety-related attention, event blockers, due maintenance, high-priority work and ready-to-install part counts in that order. | Must         |
| **FR-HOME-003** | Upcoming motorsport Events shall be visible on the associated Vehicle card.                                                                               | Must         |
| **FR-HOME-004** | Garage Home shall not use a synthetic vehicle health percentage.                                                                                          | Must         |
| **FR-HOME-005** | Vehicle Overview shall be a scrollable summary containing Needs Attention, Current Work, Parts Ready, Upcoming Event, Maintenance and Recent History.     | Must         |
| **FR-HOME-006** | Confirmed facts shall rank above inferred recommendations.                                                                                                | Must         |
| **FR-HOME-007** | Vehicle Overview shall limit contextual smart suggestions by default to avoid overload.                                                                   | Must         |
| **FR-HOME-008** | Vehicle Overview shall expose “Plan My Next Work Session”.                                                                                                | Must         |

## 8.4 Quick Add and Garage Inbox

| **ID**           | **Requirement**                                                                                                      | **Priority** |
|------------------|----------------------------------------------------------------------------------------------------------------------|--------------|
| **FR-INBOX-001** | Quick Add shall be reachable from most primary screens.                                                              | Must         |
| **FR-INBOX-002** | A Quick Add item shall be saveable with only raw text and optional current Vehicle context.                          | Must         |
| **FR-INBOX-003** | Quick Add shall support optional photo, voice-note and URL capture.                                                  | Must         |
| **FR-INBOX-004** | Quick Add shall save immediately before optional classification or enrichment.                                       | Must         |
| **FR-INBOX-005** | The Inbox shall support five primary destinations: Issue, Task, Part, Research and Note.                             | Must         |
| **FR-INBOX-006** | Classification suggestions shall be advisory; rules precede AI.                                                      | Must         |
| **FR-INBOX-007** | Items captured from Event or Work Mode shall inherit that context automatically.                                     | Must         |
| **FR-INBOX-008** | Processed Inbox items shall leave the active Inbox while preserving the original raw capture.                        | Must         |
| **FR-INBOX-009** | The product shall not require Inbox Zero or aggressively nag for review.                                             | Must         |
| **FR-INBOX-010** | Simple copied product/reference URLs shall be savable as V1 research/reference items.                                | Must         |
| **FR-INBOX-011** | Native receive-from-Share-Sheet may be implemented as a stretch feature but shall not be required for V1 acceptance. | Could        |

## 8.5 Issues and Tasks

| **ID**          | **Requirement**                                                                                                      | **Priority** |
|-----------------|----------------------------------------------------------------------------------------------------------------------|--------------|
| **FR-WORK-001** | An Issue shall represent an observation/problem and shall not automatically assert a diagnosis.                      | Must         |
| **FR-WORK-002** | Issue states shall include Needs Review, Monitoring, Action Planned, Resolved and Dismissed.                         | Must         |
| **FR-WORK-003** | Monitoring may create date- or mileage-based recheck reminders.                                                      | Should       |
| **FR-WORK-004** | One Issue may be associated with multiple Tasks.                                                                     | Must         |
| **FR-WORK-005** | Task states shall support Backlog, Planned, Blocked, Ready, In Progress, Completed and Canceled.                     | Must         |
| **FR-WORK-006** | Ready/Blocked status may be inferred from required Parts and Task dependencies.                                      | Must         |
| **FR-WORK-007** | Tasks shall support blockers such as waiting for part, tool, research, another Task, unexpected issue or time.       | Must         |
| **FR-WORK-008** | User-facing priority language shall include Urgent, Soon, Before Next Event and Whenever.                            | Must         |
| **FR-WORK-009** | Event blocker status shall require user confirmation.                                                                | Must         |
| **FR-WORK-010** | A Task may have required and optional/related Parts.                                                                 | Must         |
| **FR-WORK-011** | A Task may contain a simple tools/supplies list without maintaining a full tool inventory.                           | Should       |
| **FR-WORK-012** | Completing a Task shall create/update historical Work Records and shall not automatically resolve the related Issue. | Must         |

## 8.6 Work Planner and Work Mode

| **ID**          | **Requirement**                                                                                                                                                            | **Priority** |
|-----------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------|
| **FR-PLAN-001** | A Work Plan shall represent a practical garage session grouping one or more Tasks.                                                                                         | Must         |
| **FR-PLAN-002** | Work Plans may be created manually, from a Task, from an Event, or from Plan My Next Work Session.                                                                         | Must         |
| **FR-PLAN-003** | Planning shall consider task priority, parts readiness, maintenance, component/access area, dependencies and upcoming Events.                                              | Must         |
| **FR-PLAN-004** | The planner may ask for optional available-time buckets and optional planned date.                                                                                         | Should       |
| **FR-PLAN-005** | Readiness shall use descriptive states such as Ready or Blocked, not a synthetic percentage.                                                                               | Must         |
| **FR-PLAN-006** | Work Plans shall support Task sequencing and simple optional checklists without converting every procedural step into a Task.                                              | Must         |
| **FR-PLAN-007** | Work Mode shall use simplified large mobile controls and expose current Task, checklist, references, notes/photos and Found Something.                                     | Must         |
| **FR-PLAN-008** | The user shall be able to mark work blocked or partially complete without marking the overall session as failed.                                                           | Must         |
| **FR-PLAN-009** | Found Something shall create contextual Quick Add content linked to the current Work Plan.                                                                                 | Must         |
| **FR-PLAN-010** | Completing a Work Plan shall transactionally complete selected Tasks, install Parts, complete applicable maintenance, create Work Records and recalculate Event readiness. | Must         |
| **FR-PLAN-011** | Post-work follow-up recommendations shall be limited and optional.                                                                                                         | Must         |

## 8.7 Parts, Research and Sourcing

| **ID**          | **Requirement**                                                                                                                        | **Priority** |
|-----------------|----------------------------------------------------------------------------------------------------------------------------------------|--------------|
| **FR-PART-001** | Parts shall support Wanted → Researching → Ordered → Owned → Installed lifecycle.                                                      | Must         |
| **FR-PART-002** | Removed, Sold, Returned and Canceled shall be supported where needed.                                                                  | Must         |
| **FR-PART-003** | Owned / Ready to Install shall be a prominent actionable state.                                                                        | Must         |
| **FR-PART-004** | Parts may exist without Tasks and may later be associated to one or more Tasks.                                                        | Must         |
| **FR-PART-005** | Part fitment/applicability may target the entire Vehicle, chassis, engine, transmission, modification or user-verified custom context. | Must         |
| **FR-PART-006** | Manufacturer and part number shall be optional but searchable identifiers.                                                             | Must         |
| **FR-PART-007** | V1 shall support manual RetailerOffers with product URL, item price, shipping, tax/fees if known, seller and delivery estimate.        | Must         |
| **FR-PART-008** | Shopping comparison shall emphasize known delivered cost rather than sticker price alone.                                              | Must         |
| **FR-PART-009** | Shipping settings shall require only country/region/postal code unless an integration later requires more.                             | Must         |
| **FR-PART-010** | The system shall not generate an opaque universal seller trust score.                                                                  | Must         |
| **FR-PART-011** | Purchase costs shall be stored even if advanced analytics are deferred.                                                                | Must         |
| **FR-PART-012** | Completing associated work shall transition Parts from Owned to Installed with date and mileage.                                       | Must         |
| **FR-PART-013** | Technical recommendation ranking and commerce/retailer ranking shall remain separate.                                                  | Must         |

## 8.8 Maintenance

| **ID**           | **Requirement**                                                                                                             | **Priority** |
|------------------|-----------------------------------------------------------------------------------------------------------------------------|--------------|
| **FR-MAINT-001** | Maintenance Rules shall preserve origin: manufacturer, motorsport, modification-related, platform knowledge or user custom. | Must         |
| **FR-MAINT-002** | Rules shall support mileage, elapsed time, motorsport-event count, manual/inspection-driven and combined triggers.          | Must         |
| **FR-MAINT-003** | Unknown history shall be distinct from due/overdue.                                                                         | Must         |
| **FR-MAINT-004** | Users shall be able to progressively establish previous service history.                                                    | Must         |
| **FR-MAINT-005** | Motorsport maintenance shall use actual completed Event records rather than invented wear points.                           | Must         |
| **FR-MAINT-006** | Users may override reminder intervals while preserving the original source recommendation.                                  | Must         |
| **FR-MAINT-007** | Modification-related knowledge may suggest routines but shall not create recurring maintenance until the user accepts.      | Must         |
| **FR-MAINT-008** | Maintenance may apply to Vehicle or specific current component such as swapped engine.                                      | Must         |
| **FR-MAINT-009** | Inspection and service shall be distinct; inspection outcomes include Good, Monitor and Needs Attention.                    | Must         |
| **FR-MAINT-010** | Completing maintenance shall create a Work Record and calculate the next applicable MaintenanceInstance.                    | Must         |
| **FR-MAINT-011** | Every Maintenance item shall expose a Why view showing last completion, schedule and source.                                | Must         |
| **FR-MAINT-012** | Maintenance rule/source versions shall be retainable so historical recommendations are explainable.                         | Should       |

## 8.9 Events and Motorsport Preparation

| **ID**         | **Requirement**                                                                                                                      | **Priority** |
|----------------|--------------------------------------------------------------------------------------------------------------------------------------|--------------|
| **FR-EVT-001** | An Event shall include Vehicle, type, name, date, optional venue, optional URL and notes.                                            | Must         |
| **FR-EVT-002** | V1 Event types shall include Autocross, Track Day, Drift, Drag, Road Racing, Show/Meet and Other.                                    | Must         |
| **FR-EVT-003** | Event templates shall produce editable preparation checklists and optional post-event checklists.                                    | Must         |
| **FR-EVT-004** | Event preparation shall combine template items, due maintenance, open Issues/Tasks, owned/ordered Parts and user-confirmed blockers. | Must         |
| **FR-EVT-005** | Event preparation shall use phased timing buckets and collapse gracefully when an Event is added late.                               | Must         |
| **FR-EVT-006** | A user shall explicitly confirm which Tasks are Event blockers.                                                                      | Must         |
| **FR-EVT-007** | Plan Remaining Prep shall invoke the Work Planner with Event context.                                                                | Must         |
| **FR-EVT-008** | Events and Work Plans shall support user-triggered Add to Calendar actions.                                                          | Must         |
| **FR-EVT-009** | Event Day shall provide a simplified mobile checklist and Quick Add access.                                                          | Must         |
| **FR-EVT-010** | Completing an Event shall create a usage record, update maintenance counters and accept text/voice/photo observations.               | Must         |
| **FR-EVT-011** | The Event URL shall remain available in completed historical Event records.                                                          | Must         |

## 8.10 Complete Work and Vehicle History

| **ID**          | **Requirement**                                                                                                                         | **Priority** |
|-----------------|-----------------------------------------------------------------------------------------------------------------------------------------|--------------|
| **FR-HIST-001** | Vehicle History shall be generated automatically from meaningful completed work, maintenance, events, issues and configuration changes. | Must         |
| **FR-HIST-002** | The main timeline shall avoid low-value audit noise such as priority changes.                                                           | Must         |
| **FR-HIST-003** | Work Records shall store date, mileage, completed Tasks, installed Parts and optional attachments/notes.                                | Must         |
| **FR-HIST-004** | Photos captured in Work Mode shall automatically attach to the Work Record.                                                             | Must         |
| **FR-HIST-005** | Voice notes shall remain playable and optional transcripts shall be editable.                                                           | Must         |
| **FR-HIST-006** | Installed/removed Part and Modification history shall be preserved rather than overwritten.                                             | Must         |
| **FR-HIST-007** | Issue detail shall show lifecycle history from observation through resolution where available.                                          | Must         |
| **FR-HIST-008** | History shall support deterministic full-text search and simple type filters.                                                           | Must         |
| **FR-HIST-009** | Users shall be able to correct mistaken historical records through controlled application operations.                                   | Must         |
| **FR-HIST-010** | Work Session start/end time may be recorded to derive optional actual duration.                                                         | Should       |

## 8.11 Knowledge and Sources

| **ID**          | **Requirement**                                                                                                                                 | **Priority** |
|-----------------|-------------------------------------------------------------------------------------------------------------------------------------------------|--------------|
| **FR-KNOW-001** | Garage operational data and Product Knowledge shall be separate datasets.                                                                       | Must         |
| **FR-KNOW-002** | A Knowledge Claim shall retain source provenance and applicability.                                                                             | Must         |
| **FR-KNOW-003** | Sources shall be classified by type/authority such as OEM, component manufacturer, government, professional technical, community or individual. | Must         |
| **FR-KNOW-004** | User-facing evidence labels shall be High, Moderate, Limited or Unverified rather than raw probability percentages.                             | Must         |
| **FR-KNOW-005** | AI output shall never increase evidence strength by itself.                                                                                     | Must         |
| **FR-KNOW-006** | Applicability shall be modeled separately from evidence quality and may target platform, chassis, engine, transmission, modification and usage. | Must         |
| **FR-KNOW-007** | Known Issue knowledge shall never be presented as proof that the user’s Vehicle has the issue.                                                  | Must         |
| **FR-KNOW-008** | Contradictory evidence shall be preserved and surfaced rather than silently resolved.                                                           | Must         |
| **FR-KNOW-009** | User-saved links shall remain private references unless curated/reviewed into Product Knowledge.                                                | Must         |
| **FR-KNOW-010** | V1 Product Knowledge shall be narrow and curated rather than sourced by broad autonomous crawling.                                              | Must         |
| **FR-KNOW-011** | Knowledge may become a Task or Maintenance routine only after user action.                                                                      | Must         |
| **FR-KNOW-012** | Safety-critical claims/procedures shall require stronger source standards and shall not rely on AI-generated specifications.                    | Must         |

## 8.12 Navigation, Search and Cross-App Behavior

| **ID**         | **Requirement**                                                                                                                                                                     | **Priority** |
|----------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------|
| **FR-NAV-001** | Primary bottom navigation shall contain Garage, Work, Events, Parts and More.                                                                                                       | Must         |
| **FR-NAV-002** | Quick Add shall be globally accessible and preserve current Vehicle/Event/Work context.                                                                                             | Must         |
| **FR-NAV-003** | Global Search shall cover Vehicles, Issues, Tasks, Work Plans, Parts/part numbers, Events, Maintenance/Work Records, Research, Notes, transcripts, references and Knowledge Claims. | Must         |
| **FR-NAV-004** | Search within a Vehicle shall default to that Vehicle scope with an option to broaden to the Garage.                                                                                | Must         |
| **FR-NAV-005** | Notifications and shared/deep links shall open the relevant object directly where possible.                                                                                         | Must         |
| **FR-NAV-006** | Back navigation shall respect native hierarchy rather than unexpectedly returning to a tab root.                                                                                    | Must         |
| **FR-NAV-007** | Notes shall autosave where practical.                                                                                                                                               | Should       |
| **FR-NAV-008** | Empty states shall teach a next action rather than show only “No data”.                                                                                                             | Must         |
| **FR-NAV-009** | V1 shall support accessibility basics including large touch targets, screen-reader labels, contrast and non-color status cues.                                                      | Must         |

## 8.13 Settings, Notifications, Voice and User Control

| **ID**         | **Requirement**                                                                                                                                            | **Priority** |
|----------------|------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------|
| **FR-SET-001** | Settings shall include Account, Garage Preferences, Notifications, AI & Smart Features, Voice & Transcription, Parts & Shopping, Privacy & Data and About. | Must         |
| **FR-SET-002** | Notification presets shall support Minimal, Normal, Detailed and Off, with advanced category controls.                                                     | Must         |
| **FR-SET-003** | AI mode shall support Off, On-demand and optional Enhanced behavior; On-demand is the V1 default.                                                          | Must         |
| **FR-SET-004** | AI costs shall be measured and subject to a server-enforced monthly budget.                                                                                | Must         |
| **FR-SET-005** | The AI layer shall not automatically fall back to a materially more expensive model without explicit configuration.                                        | Must         |
| **FR-SET-006** | Voice notes shall be recordable anywhere notes/observations are supported.                                                                                 | Must         |
| **FR-SET-007** | Automatic transcription shall default Off; user-triggered transcription shall be available.                                                                | Must         |
| **FR-SET-008** | Original audio shall be retained by default and transcripts shall remain editable.                                                                         | Must         |
| **FR-SET-009** | Everything shall be private by default; VIN shall be excluded from any future sharing unless explicitly included.                                          | Must         |
| **FR-SET-010** | Basic feature flags and private developer/debug controls shall exist for experimental features and recommendation tuning.                                  | Should       |

# 9. Recommendation Engine

## 9.1 Purpose

The recommendation engine creates practical, explainable suggestions such as “inspect brakes while the wheel is already removed” or “you already own lug nuts that can be installed during this job.” It must prioritize deterministic data relationships before AI.

## 9.2 Inputs

- Selected Vehicle / current components

- Selected Task or Event

- Open Issues and Tasks

- Maintenance status

- Owned/ordered Parts

- Task relationships and access-area tags

- Upcoming Events and user-confirmed blockers

- Curated Knowledge where applicable

- User feedback on previous recommendations

## 9.3 Example Scoring Model

| **Signal**                               | **Illustrative weight** |
|------------------------------------------|-------------------------|
| **Same access area**                     | +30                     |
| **Maintenance currently due**            | +25                     |
| **Owned related part available**         | +25                     |
| **Known task relationship**              | +20                     |
| **High-severity open Issue**             | +20                     |
| **Upcoming Event relevance**             | +15                     |
| **Previously deferred**                  | +5                      |
| **Explicitly rejected for same context** | Suppress                |

Weights are configuration, not immutable product truth. The engine should expose a private debug view showing why a candidate scored as it did. User-facing recommendations shall show human reasons, not internal numeric scores.

## 9.4 Recommendation Presentation Rules

- Maximum three related-work recommendations shown by default.

- One or two contextual recommendations at most on Vehicle Overview.

- Confirmed facts and due work always rank above lower-confidence suggestions.

- “Not Relevant” feedback suppresses repeat suggestions in the same context and is stored for tuning.

- Recommendations never automatically create Tasks, maintenance routines or Event blockers without user action.

# 10. AI and Transcription Layer

## 10.1 AI Policy

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>Hard rule</strong></p>
<p>The normal product path must require zero LLM calls. AI is an optional reasoning/summarization service invoked only when deterministic logic or structured retrieval is insufficient.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## 10.2 AI Gateway Flow

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>Request → Can deterministic logic solve it? → YES: local/domain logic<br />
↓ NO<br />
Cached result? → YES: return cache<br />
↓ NO<br />
AI enabled? → NO: graceful fallback<br />
↓ YES<br />
Budget remaining? → NO: graceful fallback<br />
↓ YES<br />
Allowed operation/model/input/output limits → AI provider → validate structured output → cache/log</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## 10.3 Permitted V1 AI Uses

| **Operation**                           | **V1 constraint**                                                                       |
|-----------------------------------------|-----------------------------------------------------------------------------------------|
| **Inbox classification**                | Only when rule confidence is low or explicitly requested.                               |
| **Source summarization**                | On demand; preserve links and evidence separately.                                      |
| **Knowledge extraction**                | Draft candidate claims only; never auto-publish V1 technical truth.                     |
| **Less-obvious related-work reasoning** | Optional after deterministic recommendations.                                           |
| **Ask About This Car**                  | Optional secondary feature if implemented; must use retrieved garage/knowledge context. |

## 10.4 Prohibited AI Ownership

- Maintenance interval calculations

- Due dates and event counters

- Parts lifecycle state

- Task readiness from known dependencies

- Event preparation schedule generation from templates/rules

- Safety-critical torque/specification generation

- Automatic diagnosis

- Silent modification of garage state

## 10.5 AI Cost Controls

- AI usage table records operation, model, input/output usage and estimated cost.

- Development/private V1 default monthly AI budget: \$5 USD; configurable server-side.

- If the cap is reached, AI operations fail gracefully while the rest of the app remains fully usable.

- Provider/model is configurable; current low-cost candidate is GPT-5.6 Luna, but the architecture must not depend on a specific model name.

- Repeated source summaries or stable knowledge results should be cached rather than regenerated per user.

## 10.6 Voice Notes and Transcription

Voice recording is a first-class V1 note input. Recording and playback do not require AI. A transcription request may upload the audio to a configured speech-to-text service; transcription is user-triggered by default and the original audio remains the authoritative attachment.

- Audio may be saved offline and uploaded later.

- Transcripts are editable because automotive terms/part numbers may be misrecognized.

- If transcription fails, the voice note remains available and the user can retry later.

- Audio may optionally be deleted after successful transcription in a future preference, but not by default.

# 11. Knowledge, Evidence and Safety Model

## 11.1 Evidence vs Recommendation

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>Evidence = what sources support.<br />
Recommendation = what the product suggests the user consider doing given evidence + configuration + usage.<br />
AI may synthesize either, but never becomes a source of evidence.</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## 11.2 Evidence Labels

| **Label**      | **Meaning**                                                                                         |
|----------------|-----------------------------------------------------------------------------------------------------|
| **High**       | Strong authoritative evidence and/or multiple strong independent sources with strong applicability. |
| **Moderate**   | Useful supporting evidence but not definitive; often professional/community corroboration.          |
| **Limited**    | Small number of sources, weak independence, partial applicability or meaningful uncertainty.        |
| **Unverified** | Saved/private reference or candidate claim not yet reviewed as Product Knowledge.                   |

## 11.3 Safety-Critical Content

Brakes, steering, wheel retention, fuel systems, safety restraints and similarly critical systems require stronger source standards. V1 shall reference authoritative or user-supplied procedures rather than attempt to generate a universal repair manual. AI-generated torque values or safety specifications are prohibited.

## 11.4 Knowledge Lifecycle

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>Source → Candidate Claim (Draft) → Review → Published → Versioned / Retired<br />
<br />
Private saved URLs remain Private References unless explicitly curated into Product Knowledge.</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

# 12. Offline and Synchronization

## 12.1 V1 Offline Strategy

V1 is offline-tolerant rather than fully offline-first. The mobile client caches high-value garage data in SQLite and queues a controlled set of mutations for later synchronization. This provides practical garage/track resilience without introducing a complex collaborative conflict-resolution engine.

## 12.2 Data to Cache

- Vehicles and current configuration summary

- Open Tasks and Work Plans

- Event checklist and upcoming Events

- Owned/ordered Parts

- Current/due Maintenance summary

- Recent history needed for active workflows

## 12.3 Offline Actions

- Create Quick Add text/voice/photo metadata

- Mark checklist items

- Update mileage

- Add note

- Create Issue

- Complete simple Task/checklist actions where dependencies are locally known

## 12.4 Pending Operation

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>PendingOperation<br />
id<br />
operation_type<br />
entity_type<br />
entity_id<br />
payload<br />
created_at<br />
retry_count<br />
last_error</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## 12.5 Conflict Strategy

Because V1 is single owner, last-write-wins is acceptable for ordinary mutable fields. Historical records should be append-oriented. Multi-entity completion flows should be deferred until online if the client cannot guarantee transactional semantics locally.

## 12.6 Media

Voice/photo/document files must be saved locally first when captured. Their domain record may exist while upload is pending. The UI shall surface pending upload state only when useful and retry automatically after connectivity returns.

# 13. External Integrations

## 13.1 NHTSA vPIC

Use vPIC for VIN-assisted onboarding and original manufacturer-submitted identity information. Because vPIC is intended mainly for 1981+ U.S.-market vehicles and may rate-limit API usage, manual entry is always supported. A future local vPIC database is possible but not needed for V1.

## 13.2 Retailers and Saved URLs

V1 retailer integration is intentionally weakly coupled. Users can save/search URLs and manually enter offers. The RetailerOffer model is designed so approved APIs can be added later without changing Parts or Work logic.

## 13.3 Calendar

Use the device calendar for user-triggered Add to Calendar actions for Events and Work Plans. V1 does not require bidirectional Google/Apple/Microsoft calendar synchronization.

## 13.4 Notifications

Use local or push notifications for maintenance, Events, blockers and scheduled work. Permission is requested contextually. Notification taps should deep-link to the relevant object.

## 13.5 Native Share to Garage

Basic V1 link capture is copy/paste into Quick Add or Parts/References. Receive-from-native-share may be enabled as a V1 stretch feature because current Expo support is experimental and should not become a release dependency.

# 14. Security, Privacy and Data Ownership

## 14.1 Authorization

- Supabase Auth identifies the user.

- All exposed user-owned tables use PostgreSQL Row Level Security.

- Policies ensure authenticated users can access only rows belonging to their account/garage.

- Service-role credentials and third-party API keys never ship in the client.

## 14.2 Privacy Defaults

- Garage, Vehicles, history, saved references, photos, voice notes, receipts and documents are private by default.

- VIN is treated as sensitive vehicle metadata and is excluded from future sharing by default.

- Shipping preference stores country/region/postal code only unless a future integration genuinely requires more.

- The app shall not capture background location as part of garage notes.

## 14.3 Data Ownership

The architecture shall preserve the ability to export vehicle/garage history and attachments later. Deleting or archiving data must be a user-controlled application operation. Future sharing must support selective disclosure rather than publishing the full private dataset.

## 14.4 Local Security

SQLite uses parameterized/prepared access patterns. Local database encryption may be evaluated if threat model or future public release justifies the operational complexity; it is not required for private V1 acceptance.

# 15. Non-functional Requirements

| **ID**      | **Quality**     | **Requirement**                                                                                            |
|-------------|-----------------|------------------------------------------------------------------------------------------------------------|
| **NFR-001** | Usability       | A common Quick Add should be possible in a few interactions without completing a long form.                |
| **NFR-002** | Performance     | Primary cached screens should render from local data without waiting for network round-trips.              |
| **NFR-003** | Reliability     | Core garage data mutations shall not be lost when connectivity drops; pending operations must retry.       |
| **NFR-004** | Cost            | Private V1 must not require a recurring paid infrastructure service; AI is optional and capped.            |
| **NFR-005** | Explainability  | Any system-generated recommendation shall expose at least one reason/rule/source.                          |
| **NFR-006** | Safety          | AI shall not invent safety-critical specifications or automatically diagnose a vehicle.                    |
| **NFR-007** | Accessibility   | Large touch targets, screen-reader labeling, sufficient contrast and non-color status cues are required.   |
| **NFR-008** | Privacy         | User-owned garage information is private by default and enforced by backend authorization.                 |
| **NFR-009** | Maintainability | Domain logic is separated from UI and external provider integrations through explicit services/interfaces. |
| **NFR-010** | Portability     | The product should remain feasible on iOS/Android and web from the same TypeScript/React codebase.         |
| **NFR-011** | Auditability    | Historical Work Records and source provenance remain inspectable after later recommendations/rules change. |

# 16. Observability and Operational Controls

- Structured logging for application/service errors, database failures, failed sync operations, AI/provider errors, external API failures and scheduled-job failures.

- AI usage/cost logging per operation/model.

- Private Recommendation Debug view exposing scoring reasons.

- Feature flags for experimental capabilities such as AI classification, native share receiving and future knowledge ingestion.

- No dedicated observability vendor is required for private V1; platform logs are sufficient.

# 17. Testing and Acceptance Criteria

## 17.1 Test Strategy

- Unit tests for domain state transitions, maintenance calculations and recommendation scoring.

- Integration tests for Supabase service operations and transaction-like completion flows.

- Row Level Security tests proving cross-user data isolation.

- Offline/sync tests for queued writes, retry and media upload recovery.

- UI tests for the primary user journeys on a physical mobile device.

- AI tests validate schema/constraints and graceful fallback rather than exact wording.

- Knowledge tests validate source linkage, applicability and prohibition on AI-only evidence.

## 17.2 Core Acceptance Criteria

| **AC ID**  | **Acceptance criterion**                                                                                                                              | **Related requirements**                   |
|------------|-------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------|
| **AC-001** | A user can create an account, add a Vehicle manually, and reach Vehicle Overview without configuring advanced options.                                | FR-ACC-001..004; FR-VEH-001..009           |
| **AC-002** | A user can save “passenger rear wheel bearing making noise” in Quick Add offline and later convert it to an Issue without losing the raw capture.     | FR-INBOX-001..008; FR-WORK-001             |
| **AC-003** | A wheel-stud Task with owned studs, owned lug nuts and due brake inspection surfaces related work without an AI call.                                 | FR-PLAN-003; recommendation engine         |
| **AC-004** | An ordered required Part makes a Task blocked; marking the Part received/Owned can make the Task Ready.                                               | FR-WORK-006; FR-PART-001..003              |
| **AC-005** | Completing a Work Plan updates Tasks, installs Parts, creates Work Records and recalculates relevant maintenance/event state.                         | FR-PLAN-010; FR-HIST-001..003              |
| **AC-006** | Creating a Track Day with an Event URL produces an editable phased checklist, surfaces user-confirmed blockers and supports Add to Calendar.          | FR-EVT-001..008                            |
| **AC-007** | Completing a motorsport Event increments usage records and causes an event-count Maintenance Rule to become due when appropriate.                     | FR-EVT-010; FR-MAINT-005                   |
| **AC-008** | A swapped S13/M50 Vehicle can receive chassis-related and M50-engine-related Knowledge/Maintenance independently.                                     | FR-VEH-004..005; FR-MAINT-008; FR-KNOW-006 |
| **AC-009** | A Knowledge Claim shows source(s), evidence label, applicability and a clear statement that a Known Issue does not mean the user’s car has the fault. | FR-KNOW-002..008                           |
| **AC-010** | Voice note recording works without AI; transcription can be requested later and edited, while the original audio remains available.                   | FR-SET-006..008                            |
| **AC-011** | When AI is disabled or the monthly AI budget is exhausted, all core garage workflows remain usable.                                                   | FR-SET-003..005; AI policy                 |
| **AC-012** | An authenticated user cannot read or mutate another user’s garage rows through the client API.                                                        | Security / RLS                             |
| **AC-013** | Global Search finds matching parts, tasks, history, notes and available transcripts using deterministic search.                                       | FR-NAV-003                                 |
| **AC-014** | A copied product/forum/event URL can be stored and later reopened from the related Part, Research, Reference or Event.                                | FR-INBOX-010; FR-EVT-001                   |

# 18. Deployment and Cost Constraints

## 18.1 Private V1 Environment

- One GitHub repository / monorepo.

- Expo development build for mobile; web available through Expo/React Native Web as appropriate.

- One Supabase free project for private development/testing unless project separation is required.

- No production-grade Kubernetes/OpenShift/AWS infrastructure requirement.

- No paid vector database or crawler requirement.

## 18.2 Cost Guardrails

As of August 2026, Supabase offers a \$0 Free plan with a 500 MB database, 1 GB file storage, 5 GB egress and 50,000 MAUs; free projects may pause after inactivity. These are implementation references, not permanent contractual assumptions. V1 should monitor actual usage and avoid designing around paid quotas until justified.

Current OpenAI API pricing identifies GPT-5.6 Luna as a cost-sensitive model option. The exact model is configurable and may change; the durable requirement is that AI is optional, cached where practical, and subject to an explicit monthly spending cap.

# 19. Suggested Implementation Phases

| **Phase**                          | **Deliverables**                                                                                                       |
|------------------------------------|------------------------------------------------------------------------------------------------------------------------|
| **Phase 0 — Foundation**           | Repository, Expo app, Supabase project, authentication, migrations, RLS, feature flags, base UI/navigation, CI checks. |
| **Phase 1 — Garage Core**          | Vehicle onboarding/configuration, Garage Home, Vehicle Overview, mileage, usage and modifications.                     |
| **Phase 2 — Capture & Work**       | Quick Add/Inbox, Issues, Tasks, blockers, Work Planner, Work Mode, notes/photos/voice recording.                       |
| **Phase 3 — Parts & History**      | Parts lifecycle, saved URLs/offers, Work completion transaction, attachments and Vehicle History/search.               |
| **Phase 4 — Maintenance & Events** | Maintenance rules/instances, baseline, Event templates, phased prep, blockers, notifications/calendar.                 |
| **Phase 5 — Knowledge**            | Curated Knowledge Sources/Claims/applicability/evidence, private References, contextual surfacing.                     |
| **Phase 6 — Optional AI**          | AI Gateway, budget controls, low-confidence classification, on-demand summaries, transcription.                        |
| **Phase 7 — Polish & Acceptance**  | Offline recovery, deep links, accessibility pass, acceptance-test suite, seed/demo data, release checklist.            |

# 20. Locked Architecture Decisions

| **ADR**     | **Decision**                                                             |
|-------------|--------------------------------------------------------------------------|
| **ADR-001** | Mobile-first product.                                                    |
| **ADR-002** | Expo + React Native + TypeScript.                                        |
| **ADR-003** | Supabase/PostgreSQL V1 backend.                                          |
| **ADR-004** | Relational database over document database.                              |
| **ADR-005** | Vehicle identity separated from current configuration.                   |
| **ADR-006** | VIN is onboarding metadata, not configuration authority.                 |
| **ADR-007** | Chassis/engine/transmission may exist independently.                     |
| **ADR-008** | Issues, Tasks and Maintenance are distinct domain concepts.              |
| **ADR-009** | Parts include Owned-but-not-installed lifecycle state.                   |
| **ADR-010** | Motorsport Events are first-class domain objects.                        |
| **ADR-011** | Completed work creates historical records rather than overwriting state. |
| **ADR-012** | Knowledge retains source provenance.                                     |
| **ADR-013** | AI contributes zero evidence.                                            |
| **ADR-014** | Deterministic recommendation system precedes AI.                         |
| **ADR-015** | AI is optional and budget-controlled.                                    |
| **ADR-016** | No dedicated vector database in V1.                                      |
| **ADR-017** | No broad automated forum crawling in V1.                                 |
| **ADR-018** | No retailer API is a hard V1 dependency.                                 |
| **ADR-019** | Offline tolerant, not fully offline-first.                               |
| **ADR-020** | Single-owner permissions for V1.                                         |
| **ADR-021** | Basic saved URLs are V1; native receive-share is stretch.                |
| **ADR-022** | Voice recording is V1; transcription is optional/on-demand by default.   |
| **ADR-023** | Events support an external event/registration URL.                       |

# 21. Risks and Open Questions

| **Risk / open question**       | **Current treatment**                                                                                                                                                                         |
|--------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Automotive content quality** | Source-backed knowledge still requires curation. Mitigation: narrow V1 coverage, evidence labels and no AI-only technical truth.                                                              |
| **Modified vehicle ambiguity** | Infinite combinations prevent complete rules. Mitigation: component-based applicability, “consider checking” language and user acceptance.                                                    |
| **External retailer access**   | APIs and shipping data may be restricted/inconsistent. Mitigation: V1 saved URLs/manual offers and provider abstraction.                                                                      |
| **Offline complexity**         | Media and multi-entity operations complicate sync. Mitigation: limited offline mutation set, local-first capture, defer transactional completion if necessary.                                |
| **Notification fatigue**       | Too many reminders reduce trust. Mitigation: presets, phased event prep, caps and contextual permission requests.                                                                             |
| **AI cost/behavior**           | Unexpected volume or hallucination can harm trust/cost. Mitigation: zero-AI core, on-demand default, hard budget, structured outputs and no expensive silent fallback.                        |
| **Knowledge legal/licensing**  | Forum/manual content may have usage restrictions. Mitigation: store citations/URLs and structured claims; avoid indiscriminate copying/crawling and revisit terms before automated ingestion. |
| **Product naming/branding**    | Working title is not final. No architecture impact.                                                                                                                                           |

# 22. Future Ideas Register

The following capabilities were intentionally preserved during discovery but are outside the V1 acceptance boundary unless marked “V1 stretch / V1.1”. This register should continue to grow rather than allowing ideas to leak into V1 implementation without an explicit scope decision.

## Capture, UX and Navigation

| **Capability**                                                   | **Horizon**                        |
|------------------------------------------------------------------|------------------------------------|
| Native Share to Garage from Safari/Chrome/eBay/Amazon            | V1 stretch / V1.1                  |
| Automatic metadata extraction from shared product/reference URLs | Later                              |
| Automatic action extraction from voice notes                     | Later                              |
| Voice-note automatic summarization                               | Later                              |
| Search inside voice-note transcripts                             | V1.1 / easy once transcripts exist |
| Siri / platform voice shortcuts for “Add garage note”            | Later                              |
| Home-screen / lock-screen / wearable widgets                     | Later                              |
| Vehicle quick switcher                                           | Later                              |
| Customizable navigation and dashboards                           | Later                              |
| Garage themes / vehicle-specific themes                          | Later                              |
| Semantic natural-language garage search / “Ask my Garage”        | Later                              |
| Advanced command palette                                         | Later                              |

## Vehicle, Telemetry and Maintenance

| **Capability**                                                   | **Horizon**     |
|------------------------------------------------------------------|-----------------|
| OBD/GPS/telemetry integration                                    | Later           |
| Automatic track hours, engine hours, laps and distance ingestion | Later           |
| Telemetry-derived or adaptive maintenance intervals              | Long-term       |
| Usage-severity/wear modeling                                     | Long-term       |
| Structured measurements over time                                | Later           |
| Brake-pad thickness / tire wear trends                           | Later           |
| Compression/leakdown / fluid analysis history                    | Later           |
| Predictive component failure analysis                            | Long-term       |
| Component serial-number and cross-vehicle lifecycle tracking     | Later/team use  |
| Automatic OEM/service-data licensing integration                 | Later           |
| Maintenance templates shared between users                       | Later/community |

## Work Planning and Garage Operations

| **Capability**                                                    | **Horizon** |
|-------------------------------------------------------------------|-------------|
| Cross-garage “I have X hours—what should I work on?” optimization | Later       |
| Automatic garage-session scheduling                               | Later       |
| Advanced time optimization across vehicles                        | Later       |
| Reusable Work Plan templates                                      | Later       |
| Full tool inventory and tool availability                         | Later       |
| Shared consumables inventory                                      | Later       |
| Full spare-parts inventory and storage locations                  | Later       |
| Minimum-stock reminders                                           | Later       |
| Recurring problem/pattern detection from history                  | Later       |
| Personal job-duration learning                                    | Later       |

## Parts and Commerce

| **Capability**                                             | **Horizon**               |
|------------------------------------------------------------|---------------------------|
| Automated eBay/Amazon/Summit/RockAuto offer retrieval      | Later/API-dependent       |
| Automatic Puerto Rico shipping/tax/landed-cost calculation | Later                     |
| Package tracking and automatic delivery status             | Later                     |
| Price-drop alerts and price history                        | Later                     |
| Authorized-dealer verification                             | Later                     |
| Marketplace counterfeit/risk analysis                      | Long-term                 |
| Community fitment confirmation                             | Later/community           |
| Affiliate purchasing                                       | Later/commercial decision |
| Advanced build-cost / cost-per-event analytics             | Later                     |

## Events and Motorsport

| **Capability**                                         | **Horizon** |
|--------------------------------------------------------|-------------|
| Weather-aware event preparation                        | Later       |
| Import entire motorsport schedules / club calendars    | Later       |
| Registration links/status automation                   | Later       |
| Structured lap/run/timing/results/classes/penalties    | Later       |
| Telemetry-linked event records                         | Later       |
| Event-specific vehicle configurations / setup sheets   | Later       |
| Tire pressure / temperature logging by run/session     | Later       |
| Motorsport equipment inventory and expiration tracking | Later       |
| Packing lists based on event type                      | Later       |
| Trailer/tow-vehicle preparation                        | Later       |
| Crew/team event collaboration                          | Later/team  |
| Season-level maintenance planning                      | Later       |
| Track/venue knowledge profiles                         | Later       |
| Cross-event reliability/performance history            | Later       |

## Knowledge and Community

| **Capability**                                                  | **Horizon**               |
|-----------------------------------------------------------------|---------------------------|
| Controlled automated crawling of approved sources               | V1.x / later              |
| Crawl4AI-based ingestion worker                                 | V1.x / later              |
| Semantic search using pgvector                                  | Later if measured benefit |
| Automated claim extraction, clustering and deduplication        | Later                     |
| Independent-source evidence graph                               | Later                     |
| Contradiction detection and evidence recalculation              | Later                     |
| Source-change/freshness monitoring                              | Later                     |
| Recall/TSB monitoring                                           | Later                     |
| Cross-language automotive knowledge ingestion                   | Later                     |
| YouTube transcript ingestion / chapter extraction               | Later                     |
| Forum-thread summarization                                      | Later                     |
| Community review/voting and expert/verifier roles               | Later/community           |
| Community-submitted technical knowledge                         | Later/community           |
| Full structured repair procedures / licensed manuals / diagrams | Later                     |
| Authoritative torque/specification database                     | Later                     |
| Vehicle-component-failure knowledge graph                       | Long-term                 |
| Cross-user maintenance/reliability statistics                   | Long-term/community       |

## Sharing, Teams and Business

| **Capability**                                           | **Horizon**              |
|----------------------------------------------------------|--------------------------|
| Read-only build/work-plan sharing                        | V1.1 / later             |
| Beautiful public/shareable Build Log                     | Later                    |
| Vehicle maintenance/build report and sale package        | Later                    |
| Mechanic/service summary export                          | Later                    |
| Selective privacy controls for shared reports            | Later                    |
| CSV/JSON/PDF garage export                               | V1.1 / later             |
| Professional shop workflow / technicians / labor billing | Later                    |
| Race-team accounts, roles and shared inventory           | Later                    |
| Multiple Garages per account                             | Later                    |
| Public community/social features                         | Later; only if justified |

## History and Analytics

| **Capability**                                        | **Horizon** |
|-------------------------------------------------------|-------------|
| Historical configuration reconstruction by date/event | Later       |
| Before/after photo comparison                         | Later       |
| Automatic photo organization/classification           | Later       |
| OCR receipt vendor/amount extraction                  | Later       |
| Detailed maintenance vs modification cost analytics   | Later       |
| Estimated vs actual job-time analytics                | Later       |
| Component-level reliability history                   | Later       |
| Compare reliability before/after modifications        | Long-term   |
| Search attachment contents                            | Later       |

# Appendix A. Proposed Data Schema

The following schema is conceptual and should be normalized/refined during implementation. IDs should use UUIDs (or equivalent globally unique identifiers), timestamps should be stored in UTC, and user-facing times rendered in the account timezone.

## users / garages

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>id<br />
email/auth reference<br />
default units<br />
default currency<br />
timezone<br />
created_at</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## vehicles

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>id<br />
garage_id<br />
nickname<br />
year<br />
make<br />
model<br />
trim<br />
vin?<br />
current_mileage<br />
mileage_unit<br />
status active/archived<br />
photo_attachment_id?<br />
notes<br />
created_at<br />
updated_at</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## vehicle_components

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>id<br />
vehicle_id<br />
type<br />
manufacturer<br />
family<br />
model<br />
variant<br />
is_original<br />
installed_date?<br />
installed_mileage?<br />
removed_date?<br />
history_known<br />
notes</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## modifications

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>id<br />
vehicle_id<br />
category<br />
name<br />
manufacturer?<br />
part_number?<br />
status<br />
installed_date?<br />
installed_mileage?<br />
removed_date?<br />
notes</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## vehicle_usage_profiles

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>vehicle_id<br />
usage_mode<br />
is_primary<br />
intensity?</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## inbox_items

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>id<br />
garage_id<br />
vehicle_id?<br />
event_id?<br />
work_plan_id?<br />
raw_text?<br />
attachment_ids<br />
saved_url?<br />
suggested_type?<br />
suggested_component_area?<br />
classification_confidence?<br />
classification_method<br />
status<br />
created_at<br />
processed_at?</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## issues

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>id<br />
vehicle_id<br />
title<br />
description<br />
severity<br />
status<br />
observed_date<br />
observed_mileage?<br />
component_area?<br />
source<br />
created_at<br />
resolved_at?</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## tasks

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>id<br />
vehicle_id<br />
issue_id?<br />
title<br />
description<br />
type<br />
status<br />
priority<br />
component_area?<br />
estimated_duration_bucket?<br />
target_date?<br />
event_id?<br />
created_at<br />
completed_at?</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## task_relations

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>task_id<br />
related_task_id<br />
relation_type</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## parts

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>id<br />
owner_id<br />
manufacturer?<br />
name<br />
part_number?<br />
category?<br />
notes</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## vehicle_parts

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>id<br />
vehicle_id<br />
part_id<br />
status<br />
quantity<br />
fitment_scope<br />
fitment_entity_id?<br />
fitment_status<br />
purchase_price?<br />
shipping_cost?<br />
tax?<br />
fees?<br />
seller?<br />
purchase_url?<br />
order_date?<br />
received_date?<br />
installed_date?<br />
installed_mileage?<br />
removed_date?</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## part_task_relations

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>vehicle_part_id<br />
task_id<br />
relationship required/optional/related</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## retailer_offers

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>id<br />
vehicle_part_id<br />
retailer<br />
seller?<br />
product_url<br />
item_price?<br />
shipping_price?<br />
estimated_tax?<br />
fees?<br />
destination_region?<br />
availability?<br />
estimated_delivery?<br />
fitment_status?<br />
last_checked?</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## work_plans

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>id<br />
vehicle_id<br />
event_id?<br />
title<br />
description?<br />
status<br />
planned_date?<br />
estimated_duration_bucket?<br />
started_at?<br />
finished_at?</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## work_plan_tasks

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>work_plan_id<br />
task_id<br />
sequence<br />
required</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## work_records

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>id<br />
vehicle_id<br />
work_plan_id?<br />
task_id?<br />
maintenance_instance_id?<br />
title<br />
completed_at<br />
mileage?<br />
notes?<br />
actual_duration?</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## attachments

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>id<br />
owner_id<br />
vehicle_id?<br />
entity_type<br />
entity_id<br />
type photo/audio/document/receipt/other<br />
storage_path/local_path<br />
upload_status<br />
created_at</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## notes

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>id<br />
owner_id<br />
vehicle_id?<br />
entity_type<br />
entity_id<br />
text?<br />
audio_attachment_id?<br />
transcript?<br />
transcription_status<br />
created_at<br />
updated_at</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## maintenance_rules

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>id<br />
scope_type<br />
scope_id?<br />
title<br />
description<br />
origin<br />
source_id?<br />
trigger_type<br />
mileage_interval?<br />
time_interval_days?<br />
event_type?<br />
event_count?<br />
criticality<br />
version<br />
active</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## maintenance_instances

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>id<br />
vehicle_id<br />
component_id?<br />
maintenance_rule_id<br />
status<br />
due_date?<br />
due_mileage?<br />
due_event_count?<br />
last_work_record_id?</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## events

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>id<br />
vehicle_id<br />
type<br />
name<br />
venue?<br />
event_date<br />
event_url?<br />
status<br />
notes?</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## event_checklist_items

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>id<br />
event_id<br />
title<br />
source<br />
source_entity_id?<br />
target_phase<br />
target_date?<br />
status<br />
is_blocker</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## vehicle_usage_records

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>id<br />
vehicle_id<br />
event_id?<br />
source<br />
usage_type<br />
completed_at<br />
distance?<br />
engine_hours?<br />
track_time?<br />
laps?</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## knowledge_sources

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>id<br />
url<br />
title<br />
publisher<br />
source_type<br />
retrieved_at?<br />
content_hash?<br />
status</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## knowledge_claims

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>id<br />
title<br />
claim<br />
topic<br />
component_area?<br />
evidence_label<br />
safety_criticality<br />
review_status<br />
version<br />
created_at<br />
retired_at?</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## knowledge_claim_sources

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>claim_id<br />
source_id<br />
relationship/support_note?</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## knowledge_applicability

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>claim_id<br />
entity_type<br />
entity_key/id<br />
applicability_level</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## recommendations

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>id<br />
vehicle_id<br />
context_type<br />
context_id<br />
recommendation_type<br />
candidate_entity_id?<br />
score<br />
reasons_json<br />
status<br />
created_at</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## recommendation_feedback

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>recommendation_id<br />
user_id<br />
action accepted/rejected/deferred<br />
created_at</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## notification_preferences

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>user_id<br />
preset<br />
maintenance<br />
event_prep<br />
event_blocker<br />
work_plan<br />
parts<br />
inbox<br />
knowledge</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## ai_usage

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>id<br />
user_id<br />
operation<br />
provider<br />
model<br />
input_units<br />
output_units<br />
estimated_cost<br />
created_at</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## pending_sync_operations

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>id<br />
operation_type<br />
entity_type<br />
entity_id<br />
payload<br />
created_at<br />
retry_count<br />
last_error?</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

# Appendix B. Service Contracts

## VehicleService

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>createVehicle(input)<br />
decodeVin(vin, modelYear?)<br />
updateVehicleConfiguration(vehicleId, components, modifications)<br />
updateMileage(vehicleId, mileage)<br />
archiveVehicle(vehicleId)</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## InboxService

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>capture(input)<br />
suggestClassification(inboxItemId)<br />
process(inboxItemId, destinationType)<br />
dismiss(inboxItemId)</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## IssueService

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>createIssue(input)<br />
setMonitoring(issueId, followUp)<br />
createTaskFromIssue(issueId, taskInput)<br />
resolveIssue(issueId)<br />
dismissIssue(issueId)</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## TaskService

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>createTask(input)<br />
setPriority(taskId, priority)<br />
setBlocker(taskId, blocker)<br />
addRelation(taskId, relatedTaskId, type)<br />
completeTask(taskId, completionInput)</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## WorkPlanningService

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>suggestNextWork(vehicleId, options)<br />
createWorkPlan(input)<br />
addTask(workPlanId, taskId)<br />
startWorkPlan(workPlanId)<br />
completeWorkPlan(workPlanId, completionInput)</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## PartService

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>createPart(input)<br />
setLifecycleStatus(vehiclePartId, status)<br />
associateTask(vehiclePartId, taskId, relation)<br />
saveOffer(vehiclePartId, offer)<br />
markReceived(vehiclePartId)<br />
markInstalled(vehiclePartId, installationContext)</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## MaintenanceService

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>getMaintenanceStatus(vehicleId)<br />
acceptSuggestedRoutine(vehicleId, suggestionId)<br />
recordPreviousService(input)<br />
completeMaintenance(instanceId, completionInput)<br />
recalculate(vehicleId)</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## EventService

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>createEvent(input)<br />
generatePreparation(eventId)<br />
setBlocker(eventId, taskId, bool)<br />
planRemainingPrep(eventId)<br />
completeEvent(eventId, completionInput)</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## KnowledgeService

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>searchKnowledge(query, context)<br />
getRelevantKnowledge(vehicleId, context)<br />
savePrivateReference(input)<br />
getClaim(claimId)<br />
publishReviewedClaim(claimId) # admin/curation only</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## RecommendationService

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>suggestRelatedWork(taskId)<br />
suggestVehicleAttention(vehicleId)<br />
recordFeedback(recommendationId, action)</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## AIService

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>classifyInbox(input)<br />
summarizeSources(input)<br />
extractCandidateClaims(input)<br />
suggestRelatedWork(input)<br />
transcribeAudio(input)</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## SearchService

| searchGarage(userId, query, scope?) |
|-------------------------------------|

## SyncService

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>queue(operation)<br />
flushPending()<br />
retryFailed()</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

# Appendix C. Initial Curated Data Strategy

V1 should prove the knowledge/maintenance architecture with a narrow curated dataset rather than pretending to cover every vehicle. Recommended seed scope:

- 2013 Scion FR-S / first-generation FR-S/BRZ platform as the primary stock/modified test platform.

- FA20 engine knowledge and a small set of platform maintenance/known-issue/track-use claims with traceable sources.

- A configurable/swapped test vehicle such as an S13 chassis with BMW M50 engine to validate component-specific applicability.

- Street and Track Day maintenance templates plus at least one Autocross event template.

- A handful of Parts/Work relationships around wheel/hub/brakes, suspension/alignment and fluids to validate deterministic planning.

Each Product Knowledge item should be created as a structured Claim linked to one or more Sources and applicability metadata. Community claims should be clearly identified and should not be promoted into recurring maintenance without user acceptance.

# Appendix D. Research References

Current technical references used to support the V1 architecture. These links are implementation inputs and should be re-checked when development begins because SDKs, API terms and pricing can change.

| **Reference**                       | **URL**                                                                                                                                               | **Use**                                                                                     |
|-------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------|
| **Expo Router — Introduction**      | [<u>https://docs.expo.dev/router/introduction/</u>](https://docs.expo.dev/router/introduction/)                                                       | Universal React Native routing across iOS, Android and web; deep-linkable routes.           |
| **Expo SQLite**                     | [<u>https://docs.expo.dev/versions/latest/sdk/sqlite/</u>](https://docs.expo.dev/versions/latest/sdk/sqlite/)                                         | Persistent on-device SQLite for cache and pending operations.                               |
| **Expo Audio**                      | [<u>https://docs.expo.dev/versions/latest/sdk/audio/</u>](https://docs.expo.dev/versions/latest/sdk/audio/)                                           | Cross-platform native audio playback and recording.                                         |
| **Expo Notifications**              | [<u>https://docs.expo.dev/versions/v57.0.0/sdk/notifications/</u>](https://docs.expo.dev/versions/v57.0.0/sdk/notifications/)                         | Local/push notifications and notification interaction handling.                             |
| **Expo Push Notifications Guide**   | [<u>https://docs.expo.dev/guides/using-push-notifications-services/</u>](https://docs.expo.dev/guides/using-push-notifications-services/)             | Expo push service integration and current limits.                                           |
| **Expo Calendar**                   | [<u>https://docs.expo.dev/versions/latest/sdk/calendar/</u>](https://docs.expo.dev/versions/latest/sdk/calendar/)                                     | Device calendar/event integration.                                                          |
| **Expo Sharing**                    | [<u>https://docs.expo.dev/versions/v55.0.0/sdk/sharing/</u>](https://docs.expo.dev/versions/v55.0.0/sdk/sharing/)                                     | Receive-share support exists but is currently experimental; supports V1 stretch assessment. |
| **Supabase Pricing**                | [<u>https://supabase.com/pricing</u>](https://supabase.com/pricing)                                                                                   | Current Free/Pro quotas and pricing reference.                                              |
| **Supabase Row Level Security**     | [<u>https://supabase.com/docs/guides/database/postgres/row-level-security</u>](https://supabase.com/docs/guides/database/postgres/row-level-security) | Postgres RLS guidance for secure per-user data access.                                      |
| **NHTSA vPIC Vehicle API**          | [<u>https://vpic.nhtsa.dot.gov/api/</u>](https://vpic.nhtsa.dot.gov/api/)                                                                             | VIN decoding and manufacturer-submitted vehicle data.                                       |
| **NHTSA vPIC Home**                 | [<u>https://vpic.nhtsa.dot.gov/</u>](https://vpic.nhtsa.dot.gov/)                                                                                     | vPIC scope, intended model years and standalone database option.                            |
| **OpenAI API Pricing**              | [<u>https://platform.openai.com/pricing</u>](https://platform.openai.com/pricing)                                                                     | Current model pricing; use only as a configurable low-cost provider option.                 |
| **OpenAI Audio Transcriptions API** | [<u>https://platform.openai.com/docs/api-reference/audio</u>](https://platform.openai.com/docs/api-reference/audio)                                   | Supported speech-to-text models and transcription endpoint.                                 |
| **pgvector (future)**               | [<u>https://github.com/pgvector/pgvector</u>](https://github.com/pgvector/pgvector)                                                                   | Potential future semantic retrieval inside PostgreSQL; intentionally not required for V1.   |
| **Crawl4AI (future)**               | [<u>https://github.com/unclecode/crawl4ai</u>](https://github.com/unclecode/crawl4ai)                                                                 | Candidate future controlled knowledge-ingestion worker; not a V1 dependency.                |

# End of Functional Specification v1.0

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>Implementation rule</strong></p>
<p>If an implementation choice is not defined here, choose the simplest approach consistent with the product principles, locked ADRs, free-tier/private-V1 cost goal, safety model and Future Ideas boundary. Record material deviations before building them.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

Next recommended artifact after approval: implementation backlog / technical task breakdown derived directly from the FR and AC identifiers in this document.
