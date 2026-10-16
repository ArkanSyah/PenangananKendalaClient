---
name: acceptance-criteria-workflow
description: >-
  Use this skill when creating, updating, or validating Acceptance Criteria in AC.md.
  Ensures all business rules, unit tests, and integration tests are systematically documented
  following the Given-When-Then specification format.
---

# Acceptance Criteria Workflow (`AC.md`)

## Overview
This skill guides the creation and synchronization of the Acceptance Criteria documented in `webPenangananKendalaClientBE/AC.md`. It guarantees traceability between stakeholder requirements, user stories, and automated tests.

---

## 1. Document Structure
`AC.md` is divided into major sections:
1. **Scope**: Summary of tested modules and business domains.
2. **Unit Testing Acceptance Criteria (`AC-UT-XX`)**: Model relations, attribute casting, helper methods.
3. **Integration Testing Acceptance Criteria (`AC-INT-XX`)**: HTTP endpoints, auth flows, RBAC policies, ticket state transitions, and background events.

---

## 2. Specification Standard (Given - When - Then)
Every acceptance criterion must follow this exact format:

```markdown
### AC-INT-XX: [Brief Title of the Scenario]
- **Given**: Initial preconditions (e.g. user logged in with a specific role, ticket exists in status X)
- **When**: The action or HTTP request performed (e.g. `POST /api/tickets/{id}/confirm` with payload Y)
- **Then**: Expected system outcome (e.g. status code 200, status updated in database)
- **Acceptance**:
  - Exact assertion check 1 (e.g. HTTP status 200 OK)
  - Exact assertion check 2 (e.g. ProgressLog created with `is_internal = false`)
  - Exact assertion check 3 (e.g. database table `tickets` has status `open`)
```

---

## 3. Workflow for Adding New Features
Whenever a new feature or endpoint is added to the backend:
1. **Define the AC**: Write the `AC-INT-XX` entry in `AC.md` before or alongside the feature.
2. **Implement the Test**: Write a corresponding test in `tests/Feature/` or `tests/Unit/` that asserts every condition listed in the AC.
3. **Execute & Verify**: Run `php artisan test` to prove that the criteria pass.
4. **Link Traceability**: Reference the test file in the AC documentation if relevant.
