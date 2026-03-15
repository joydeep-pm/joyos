# S03: Verify coherent discovery across nav and routes — UAT

**Milestone:** M008
**Written:** 2026-03-15

## UAT Type

- UAT mode: mixed
- Why this mode is sufficient: this slice is verification-only and needs both automated route proof and one live browser walkthrough.

## Preconditions

- Local web app is running.
- Primary nav is visible in the root layout.

## Smoke Test

Open `/` and confirm the app lands on Today with the primary nav visible.

## Test Cases

### 1. Home route discovery

1. Open `/`.
2. **Expected:** The app lands on `/today`.

### 2. Primary nav discovery

1. Inspect the top nav.
2. Click `Assistant`.
3. Click `Control Tower`.
4. **Expected:** The nav exposes `Today`, `Assistant`, and `Control Tower`, and the legacy route remains reachable through `Control Tower` rather than `Intervention`.

## Edge Cases

### Legacy route still reachable

1. Navigate to `Control Tower`.
2. **Expected:** `/intervention` loads successfully without being the default landing route.

## Failure Signals

- `/` does not land on `/today`
- nav omits `Today` or `Assistant`
- nav still exposes `Intervention` as the primary label instead of `Control Tower`
- `Control Tower` no longer reaches `/intervention`

## Requirements Proved By This UAT

- R001 — users land on the right daily surface
- R008 — route behavior is coherent and inspectable instead of hidden behind stale information architecture

## Not Proven By This UAT

- Any redesign of the legacy intervention screen
- Any deeper bookmark migration logic beyond current route availability

## Notes for Tester

Treat this slice as verification and closeout. If the existing shipped behavior matches the roadmap, no product code changes are required.
