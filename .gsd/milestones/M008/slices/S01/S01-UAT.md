# S01: Promote Today and Assistant in primary navigation — UAT

**Milestone:** M008
**Written:** 2026-03-15

## UAT Type

- UAT mode: route and nav verification
- Why this mode is sufficient: this slice changes product discovery and landing behavior rather than deep runtime logic.

## Preconditions

- Nav component and root redirect are updated.
- Focused route/nav tests exist.

## Smoke Test

Open `/` and confirm the app lands on `/today`.

## Test Cases

### 1. Primary nav contents

1. Open any main page with the app nav visible.
2. **Expected:** Primary nav shows `Today`, `Assistant`, `Grooming`, `People`, and `Settings`.
3. **Expected:** `Intervention` is not shown in primary nav.

### 2. Home redirect

1. Open `/`.
2. **Expected:** The app redirects to `/today`.

### 3. Primary page discoverability

1. Run `cd web && npm run test -- --run tests/nav-route-coherence.test.tsx tests/today-page.test.tsx tests/assistant-page-alignment.test.tsx`.
2. **Expected:** Today and Assistant remain the validated primary surfaces.

## Edge Cases

### Legacy bookmarked route

1. Open `/intervention` directly.
2. **Expected:** The route still works, but it is no longer the default landing experience.

## Failure Signals

- Users still land on `/intervention` by default.
- Primary nav still shows `Intervention` instead of `Today` and `Assistant`.
- Typecheck or route-coherence tests fail after nav changes.

## Requirements Proved By This UAT

- R001 — proves users now start in the intended daily intervention flow.
- R008 — proves route discovery is aligned with the current operating model.

## Not Proven By This UAT

- No long-term decision about `/intervention` semantics is proven yet.

## Notes for Tester

This slice intentionally keeps `/intervention` alive while removing it from the primary route model.
