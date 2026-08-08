# Account Manager UI Restyle Plan

## Goal

Replace the current flat, pale-blue account screen with a polished light CRM dashboard using the existing local shadcn/ui setup, while preserving all API behavior, validation, loading/error handling, success notifications, and account-list refresh behavior.

## Confirmed Decisions

- Use a light CRM visual direction: warm neutral page background, white surfaces, deep ink text, restrained indigo/blue primary, subtle borders, and limited shadows.
- Prefer the repository's shadcn `new-york` component style and existing primitives over custom CSS or a new UI dependency.
- Treat this as a presentation-only change. Existing labels and button names used by the Playwright tests must remain available.
- Keep the existing Geist typography and Tailwind v4 setup unless a small token-level adjustment is needed.
- Do not add dark-mode behavior in this pass; the selected design is intentionally light and should not change with the OS color scheme.

## Findings From The Current UI

- `frontend/src/components/accounts/accounts-view.tsx` renders a bare `space-y-8` root with no page shell, max-width, padding, surface hierarchy, or semantic main region.
- The form and table are two ungrouped columns, so the page lacks visual grouping and the form/list proportions are not intentional on wide screens.
- `frontend/src/components/accounts/accounts-table.tsx` duplicates raw table utility classes instead of using the existing `components/ui/table.tsx` primitives.
- `frontend/src/app/globals.css` uses a very pale blue background and an automatic dark media override; the token set does not include card/popover surfaces required for a clear shadcn hierarchy.
- Loading, empty, and error states are plain blocks with weak differentiation, and the toast style only has a bottom border.
- The repository has `agents/` and `skills/`, but no `.agent/` directory. The relevant frontend guidance is `skills/nextjs-frontend/SKILL.md`; it requires Tailwind, reusable focused components, responsive UI, semantic markup, and accessible labels.

## Implementation Steps

### 1. Establish the light shadcn theme

Files:

- `frontend/src/app/globals.css`

Changes:

- Replace the current pale-blue values with a warm off-white background, high-contrast ink foreground, white card surface, muted surface, readable muted text, and a restrained indigo/blue primary.
- Add the shadcn surface tokens needed by the new components, including card and popover foreground/background values, while retaining the existing Tailwind v4 `@theme inline` structure.
- Tune border, input, ring, destructive, and secondary tokens so controls remain visible without heavy outlines.
- Remove the `prefers-color-scheme: dark` override so the selected light presentation is stable.
- Keep global CSS limited to tokens and baseline body styling; component-specific layout should remain in Tailwind classes.

### 2. Add the focused shadcn primitives needed for hierarchy

Files:

- Add `frontend/src/components/ui/card.tsx`.
- Add `frontend/src/components/ui/skeleton.tsx`.

Changes:

- Implement the standard local shadcn `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, and `CardFooter` composition with `cn()` and token-based classes.
- Implement a small token-based `Skeleton` primitive for the account-list loading state.
- Do not add the shadcn CLI, a component registry dependency, or a form abstraction; the current React Hook Form and validation flow remains in place.

### 3. Rebuild the account page shell without changing state logic

Files:

- `frontend/src/components/accounts/accounts-view.tsx`

Changes:

- Preserve `loadAccounts`, the initial fetch, the refresh-after-create flow, and all existing error/toast behavior.
- Wrap the view in a full-height page shell with responsive horizontal padding and a centered max-width content region.
- Use a compact eyebrow or section label, a stronger page title, and a concise description to create a clear visual hierarchy without changing the tested `Salesforce Accounts` heading.
- Change the content area to a responsive grid: a narrower form column and a wider list column on large screens, stacked sections on small screens, with `items-start` so card heights do not distort each other.
- Put the create form and account list into separate `Card` surfaces with intentional headers and descriptions.
- Replace plain state blocks with composed card content: `Skeleton` rows for loading, an alert-styled panel for errors, and an icon-supported empty state. Preserve the existing user-facing messages.
- Use semantic `main`, heading levels, and `aria-live`/alert semantics where appropriate without changing the API or interaction contract.

### 4. Polish the create-account form with existing shadcn controls

Files:

- `frontend/src/components/accounts/create-account-form.tsx`

Changes:

- Keep the current Zod schema, React Hook Form wiring, submit payload, reset behavior, success callback, and friendly error toast unchanged.
- Improve field rhythm, label contrast, input height/radius, invalid-field affordances, and optional-field grouping using the existing `Label` and `Input` components.
- Keep accessible label names such as `Name *` and the existing `aria-invalid`/`aria-describedby` behavior so current E2E coverage remains valid.
- Make the submit button full-width within the card on narrow screens and visually emphasize it as the single primary action; keep the `Create Account` accessible name and disabled submitting behavior.
- Use an existing `lucide-react` icon only where it improves scanability, without adding a dependency or introducing decorative noise.

### 5. Convert the account list to the shadcn table composition

Files:

- `frontend/src/components/accounts/accounts-table.tsx`
- `frontend/src/components/accounts/account-row.tsx`
- `frontend/src/components/ui/table.tsx` only if needed to correct/normalize its local shadcn utility selectors.

Changes:

- Replace duplicated raw `<table>` classes with `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, and `TableCell`.
- Keep the table inside a rounded, bordered overflow region with a sensible minimum width so narrow screens scroll only the data region rather than the whole page.
- Give the header a quiet muted surface, compact uppercase/letter-spaced labels, and consistent cell spacing; keep rows readable with subtle hover treatment and dividers.
- Preserve the four required fields and `-` fallbacks. Keep external website links keyboard-focusable, visibly interactive, and safely opened in a new tab.
- Correct any malformed reusable-table selector while preserving the component's shadcn API.

### 6. Match toast styling to the new surface system

Files:

- `frontend/src/components/ui/sonner.tsx`

Changes:

- Keep Sonner and all call sites unchanged.
- Update toast classes to use the new surface tokens, rounded corners, complete border, readable shadow, and appropriate success/error contrast instead of the current bottom-border-only treatment.

## Non-Goals

- No changes to backend code, Salesforce integration, API routes, request types, or environment configuration.
- No new state-management library, routing, modal flow, pagination, filtering, or account actions.
- No redesign of the account data model or changes to user-facing workflow semantics.
- No broad custom stylesheet or replacement of the existing shadcn primitives with a third-party component library.

## Validation Plan

Run from `frontend/` after implementation:

- `npm run lint`
- `npm run build`
- `npx playwright test`

Verify in the rendered UI at desktop and narrow mobile widths:

- The page is centered with stable whitespace and no accidental full-page horizontal overflow.
- The form and list are visibly separate cards on desktop and stack cleanly on mobile.
- Loading, empty, error, and success states remain understandable and visually distinct.
- Existing E2E selectors still work: `Salesforce Accounts`, `Name *`, `Create Account`, account names, and success/error messages.
- Keyboard focus is visible on inputs, the submit button, and website links; text and borders meet readable contrast expectations.
- No source changes occur outside the planned frontend styling/component files and the plan file.
