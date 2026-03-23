# Design System — JoyOS Control Tower

## Product Context
- **What this is:** A local-first control tower for Joydeep Sarkar, Director of Products at M2P Fintech, built to run intervention-first product leadership work across feature requests, PM coaching, grooming, strategy, and approval-gated communications.
- **Who it's for:** Primarily Joydeep as a daily-use personal operating cockpit. Secondarily, the system should remain productizable for other senior product leaders later without losing its point of view.
- **Space/industry:** B2B lending infrastructure, product operations, product leadership, intervention dashboards, and AI-assisted execution support.
- **Project type:** Desktop-first internal web app / dashboard with briefing, review, and workflow surfaces.

## Aesthetic Direction
- **Direction:** Editorial Utilitarian
- **Decoration level:** Intentional
- **Mood:** Calm authority under operational pressure. The app should feel like a decision desk, not a generic SaaS admin panel. It should support long periods of review work without looking sterile or toy-like.
- **Reference sites:**
  - [https://linear.app](https://linear.app)
  - [https://www.notion.com/product](https://www.notion.com/product)
  - [https://coda.io/product](https://coda.io/product)
  - [https://www.granola.ai](https://www.granola.ai)
- **Research synthesis:**
  - The category baseline is operational sharpness, cool neutrals, and fast sans-serif readability.
  - This product should keep the sharpness, but break from the category with warmer surfaces, more editorial hierarchy, and stronger separation between workflow and judgment moments.
  - The intended effect is a product cockpit that feels personal, senior, and deliberate.

## Typography
- **Display/Hero:** `Satoshi` — a single, sharper interface family for page titles, shell branding, and section headers. It keeps the product modern and coherent without reintroducing a second editorial voice.
- **Body:** `Satoshi` — primary UI and reading face. Slightly crisper than Manrope, with enough neutrality for dense daily operational use.
- **UI/Labels:** `Satoshi` — same as body, with stronger weights and controlled tracking for labels, controls, summaries, and navigation.
- **Data/Tables:** `JetBrains Mono` — for Jira keys, dates, status readouts, metrics, and any operational detail that benefits from precision and tabular rhythm.
- **Code:** `JetBrains Mono`
- **Loading:**
  - App runtime: host `Satoshi` locally under `web/public/fonts/` and load it through `@font-face`
  - Keep `JetBrains Mono` via `@fontsource`
  - Do not introduce a second display face unless the user explicitly asks for one again
  - Preview artifacts should use the same runtime font stack when possible
- **Scale:**
  - Display XXL: `clamp(54px, 7vw, 92px)`
  - Display XL: `44px`
  - H1 page title: `34px`
  - H2 section title: `28px`
  - H3 card title: `18px`
  - Body large: `17px`
  - Body default: `15px`
  - Body compact: `14px`
  - Caption / helper: `12px`
  - Label / eyebrow: `10px–11px`, uppercase, tracked

## Color
- **Approach:** Restrained
- **Primary:** `#145C63` (`Petrol`) — action color, focused controls, active navigation states, and positive strategic emphasis.
- **Secondary:** `#5E6673` (`Slate`) — quiet support color for labels, helper copy, and subdued structure.
- **Neutrals:**
  - `#FFFCF6` (`Paper`) — primary light surface
  - `#F5F1E8` (`Bone`) — secondary warm surface
  - `#171717` (`Ink`) — primary text and high-contrast anchors
  - Border system: `rgba(23, 23, 23, 0.12)` and `rgba(23, 23, 23, 0.20)`
- **Semantic:**
  - success: `#456B56` (`Moss`)
  - warning: `#A97822` (`Mustard`)
  - error: `#7A2E2E` (`Oxblood`)
  - info: `#145C63` (`Petrol`)
- **Dark mode:**
  - Preserve the same palette hierarchy, but shift to charcoal-paper surfaces rather than default black.
  - Reduce saturation slightly for semantic accents while keeping readability high.
  - Use `#11100F` and `#181614` as dark surfaces with `#F5F2EC` text.
  - Dark mode should feel like a night desk, not a neon dashboard.

## Spacing
- **Base unit:** `8px`
- **Density:** Compact-comfortable
- **Scale:**
  - 2xs: `4px`
  - xs: `8px`
  - sm: `12px`
  - md: `16px`
  - lg: `24px`
  - xl: `32px`
  - 2xl: `48px`
  - 3xl: `64px`
- **Rule:** Prefer tighter vertical rhythm inside operational cards, with more generous space around briefing sections and review surfaces.

## Layout
- **Approach:** Hybrid
- **Grid:**
  - Desktop shell: left nav + main canvas + optional right-side detail/secondary rail
  - Main review pages: `12-column` mental model, but used through asymmetrical section composition rather than visible grid fetishism
  - Tablet: collapse to stacked sections with retained hierarchy
  - Mobile: functional only, not the design center of gravity
- **Max content width:** `1440px–1480px`
- **Border radius:**
  - sm: `8px`
  - md: `14px`
  - lg: `20px`
  - xl: `28px`
  - full: `9999px`
- **Rule:** Do not turn every page into uniform cards. Use cards for containment, but allow briefing-style sections and larger typographic openings where the product benefits from narrative structure.

## Motion
- **Approach:** Minimal-functional
- **Easing:**
  - enter: `ease-out`
  - exit: `ease-in`
  - move: `ease-in-out`
- **Duration:**
  - micro: `80–120ms`
  - short: `150–220ms`
  - medium: `220–320ms`
  - long: `320–480ms`
- **Rule:** Motion should confirm interaction and improve scanning. No decorative choreography, scroll theater, or floating startup effects.

## Safe Choices
- Dense left-nav + content shell for fast repeat use
- Sans-serif UI for forms, filters, tables, and operational reading
- Restrained semantic color rather than expressive multicolor dashboards
- Approval and workflow states signaled by typography and structure, not only by badges

## Deliberate Risks
- Warm paper surfaces instead of category-standard cool white
- Strong sans-serif hierarchy instead of default enterprise-neutral typography
- Oxblood instead of default bright red for escalation states
- Briefing-style section composition rather than endless uniform card grids

## Implementation Guidance
- Keep `Satoshi` as the dominant interface face across body and headings.
- Differentiate hierarchy with size, weight, tracking, and spacing before reaching for a second type family.
- Keep `JetBrains Mono` tightly scoped to IDs, metrics, dates, and machine-readable status strings.
- Introduce color primarily through priority, state, and action. The product should not rely on a bright branded wash.
- Prefer hairline borders, surface separation, and type hierarchy over heavy shadows or saturated fills.
- Preserve the desktop-first bias. Mobile should degrade cleanly, but desktop is the primary design target.

## Anti-Patterns to Avoid
- Purple/violet accent systems
- Generic SaaS gradients
- Symmetrical 3-column feature-card thinking inside app workflows
- Over-rounded components everywhere
- Icon-in-circle enterprise tiles
- Excessively playful motion or microinteraction clutter
- Cold admin-panel whiteness with no warmth or hierarchy

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-03-23 | Adopted Editorial Utilitarian direction | The product is a personal operating cockpit for senior product judgment, not a generic PM dashboard. |
| 2026-03-23 | Switched the live UI system to Satoshi with JetBrains Mono for precision text | The user wanted end-to-end font coherence, and Satoshi provides a cleaner single-family hierarchy than the earlier mixed or Manrope-led setups. |
| 2026-03-23 | Removed the serif display accent from the live system | User feedback showed the mixed type system felt visually inconsistent across the shell and work surfaces. |
| 2026-03-23 | Chose warm paper neutrals with petrol / oxblood accents | This keeps the interface calm and distinctive while preserving seriousness and operational clarity. |
